import { createRemoteJWKSet, jwtVerify } from "jose"
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js"
import { z } from "zod"

import { env } from "@/infrastructure/env"

export const supportedScopes = ["invoice:read", "invoice:create"] as const

const credentialResponseSchema = z.object({ token: z.string().min(1) })
const jwks = createRemoteJWKSet(new URL(env.OAUTH_JWKS_URL))

export class CredentialResolutionError extends Error {
  constructor(public readonly status: 403 | 503) {
    super("Unable to resolve the Outvoicer connection")
  }
}

export function resourceUrl(subdomain: string) {
  return `${env.MCP_PUBLIC_ORIGIN}/outvoicer/${subdomain}`
}

export function resourceMetadataUrl(subdomain: string) {
  return `${env.MCP_PUBLIC_ORIGIN}/.well-known/oauth-protected-resource/outvoicer/${subdomain}`
}

export async function verifyAccessToken(token: string, subdomain: string): Promise<AuthInfo> {
  const resource = resourceUrl(subdomain)
  const { payload } = await jwtVerify(token, jwks, {
    issuer: env.OAUTH_ISSUER,
    audience: resource,
    algorithms: env.OAUTH_JWT_ALGORITHMS.split(",").map((algorithm) => algorithm.trim()),
    clockTolerance: env.OAUTH_CLOCK_TOLERANCE_SECONDS,
    requiredClaims: ["sub", "exp"],
  })

  if (typeof payload.sub !== "string" || !payload.sub || typeof payload.scope !== "string") {
    throw new Error("Invalid OAuth access token claims")
  }

  const clientId =
    typeof payload.client_id === "string"
      ? payload.client_id
      : typeof payload.azp === "string"
        ? payload.azp
        : payload.sub

  return {
    token,
    clientId,
    scopes: payload.scope.split(" ").filter(Boolean),
    expiresAt: payload.exp,
    resource: new URL(resource),
    extra: { subject: payload.sub },
  }
}

export async function resolveOutvoicerToken(authInfo: AuthInfo, subdomain: string) {
  const subject = authInfo.extra?.subject
  if (typeof subject !== "string") throw new CredentialResolutionError(403)

  let response: Response

  try {
    response = await fetch(env.OAUTH_CREDENTIAL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OAUTH_SERVICE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ issuer: env.OAUTH_ISSUER, subject, subdomain }),
      signal: AbortSignal.timeout(env.OAUTH_CREDENTIAL_TIMEOUT_MS),
    })
  } catch {
    throw new CredentialResolutionError(503)
  }

  if (response.status === 403 || response.status === 404) throw new CredentialResolutionError(403)
  if (!response.ok) throw new CredentialResolutionError(503)

  const credential = credentialResponseSchema.safeParse(await response.json().catch(() => null))
  if (!credential.success) throw new CredentialResolutionError(503)

  return credential.data.token
}
