export function SimpleJsonRpcRespponse(status: number, message: string, code = -32000): Response {
  return Response.json({ jsonrpc: "2.0", error: { code, message }, id: null }, { status })
}
