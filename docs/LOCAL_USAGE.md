# Test locally with OpenCode

Requirements: Bun 1.3+, OpenCode, and an Outvoicer subdomain and bearer token.

## 1. Start the server

```bash
bun install
bun run start
```

The server should print:

```text
Outvoicer MCP listening on http://127.0.0.1:3000/outvoicer/{subdomain}
```

## 2. Configure OpenCode

In another terminal, export the token:

```bash
export OUTVOICER_TOKEN='your-token'
```

Create `opencode.json`. Replace `your-subdomain` with the
company subdomain only, for example `acme` for `acme.outvoicer.com`.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "outvoicer": {
      "type": "remote",
      "url": "http://127.0.0.1:3000/outvoicer/your-subdomain",
      "enabled": true,
      "oauth": false,
      "headers": {
        "Authorization": "Bearer {env:OUTVOICER_TOKEN}"
      }
    }
  }
}
```

Do not put the token directly in `opencode.json`.

## 3. Verify

Keep the server running, then run:

```bash
opencode mcp list
opencode
```

Use this smoke-test prompt:

```text
List the Outvoicer MCP tools available to you. Do not call them or create, review, or send an invoice.
```

OpenCode should report `create_invoice`, `review_invoice`, and `send_invoice`.
