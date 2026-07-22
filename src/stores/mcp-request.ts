import { AsyncLocalStorage } from "node:async_hooks"

export interface RequestContext {
  subdomain: string
  outvoicerToken: string
}

export const mcpReqStorage = new AsyncLocalStorage<RequestContext>()
