import type * as types from "./types"
import type { ConfigOptions, FetchResponse } from "api/dist/core"
import Oas from "oas"
import APICore from "api/dist/core"
import definition from "./openapi.json"

export class TetrisSDK {
  spec: Oas
  core: APICore

  constructor() {
    this.spec = Oas.init(definition)
    this.core = new APICore(this.spec, "tetris/1.0.0 (api/6.1.3)")
  }

  /**
   * Optionally configure various options that the SDK allows.
   *
   * @param config Object of supported SDK options and toggles.
   * @param config.timeout Override the default `fetch` request timeout of 30 seconds. This number
   * should be represented in milliseconds.
   */
  config(config: ConfigOptions) {
    this.core.setConfig(config)
  }

  /**
   * If the API you're using requires authentication you can supply the required credentials
   * through this method and the library will magically determine how they should be used
   * within your API request.
   *
   * With the exception of OpenID and MutualTLS, it supports all forms of authentication
   * supported by the OpenAPI specification.
   *
   * @example <caption>HTTP Basic auth</caption>
   * sdk.auth('username', 'password');
   *
   * @example <caption>Bearer tokens (HTTP or OAuth 2)</caption>
   * sdk.auth('myBearerToken');
   *
   * @example <caption>API Keys</caption>
   * sdk.auth('myApiKey');
   *
   * @see {@link https://spec.openapis.org/oas/v3.0.3#fixed-fields-22}
   * @see {@link https://spec.openapis.org/oas/v3.1.0#fixed-fields-22}
   * @param values Your auth credentials for the API; can specify up to two strings or numbers.
   */
  auth(...values: string[] | number[]) {
    this.core.setAuth(...values)
    return this
  }

  /**
   * If the API you're using offers alternate server URLs, and server variables, you can tell
   * the SDK which one to use with this method. To use it you can supply either one of the
   * server URLs that are contained within the OpenAPI definition (along with any server
   * variables), or you can pass it a fully qualified URL to use (that may or may not exist
   * within the OpenAPI definition).
   *
   * @example <caption>Server URL with server variables</caption>
   * sdk.server('https://{region}.api.example.com/{basePath}', {
   *   name: 'eu',
   *   basePath: 'v14',
   * });
   *
   * @example <caption>Fully qualified server URL</caption>
   * sdk.server('https://eu.api.example.com/v14');
   *
   * @param url Server URL
   * @param variables An object of variables to replace into the server URL.
   */
  server(url: string, variables = {}) {
    this.core.setServer(url, variables)
  }

  /**
   * Every user can have one Bearer token. Called against app.outvoicer.com, not the customer
   * subdomain.
   *
   * @summary View your Bearer token
   * @throws FetchError<401, types.ViewBearerTokenResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   */
  viewBearerToken(): Promise<FetchResponse<200, types.ViewBearerTokenResponse200>> {
    return this.core.fetch("/api/user/bearer/view", "get")
  }

  /**
   * Generates (or regenerates) the user's single Bearer token. Called against
   * app.outvoicer.com.
   *
   * @summary Generate a new Bearer token
   * @throws FetchError<401, types.GenerateBearerTokenResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   */
  generateBearerToken(): Promise<FetchResponse<200, types.GenerateBearerTokenResponse200>> {
    return this.core.fetch("/api/user/bearer/generate", "post")
  }

