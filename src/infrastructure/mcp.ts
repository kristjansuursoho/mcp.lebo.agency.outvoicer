import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"

import { INVOICE_GUIDE_URI, invoiceGuide } from "@/resources/invoice-guide"
import { registerPrepareInvoiceTool } from "@/tools/prepare-invoice.tool"
import { registerCreateInvoiceTool } from "@/tools/create-invoice.tool"
import { logger } from "@/infrastructure/logger"

export function createMcp(subdomain: string) {
  logger.info(`new mcp for: ${subdomain}`)

  const mcp = new McpServer(
    {
      name: "outvoicer-mcp",
      title: "Outvoicer MCP",
      version: "0.1.0",
      description: "Prepare and create Outvoicer invoice drafts",
    },
    {
      enforceStrictCapabilities: true,
      instructions:
        `This session uses Outvoicer subdomain "${subdomain}" at https://${subdomain}.outvoicer.com. ` +
        "Always call prepare-invoice with all known invoice information before create-invoice. " +
        "When prepare-invoice reports missing_client, missing_products, or missing_amount, ask for that one value and retry while preserving known clientId and productId selections. Show supplied choices individually and never ask the user to find an ID in the browser. " +
        "When showing the selected client, always format it as clientName (clientId). " +
        "Only call create-invoice with the exact invoice payload returned by prepare-invoice when its status is ready. create-invoice creates an unsent draft. " +
        "Never request or expose bearer tokens in tool arguments or content.",
    }
  )

  mcp.registerResource(
    "invoice-guide",
    INVOICE_GUIDE_URI,
    {
      title: "Invoice workflow and OpenAPI context",
      description: "Canonical, cited context for creating, reviewing, and sending invoices",
      mimeType: "application/json",
      annotations: { audience: ["assistant"], priority: 1 },
    },
    async (uri) => ({
      contents: [{ uri: uri.href, mimeType: "application/json", text: invoiceGuide }],
    })
  )

  registerPrepareInvoiceTool(mcp)
  registerCreateInvoiceTool(mcp)

  return mcp
}
