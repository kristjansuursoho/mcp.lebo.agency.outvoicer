import type { FromSchema } from "json-schema-to-ts"
import * as schemas from "./schemas"

export type CreateAndPrintInvoiceBodyParam = FromSchema<typeof schemas.CreateAndPrintInvoice.body>
export type CreateAndPrintInvoiceResponse200 = FromSchema<
  (typeof schemas.CreateAndPrintInvoice.response)["200"]
>
export type CreateAndPrintInvoiceResponse400 = FromSchema<
  (typeof schemas.CreateAndPrintInvoice.response)["400"]
>
export type CreateAndPrintInvoiceResponse401 = FromSchema<
  (typeof schemas.CreateAndPrintInvoice.response)["401"]
>
export type CreateAndSendInvoiceBodyParam = FromSchema<typeof schemas.CreateAndSendInvoice.body>
export type CreateAndSendInvoiceResponse200 = FromSchema<
  (typeof schemas.CreateAndSendInvoice.response)["200"]
>
export type CreateAndSendInvoiceResponse400 = FromSchema<
  (typeof schemas.CreateAndSendInvoice.response)["400"]
>
export type CreateAndSendInvoiceResponse401 = FromSchema<
  (typeof schemas.CreateAndSendInvoice.response)["401"]
>
export type CreateAndSendInvoiceResponse409 = FromSchema<
  (typeof schemas.CreateAndSendInvoice.response)["409"]
>
export type CreateClientBodyParam = FromSchema<typeof schemas.CreateClient.body>
export type CreateClientResponse200 = FromSchema<(typeof schemas.CreateClient.response)["200"]>
export type CreateClientResponse400 = FromSchema<(typeof schemas.CreateClient.response)["400"]>
export type CreateClientResponse401 = FromSchema<(typeof schemas.CreateClient.response)["401"]>
export type CreateCompanyBodyParam = FromSchema<typeof schemas.CreateCompany.body>
export type CreateCompanyResponse200 = FromSchema<(typeof schemas.CreateCompany.response)["200"]>
export type CreateCompanyResponse400 = FromSchema<(typeof schemas.CreateCompany.response)["400"]>
export type CreateCompanyResponse401 = FromSchema<(typeof schemas.CreateCompany.response)["401"]>
export type CreateInvoiceBodyParam = FromSchema<typeof schemas.CreateInvoice.body>
export type CreateInvoiceResponse200 = FromSchema<(typeof schemas.CreateInvoice.response)["200"]>
export type CreateInvoiceResponse400 = FromSchema<(typeof schemas.CreateInvoice.response)["400"]>
export type CreateInvoiceResponse401 = FromSchema<(typeof schemas.CreateInvoice.response)["401"]>
export type CreateProductBodyParam = FromSchema<typeof schemas.CreateProduct.body>
export type CreateProductResponse200 = FromSchema<(typeof schemas.CreateProduct.response)["200"]>
export type CreateProductResponse400 = FromSchema<(typeof schemas.CreateProduct.response)["400"]>
export type CreateProductResponse401 = FromSchema<(typeof schemas.CreateProduct.response)["401"]>
export type CreateSendAndForwardInvoiceBodyParam = FromSchema<
  typeof schemas.CreateSendAndForwardInvoice.body
>
export type CreateSendAndForwardInvoiceResponse200 = FromSchema<
  (typeof schemas.CreateSendAndForwardInvoice.response)["200"]
>
export type CreateSendAndForwardInvoiceResponse400 = FromSchema<
  (typeof schemas.CreateSendAndForwardInvoice.response)["400"]
>
export type CreateSendAndForwardInvoiceResponse401 = FromSchema<
  (typeof schemas.CreateSendAndForwardInvoice.response)["401"]
>
export type CreateSendAndForwardInvoiceResponse409 = FromSchema<
  (typeof schemas.CreateSendAndForwardInvoice.response)["409"]
>
export type DeleteBearerTokenResponse401 = FromSchema<
  (typeof schemas.DeleteBearerToken.response)["401"]
>
export type DeleteClientFromIntegrationMetadataParam = FromSchema<
  typeof schemas.DeleteClientFromIntegration.metadata
>
export type DeleteClientFromIntegrationResponse401 = FromSchema<
  (typeof schemas.DeleteClientFromIntegration.response)["401"]
