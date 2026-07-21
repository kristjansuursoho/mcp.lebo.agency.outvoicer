# Connect to Outvoicer MCP

Outvoicer MCP is a remote [Streamable HTTP](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports#streamable-http) server. Each connection needs:

- The MCP server host.
- The intended company's Outvoicer subdomain. For `https://acme.outvoicer.com`, use `acme`.
- An Outvoicer bearer token with access to that subdomain.

The endpoint is:

```text
https://HOST/mcp/SUBDOMAIN
```

One token can access multiple companies, so the token does not replace `SUBDOMAIN`. Manage the token at [app.outvoicer.com](https://app.outvoicer.com), and never commit it to a client configuration file.

## Before connecting

Read the token without echoing it or saving it in shell history, then export it for clients that support environment-variable substitution:

```bash
printf 'Outvoicer token: '
read -s OUTVOICER_TOKEN
printf '\n'
export OUTVOICER_TOKEN
```

Confirm that the token can access the selected company:

```bash
curl --fail-with-body \
  --config <(printf 'header = "Authorization: Bearer %s"\n' "$OUTVOICER_TOKEN") \
  https://SUBDOMAIN.outvoicer.com/api/test
```

For local development, start the server with `bun run start` and use `http://127.0.0.1:3000/mcp/SUBDOMAIN`. Local clients can use that URL directly. Cloud clients need a public HTTPS deployment or their documented private-tunnel option.

MCP sessions are currently held in the server process. A production deployment must use one long-lived instance or session-affine routing based on `Mcp-Session-Id`. Request-isolated serverless deployments and multi-instance deployments without affinity will lose sessions.

After connecting, use this non-mutating smoke-test prompt:

```text
List the Outvoicer tools available to you. Do not call them or create an invoice.
```

The current tool list contains `prepare-invoice` and `create-invoice`.

## Claude

### Claude Code

Add a user-scoped server while preserving the environment-variable reference in the saved configuration:

```bash
claude mcp add-json outvoicer \
  '{"type":"http","url":"https://HOST/mcp/SUBDOMAIN","headers":{"Authorization":"Bearer ${OUTVOICER_TOKEN}"}}' \
  --scope user
```

Verify it with:

```bash
claude mcp get outvoicer
claude mcp list
```

Inside Claude Code, `/mcp` should show `outvoicer` as connected. Use `--scope local` instead if the connection should apply only to the current project.

### Claude web and desktop

Claude's remote connectors can use a fixed request header, but request-header authentication is a beta feature with a gradual rollout. The endpoint must be reachable from Anthropic over HTTPS.

1. Open **Settings > Connectors > Add custom connector**. Team and Enterprise owners use **Admin settings > Connectors**.
2. Enter `https://HOST/mcp/SUBDOMAIN`.
3. Under **Request headers**, add `authorization` as a required header.
4. Enter `Bearer your-token` as the complete value. Claude does not add `Bearer` for you.
5. Add the connector, enable it in a chat, and run the smoke-test prompt.

If **Request headers** is not available for the account, use Claude Code until the beta is enabled.

## ChatGPT

ChatGPT developer-mode apps cannot send a user-supplied API key or fixed `Authorization` header. This server therefore cannot be added directly by URL: authenticated ChatGPT apps require OAuth 2.1, which Outvoicer MCP does not currently implement.

Use one of the following supported paths instead.

### ChatGPT with Secure MCP Tunnel

[Secure MCP Tunnel](https://developers.openai.com/api/docs/guides/secure-mcp-tunnels) can keep the fixed bearer header between `tunnel-client` and Outvoicer MCP.

1. Create a tunnel and runtime API key in [OpenAI Platform tunnel settings](https://platform.openai.com/settings/organization/tunnels). Associate the tunnel with the target ChatGPT workspace.
2. Install the latest [`tunnel-client`](https://github.com/openai/tunnel-client/releases/latest).
3. Start it with the endpoint and header supplied through environment variables:

```bash
printf 'OpenAI tunnel runtime key: '
read -s CONTROL_PLANE_API_KEY
printf '\n'
export CONTROL_PLANE_API_KEY
export CONTROL_PLANE_TUNNEL_ID='tunnel_0123456789abcdef0123456789abcdef'
export MCP_SERVER_URL='https://HOST/mcp/SUBDOMAIN'
export MCP_UPSTREAM_AUTHORIZATION="Bearer $OUTVOICER_TOKEN"
export MCP_EXTRA_HEADERS='Authorization: env:MCP_UPSTREAM_AUTHORIZATION'

tunnel-client doctor --explain
tunnel-client run
```

4. Enable **Developer mode** in **ChatGPT > Settings > Security and login**.
5. Open **Settings > Plugins**, add a developer-mode app, choose **Tunnel**, and select the running tunnel.
6. Confirm that ChatGPT discovers the tools, then run the smoke-test prompt.

Keep `tunnel-client` running while ChatGPT uses the app. Tunnel and ChatGPT workspace permissions are separate; the operator needs tunnel **Read** and **Use** access.

### OpenAI Responses API

The Responses API can send the bearer token directly. It does not store this value, so include it in every request. Keep approval enabled because this server can create invoice drafts:

```bash
printf 'OpenAI API key: '
read -s OPENAI_API_KEY
printf '\n'
export OPENAI_API_KEY

jq -n \
  --arg url 'https://HOST/mcp/SUBDOMAIN' \
  '{
      model: "gpt-5.6",
      input: "List the Outvoicer tools. Do not call them.",
      tools: [{
        type: "mcp",
        server_label: "outvoicer",
        server_url: $url,
        authorization: env.OUTVOICER_TOKEN,
        require_approval: "always"
      }]
    }' |
  curl https://api.openai.com/v1/responses \
    --config <(printf 'header = "Authorization: Bearer %s"\n' "$OPENAI_API_KEY") \
    -H "Content-Type: application/json" \
    --data-binary @-
```

The outer `Authorization` header authenticates with OpenAI; `tools[0].authorization` authenticates OpenAI's MCP request with Outvoicer.

## OpenCode

Add this entry to `opencode.json` in the project, or to the [global OpenCode config](https://opencode.ai/docs/config/) if it should be available everywhere:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "outvoicer": {
      "type": "remote",
      "url": "https://HOST/mcp/SUBDOMAIN",
      "enabled": true,
      "oauth": false,
      "headers": {
        "Authorization": "Bearer {env:OUTVOICER_TOKEN}"
      }
    }
  }
}
```

`oauth: false` is required because this server uses a fixed token instead of OAuth. Verify the connection with:

```bash
opencode mcp list
opencode
```

Then run the smoke-test prompt. For connection diagnostics, use `opencode mcp debug outvoicer`.

## OpenClaw

OpenClaw has native MCP client support. Put the token in the Gateway process environment or its global runtime dotenv file, not in `openclaw.json`:

```bash
umask 077
printf 'OUTVOICER_TOKEN=%s\n' "$OUTVOICER_TOKEN" >> ~/.openclaw/.env
chmod 600 ~/.openclaw/.env
```

Save the server definition. The single quotes keep `${OUTVOICER_TOKEN}` as a reference instead of expanding the secret into the command line:

```bash
openclaw mcp set outvoicer \
  '{"url":"https://HOST/mcp/SUBDOMAIN","transport":"streamable-http","headers":{"Authorization":"Bearer ${OUTVOICER_TOKEN}"}}'
```

Restart the Gateway if it was already running, then make a live connection and list capabilities:

```bash
openclaw gateway restart
openclaw mcp doctor outvoicer --probe
openclaw mcp probe outvoicer --json
```

Do not set `auth: "oauth"` or run `openclaw mcp login`; OAuth mode ignores the static `Authorization` header. Older OpenClaw versions without `openclaw mcp` need to be updated rather than configured through the separate MCPorter registry.

## Hermes

This section covers [NousResearch Hermes Agent](https://github.com/NousResearch/hermes-agent), whose CLI command is `hermes`.

Use its interactive setup so the token is entered without echo and stored separately from `config.yaml`:

```bash
hermes mcp add outvoicer \
  --url "https://HOST/mcp/SUBDOMAIN" \
  --auth header
```

Enter the Outvoicer token when prompted. Hermes writes an environment-variable reference under `mcp_servers.outvoicer` in `~/.hermes/config.yaml` and stores the token in `~/.hermes/.env`.

Verify the saved server and make a live connection:

```bash
chmod 600 "$(hermes config env-path)"
hermes mcp list
hermes mcp test outvoicer
```

A manually authored equivalent is:

```yaml
mcp_servers:
  outvoicer:
    url: "https://HOST/mcp/SUBDOMAIN"
    headers:
      Authorization: "Bearer ${MCP_OUTVOICER_API_KEY}"
    enabled: true
```

Set `MCP_OUTVOICER_API_KEY=your-token` in the file reported by `hermes config env-path`. Do not add `auth: oauth`; URL-based entries use Streamable HTTP automatically.

## Troubleshooting

- `401 Unauthorized`: confirm that the client sends the full `Authorization: Bearer ...` header and rerun the `/api/test` preflight for the same `SUBDOMAIN`.
- Connection works but invoice lookup fails: the token may be valid for another company. The endpoint subdomain selects the tenant.
- Cloud client cannot connect to `127.0.0.1`: use a public HTTPS deployment or the client's private-tunnel feature.
- Tools are missing after a server update: reconnect or refresh the MCP server metadata in the client.
- Token was exposed: regenerate it at `app.outvoicer.com`, update the environment/secret store, and restart the client.

## Client documentation

- [Claude Code MCP](https://code.claude.com/docs/en/mcp)
- [Claude remote connectors](https://claude.com/docs/connectors/custom/remote-mcp)
- [ChatGPT app authentication](https://developers.openai.com/apps-sdk/build/auth)
- [ChatGPT developer-mode apps](https://developers.openai.com/apps-sdk/deploy/connect-chatgpt)
- [OpenAI MCP tools](https://developers.openai.com/api/docs/guides/tools-connectors-mcp)
- [OpenAI Secure MCP Tunnel](https://developers.openai.com/api/docs/guides/secure-mcp-tunnels)
- [OpenCode MCP servers](https://opencode.ai/docs/mcp-servers/)
- [OpenClaw MCP](https://docs.openclaw.ai/cli/mcp)
- [Hermes MCP](https://github.com/NousResearch/hermes-agent/blob/main/website/docs/user-guide/features/mcp.md)
