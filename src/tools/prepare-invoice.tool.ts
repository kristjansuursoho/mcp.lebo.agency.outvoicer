import { propagateAttributes, startActiveObservation } from "@langfuse/tracing"
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp"
import { selectClientByIdentifier, selectProductByIdentifier } from "@/lib/tool-responses"
import { prepareInvoiceInputSchema, prepareInvoiceOutputSchema } from "@/domain/invoice"
import { CreateSimpleToolError, TOOL_ERROR } from "@/lib/tool-errors"
import { AuthorizationToolError } from "@/lib/mcp-errors"
import { TetrisSDK, type CreateInvoiceBodyParam } from "@api/tetris"
import { mcpReqStorage } from "@/stores/mcp-request"

export const PREPARE_INVOICE_TOOL_NAME = "prepare-invoice"

export const prepareInvoiceData = {
  title: "Prepare invoice draft",
  description:
    "Resolve one client and invoice products without creating an invoice. Returns at most 10 matching or recently used choices and loops until the invoice payload is ready for create-invoice.",
  inputSchema: prepareInvoiceInputSchema,
  outputSchema: prepareInvoiceOutputSchema,
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  },
  _meta: {
    securitySchemes: [{ type: "oauth2", scopes: ["invoice:read"] }],
  },
}

export const registerPrepareInvoiceTool = (server: McpServer) =>
  server.registerTool(PREPARE_INVOICE_TOOL_NAME, prepareInvoiceData, async (input, extra) => {
    const store = mcpReqStorage.getStore()

    if (!store) {
      return CreateSimpleToolError(TOOL_ERROR.MISSING_CONTEXT)
    }

    if (!extra.authInfo?.scopes.includes("invoice:read")) {
      return AuthorizationToolError("invoice:read")
    }

    const attrs = {
      traceName: PREPARE_INVOICE_TOOL_NAME,
      tags: ["invoice"],
    }

    return propagateAttributes(attrs, () => {
      return startActiveObservation(
        PREPARE_INVOICE_TOOL_NAME,
        async (observation) => {
          try {
            const tetris = new TetrisSDK()

            tetris.server(`https://${store.subdomain}.outvoicer.com`)
            tetris.auth(store.outvoicerToken)

            let clientId = input.clientId
            let clientName = input.clientId

            if (!clientId) {
              const { data: clients } = await tetris.getClients()

              if (!clients.length) {
                return CreateSimpleToolError(TOOL_ERROR.NO_CLIENTS)
              }

              const res = selectClientByIdentifier(input.clientIdentifier, clients)

              if (res.type === "found") {
                clientId = res.payload.clientId
                clientName = res.payload.clientName
              } else {
                return res.payload
              }
            }

            if (extra.signal.aborted) {
              throw new Error("Invoice preparation was cancelled")
            }

            const needsProductSelection = input.lines.some((line) => !line.productId)
            const products = needsProductSelection ? (await tetris.getProducts()).data : []

            if (needsProductSelection && !products.length) {
              return CreateSimpleToolError(TOOL_ERROR.NO_PRODUCTS)
            }

            const preparedLines: CreateInvoiceBodyParam["lines"] = []

            for (const [lineIndex, line] of input.lines.entries()) {
              let productId = line.productId

              if (!productId) {
                const res = selectProductByIdentifier(line.productIdentifier, lineIndex, products)

                if (res.type === "found") {
                  productId = res.payload.productId
                } else {
                  return res.payload
                }
              }

              if (line.amount === undefined) {
                return {
                  content: [
                    {
                      type: "text" as const,
                      text: `What quantity of product ${productId} should be invoiced on line ${lineIndex + 1}?`,
                    },
                  ],
                  structuredContent: {
                    status: "missing_amount" as const,
                    clientId,
                    clientName,
                    context: { lineIndex, productId },
                  },
                }
              }

              const preparedLine: CreateInvoiceBodyParam["lines"][number] = {
                product: productId,
                amount: line.amount,
              }

              if (line.unitPrice !== undefined) preparedLine.unitPrice = line.unitPrice
              if (line.comment !== undefined) preparedLine.comment = line.comment
              if (line.exception !== undefined) preparedLine.exception = line.exception

              preparedLines.push(preparedLine)
            }

            if (extra.signal.aborted) {
              throw new Error("Invoice preparation was cancelled")
            }

            const invoice = {
              date: input.date,
              client: clientId,
              lines: preparedLines,
            }

            observation.update({ output: { status: "ready", lineCount: invoice.lines.length } })

            return {
              content: [
                {
                  type: "text" as const,
                  text: `Invoice draft for ${clientName} (${clientId}) is ready to create.`,
                },
              ],
              structuredContent: { status: "ready" as const, clientId, clientName, invoice },
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : "Tool call failed"

            observation.update({
              output: { status: "error" },
              level: "ERROR",
              statusMessage: message,
            })

            return {
              isError: true,
              content: [{ type: "text" as const, text: message }],
            }
          }
        },
        { asType: "tool" }
      )
    })
  })
