import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js"
import type { BlankEnv, BlankInput } from "hono/types"
import type { Context } from "hono"

import {
  CredentialResolutionError,
  resolveOutvoicerToken,
  resourceMetadataUrl,
  supportedScopes,
  verifyAccessToken,
} from "@/infrastructure/oauth"
import { InsufficientScopeResponse, UnauthorizedResponse } from "@/lib/mcp-errors"
import { getReqBearerToken } from "@/helpers/get-req-bearer-token"
import { SimpleJsonRpcRespponse } from "@/lib/mcp-responses"
import { mcpReqStorage } from "@/stores/mcp-request"
import { createMcp } from "@/infrastructure/mcp"
import { logger } from "@/infrastructure/logger"

export type ParsedBodyContext = Context<{ Variables: { parsedBody?: unknown } }, "/outvoicer/:subdomain", BlankInput>

export const subdomainPattern = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/

export async function handleMcpRequest(c: Context<BlankEnv, "/outvoicer/:subdomain", BlankInput>) {
  const parsedBody = (c as unknown as ParsedBodyContext).get("parsedBody")
  const subdomain = c.req.param("subdomain")
  if (!subdomainPattern.test(subdomain)) return c.json({ error: "Invalid Outvoicer subdomain" }, 400)

  const metadataUrl = resourceMetadataUrl(subdomain)
  const token = getReqBearerToken(c.req.raw)
  if (!token) return UnauthorizedResponse(metadataUrl)

  let authInfo
  try {
    authInfo = await verifyAccessToken(token, subdomain)
  } catch {
    return UnauthorizedResponse(metadataUrl, "invalid_token")
  }

  if (!supportedScopes.some((scope) => authInfo.scopes.includes(scope))) {
    return InsufficientScopeResponse(metadataUrl)
  }

  if (c.req.method !== "POST") {
    return SimpleJsonRpcRespponse(405, "Stateless MCP only supports POST requests")
  }

  let outvoicerToken: string
  try {
    outvoicerToken = await resolveOutvoicerToken(authInfo, subdomain)
  } catch (error) {
    if (error instanceof CredentialResolutionError && error.status === 403) {
      return c.json({ error: "No Outvoicer connection for this tenant" }, 403)
    }

    logger.warn({ subdomain }, "Outvoicer credential resolution failed")
    return SimpleJsonRpcRespponse(503, "Outvoicer credential resolution is unavailable")
  }

  const mcp = createMcp(subdomain)
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined })
  await mcp.connect(transport)

  return mcpReqStorage.run({ subdomain, outvoicerToken, resourceMetadataUrl: metadataUrl }, () =>
    transport.handleRequest(c.req.raw, { parsedBody, authInfo })
  )
}
