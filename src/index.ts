import { createMcpHonoApp } from "@modelcontextprotocol/hono"

import { handleMcpRequest } from "@/interface/mcp.interface"
import { supportedScopes } from "@/infrastructure/oauth"
import { env } from "@/infrastructure/env"

const allowedHosts = env.MCP_ALLOWED_HOSTS?.split(",").map((host) => host.trim())
const allowedOrigins = env.MCP_ALLOWED_ORIGINS?.split(",").map((origin) => origin.trim())

const app = createMcpHonoApp({ host: env.HOST, allowedHosts, allowedOrigins })

app.get("/.well-known/oauth-protected-resource/outvoicer", (c) => {
  return c.json({
    resource: env.MCP_RESOURCE,
    authorization_servers: [env.OAUTH_ISSUER],
    scopes_supported: supportedScopes,
    bearer_methods_supported: ["header"],
    resource_name: "Outvoicer MCP",
  })
})

app.all("/outvoicer", async (c) => {
  return handleMcpRequest(c)
})

export default {
  fetch: app.fetch,
  hostname: env.HOST,
  port: env.PORT,
  maxRequestBodySize: env.MAX_REQ_BODY_SIZE,
}
