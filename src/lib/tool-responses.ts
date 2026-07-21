import type { GetClientResponse200, GetProductResponse200 } from "@api/tetris"
import fuzzysort from "fuzzysort"

export const selectClientByIdentifier = (identifier: string | undefined, clients: GetClientResponse200[]) => {
  if (!identifier) {
    const visibleClients = clients.slice(0, 3)
    const moreClients = clients.length - visibleClients.length

    return {
      type: "needs_input" as const,
      payload: {
        content: [
          {
            type: "text" as const,
            text: `Select the client who should receive the invoice: ${visibleClients.map((client) => client.name).join(", ")}${moreClients ? `, +${moreClients} more clients` : ""}.`,
          },
        ],
        structuredContent: {
          status: "missing_client" as const,
          context: { query: identifier, clients: visibleClients, hasMore: moreClients > 0 },
        },
      },
    }
  }

  const matchingClients = fuzzysort.go(identifier, clients, {
    threshold: 0.5,
    limit: 5,
    keys: [
      "name",
      (client) => String(client.regCode ?? ""),
      (client) => String(client.VATNumber ?? ""),
      (client) => client.email ?? "",
      (client) => client.id,
    ],
  })

  const [matchingClient] = matchingClients

  if (matchingClients.total === 1 && matchingClient) {
    return {
      type: "found" as const,
      payload: { clientId: matchingClient.obj.id, clientName: matchingClient.obj.name },
    }
  }

  const visibleClients = matchingClients.map((result) => result.obj)
  const moreClients = matchingClients.total - visibleClients.length

  return {
    type: "needs_input" as const,
    payload: {
      content: [
        {
          type: "text" as const,
          text: visibleClients.length
            ? `Select the client who should receive the invoice: ${visibleClients.map((client) => client.name).join(", ")}${moreClients ? `, +${moreClients} more clients` : ""}.`
            : `No client matched "${identifier}". Select another client.`,
        },
      ],
      structuredContent: {
        status: "missing_client" as const,
        context: {
          query: identifier,
          clients: visibleClients,
          hasMore: moreClients > 0,
        },
      },
    },
  }
}

export const selectProductByIdentifier = (
  identifier: string | undefined,
  lineIndex: number,
  products: GetProductResponse200[]
) => {
  if (!identifier) {
    const visibleProducts = products.slice(0, 3)
    const moreProducts = products.length - visibleProducts.length

    return {
      type: "needs_input" as const,
      payload: {
        content: [
          {
            type: "text" as const,
            text: `Select the product for invoice line ${lineIndex + 1}: ${visibleProducts.map((product) => product.name).join(", ")}${moreProducts ? `, +${moreProducts} more products` : ""}.`,
          },
        ],
        structuredContent: {
          status: "missing_products" as const,
          context: { lineIndex, query: identifier, products: visibleProducts, hasMore: moreProducts > 0 },
        },
      },
    }
  }

  const matchingProducts = fuzzysort.go(identifier, products, {
    threshold: 0.5,
    limit: 5,
    keys: ["name", "id"],
  })
  const [matchingProduct] = matchingProducts

  if (matchingProducts.total === 1 && matchingProduct) {
    return {
      type: "found" as const,
      payload: { productId: matchingProduct.obj.id },
    }
  }

  const visibleProducts = matchingProducts.map((result) => result.obj)
  const moreProducts = matchingProducts.total - visibleProducts.length

  return {
    type: "needs_input" as const,
    payload: {
      content: [
        {
          type: "text" as const,
          text: visibleProducts.length
            ? `Select the product for invoice line ${lineIndex + 1}: ${visibleProducts.map((product) => product.name).join(", ")}${moreProducts ? `, +${moreProducts} more products` : ""}.`
            : `No product matched "${identifier}" for invoice line ${lineIndex + 1}. Select another product.`,
        },
      ],
      structuredContent: {
        status: "missing_products" as const,
        context: { lineIndex, query: identifier, products: visibleProducts, hasMore: moreProducts > 0 },
      },
    },
  }
}
