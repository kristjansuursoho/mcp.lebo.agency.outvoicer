import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js"
import type { BlankEnv, BlankInput } from "hono/types"
import type { Context } from "hono"

import {
  CredentialResolutionError,
  resolveOutvoicerConnection,
  supportedScopes,
  verifyAccessToken,
} from "@/infrastructure/oauth"
import {
  InsufficientScopeResponse,
  OutvoicerConnectionErrorResponse,
  UnauthorizedResponse,
} from "@/lib/mcp-errors"
import { getReqBearerToken } from "@/helpers/get-req-bearer-token"
import { SimpleJsonRpcRespponse } from "@/lib/mcp-responses"
import { mcpReqStorage } from "@/stores/mcp-request"
import { createMcp } from "@/infrastructure/mcp"
import { logger } from "@/infrastructure/logger"

export type ParsedBodyContext = Context<{ Variables: { parsedBody?: unknown } }, "/outvoicer", BlankInput>

export async function handleMcpRequest(c: Context<BlankEnv, "/outvoicer", BlankInput>) {
  const parsedBody = (c as unknown as ParsedBodyContext).get("parsedBody")
  const token = getReqBearerToken(c.req.raw)
  if (!token) return UnauthorizedResponse()

  let authInfo
  try {
    authInfo = await verifyAccessToken(token)
  } catch {
    return UnauthorizedResponse("invalid_token")
  }

  if (!supportedScopes.some((scope) => authInfo.scopes.includes(scope))) {
    return InsufficientScopeResponse()
  }

  if (c.req.method !== "POST") {
    return SimpleJsonRpcRespponse(405, "Stateless MCP only supports POST requests")
  }

  let connection: { subdomain: string; token: string }
  try {
    connection = await resolveOutvoicerConnection(authInfo)
  } catch (error) {
    if (error instanceof CredentialResolutionError && error.status === 403) {
      return OutvoicerConnectionErrorResponse()
    }

    logger.warn("Outvoicer credential resolution failed")
    return SimpleJsonRpcRespponse(503, "Outvoicer credential resolution is unavailable")
  }

  const mcp = createMcp(connection.subdomain)
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined })
  await mcp.connect(transport)

  return mcpReqStorage.run(
    {
      subdomain: connection.subdomain,
      outvoicerToken: connection.token,
    },
    () => transport.handleRequest(c.req.raw, { parsedBody, authInfo })
  )
}