  /**
   * Called against app.outvoicer.com.
   *
   * @summary Delete your Bearer token
   * @throws FetchError<401, types.DeleteBearerTokenResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   */
  deleteBearerToken(): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch("/api/user/bearer/token", "delete")
  }

  /**
   * Test the token / connectivity against a customer subdomain
   *
   * @throws FetchError<401, types.TestTokenResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   */
  testToken(): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch("/api/test", "get")
  }

  /**
   * Get all clients
   *
   * @throws FetchError<401, types.GetClientsResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   */
  getClients(): Promise<FetchResponse<200, types.GetClientsResponse200>> {
    return this.core.fetch("/api/client", "get")
  }

  /**
   * Create a client
   *
   * @throws FetchError<400, types.CreateClientResponse400> Invalid payload (e.g. email fails validation, country is not a real country name,
   * referenced client/product does not exist)
   * @throws FetchError<401, types.CreateClientResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   */
  createClient(body: types.CreateClientBodyParam): Promise<FetchResponse<200, types.CreateClientResponse200>> {
    return this.core.fetch("/api/client", "post", body)
  }

  /**
   * Recommended in automated workflows: overwrite the client every month, because the e-mail
   * address or company name may have changed. Returns the full updated client (including
   * `client.id`, which is needed for forwarding).
   *
   * @summary Create a client or overwrite it if it already exists
   * @throws FetchError<400, types.PostOrOverwriteClientResponse400> Invalid payload (e.g. email fails validation, country is not a real country name,
   * referenced client/product does not exist)
   * @throws FetchError<401, types.PostOrOverwriteClientResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   */
  postOrOverwriteClient(
    body: types.PostOrOverwriteClientBodyParam
  ): Promise<FetchResponse<200, types.PostOrOverwriteClientResponse200>> {
    return this.core.fetch("/api/client/post-or-overwrite", "post", body)
  }

  /**
   * Express variant of post-or-overwrite that also forwards the client to the connected
   * accounting software. In highly automated workflows a 2-step approach (post-or-overwrite,
   * then forward) is recommended, because either step can fail independently and separate
   * calls make debugging easier. Returns the full updated client.
   *
   * @summary Create/overwrite a client and forward it to the accounting software in one call
   * @throws FetchError<400, types.PostForwardAndOverwriteClientResponse400> Invalid payload (e.g. email fails validation, country is not a real country name,
   * referenced client/product does not exist)
   * @throws FetchError<401, types.PostForwardAndOverwriteClientResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   */
  postForwardAndOverwriteClient(
    body: types.PostForwardAndOverwriteClientBodyParam
  ): Promise<FetchResponse<200, types.PostForwardAndOverwriteClientResponse200>> {
    return this.core.fetch("/api/client/post-forward-and-overwrite", "post", body)
  }

  /**
   * Get one client
   *
   * @throws FetchError<401, types.GetClientResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   * @throws FetchError<404, types.GetClientResponse404> Resource not found
   */
  getClient(metadata: types.GetClientMetadataParam): Promise<FetchResponse<200, types.GetClientResponse200>> {
    return this.core.fetch("/api/client/{clientId}", "get", metadata)
  }

  /**
   * Update one client
   *
   * @throws FetchError<400, types.UpdateClientResponse400> Invalid payload (e.g. email fails validation, country is not a real country name,
   * referenced client/product does not exist)
   * @throws FetchError<401, types.UpdateClientResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   * @throws FetchError<404, types.UpdateClientResponse404> Resource not found
   */
  updateClient(
    body: types.UpdateClientBodyParam,
    metadata: types.UpdateClientMetadataParam
  ): Promise<FetchResponse<200, types.UpdateClientResponse200>> {
    return this.core.fetch("/api/client/{clientId}", "put", body, metadata)
  }

  /**
   * Delete one client
   *
   * @throws FetchError<401, types.DeleteClientResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   * @throws FetchError<404, types.DeleteClientResponse404> Resource not found
   */
  deleteClient(metadata: types.DeleteClientMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch("/api/client/{clientId}", "delete", metadata)
  }

  /**
   * Removes a single field (key) from the client document (the data store is NoSQL).
   *
   * @summary Delete one key from a client
   * @throws FetchError<401, types.DeleteClientKeyResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   * @throws FetchError<404, types.DeleteClientKeyResponse404> Resource not found
   */
  deleteClientKey(
    metadata: types.DeleteClientKeyMetadataParam
  ): Promise<FetchResponse<200, types.DeleteClientKeyResponse200>> {
    return this.core.fetch("/api/client/{clientId}/{keyname}", "delete", metadata)
  }

  /**
   * Get the client's current e-invoice eligibility / delivery channel
   *
   * @throws FetchError<401, types.GetClientChannelResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   * @throws FetchError<404, types.GetClientChannelResponse404> Resource not found
   */
  getClientChannel(
    metadata: types.GetClientChannelMetadataParam
  ): Promise<FetchResponse<200, types.GetClientChannelResponse200>> {
    return this.core.fetch("/api/client/{clientId}/channel", "get", metadata)
  }

  /**
   * Checks e-invoice registries and updates the client's delivery channel so invoices can be
   * delivered as e-invoices where possible.
   *
   * @summary Refresh / verify that the client can receive e-invoices
   * @throws FetchError<401, types.UpdateClientChannelResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   * @throws FetchError<404, types.UpdateClientChannelResponse404> Resource not found
   */
  updateClientChannel(
    metadata: types.UpdateClientChannelMetadataParam
  ): Promise<FetchResponse<200, types.UpdateClientChannelResponse200>> {
    return this.core.fetch("/api/client/{clientId}/channel", "put", metadata)
  }

  /**
   * Search clients by name
   *
   * @throws FetchError<401, types.SearchClientsResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   */
  searchClients(
    metadata: types.SearchClientsMetadataParam
  ): Promise<FetchResponse<200, types.SearchClientsResponse200>> {
    return this.core.fetch("/api/client/{name}/search", "get", metadata)
  }

  /**
   * Get all invoices of a client
   *
   * @throws FetchError<401, types.GetClientInvoicesResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   */
  getClientInvoices(
    metadata: types.GetClientInvoicesMetadataParam
  ): Promise<FetchResponse<200, types.GetClientInvoicesResponse200>> {
    return this.core.fetch("/api/client/{name}/sell", "get", metadata)
  }

  /**
   * Sends the client to the connected accounting software so it can be referenced on
   * forwarded sales invoices. Payload is an empty object.
   *
   * @summary Forward a client to the accounting software
   * @throws FetchError<401, types.ForwardClientResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   * @throws FetchError<404, types.ForwardClientResponse404> Resource not found
   */
  forwardClient(
    body: types.ForwardClientBodyParam,
    metadata: types.ForwardClientMetadataParam
  ): Promise<FetchResponse<200, types.ForwardClientResponse200>> {
    return this.core.fetch("/api/client/{clientId}/forward", "post", body, metadata)
  }

  /**
   * Not all accounting softwares have all integration endpoints available.
   *
   * @summary Import all customers from the accounting software
   * @throws FetchError<401, types.ImportClientsFromIntegrationResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   * @throws FetchError<501, types.ImportClientsFromIntegrationResponse501> The connected accounting software does not support this integration endpoint
   */
  importClientsFromIntegration(): Promise<FetchResponse<200, types.ImportClientsFromIntegrationResponse200>> {
    return this.core.fetch("/api/client/import/integration", "get")
  }

  /**
   * View all clients in the accounting software
   *
   * @throws FetchError<401, types.ViewClientsInIntegrationResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   * @throws FetchError<501, types.ViewClientsInIntegrationResponse501> The connected accounting software does not support this integration endpoint
   */
  viewClientsInIntegration(): Promise<FetchResponse<200, types.ViewClientsInIntegrationResponse200>> {
    return this.core.fetch("/api/client/view/integration", "get")
  }

  /**
   * View one client in the accounting software
   *
   * @throws FetchError<401, types.ViewClientInIntegrationResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   * @throws FetchError<404, types.ViewClientInIntegrationResponse404> Resource not found
   * @throws FetchError<501, types.ViewClientInIntegrationResponse501> The connected accounting software does not support this integration endpoint
   */
  viewClientInIntegration(
    metadata: types.ViewClientInIntegrationMetadataParam
  ): Promise<FetchResponse<200, types.ViewClientInIntegrationResponse200>> {
    return this.core.fetch("/api/client/{clientId}/view/integration", "get", metadata)
  }

  /**
   * Delete a client from the accounting software integration
   *
   * @throws FetchError<401, types.DeleteClientFromIntegrationResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   * @throws FetchError<404, types.DeleteClientFromIntegrationResponse404> Resource not found
   * @throws FetchError<501, types.DeleteClientFromIntegrationResponse501> The connected accounting software does not support this integration endpoint
   */
  deleteClientFromIntegration(
    metadata: types.DeleteClientFromIntegrationMetadataParam
  ): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch("/api/client/{clientId}/from/integration", "delete", metadata)
  }

  /**
   * Get client debt or prepayment (balance)
   *
   * @throws FetchError<401, types.GetClientBalanceResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   * @throws FetchError<501, types.GetClientBalanceResponse501> The connected accounting software does not support this integration endpoint
   */
  getClientBalance(): Promise<FetchResponse<200, types.GetClientBalanceResponse200>> {
    return this.core.fetch("/api/client/get/balance", "get")
  }

  /**
   * Get all products
   *
   * @throws FetchError<401, types.GetProductsResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   */
  getProducts(): Promise<FetchResponse<200, types.GetProductsResponse200>> {
    return this.core.fetch("/api/product", "get")
  }

  /**
   * Create a product
   *
   * @throws FetchError<400, types.CreateProductResponse400> Invalid payload (e.g. email fails validation, country is not a real country name,
   * referenced client/product does not exist)
   * @throws FetchError<401, types.CreateProductResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   */
  createProduct(body: types.CreateProductBodyParam): Promise<FetchResponse<200, types.CreateProductResponse200>> {
    return this.core.fetch("/api/product", "post", body)
  }

  /**
   * Get one product
   *
   * @throws FetchError<401, types.GetProductResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   * @throws FetchError<404, types.GetProductResponse404> Resource not found
   */
  getProduct(metadata: types.GetProductMetadataParam): Promise<FetchResponse<200, types.GetProductResponse200>> {
    return this.core.fetch("/api/product/{productId}", "get", metadata)
  }

  /**
   * Also used for one-time settings such as locking the price so mobile app users cannot
   * change the API-set price: `{ "lockPrice": true }`.
   *
   * @summary Update one product
   * @throws FetchError<400, types.UpdateProductResponse400> Invalid payload (e.g. email fails validation, country is not a real country name,
   * referenced client/product does not exist)
   * @throws FetchError<401, types.UpdateProductResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   * @throws FetchError<404, types.UpdateProductResponse404> Resource not found
   */
  updateProduct(
    body: types.UpdateProductBodyParam,
    metadata: types.UpdateProductMetadataParam
  ): Promise<FetchResponse<200, types.UpdateProductResponse200>> {
    return this.core.fetch("/api/product/{productId}", "put", body, metadata)
  }

  /**
   * Delete one product
   *
   * @throws FetchError<401, types.DeleteProductResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   * @throws FetchError<404, types.DeleteProductResponse404> Resource not found
   */
  deleteProduct(metadata: types.DeleteProductMetadataParam): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch("/api/product/{productId}", "delete", metadata)
  }

  /**
   * Forward a product to the accounting software
   *
   * @throws FetchError<401, types.ForwardProductResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   * @throws FetchError<404, types.ForwardProductResponse404> Resource not found
   * @throws FetchError<501, types.ForwardProductResponse501> The connected accounting software does not support this integration endpoint
   */
  forwardProduct(
    body: types.ForwardProductBodyParam,
    metadata: types.ForwardProductMetadataParam
  ): Promise<FetchResponse<200, types.ForwardProductResponse200>> {
    return this.core.fetch("/api/product/{productId}/forward", "post", body, metadata)
  }

  /**
   * Import all products from the accounting software
   *
   * @throws FetchError<401, types.ImportProductsFromIntegrationResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   * @throws FetchError<501, types.ImportProductsFromIntegrationResponse501> The connected accounting software does not support this integration endpoint
   */
  importProductsFromIntegration(): Promise<FetchResponse<200, types.ImportProductsFromIntegrationResponse200>> {
    return this.core.fetch("/api/product/import/integration", "get")
  }

  /**
   * Get seller company settings
   *
   * @throws FetchError<401, types.GetCompanyResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   */
  getCompany(): Promise<FetchResponse<200, types.GetCompanyResponse200>> {
    return this.core.fetch("/api/company", "get")
  }

  /**
   * Create / set seller company settings
   *
   * @throws FetchError<400, types.CreateCompanyResponse400> Invalid payload (e.g. email fails validation, country is not a real country name,
   * referenced client/product does not exist)
   * @throws FetchError<401, types.CreateCompanyResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   */
  createCompany(body: types.CreateCompanyBodyParam): Promise<FetchResponse<200, types.CreateCompanyResponse200>> {
    return this.core.fetch("/api/company", "post", body)
  }

  /**
   * Partial update — send only the fields you want to change. Example: set an invoice number
   * prefix to avoid duplicate invoice numbers in the accounting software: { "prefix": "api"
   * }.
   *
   * @summary Update seller company settings
   * @throws FetchError<400, types.UpdateCompanyResponse400> Invalid payload (e.g. email fails validation, country is not a real country name,
   * referenced client/product does not exist)
   * @throws FetchError<401, types.UpdateCompanyResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   */
  updateCompany(body: types.UpdateCompanyBodyParam): Promise<FetchResponse<200, types.UpdateCompanyResponse200>> {
    return this.core.fetch("/api/company", "put", body)
  }

  /**
   * Query all invoices
   *
   * @throws FetchError<401, types.GetInvoicesResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   */
  getInvoices(): Promise<FetchResponse<200, types.GetInvoicesResponse200>> {
    return this.core.fetch("/api/sell", "get")
  }

  /**
   * Saves the invoice data. No invoice number or PDF is generated yet (that happens on first
   * print). Requires that the referenced client and products exist and are already forwarded
   * to the accounting software (when integration forwarding is used later).
   *
   * @summary Create an invoice
   * @throws FetchError<400, types.CreateInvoiceResponse400> Invalid payload (e.g. email fails validation, country is not a real country name,
   * referenced client/product does not exist)
   * @throws FetchError<401, types.CreateInvoiceResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   */
  createInvoice(body: types.CreateInvoiceBodyParam): Promise<FetchResponse<200, types.CreateInvoiceResponse200>> {
    return this.core.fetch("/api/sell", "post", body)
  }

  /**
   * Create an invoice, assign an invoice number and generate the PDF (+ JPG preview)
   *
   * @throws FetchError<400, types.CreateAndPrintInvoiceResponse400> Invalid payload (e.g. email fails validation, country is not a real country name,
   * referenced client/product does not exist)
   * @throws FetchError<401, types.CreateAndPrintInvoiceResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   */
  createAndPrintInvoice(
    body: types.CreateAndPrintInvoiceBodyParam
  ): Promise<FetchResponse<200, types.CreateAndPrintInvoiceResponse200>> {
    return this.core.fetch("/api/sell/post-and-print", "post", body)
  }

  /**
   * Sends as e-invoice if the client can receive one, otherwise emails it.
   * Duplicate-protected.
   *
   * @summary Create an invoice, generate the PDF and send it to the client
   * @throws FetchError<400, types.CreateAndSendInvoiceResponse400> Invalid payload (e.g. email fails validation, country is not a real country name,
   * referenced client/product does not exist)
   * @throws FetchError<401, types.CreateAndSendInvoiceResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   * @throws FetchError<409, types.CreateAndSendInvoiceResponse409> Duplicate prevented — this consequence-bearing action (send / forward) has already been
   * triggered for this invoice
   */
  createAndSendInvoice(
    body: types.CreateAndSendInvoiceBodyParam
  ): Promise<FetchResponse<200, types.CreateAndSendInvoiceResponse200>> {
    return this.core.fetch("/api/sell/post-and-send", "post", body)
  }

  /**
   * One-shot convenience endpoint. Requires that the referenced client and products exist
   * and have already been forwarded to the accounting software. Duplicate-protected.
   *
   * @summary Create an invoice, generate the PDF, send it to the client and forward it to the
   * accounting software
   * @throws FetchError<400, types.CreateSendAndForwardInvoiceResponse400> Invalid payload (e.g. email fails validation, country is not a real country name,
   * referenced client/product does not exist)
   * @throws FetchError<401, types.CreateSendAndForwardInvoiceResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   * @throws FetchError<409, types.CreateSendAndForwardInvoiceResponse409> Duplicate prevented — this consequence-bearing action (send / forward) has already been
   * triggered for this invoice
   */
  createSendAndForwardInvoice(
    body: types.CreateSendAndForwardInvoiceBodyParam
  ): Promise<FetchResponse<200, types.CreateSendAndForwardInvoiceResponse200>> {
    return this.core.fetch("/api/sell/post-send-and-forward", "post", body)
  }

  /**
   * The invoice can be addressed by its internal id (e.g. `68b544f233f9e94dcfc24dd3`) at any
   * time, or by its invoice number (e.g. `1234`) once the number has been assigned (numbers
   * are assigned when the PDF is first generated).
   *
   * @summary View one invoice
   * @throws FetchError<401, types.GetInvoiceResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   * @throws FetchError<404, types.GetInvoiceResponse404> Resource not found
   */
  getInvoice(metadata: types.GetInvoiceMetadataParam): Promise<FetchResponse<200, types.GetInvoiceResponse200>> {
    return this.core.fetch("/api/sell/{id}", "get", metadata)
  }

  /**
   * The invoice can be printed many times; the invoice number is assigned only on the first
   * print.
   *
   * @summary Create the invoice PDF and assign an invoice number
   * @throws FetchError<401, types.PrintInvoiceResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   * @throws FetchError<404, types.PrintInvoiceResponse404> Resource not found
   */
  printInvoice(
    body: types.PrintInvoiceBodyParam,
    metadata: types.PrintInvoiceMetadataParam
  ): Promise<FetchResponse<200, types.PrintInvoiceResponse200>> {
    return this.core.fetch("/api/sell/{id}/print", "post", body, metadata)
  }

  /**
   * Automatically sends an e-invoice if the client can receive one, otherwise defaults to
   * email. Duplicate-protected: can be triggered only once.
   *
   * @summary Send an invoice to the client
   * @throws FetchError<401, types.SendInvoiceResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   * @throws FetchError<404, types.SendInvoiceResponse404> Resource not found
   * @throws FetchError<409, types.SendInvoiceResponse409> Duplicate prevented — this consequence-bearing action (send / forward) has already been
   * triggered for this invoice
   */
  sendInvoice(
    body: types.SendInvoiceBodyParam,
    metadata: types.SendInvoiceMetadataParam
  ): Promise<FetchResponse<200, types.SendInvoiceResponse200>> {
    return this.core.fetch("/api/sell/{id}/send", "post", body, metadata)
  }

  /**
   * Duplicate-protected: can be triggered only once.
   *
   * @summary Send an invoice by email only
   * @throws FetchError<401, types.EmailInvoiceResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   * @throws FetchError<404, types.EmailInvoiceResponse404> Resource not found
   * @throws FetchError<409, types.EmailInvoiceResponse409> Duplicate prevented — this consequence-bearing action (send / forward) has already been
   * triggered for this invoice
   */
  emailInvoice(
    body: types.EmailInvoiceBodyParam,
    metadata: types.EmailInvoiceMetadataParam
  ): Promise<FetchResponse<200, types.EmailInvoiceResponse200>> {
    return this.core.fetch("/api/sell/{id}/email", "post", body, metadata)
  }

  /**
   * Requires e-invoicing to be enabled for the seller and the client to be able to receive
   * e-invoices. Duplicate-protected: can be triggered only once.
   *
   * @summary Send an invoice as an e-invoice only
   * @throws FetchError<401, types.EinvoiceInvoiceResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   * @throws FetchError<404, types.EinvoiceInvoiceResponse404> Resource not found
   * @throws FetchError<409, types.EinvoiceInvoiceResponse409> Duplicate prevented — this consequence-bearing action (send / forward) has already been
   * triggered for this invoice
   */
  einvoiceInvoice(
    body: types.EinvoiceInvoiceBodyParam,
    metadata: types.EinvoiceInvoiceMetadataParam
  ): Promise<FetchResponse<200, types.EinvoiceInvoiceResponse200>> {
    return this.core.fetch("/api/sell/{id}/einvoice", "post", body, metadata)
  }

  /**
   * Duplicate-protected: can be triggered only once.
   *
   * @summary Forward an invoice to the accounting software under sales invoices
   * @throws FetchError<401, types.ForwardInvoiceResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   * @throws FetchError<404, types.ForwardInvoiceResponse404> Resource not found
   * @throws FetchError<409, types.ForwardInvoiceResponse409> Duplicate prevented — this consequence-bearing action (send / forward) has already been
   * triggered for this invoice
   * @throws FetchError<501, types.ForwardInvoiceResponse501> The connected accounting software does not support this integration endpoint
   */
  forwardInvoice(
    body: types.ForwardInvoiceBodyParam,
    metadata: types.ForwardInvoiceMetadataParam
  ): Promise<FetchResponse<200, types.ForwardInvoiceResponse200>> {
    return this.core.fetch("/api/sell/{id}/forward", "post", body, metadata)
  }

  /**
   * Query invoices from a specific month
   *
   * @throws FetchError<401, types.GetInvoicesByMonthResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   */
  getInvoicesByMonth(
    metadata: types.GetInvoicesByMonthMetadataParam
  ): Promise<FetchResponse<200, types.GetInvoicesByMonthResponse200>> {
    return this.core.fetch("/api/sell/total/{year}/{month}", "get", metadata)
  }

  /**
   * The JPG preview is generated together with the PDF (post-and-print or print).
   *
   * @summary Get the invoice preview as a JPG
   * @throws FetchError<401, types.GetInvoiceJpgResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   * @throws FetchError<404, types.GetInvoiceJpgResponse404> Resource not found
   */
  getInvoiceJpg(
    metadata: types.GetInvoiceJpgMetadataParam
  ): Promise<FetchResponse<200, types.GetInvoiceJpgResponse200>> {
    return this.core.fetch("/api/jpg/{id}", "get", metadata)
  }

  /**
   * Download the invoice PDF
   *
   * @throws FetchError<401, types.GetInvoicePdfResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   * @throws FetchError<404, types.GetInvoicePdfResponse404> Resource not found
   */
  getInvoicePdf(
    metadata: types.GetInvoicePdfMetadataParam
  ): Promise<FetchResponse<200, types.GetInvoicePdfResponse200>> {
    return this.core.fetch("/api/pdf/{id}", "get", metadata)
  }

  /**
   * Not all accounting softwares have all integration endpoints available.
   *
   * @summary View all products in the accounting software
   * @throws FetchError<401, types.ViewProductsInIntegrationResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   * @throws FetchError<501, types.ViewProductsInIntegrationResponse501> The connected accounting software does not support this integration endpoint
   */
  viewProductsInIntegration(): Promise<FetchResponse<200, types.ViewProductsInIntegrationResponse200>> {
    return this.core.fetch("/api/product/view/integration", "get")
  }

  /**
   * View one product in the accounting software
   *
   * @throws FetchError<401, types.ViewProductInIntegrationResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   * @throws FetchError<404, types.ViewProductInIntegrationResponse404> Resource not found
   * @throws FetchError<501, types.ViewProductInIntegrationResponse501> The connected accounting software does not support this integration endpoint
   */
  viewProductInIntegration(
    metadata: types.ViewProductInIntegrationMetadataParam
  ): Promise<FetchResponse<200, types.ViewProductInIntegrationResponse200>> {
    return this.core.fetch("/api/product/{productId}/view/integration", "get", metadata)
  }

  /**
   * Delete product from the accounting software integration
   *
   * @throws FetchError<401, types.DeleteProductFromIntegrationResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   * @throws FetchError<404, types.DeleteProductFromIntegrationResponse404> Resource not found
   * @throws FetchError<501, types.DeleteProductFromIntegrationResponse501> The connected accounting software does not support this integration endpoint
   */
  deleteProductFromIntegration(
    metadata: types.DeleteProductFromIntegrationMetadataParam
  ): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch("/api/product/{productId}/from/integration", "delete", metadata)
  }

  /**
   * Not all accounting softwares have all integration endpoints available.
   *
   * @summary View all invoices in the accounting software
   * @throws FetchError<401, types.ViewInvoicesInIntegrationResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   * @throws FetchError<501, types.ViewInvoicesInIntegrationResponse501> The connected accounting software does not support this integration endpoint
   */
  viewInvoicesInIntegration(): Promise<FetchResponse<200, types.ViewInvoicesInIntegrationResponse200>> {
    return this.core.fetch("/api/sell/view/integration", "get")
  }

  /**
   * View one invoice in the accounting software
   *
   * @throws FetchError<401, types.ViewInvoiceInIntegrationResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   * @throws FetchError<404, types.ViewInvoiceInIntegrationResponse404> Resource not found
   * @throws FetchError<501, types.ViewInvoiceInIntegrationResponse501> The connected accounting software does not support this integration endpoint
   */
  viewInvoiceInIntegration(
    metadata: types.ViewInvoiceInIntegrationMetadataParam
  ): Promise<FetchResponse<200, types.ViewInvoiceInIntegrationResponse200>> {
    return this.core.fetch("/api/sell/{id}/view/integration", "get", metadata)
  }

  /**
   * Delete invoice from the accounting software integration
   *
   * @throws FetchError<401, types.DeleteInvoiceFromIntegrationResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   * @throws FetchError<404, types.DeleteInvoiceFromIntegrationResponse404> Resource not found
   * @throws FetchError<501, types.DeleteInvoiceFromIntegrationResponse501> The connected accounting software does not support this integration endpoint
   */
  deleteInvoiceFromIntegration(
    metadata: types.DeleteInvoiceFromIntegrationMetadataParam
  ): Promise<FetchResponse<number, unknown>> {
    return this.core.fetch("/api/sell/{id}/from/integration", "delete", metadata)
  }

  /**
   * Validates the client's VAT number against the EU VIES (VAT Information Exchange System)
   * service.
   *
   * @summary Validate client VAT number (VIES)
   * @throws FetchError<401, types.ValidateClientVatResponse401> Missing or invalid Bearer token, or the token has no access to this subdomain
   * @throws FetchError<404, types.ValidateClientVatResponse404> Resource not found
   */
  validateClientVat(
    metadata: types.ValidateClientVatMetadataParam
  ): Promise<FetchResponse<200, types.ValidateClientVatResponse200>> {
    return this.core.fetch("/api/client/{clientId}/vies", "get", metadata)
  }
}

