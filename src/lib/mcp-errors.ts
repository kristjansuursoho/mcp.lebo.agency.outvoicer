export const UnauthorizedResponse = (resourceMetadataUrl: string, error?: "invalid_token") => {
  const challenge = [`Bearer resource_metadata="${resourceMetadataUrl}"`, error && `error="${error}"`]
    .filter(Boolean)
    .join(", ")

  return Response.json(
    { error: "OAuth authorization is required" },
    { status: 401, headers: { "WWW-Authenticate": challenge } }
  )
}

export const InsufficientScopeResponse = (resourceMetadataUrl: string) => {
  const scope = "invoice:read invoice:create"
  const challenge =
    `Bearer resource_metadata="${resourceMetadataUrl}", ` + `error="insufficient_scope", scope="${scope}"`

  return Response.json({ error: "insufficient_scope" }, { status: 403, headers: { "WWW-Authenticate": challenge } })
}

export const AuthorizationToolError = (resourceMetadataUrl: string, scope: string) => ({
  isError: true,
  content: [{ type: "text" as const, text: `OAuth scope ${scope} is required.` }],
  _meta: {
    "mcp/www_authenticate":
      `Bearer resource_metadata="${resourceMetadataUrl}", ` + `error="insufficient_scope", scope="${scope}"`,
  },
})
