# outvoicer.mcp - Instructions

This project is providing MCP server for outvoicer - helping to create and manage e-invoicing (also regular).

This project is connected to another api that is called "tetris", that is connected to outvoicer.


## Facts about the building MCP

- Initial company registration, accounting integration setup, and enabling e-invoicing require human setup in Outvoicer. SmartID or Mobile-ID is used to prove board membership.
- Business requests use `https://{subdomain}.outvoicer.com`; bearer-token management uses `https://app.outvoicer.com`.
- One token may access multiple subdomains. Possession of a token does not identify the intended tenant.
- `GET /api/test` validates token access on the selected tenant.
- Successful `POST` and `PUT` operations return the complete current object. Treat that response as the new state.
- Sending and ERP forwarding are duplicate-protected consequence-bearing operations.
- Not every accounting integration supports every endpoint. API import is documented for Horizon Visma, Jumis Pro, and Zalktis; data import is documented for Jumis Start, Zalktis, and Moneo.
- An invoice internal `id` is usable immediately. Its `nr` is assigned on first print and can then also identify the invoice.
- Printing may be repeated, but only the first print assigns the invoice number.
- Normal send automatically chooses e-invoice when available and falls back to email.
- `VATRate` is always a JSON number. `unitPrice`, `amount`, `rounding`, `subtotal`, `total`, and `VAT` may be numbers or numeric strings.
- Invoice storage is NoSQL, so returned objects may contain additional fields and legacy fields may have mixed types.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing (!IMPORTANT!):

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- Do not make abstract functions when task dosent require it.
- Do not touch code the user explicitly says not to touch.
- Trust the type system. If a field is typed as required, do not add runtime guards, fallbacks, or normalization unless there is a known real-world data issue.
- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.
- If a DTO says a field is required, trust it. Do not wrap it with defensive helpers like `text()`, `numberValue()`, or fallback logic.
- Do not add guards for required DTO fields. Avoid code like `if (!id || !code) continue` when `id` and `code` are required by the type.
- Do not create aliases that only rename a DTO field. Prefer `tax.Id` over `const extId = tax.Id` when the original field is clearer.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

## Working Rules

- When you need to search docs, use `context7` tools.
- Prefer existing utilities, components, helpers, schemas, and server functions over new ones.
- Prefer validation schemas in `src/domain` for request and response shapes.
- Keep tables as clean, dont update them easily.
- DO NOT WRITE TEST IF NOT EXPLICITLY ASKED
- Be aware that in some point, ReceiptHunt is integrated with over 20 accounting and digitization system. Meaning tables and DTO should stay for general purpose not for one specific use case.
