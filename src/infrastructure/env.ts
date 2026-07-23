import { z } from "zod"

const positiveInteger = z.coerce.number().int().positive()

export const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.string().default("info"),

  HOST: z.string().default("127.0.0.1"),
  PORT: z.coerce.number().int().positive().default(3000),
  MAX_REQ_BODY_SIZE: z.coerce
    .number()
    .int()
    .positive()
    .default(1024 * 1024),

  MCP_ALLOWED_HOSTS: z.string().optional(),
  MCP_ALLOWED_ORIGINS: z.string().optional(),
  MCP_REVIEW_TTL_MS: positiveInteger.default(10 * 60_000),
  MCP_ELICITATION_TIMEOUT_MS: positiveInteger.default(2 * 60_000),

  MCP_RESOURCE: z.url().default("https://mcp.lebo.agency/outvoicer"),
  RESOURCE_METADATA: z.url().default("https://mcp.lebo.agency/.well-known/oauth-protected-resource/outvoicer"),
  OAUTH_ISSUER: z.url().default("https://oauth.lebo.agency"),
  OAUTH_JWKS_URL: z.url(),
  OAUTH_JWT_ALGORITHMS: z.string().default("RS256,EdDSA"),
  OAUTH_CLOCK_TOLERANCE_SECONDS: z.coerce.number().int().nonnegative().default(5),
  OAUTH_CREDENTIAL_URL: z.url(),
  OAUTH_CREDENTIAL_TIMEOUT_MS: positiveInteger.default(5_000),
  OAUTH_SERVICE_TOKEN: z.string().min(1),

  LANGFUSE_PUBLIC_KEY: z.string().optional(),
  LANGFUSE_SECRET_KEY: z.string().optional(),
  LANGFUSE_BASE_URL: z.string().optional(),
  LANGFUSE_TRACING_ENVIRONMENT: z.string().optional(),
})

export const env = EnvSchema.parse(process.env)