>
export type DeleteClientFromIntegrationResponse404 = FromSchema<
  (typeof schemas.DeleteClientFromIntegration.response)["404"]
>
export type DeleteClientFromIntegrationResponse501 = FromSchema<
  (typeof schemas.DeleteClientFromIntegration.response)["501"]
>
export type DeleteClientKeyMetadataParam = FromSchema<typeof schemas.DeleteClientKey.metadata>
export type DeleteClientKeyResponse200 = FromSchema<
  (typeof schemas.DeleteClientKey.response)["200"]
>
export type DeleteClientKeyResponse401 = FromSchema<
  (typeof schemas.DeleteClientKey.response)["401"]
>
export type DeleteClientKeyResponse404 = FromSchema<
  (typeof schemas.DeleteClientKey.response)["404"]
>
export type DeleteClientMetadataParam = FromSchema<typeof schemas.DeleteClient.metadata>
export type DeleteClientResponse401 = FromSchema<(typeof schemas.DeleteClient.response)["401"]>
export type DeleteClientResponse404 = FromSchema<(typeof schemas.DeleteClient.response)["404"]>
export type DeleteInvoiceFromIntegrationMetadataParam = FromSchema<
  typeof schemas.DeleteInvoiceFromIntegration.metadata
>
export type DeleteInvoiceFromIntegrationResponse401 = FromSchema<
  (typeof schemas.DeleteInvoiceFromIntegration.response)["401"]
>
export type DeleteInvoiceFromIntegrationResponse404 = FromSchema<
  (typeof schemas.DeleteInvoiceFromIntegration.response)["404"]
>
export type DeleteInvoiceFromIntegrationResponse501 = FromSchema<
  (typeof schemas.DeleteInvoiceFromIntegration.response)["501"]
>
export type DeleteProductFromIntegrationMetadataParam = FromSchema<
  typeof schemas.DeleteProductFromIntegration.metadata
>
export type DeleteProductFromIntegrationResponse401 = FromSchema<
  (typeof schemas.DeleteProductFromIntegration.response)["401"]
>
export type DeleteProductFromIntegrationResponse404 = FromSchema<
  (typeof schemas.DeleteProductFromIntegration.response)["404"]
>
export type DeleteProductFromIntegrationResponse501 = FromSchema<
  (typeof schemas.DeleteProductFromIntegration.response)["501"]
>
export type DeleteProductMetadataParam = FromSchema<typeof schemas.DeleteProduct.metadata>
export type DeleteProductResponse401 = FromSchema<(typeof schemas.DeleteProduct.response)["401"]>
export type DeleteProductResponse404 = FromSchema<(typeof schemas.DeleteProduct.response)["404"]>
export type EinvoiceInvoiceBodyParam = FromSchema<typeof schemas.EinvoiceInvoice.body>
export type EinvoiceInvoiceMetadataParam = FromSchema<typeof schemas.EinvoiceInvoice.metadata>
export type EinvoiceInvoiceResponse200 = FromSchema<
  (typeof schemas.EinvoiceInvoice.response)["200"]
>
export type EinvoiceInvoiceResponse401 = FromSchema<
  (typeof schemas.EinvoiceInvoice.response)["401"]
>
export type EinvoiceInvoiceResponse404 = FromSchema<
  (typeof schemas.EinvoiceInvoice.response)["404"]
>
export type EinvoiceInvoiceResponse409 = FromSchema<
  (typeof schemas.EinvoiceInvoice.response)["409"]
