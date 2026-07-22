import { env } from "@/infrastructure/env"

export const UnauthorizedResponse = (error?: "invalid_token") => {
  const challenge = [`Bearer resource_metadata="${env.RESOURCE_METADATA}"`, error && `error="${error}"`]
    .filter(Boolean)
    .join(", ")

  return Response.json(
    { error: "OAuth authorization is required" },
    { status: 401, headers: { "WWW-Authenticate": challenge } }
  )
}

export const InsufficientScopeResponse = () => {
  const scope = "invoice:read invoice:create"
  const challenge =
    `Bearer resource_metadata="${env.RESOURCE_METADATA}", ` + `error="insufficient_scope", scope="${scope}"`

  return Response.json({ error: "insufficient_scope" }, { status: 403, headers: { "WWW-Authenticate": challenge } })
}

export const OutvoicerConnectionErrorResponse = () =>
  Response.json({ error: "No Outvoicer connection for this account" }, { status: 403 })

export const AuthorizationToolError = (scope: string) => ({
  isError: true,
  content: [{ type: "text" as const, text: `OAuth scope ${scope} is required.` }],
  _meta: {
    "mcp/www_authenticate":
      `Bearer resource_metadata="${env.RESOURCE_METADATA}", ` + `error="insufficient_scope", scope="${scope}"`,
  },
})
