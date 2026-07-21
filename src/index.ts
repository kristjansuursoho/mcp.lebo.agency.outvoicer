import { handleMcpRequest } from "@/infrastructure/mcp"
import { createMcpHonoApp } from "@modelcontextprotocol/hono"

const app = createMcpHonoApp()

app.all("/mcp/:subdomain", async (c) => {
  return handleMcpRequest(c)
})

export default app