>
export type EmailInvoiceBodyParam = FromSchema<typeof schemas.EmailInvoice.body>
export type EmailInvoiceMetadataParam = FromSchema<typeof schemas.EmailInvoice.metadata>
export type EmailInvoiceResponse200 = FromSchema<(typeof schemas.EmailInvoice.response)["200"]>
export type EmailInvoiceResponse401 = FromSchema<(typeof schemas.EmailInvoice.response)["401"]>
export type EmailInvoiceResponse404 = FromSchema<(typeof schemas.EmailInvoice.response)["404"]>
export type EmailInvoiceResponse409 = FromSchema<(typeof schemas.EmailInvoice.response)["409"]>
export type ForwardClientBodyParam = FromSchema<typeof schemas.ForwardClient.body>
export type ForwardClientMetadataParam = FromSchema<typeof schemas.ForwardClient.metadata>
export type ForwardClientResponse200 = FromSchema<(typeof schemas.ForwardClient.response)["200"]>
export type ForwardClientResponse401 = FromSchema<(typeof schemas.ForwardClient.response)["401"]>
export type ForwardClientResponse404 = FromSchema<(typeof schemas.ForwardClient.response)["404"]>
export type ForwardInvoiceBodyParam = FromSchema<typeof schemas.ForwardInvoice.body>
export type ForwardInvoiceMetadataParam = FromSchema<typeof schemas.ForwardInvoice.metadata>
export type ForwardInvoiceResponse200 = FromSchema<(typeof schemas.ForwardInvoice.response)["200"]>
export type ForwardInvoiceResponse401 = FromSchema<(typeof schemas.ForwardInvoice.response)["401"]>
export type ForwardInvoiceResponse404 = FromSchema<(typeof schemas.ForwardInvoice.response)["404"]>
export type ForwardInvoiceResponse409 = FromSchema<(typeof schemas.ForwardInvoice.response)["409"]>
export type ForwardInvoiceResponse501 = FromSchema<(typeof schemas.ForwardInvoice.response)["501"]>
export type ForwardProductBodyParam = FromSchema<typeof schemas.ForwardProduct.body>
export type ForwardProductMetadataParam = FromSchema<typeof schemas.ForwardProduct.metadata>
export type ForwardProductResponse200 = FromSchema<(typeof schemas.ForwardProduct.response)["200"]>
export type ForwardProductResponse401 = FromSchema<(typeof schemas.ForwardProduct.response)["401"]>
export type ForwardProductResponse404 = FromSchema<(typeof schemas.ForwardProduct.response)["404"]>
export type ForwardProductResponse501 = FromSchema<(typeof schemas.ForwardProduct.response)["501"]>
export type GenerateBearerTokenResponse200 = FromSchema<
  (typeof schemas.GenerateBearerToken.response)["200"]
>
export type GenerateBearerTokenResponse401 = FromSchema<
  (typeof schemas.GenerateBearerToken.response)["401"]
>
export type GetClientBalanceResponse200 = FromSchema<
  (typeof schemas.GetClientBalance.response)["200"]
>
export type GetClientBalanceResponse401 = FromSchema<
  (typeof schemas.GetClientBalance.response)["401"]
>
export type GetClientBalanceResponse501 = FromSchema<
  (typeof schemas.GetClientBalance.response)["501"]
>
export type GetClientChannelMetadataParam = FromSchema<typeof schemas.GetClientChannel.metadata>
export type GetClientChannelResponse200 = FromSchema<
  (typeof schemas.GetClientChannel.response)["200"]
>
export type GetClientChannelResponse401 = FromSchema<
  (typeof schemas.GetClientChannel.response)["401"]
>
export type GetClientChannelResponse404 = FromSchema<
  (typeof schemas.GetClientChannel.response)["404"]
>
export type GetClientInvoicesMetadataParam = FromSchema<typeof schemas.GetClientInvoices.metadata>
export type GetClientInvoicesResponse200 = FromSchema<
  (typeof schemas.GetClientInvoices.response)["200"]
>
export type GetClientInvoicesResponse401 = FromSchema<
  (typeof schemas.GetClientInvoices.response)["401"]
