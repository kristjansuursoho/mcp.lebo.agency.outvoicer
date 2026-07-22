import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js"
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js"
import type { BlankEnv, BlankInput } from "hono/types"
import type { Context } from "hono"

import { removeExpiredSessions, sessions } from "@/lib/mcp-session"
import { getReqBearerToken } from "@/helpers/get-req-bearer-token"
import { SimpleJsonRpcRespponse } from "@/lib/mcp-responses"
import { UnauthorizedResponse } from "@/lib/mcp-errors"
import { mcpReqStorage } from "@/stores/mcp-request"
import { createMcp } from "@/infrastructure/mcp"
import { logger } from "@/infrastructure/logger"
import { env } from "@/infrastructure/env"
import { TetrisSDK } from "@api/tetris"

// TODO: figure out why tf i need to use this hack
export type ParsedBodyContext = Context<{ Variables: { parsedBody?: unknown } }, "/outvoicer/:subdomain", BlankInput>

export const subdomainPattern = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/

// were using pending sessions until actual session is established
let pendingSessions = 0

export async function handleMcpRequest(c: Context<BlankEnv, "/outvoicer/:subdomain", BlankInput>) {
  // TODO: figure out why tf i need to use this hack
  const parsedBody = (c as unknown as ParsedBodyContext).get("parsedBody")

  const subdomain = c.req.param("subdomain")
  if (!subdomainPattern.test(subdomain)) return c.json({ error: "Invalid Outvoicer subdomain" }, 400)

  const token = getReqBearerToken(c.req.raw)
  if (!token) return UnauthorizedResponse()

  removeExpiredSessions()

  // TODO: is this only header key i should look for..
  const sessionId = c.req.header("MCP-session-Id")
  const fingerprint = new Bun.CryptoHasher("sha256").update(token).digest("hex")

  if (sessionId) {
    const session = sessions.get(sessionId)

    // TODO: fingerprint check is currently the easiest but also impressively secure
    if (!session || session.subdomain !== subdomain || session.fingerprint !== fingerprint) {
      return UnauthorizedResponse()
    }

    session.lastSeenAt = Date.now()

    const response = await mcpReqStorage.run({ subdomain, token }, () => {
      return session.transport.handleRequest(c.req.raw, {
        parsedBody,
        authInfo: {
          token,
          clientId: subdomain,
          scopes: ["invoice:create", "invoice:review"],
        },
      })
    })

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers),
    })
  }

  const body = parsedBody

  if (!isInitializeRequest(body)) {
    return SimpleJsonRpcRespponse(400, "Initialize the MCP session first")
  }

  // no session found, also not creating
  if (c.req.method !== "POST") {
    return SimpleJsonRpcRespponse(400, "mcp-session-id header is required")
  }

  const tetris = new TetrisSDK()
  tetris.server(`https://${subdomain}.outvoicer.com`)
  tetris.auth(token)

  try {
    // we must test tetris token, so we can return error early
    await tetris.testToken()
  } catch (err) {
    if (typeof err === "object" && err !== null && "status" in err && err.status === 401) {
      return UnauthorizedResponse()
    }

    logger.warn({ err, subdomain }, "Outvoicer token validation failed")
    return SimpleJsonRpcRespponse(503, "Outvoicer token validation is unavailable")
  }

  if (sessions.size + pendingSessions >= env.MCP_MAX_SESSIONS) {
    return SimpleJsonRpcRespponse(503, "MCP session capacity reached")
  }

  const mcp = createMcp(subdomain)

  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: () => crypto.randomUUID(),
    onsessioninitialized: (initializedSessionId) => {
      sessions.set(initializedSessionId, {
        subdomain,
        fingerprint,
        transport,
        mcp,
        lastSeenAt: Date.now(),
      })
    },
    onsessionclosed: (closedSessionId) => {
      if (closedSessionId) sessions.delete(closedSessionId)
    },
  })

  pendingSessions += 1

  try {
    await mcp.connect(transport)

    const response = await mcpReqStorage.run({ subdomain, token }, () => {
      return transport.handleRequest(c.req.raw, {
        parsedBody: body,
        authInfo: {
          token,
          clientId: subdomain,
          scopes: ["invoice:create", "invoice:review"],
        },
      })
    })

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers),
    })
  } finally {
    pendingSessions -= 1

    if (!transport.sessionId) {
      await mcp.close().catch((err) => logger.warn({ err }, "Failed to close uninitialized session"))
    }
  }
}
