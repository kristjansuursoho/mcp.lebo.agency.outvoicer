import { createMcpHonoApp } from "@modelcontextprotocol/hono"

import { handleMcpRequest, subdomainPattern } from "@/interface/mcp.interface"
import { resourceUrl, supportedScopes } from "@/infrastructure/oauth"
import { env } from "@/infrastructure/env"

const allowedHosts = env.MCP_ALLOWED_HOSTS?.split(",").map((host) => host.trim())
const allowedOrigins = env.MCP_ALLOWED_ORIGINS?.split(",").map((origin) => origin.trim())

const app = createMcpHonoApp({ host: env.HOST, allowedHosts, allowedOrigins })

app.get("/.well-known/oauth-protected-resource/outvoicer/:subdomain", (c) => {
  const subdomain = c.req.param("subdomain")
  if (!subdomainPattern.test(subdomain)) return c.json({ error: "Invalid Outvoicer subdomain" }, 400)

  return c.json({
    resource: resourceUrl(subdomain),
    authorization_servers: [env.OAUTH_ISSUER],
    scopes_supported: supportedScopes,
    bearer_methods_supported: ["header"],
  })
})

app.all("/outvoicer/:subdomain", async (c) => {
  return handleMcpRequest(c)
})

export default {
  fetch: app.fetch,
  hostname: env.HOST,
  port: env.PORT,
  maxRequestBodySize: env.MAX_REQ_BODY_SIZE,
}