>
export type GetClientMetadataParam = FromSchema<typeof schemas.GetClient.metadata>
export type GetClientResponse200 = FromSchema<(typeof schemas.GetClient.response)["200"]>
export type GetClientResponse401 = FromSchema<(typeof schemas.GetClient.response)["401"]>
export type GetClientResponse404 = FromSchema<(typeof schemas.GetClient.response)["404"]>
export type GetClientsResponse200 = FromSchema<(typeof schemas.GetClients.response)["200"]>
export type GetClientsResponse401 = FromSchema<(typeof schemas.GetClients.response)["401"]>
export type GetCompanyResponse200 = FromSchema<(typeof schemas.GetCompany.response)["200"]>
export type GetCompanyResponse401 = FromSchema<(typeof schemas.GetCompany.response)["401"]>
export type GetInvoiceJpgMetadataParam = FromSchema<typeof schemas.GetInvoiceJpg.metadata>
export type GetInvoiceJpgResponse200 = FromSchema<(typeof schemas.GetInvoiceJpg.response)["200"]>
export type GetInvoiceJpgResponse401 = FromSchema<(typeof schemas.GetInvoiceJpg.response)["401"]>
export type GetInvoiceJpgResponse404 = FromSchema<(typeof schemas.GetInvoiceJpg.response)["404"]>
export type GetInvoiceMetadataParam = FromSchema<typeof schemas.GetInvoice.metadata>
export type GetInvoicePdfMetadataParam = FromSchema<typeof schemas.GetInvoicePdf.metadata>
export type GetInvoicePdfResponse200 = FromSchema<(typeof schemas.GetInvoicePdf.response)["200"]>
export type GetInvoicePdfResponse401 = FromSchema<(typeof schemas.GetInvoicePdf.response)["401"]>
export type GetInvoicePdfResponse404 = FromSchema<(typeof schemas.GetInvoicePdf.response)["404"]>
export type GetInvoiceResponse200 = FromSchema<(typeof schemas.GetInvoice.response)["200"]>
export type GetInvoiceResponse401 = FromSchema<(typeof schemas.GetInvoice.response)["401"]>
export type GetInvoiceResponse404 = FromSchema<(typeof schemas.GetInvoice.response)["404"]>
export type GetInvoicesByMonthMetadataParam = FromSchema<typeof schemas.GetInvoicesByMonth.metadata>
export type GetInvoicesByMonthResponse200 = FromSchema<
  (typeof schemas.GetInvoicesByMonth.response)["200"]
>
export type GetInvoicesByMonthResponse401 = FromSchema<
  (typeof schemas.GetInvoicesByMonth.response)["401"]
>
export type GetInvoicesResponse200 = FromSchema<(typeof schemas.GetInvoices.response)["200"]>
export type GetInvoicesResponse401 = FromSchema<(typeof schemas.GetInvoices.response)["401"]>
export type GetProductMetadataParam = FromSchema<typeof schemas.GetProduct.metadata>
export type GetProductResponse200 = FromSchema<(typeof schemas.GetProduct.response)["200"]>
export type GetProductResponse401 = FromSchema<(typeof schemas.GetProduct.response)["401"]>
export type GetProductResponse404 = FromSchema<(typeof schemas.GetProduct.response)["404"]>
export type GetProductsResponse200 = FromSchema<(typeof schemas.GetProducts.response)["200"]>
export type GetProductsResponse401 = FromSchema<(typeof schemas.GetProducts.response)["401"]>
export type ImportClientsFromIntegrationResponse200 = FromSchema<
  (typeof schemas.ImportClientsFromIntegration.response)["200"]
>
export type ImportClientsFromIntegrationResponse401 = FromSchema<
  (typeof schemas.ImportClientsFromIntegration.response)["401"]
>
export type ImportClientsFromIntegrationResponse501 = FromSchema<
  (typeof schemas.ImportClientsFromIntegration.response)["501"]
>
export type ImportProductsFromIntegrationResponse200 = FromSchema<
  (typeof schemas.ImportProductsFromIntegration.response)["200"]
>
export type ImportProductsFromIntegrationResponse401 = FromSchema<
  (typeof schemas.ImportProductsFromIntegration.response)["401"]
>
export type ImportProductsFromIntegrationResponse501 = FromSchema<
  (typeof schemas.ImportProductsFromIntegration.response)["501"]
>
export type PostForwardAndOverwriteClientBodyParam = FromSchema<
  typeof schemas.PostForwardAndOverwriteClient.body
>
export type PostForwardAndOverwriteClientResponse200 = FromSchema<
  (typeof schemas.PostForwardAndOverwriteClient.response)["200"]
>
export type PostForwardAndOverwriteClientResponse400 = FromSchema<
  (typeof schemas.PostForwardAndOverwriteClient.response)["400"]
>
export type PostForwardAndOverwriteClientResponse401 = FromSchema<
  (typeof schemas.PostForwardAndOverwriteClient.response)["401"]
