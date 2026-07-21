import openapi from "../static/tetris-openapi.json"

export const INVOICE_GUIDE_URI = "outvoicer://invoice/guide"

export const invoiceGuide = JSON.stringify(
  {
    purpose:
      "Ground invoice creation, rendered review, human confirmation, and sending in the canonical Outvoicer OpenAPI contract.",
    workflow: [
      "Call create_invoice with the known client and line information. Names are accepted; when information is missing or ambiguous, show its tenant-scoped choices and retry with the user's selection.",
      "When create_invoice returns created, the unsent draft is ready for review.",
      "Call review_invoice to assign the invoice number and retrieve the rendered PDF.",
      "Show the PDF and returned invoice summary in chat, then ask whether changes are needed before sending. A human must review the PDF.",
      "Call send_invoice with the reviewId. The server asks the human to confirm and sends only after explicit acceptance.",
    ],
    behavior: {
      delivery: "Outvoicer sends an e-invoice when the client can receive one; otherwise it sends email.",
      duplicateProtection: "An invoice send can be triggered only once. Duplicate attempts return HTTP 409.",
      reviewValidity: "A review is short-lived and bound to the exact rendered PDF hash.",
    },
    source: "src/static/openapi.json",
    pointers: {
      create: "#/paths/~1api~1sell/post",
      print: "#/paths/~1api~1sell~1{id}~1print/post",
      read: "#/paths/~1api~1sell~1{id}/get",
      send: "#/paths/~1api~1sell~1{id}~1send/post",
      pdf: "#/paths/~1api~1pdf~1{id}/get",
      invoiceCreate: "#/components/schemas/InvoiceCreate",
      invoiceLineInput: "#/components/schemas/InvoiceLineInput",
      invoice: "#/components/schemas/Invoice",
    },
    contract: {
      create: openapi.paths["/api/sell"].post,
      print: openapi.paths["/api/sell/{id}/print"].post,
      read: openapi.paths["/api/sell/{id}"].get,
      send: openapi.paths["/api/sell/{id}/send"].post,
      pdf: openapi.paths["/api/pdf/{id}"].get,
      invoiceCreate: openapi.components.schemas.InvoiceCreate,
      invoiceLineInput: openapi.components.schemas.InvoiceLineInput,
      invoice: openapi.components.schemas.Invoice,
    },
  },
  null,
  2
)
