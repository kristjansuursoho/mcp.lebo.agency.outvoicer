# Outvoicer MCP

An unofficial MCP server for preparing and creating unsent invoice drafts through [Outvoicer](https://outvoicer.com).

## Purpose

This project was created in collaboration with [Martin Sookael](https://github.com/martinsookael), founder of [Outvoicer](https://outvoicer.com). It started from a desire to create and send invoices through simple conversations.

My personal choice is [OpenCode](https://opencode.ai), but the MCP server is intended to work with other compatible clients, including ChatGPT and Claude.

## Scope

The current focus is limited to:

- Creating invoices
- Previewing invoices

Currently, this MCP server is not intended for managing Outvoicer account data, integrations, or settings. Integrations and other configuration can be set up or changed at [outvoicer.com](https://outvoicer.com).

## Authentication

Public MCP deployments operated by lebo.agency use the separate OAuth authorization server at [oauth.lebo.agency](https://oauth.lebo.agency). That service grants clients access to lebo.agency MCP servers; OAuth is not implemented in this repository.

At this application's boundary, requests carry an Outvoicer bearer credential. The server validates it against the exact tenant selected by the URL before creating an MCP session. Direct and self-hosted setup is documented in [docs/SETUP.md](docs/SETUP.md).

## Security

- Only `prepare-invoice` and unsent-draft `create-invoice` tools are exposed. Sending and accounting forwarding are not registered.
- Initialization validates the bearer credential with the selected tenant before allocating a session.
- Authorization accepts only a strict `Bearer` header, and tenant subdomains must be lowercase DNS labels.
- Sessions are bound to the tenant and a token fingerprint, limited by `MCP_MAX_SESSIONS`, and expired after `MCP_SESSION_TTL_MS`.
- Bun rejects bodies larger than `MAX_REQ_BODY_SIZE` before JSON parsing. The default is 1 MiB.
- MCP responses expose only client/product IDs and names or the created invoice ID, not complete financial and customer records.
- Langfuse observations contain operational status only, not invoice payloads, customer identifiers, prices, comments, bearer tokens, or tenant names.
- Each upstream operation uses an isolated SDK instance so mutable authentication and tenant state cannot cross requests.
- A successful draft creation is reported as successful even if cancellation arrives after the upstream API call, preventing retry-driven duplicates.
- Published OpenAPI examples use fictional company, registration, email, address, and non-routable bank values.
- The vulnerable transitive `underscore` version is overridden to `1.13.8`.
- Production deployments must terminate TLS, rate-limit session initialization at the edge, configure `MCP_ALLOWED_HOSTS` and `MCP_ALLOWED_ORIGINS`, keep session-affine routing, and keep OAuth and Outvoicer credentials out of logs and source control.

## About

This project is maintained by [Kristjan Suursoho](https://github.com/kristjansuursoho), who works with Outvoicer as a freelancer. It is an unofficial project and is not maintained or published by Outvoicer.

The Outvoicer API, internally known as Tetris, is available at [api.outvoicer.com](https://api.outvoicer.com). OpenAPI documentation is available there.