>
export type PostOrOverwriteClientBodyParam = FromSchema<typeof schemas.PostOrOverwriteClient.body>
export type PostOrOverwriteClientResponse200 = FromSchema<
  (typeof schemas.PostOrOverwriteClient.response)["200"]
>
export type PostOrOverwriteClientResponse400 = FromSchema<
  (typeof schemas.PostOrOverwriteClient.response)["400"]
>
export type PostOrOverwriteClientResponse401 = FromSchema<
  (typeof schemas.PostOrOverwriteClient.response)["401"]
>
export type PrintInvoiceBodyParam = FromSchema<typeof schemas.PrintInvoice.body>
export type PrintInvoiceMetadataParam = FromSchema<typeof schemas.PrintInvoice.metadata>
export type PrintInvoiceResponse200 = FromSchema<(typeof schemas.PrintInvoice.response)["200"]>
export type PrintInvoiceResponse401 = FromSchema<(typeof schemas.PrintInvoice.response)["401"]>
export type PrintInvoiceResponse404 = FromSchema<(typeof schemas.PrintInvoice.response)["404"]>
export type SearchClientsMetadataParam = FromSchema<typeof schemas.SearchClients.metadata>
export type SearchClientsResponse200 = FromSchema<(typeof schemas.SearchClients.response)["200"]>
export type SearchClientsResponse401 = FromSchema<(typeof schemas.SearchClients.response)["401"]>
export type SendInvoiceBodyParam = FromSchema<typeof schemas.SendInvoice.body>
export type SendInvoiceMetadataParam = FromSchema<typeof schemas.SendInvoice.metadata>
export type SendInvoiceResponse200 = FromSchema<(typeof schemas.SendInvoice.response)["200"]>
export type SendInvoiceResponse401 = FromSchema<(typeof schemas.SendInvoice.response)["401"]>
export type SendInvoiceResponse404 = FromSchema<(typeof schemas.SendInvoice.response)["404"]>
export type SendInvoiceResponse409 = FromSchema<(typeof schemas.SendInvoice.response)["409"]>
export type TestTokenResponse401 = FromSchema<(typeof schemas.TestToken.response)["401"]>
export type UpdateClientBodyParam = FromSchema<typeof schemas.UpdateClient.body>
export type UpdateClientChannelMetadataParam = FromSchema<
  typeof schemas.UpdateClientChannel.metadata
>
export type UpdateClientChannelResponse200 = FromSchema<
  (typeof schemas.UpdateClientChannel.response)["200"]
>
export type UpdateClientChannelResponse401 = FromSchema<
  (typeof schemas.UpdateClientChannel.response)["401"]
>
export type UpdateClientChannelResponse404 = FromSchema<
  (typeof schemas.UpdateClientChannel.response)["404"]
>
export type UpdateClientMetadataParam = FromSchema<typeof schemas.UpdateClient.metadata>
export type UpdateClientResponse200 = FromSchema<(typeof schemas.UpdateClient.response)["200"]>
export type UpdateClientResponse400 = FromSchema<(typeof schemas.UpdateClient.response)["400"]>
export type UpdateClientResponse401 = FromSchema<(typeof schemas.UpdateClient.response)["401"]>
export type UpdateClientResponse404 = FromSchema<(typeof schemas.UpdateClient.response)["404"]>
export type UpdateCompanyBodyParam = FromSchema<typeof schemas.UpdateCompany.body>
export type UpdateCompanyResponse200 = FromSchema<(typeof schemas.UpdateCompany.response)["200"]>
export type UpdateCompanyResponse400 = FromSchema<(typeof schemas.UpdateCompany.response)["400"]>
export type UpdateCompanyResponse401 = FromSchema<(typeof schemas.UpdateCompany.response)["401"]>
export type UpdateProductBodyParam = FromSchema<typeof schemas.UpdateProduct.body>
export type UpdateProductMetadataParam = FromSchema<typeof schemas.UpdateProduct.metadata>
export type UpdateProductResponse200 = FromSchema<(typeof schemas.UpdateProduct.response)["200"]>
export type UpdateProductResponse400 = FromSchema<(typeof schemas.UpdateProduct.response)["400"]>
export type UpdateProductResponse401 = FromSchema<(typeof schemas.UpdateProduct.response)["401"]>
export type UpdateProductResponse404 = FromSchema<(typeof schemas.UpdateProduct.response)["404"]>
export type ValidateClientVatMetadataParam = FromSchema<typeof schemas.ValidateClientVat.metadata>
export type ValidateClientVatResponse200 = FromSchema<
  (typeof schemas.ValidateClientVat.response)["200"]
