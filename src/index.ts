import { createMcpHonoApp } from "@modelcontextprotocol/hono"

import { handleMcpRequest } from "@/interface/mcp.interface"
import { env } from "@/infrastructure/env"

const allowedHosts = env.MCP_ALLOWED_HOSTS?.split(",").map((host) => host.trim())
const allowedOrigins = env.MCP_ALLOWED_ORIGINS?.split(",").map((origin) => origin.trim())

const app = createMcpHonoApp({ host: env.HOST, allowedHosts, allowedOrigins })

app.all("/outvoicer/:subdomain", async (c) => {
  return handleMcpRequest(c)
})

export default {
  fetch: app.fetch,
  hostname: env.HOST,
  port: env.PORT,
  maxRequestBodySize: env.MAX_REQ_BODY_SIZE,
}
