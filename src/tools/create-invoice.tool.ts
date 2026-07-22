import { propagateAttributes, startActiveObservation } from "@langfuse/tracing"
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp"
import { createInvoiceInputSchema, createInvoiceOutputSchema } from "@/domain/invoice"
import { CreateSimpleToolError, TOOL_ERROR } from "@/lib/tool-errors"
import { AuthorizationToolError } from "@/lib/mcp-errors"
import { TetrisSDK, type CreateInvoiceBodyParam } from "@api/tetris"
import { mcpReqStorage } from "@/stores/mcp-request"

export const CREATE_INVOICE_TOOL_NAME = "create-invoice"

export const createInvoiceData = {
  title: "Create prepared invoice draft",
  description:
    "Create one unsent invoice draft from the complete resolved payload returned by prepare-invoice. This tool does not resolve missing clients or products.",
  inputSchema: createInvoiceInputSchema,
  outputSchema: createInvoiceOutputSchema,
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  _meta: {
    securitySchemes: [{ type: "oauth2", scopes: ["invoice:create"] }],
  },
}

export const registerCreateInvoiceTool = (server: McpServer) =>
  server.registerTool(CREATE_INVOICE_TOOL_NAME, createInvoiceData, async (input, extra) => {
    const store = mcpReqStorage.getStore()

    if (!store) {
      return CreateSimpleToolError(TOOL_ERROR.MISSING_CONTEXT)
    }

    if (!extra.authInfo?.scopes.includes("invoice:create")) {
      return AuthorizationToolError("invoice:create")
    }

    const attrs = {
      traceName: CREATE_INVOICE_TOOL_NAME,
      tags: ["invoice"],
    }

    return propagateAttributes(attrs, () => {
      return startActiveObservation(
        CREATE_INVOICE_TOOL_NAME,
        async (observation) => {
          try {
            if (extra.signal.aborted) {
              throw new Error("Invoice creation was cancelled before delivery")
            }

            const tetris = new TetrisSDK()

            tetris.server(`https://${store.subdomain}.outvoicer.com`)
            tetris.auth(store.outvoicerToken)

            const preparedInvoice: CreateInvoiceBodyParam = input.invoice
            const { data: invoice } = await tetris.createInvoice(preparedInvoice)

            observation.update({ output: { status: "created", invoice: { id: invoice.id } } })

            return {
              content: [
                {
                  type: "text" as const,
                  text: `Invoice [${invoice.id}] draft was created but not sent. Review its rendered PDF before sending.`,
                },
              ],
              // TODO: Return full invoice data, or preview using markdown/ascii
              structuredContent: { status: "created" as const, invoice: { id: invoice.id } },
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
