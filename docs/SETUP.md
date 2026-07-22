# Connect to Outvoicer MCP

The Streamable HTTP endpoint is:

```text
https://mcp.lebo.agency/outvoicer
```

Add that URL as a custom MCP connector in ChatGPT developer mode or Claude. The client discovers `oauth.lebo.agency`, dynamically registers its callback, and starts the OAuth authorization-code flow automatically. The server uses the Outvoicer connection selected in the OAuth account.

Do not put an Outvoicer token in ChatGPT or any MCP client configuration. The Worker resolves it after OAuth authorization.

## OAuth Service Contract

`oauth.lebo.agency` must:

- Publish authorization-server metadata and a JWKS matching `OAUTH_JWKS_URL`.
- Support authorization code with PKCE `S256` and dynamic client registration.
- Accept `https://mcp.lebo.agency/outvoicer` as the OAuth `resource` and issue it as the JWT `aud`.
- Issue signed JWT access tokens with `iss`, `sub`, `aud`, `exp`, and a space-delimited `scope` containing `invoice:read`, `invoice:create`, or both.
- Resolve the subject's stored Outvoicer connection at the credential endpoint.

The configured `OAUTH_CREDENTIAL_URL` accepts this service-authenticated request:

```http
POST /api/outvoicer/credential
Authorization: Bearer <OAUTH_SERVICE_TOKEN>
Content-Type: application/json

{"issuer":"https://oauth.lebo.agency","subject":"<oauth-sub>"}
```

It returns `{"token":"<outvoicer-token>","subdomain":"acme"}` only when that subject has an Outvoicer connection. It returns `404` otherwise. The endpoint must never return the credential to a browser or MCP client.

Set the shared credential-service secret before deploying:

```sh
bunx wrangler secret put OAUTH_SERVICE_TOKEN
```

The JWKS and credential endpoint paths in `wrangler.jsonc` are deployment values. Change them there if `oauth.lebo.agency` exposes different paths.
