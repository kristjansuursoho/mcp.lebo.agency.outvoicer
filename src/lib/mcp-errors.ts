export const UnauthorizedResponse = () => {
  return Response.json(
    { error: "A valid Outvoicer bearer token is required" },
    { status: 401, headers: { "WWW-Authenticate": 'Bearer realm="outvoicer-mcp"' } }
  )
}
