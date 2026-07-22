# Connect to Outvoicer MCP

Public MCP deployments operated by lebo.agency use the separate OAuth authorization server at [oauth.lebo.agency](https://oauth.lebo.agency). OAuth termination and access to lebo.agency MCP servers are deployment concerns outside this repository.

The instructions below are for direct or self-hosted connections to this application. They use an Outvoicer bearer token rather than the hosted OAuth flow.

Outvoicer MCP is a remote [Streamable HTTP](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports#streamable-http) server. Each connection needs:

- The MCP server host.
- The intended company's Outvoicer subdomain. For `https://acme.outvoicer.com`, use `acme`.
- An Outvoicer bearer token with access to that subdomain.

The endpoint is:

```text
https://mcp.lebo.agency/outvoicer/{subdomain}
```

One token can access multiple companies, so the token does not replace `{subdomain}`. Manage the token at [app.outvoicer.com](https://app.outvoicer.com), and never commit it to a client configuration file.
