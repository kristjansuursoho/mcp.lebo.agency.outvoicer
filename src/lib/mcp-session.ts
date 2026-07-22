import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js"

import type { createMcp } from "@/infrastructure/mcp"
import { logger } from "@/infrastructure/logger"
import { env } from "@/infrastructure/env"

export type Session = {
  subdomain: string
  fingerprint: string
  transport: WebStandardStreamableHTTPServerTransport
  mcp: ReturnType<typeof createMcp>
  lastSeenAt: number
}

export const sessions = new Map<string, Session>()

export function removeExpiredSessions() {
  const expiresBefore = Date.now() - env.MCP_SESSION_TTL_MS

  for (const [sessionId, session] of sessions) {
    if (session.lastSeenAt > expiresBefore) continue

    sessions.delete(sessionId)

    void session.mcp.close().catch((err) => logger.warn({ err, sessionId }, "Failed to close expired session"))
  }
}
