import { INVOICE_GUIDE_URI, invoiceGuide } from "@/resources/invoice-guide"
import { mcpReqStorage } from "@/stores/mcp-request"
import { registerCreateInvoiceTool } from "@/tools/create-invoice.tool"
import { registerPrepareInvoiceTool } from "@/tools/prepare-invoice.tool"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js"
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js"

import type { Context } from "hono"
import type { BlankEnv, BlankInput } from "hono/types"
import { logger } from "./logger"

type Session = {
  subdomain: string
  fingerprint: string
  transport: WebStandardStreamableHTTPServerTransport
  mcp: ReturnType<typeof createMcp>
  lastSeenAt: number
}

const sessions = new Map<string, Session>()

export function createMcp(subdomain: string) {
  logger.info(`new mcp for: ${subdomain}`)

  const mcp = new McpServer(
    {
      name: "outvoicer-mcp",
      title: "Outvoicer MCP",
      version: "0.1.0",
      description: "Prepare and create Outvoicer invoice drafts",
    },
    {
      enforceStrictCapabilities: true,
      instructions:
        `This session uses Outvoicer subdomain "${subdomain}" at https://${subdomain}.outvoicer.com. ` +
        "Always call prepare-invoice with all known invoice information before create-invoice. " +
        "When prepare-invoice reports missing_client, missing_products, or missing_amount, ask for that one value and retry while preserving known clientId and productId selections. Show supplied choices individually and never ask the user to find an ID in the browser. " +
        "When showing the selected client, always format it as clientName (clientId). " +
        "Only call create-invoice with the exact invoice payload returned by prepare-invoice when its status is ready. create-invoice creates an unsent draft. " +
        "Never request or expose bearer tokens in tool arguments or content.",
    }
  )

  // mcp.registerTool()

  mcp.registerResource(
    "invoice-guide",
    INVOICE_GUIDE_URI,
    {
      title: "Invoice workflow and OpenAPI context",
      description: "Canonical, cited context for creating, reviewing, and sending invoices",
      mimeType: "application/json",
      annotations: { audience: ["assistant"], priority: 1 },
    },
    async (uri) => ({
      contents: [{ uri: uri.href, mimeType: "application/json", text: invoiceGuide }],
    })
  )

  registerPrepareInvoiceTool(mcp)
  registerCreateInvoiceTool(mcp)

  return mcp
}

export function jsonRpcError(status: number, message: string, code = -32000): Response {
  return Response.json({ jsonrpc: "2.0", error: { code, message }, id: null }, { status })
}

export async function handleMcpRequest(c: Context<BlankEnv, "/mcp/:subdomain", BlankInput>) {
  const token = c.req.header("Authorization")?.split(" ")[1]
  if (!token) return c.json({ error: "Unauthorized" }, 401)

  const subdomain = c.req.param("subdomain")
  const sessionId = c.req.header("MCP-session-Id")
  const fingerprint = new Bun.CryptoHasher("sha256").update(token).digest("hex")

  if (sessionId) {
    const session = sessions.get(sessionId)

    if (!session || session.subdomain !== subdomain || session.fingerprint !== fingerprint) {
      throw Response.json(
        { error: "A valid Outvoicer bearer token is required" },
        {
          status: 401,
          headers: { "WWW-Authenticate": 'Bearer realm="outvoicer-mcp"' },
        }
      )
    }

    session.lastSeenAt = Date.now()

    const response = await mcpReqStorage.run({ subdomain, token }, () => {
      return session.transport.handleRequest(c.req.raw, {
        authInfo: {
          token,
          clientId: subdomain,
          scopes: ["invoice:create", "invoice:review", "invoice:send"],
        },
      })
    })

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers),
    })
  }

  const body = await c.req.raw.clone().json()

  if (!isInitializeRequest(body)) {
    return jsonRpcError(400, "Initialize the MCP session first")
  }

  // no session found, also not creating
  if (c.req.method !== "POST") {
    return jsonRpcError(400, "mcp-session-id header is required")
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

  await mcp.connect(transport)

  const response = await mcpReqStorage.run({ subdomain, token }, () => {
    return transport.handleRequest(c.req.raw, {
      authInfo: {
        token,
        clientId: subdomain,
        scopes: ["invoice:create", "invoice:review", "invoice:send"],
      },
    })
  })

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: new Headers(response.headers),
  })
}