>
export type ValidateClientVatResponse401 = FromSchema<
  (typeof schemas.ValidateClientVat.response)["401"]
>
export type ValidateClientVatResponse404 = FromSchema<
  (typeof schemas.ValidateClientVat.response)["404"]
>
export type ViewBearerTokenResponse200 = FromSchema<
  (typeof schemas.ViewBearerToken.response)["200"]
>
export type ViewBearerTokenResponse401 = FromSchema<
  (typeof schemas.ViewBearerToken.response)["401"]
>
export type ViewClientInIntegrationMetadataParam = FromSchema<
  typeof schemas.ViewClientInIntegration.metadata
>
export type ViewClientInIntegrationResponse200 = FromSchema<
  (typeof schemas.ViewClientInIntegration.response)["200"]
>
export type ViewClientInIntegrationResponse401 = FromSchema<
  (typeof schemas.ViewClientInIntegration.response)["401"]
>
export type ViewClientInIntegrationResponse404 = FromSchema<
  (typeof schemas.ViewClientInIntegration.response)["404"]
>
export type ViewClientInIntegrationResponse501 = FromSchema<
  (typeof schemas.ViewClientInIntegration.response)["501"]
>
export type ViewClientsInIntegrationResponse200 = FromSchema<
  (typeof schemas.ViewClientsInIntegration.response)["200"]
>
export type ViewClientsInIntegrationResponse401 = FromSchema<
  (typeof schemas.ViewClientsInIntegration.response)["401"]
>
export type ViewClientsInIntegrationResponse501 = FromSchema<
  (typeof schemas.ViewClientsInIntegration.response)["501"]
>
export type ViewInvoiceInIntegrationMetadataParam = FromSchema<
  typeof schemas.ViewInvoiceInIntegration.metadata
>
export type ViewInvoiceInIntegrationResponse200 = FromSchema<
  (typeof schemas.ViewInvoiceInIntegration.response)["200"]
>
export type ViewInvoiceInIntegrationResponse401 = FromSchema<
  (typeof schemas.ViewInvoiceInIntegration.response)["401"]
>
export type ViewInvoiceInIntegrationResponse404 = FromSchema<
  (typeof schemas.ViewInvoiceInIntegration.response)["404"]
>
export type ViewInvoiceInIntegrationResponse501 = FromSchema<
  (typeof schemas.ViewInvoiceInIntegration.response)["501"]
>
export type ViewInvoicesInIntegrationResponse200 = FromSchema<
  (typeof schemas.ViewInvoicesInIntegration.response)["200"]
>
export type ViewInvoicesInIntegrationResponse401 = FromSchema<
  (typeof schemas.ViewInvoicesInIntegration.response)["401"]
>
export type ViewInvoicesInIntegrationResponse501 = FromSchema<
  (typeof schemas.ViewInvoicesInIntegration.response)["501"]
>
export type ViewProductInIntegrationMetadataParam = FromSchema<
  typeof schemas.ViewProductInIntegration.metadata
>
export type ViewProductInIntegrationResponse200 = FromSchema<
  (typeof schemas.ViewProductInIntegration.response)["200"]
>
export type ViewProductInIntegrationResponse401 = FromSchema<
  (typeof schemas.ViewProductInIntegration.response)["401"]
>
export type ViewProductInIntegrationResponse404 = FromSchema<
  (typeof schemas.ViewProductInIntegration.response)["404"]
>
export type ViewProductInIntegrationResponse501 = FromSchema<
  (typeof schemas.ViewProductInIntegration.response)["501"]
>
export type ViewProductsInIntegrationResponse200 = FromSchema<
  (typeof schemas.ViewProductsInIntegration.response)["200"]
>
export type ViewProductsInIntegrationResponse401 = FromSchema<
  (typeof schemas.ViewProductsInIntegration.response)["401"]
>
export type ViewProductsInIntegrationResponse501 = FromSchema<
  (typeof schemas.ViewProductsInIntegration.response)["501"]
>