const createSDK = (() => {
  return new TetrisSDK()
})()

export default createSDK

export type {
  CreateAndPrintInvoiceBodyParam,
  CreateAndPrintInvoiceResponse200,
  CreateAndPrintInvoiceResponse400,
  CreateAndPrintInvoiceResponse401,
  CreateAndSendInvoiceBodyParam,
  CreateAndSendInvoiceResponse200,
  CreateAndSendInvoiceResponse400,
  CreateAndSendInvoiceResponse401,
  CreateAndSendInvoiceResponse409,
  CreateClientBodyParam,
  CreateClientResponse200,
  CreateClientResponse400,
  CreateClientResponse401,
  CreateCompanyBodyParam,
  CreateCompanyResponse200,
  CreateCompanyResponse400,
  CreateCompanyResponse401,
  CreateInvoiceBodyParam,
  CreateInvoiceResponse200,
  CreateInvoiceResponse400,
  CreateInvoiceResponse401,
  CreateProductBodyParam,
  CreateProductResponse200,
  CreateProductResponse400,
  CreateProductResponse401,
  CreateSendAndForwardInvoiceBodyParam,
  CreateSendAndForwardInvoiceResponse200,
  CreateSendAndForwardInvoiceResponse400,
  CreateSendAndForwardInvoiceResponse401,
  CreateSendAndForwardInvoiceResponse409,
  DeleteBearerTokenResponse401,
  DeleteClientFromIntegrationMetadataParam,
  DeleteClientFromIntegrationResponse401,
  DeleteClientFromIntegrationResponse404,
  DeleteClientFromIntegrationResponse501,
  DeleteClientKeyMetadataParam,
  DeleteClientKeyResponse200,
  DeleteClientKeyResponse401,
  DeleteClientKeyResponse404,
  DeleteClientMetadataParam,
  DeleteClientResponse401,
  DeleteClientResponse404,
  DeleteInvoiceFromIntegrationMetadataParam,
  DeleteInvoiceFromIntegrationResponse401,
  DeleteInvoiceFromIntegrationResponse404,
  DeleteInvoiceFromIntegrationResponse501,
  DeleteProductFromIntegrationMetadataParam,
  DeleteProductFromIntegrationResponse401,
  DeleteProductFromIntegrationResponse404,
  DeleteProductFromIntegrationResponse501,
  DeleteProductMetadataParam,
  DeleteProductResponse401,
  DeleteProductResponse404,
  EinvoiceInvoiceBodyParam,
  EinvoiceInvoiceMetadataParam,
  EinvoiceInvoiceResponse200,
  EinvoiceInvoiceResponse401,
  EinvoiceInvoiceResponse404,
  EinvoiceInvoiceResponse409,
  EmailInvoiceBodyParam,
  EmailInvoiceMetadataParam,
  EmailInvoiceResponse200,
  EmailInvoiceResponse401,
  EmailInvoiceResponse404,
  EmailInvoiceResponse409,
  ForwardClientBodyParam,
  ForwardClientMetadataParam,
  ForwardClientResponse200,
  ForwardClientResponse401,
  ForwardClientResponse404,
  ForwardInvoiceBodyParam,
  ForwardInvoiceMetadataParam,
  ForwardInvoiceResponse200,
  ForwardInvoiceResponse401,
  ForwardInvoiceResponse404,
  ForwardInvoiceResponse409,
  ForwardInvoiceResponse501,
  ForwardProductBodyParam,
  ForwardProductMetadataParam,
  ForwardProductResponse200,
  ForwardProductResponse401,
  ForwardProductResponse404,
  ForwardProductResponse501,
  GenerateBearerTokenResponse200,
  GenerateBearerTokenResponse401,
  GetClientBalanceResponse200,
  GetClientBalanceResponse401,
  GetClientBalanceResponse501,
  GetClientChannelMetadataParam,
  GetClientChannelResponse200,
  GetClientChannelResponse401,
  GetClientChannelResponse404,
  GetClientInvoicesMetadataParam,
  GetClientInvoicesResponse200,
  GetClientInvoicesResponse401,
  GetClientMetadataParam,
  GetClientResponse200,
  GetClientResponse401,
  GetClientResponse404,
  GetClientsResponse200,
  GetClientsResponse401,
  GetCompanyResponse200,
  GetCompanyResponse401,
  GetInvoiceJpgMetadataParam,
  GetInvoiceJpgResponse200,
  GetInvoiceJpgResponse401,
  GetInvoiceJpgResponse404,
  GetInvoiceMetadataParam,
  GetInvoicePdfMetadataParam,
  GetInvoicePdfResponse200,
  GetInvoicePdfResponse401,
  GetInvoicePdfResponse404,
  GetInvoiceResponse200,
  GetInvoiceResponse401,
  GetInvoiceResponse404,
  GetInvoicesByMonthMetadataParam,
  GetInvoicesByMonthResponse200,
  GetInvoicesByMonthResponse401,
  GetInvoicesResponse200,
  GetInvoicesResponse401,
  GetProductMetadataParam,
  GetProductResponse200,
  GetProductResponse401,
  GetProductResponse404,
  GetProductsResponse200,
  GetProductsResponse401,
  ImportClientsFromIntegrationResponse200,
  ImportClientsFromIntegrationResponse401,
  ImportClientsFromIntegrationResponse501,
  ImportProductsFromIntegrationResponse200,
  ImportProductsFromIntegrationResponse401,
  ImportProductsFromIntegrationResponse501,
  PostForwardAndOverwriteClientBodyParam,
  PostForwardAndOverwriteClientResponse200,
  PostForwardAndOverwriteClientResponse400,
  PostForwardAndOverwriteClientResponse401,
  PostOrOverwriteClientBodyParam,
  PostOrOverwriteClientResponse200,
  PostOrOverwriteClientResponse400,
  PostOrOverwriteClientResponse401,
  PrintInvoiceBodyParam,
  PrintInvoiceMetadataParam,
  PrintInvoiceResponse200,
  PrintInvoiceResponse401,
  PrintInvoiceResponse404,
  SearchClientsMetadataParam,
  SearchClientsResponse200,
  SearchClientsResponse401,
  SendInvoiceBodyParam,
  SendInvoiceMetadataParam,
  SendInvoiceResponse200,
  SendInvoiceResponse401,
  SendInvoiceResponse404,
  SendInvoiceResponse409,
  TestTokenResponse401,
  UpdateClientBodyParam,
  UpdateClientChannelMetadataParam,
  UpdateClientChannelResponse200,
  UpdateClientChannelResponse401,
  UpdateClientChannelResponse404,
  UpdateClientMetadataParam,
  UpdateClientResponse200,
  UpdateClientResponse400,
  UpdateClientResponse401,
  UpdateClientResponse404,
  UpdateCompanyBodyParam,
  UpdateCompanyResponse200,
  UpdateCompanyResponse400,
  UpdateCompanyResponse401,
  UpdateProductBodyParam,
  UpdateProductMetadataParam,
  UpdateProductResponse200,
  UpdateProductResponse400,
  UpdateProductResponse401,
  UpdateProductResponse404,
  ValidateClientVatMetadataParam,
  ValidateClientVatResponse200,
  ValidateClientVatResponse401,
  ValidateClientVatResponse404,
  ViewBearerTokenResponse200,
  ViewBearerTokenResponse401,
  ViewClientInIntegrationMetadataParam,
  ViewClientInIntegrationResponse200,
  ViewClientInIntegrationResponse401,
  ViewClientInIntegrationResponse404,
  ViewClientInIntegrationResponse501,
  ViewClientsInIntegrationResponse200,
  ViewClientsInIntegrationResponse401,
  ViewClientsInIntegrationResponse501,
  ViewInvoiceInIntegrationMetadataParam,
  ViewInvoiceInIntegrationResponse200,
  ViewInvoiceInIntegrationResponse401,
  ViewInvoiceInIntegrationResponse404,
  ViewInvoiceInIntegrationResponse501,
  ViewInvoicesInIntegrationResponse200,
  ViewInvoicesInIntegrationResponse401,
  ViewInvoicesInIntegrationResponse501,
  ViewProductInIntegrationMetadataParam,
  ViewProductInIntegrationResponse200,
  ViewProductInIntegrationResponse401,
  ViewProductInIntegrationResponse404,
  ViewProductInIntegrationResponse501,
  ViewProductsInIntegrationResponse200,
  ViewProductsInIntegrationResponse401,
  ViewProductsInIntegrationResponse501,
} from "./types"
