export function getReqBearerToken(request: Request) {
  const authorization = request.headers.get("authorization")
  return authorization?.match(/^Bearer ([^\s]+)$/i)?.[1] ?? null
}
