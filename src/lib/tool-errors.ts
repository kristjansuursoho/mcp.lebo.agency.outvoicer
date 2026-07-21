export enum TOOL_ERROR {
  MISSING_CONTEXT = "MISSING_CONTEXT",
  NO_CLIENTS = "NO_CLIENTS",
  NO_PRODUCTS = "NO_PRODUCTS",
}

export const TOOL_ERROR_DESCRIPTION = {
  [TOOL_ERROR.MISSING_CONTEXT]: "Context was lost.",
  [TOOL_ERROR.NO_CLIENTS]: "Register at least one client in Outvoicer before creating an invoice.",
  [TOOL_ERROR.NO_PRODUCTS]: "Register at least one product in Outvoicer before creating an invoice.",
}

export const CreateSimpleTextToolError = (text: string) => ({
  isError: true,
  content: [{ type: "text" as const, text }],
})

export const CreateSimpleToolError = (error: TOOL_ERROR) => ({
  isError: true,
  content: [{ type: "text" as const, text: TOOL_ERROR_DESCRIPTION[error] }],
})
