export function getReqBearerToken(request: Request) {
  const authorization = request.headers.get("authorization")
  if (!authorization?.startsWith("Bearer ")) return null

  const token = authorization.slice(7).trim()
  return token || null
}
