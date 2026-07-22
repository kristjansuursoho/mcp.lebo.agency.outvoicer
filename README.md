# Outvoicer MCP

An unofficial MCP server for preparing and creating invoice drafts in [Outvoicer](https://outvoicer.com).

## Purpose

I already use MCP servers, so connecting Outvoicer was a natural next step. Its [public API](https://api.outvoicer.com) makes it possible to prepare, create, and send invoices through conversation.

This project was created in collaboration with [Martin Sookael](https://github.com/martinsookael), founder of [Outvoicer](https://outvoicer.com).

I use [OpenCode](https://opencode.ai), but the server also works with compatible clients such as ChatGPT and Claude.

## Scope

The current focus is limited to:

- Creating invoices
- Previewing invoices
- Sending invoices

Currently, it does not manage Outvoicer account data, integrations, or settings. These can be managed at [outvoicer.com](https://outvoicer.com).

## Authentication

Public lebo.agency endpoints use OAuth through [oauth.lebo.agency](https://oauth.lebo.agency).

The server validates signed OAuth access tokens, then resolves the user's selected Outvoicer connection server-side.

- Protected resource discovery uses RFC 9728 metadata.
- Authorization uses the OAuth authorization code flow with PKCE `S256` and dynamic client registration.
- OAuth resource indicators bind authorization, access tokens, and JWT audiences to the Outvoicer MCP URL.
- JWT access tokens are verified against the authorization server's JWKS with exact issuer, audience, expiry, and scope checks.
- Tools advertise and enforce `invoice:read` and `invoice:create` independently.

## Security

- Public access is protected by OAuth.
- OAuth access is limited to the Outvoicer MCP resource and the user's stored connection.
- Requests are stateless and access tokens are validated on every request.
- OAuth access tokens are never forwarded to Outvoicer.
- Responses and telemetry exclude sensitive data.

## Technology

- [TypeScript](https://www.typescriptlang.org/)
- [Bun](https://bun.sh/) runs the application and manages packages.
- [Cloudflare Workers](https://developers.cloudflare.com/workers/) hosts the server.
- [Hono](https://hono.dev/) handles HTTP requests, and the [Model Context Protocol SDK](https://modelcontextprotocol.io/) provides MCP support.
- [Zod](https://zod.dev/) validates data.
- [Langfuse](https://langfuse.com/) and [OpenTelemetry](https://opentelemetry.io/) provide tracing and observability.

## About

This project is maintained by [Kristjan Suursoho](https://github.com/kristjansuursoho), who works with Outvoicer as a freelancer. It is an unofficial project and is not maintained or published by Outvoicer.

The Outvoicer API, internally known as Tetris, is available at [api.outvoicer.com](https://api.outvoicer.com). OpenAPI documentation is available there.

## License

Licensed under the [MIT License](LICENSE).
