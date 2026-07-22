import { z } from "zod/v4"

export const numericStringSchema = z.string().regex(/^-?\d+(\.\d+)?$/, "Must be a number or numeric string")

export const numberOrNumericStringSchema = z.union([z.number().finite(), numericStringSchema])

export const lineExceptionSchema = z.union([
  z.enum([
    "sellerNotKnown",
    "missingCountry",
    "sameCountry0VAT",
    "useDefault",
    "MOSS",
    "private",
    "outsideEU",
    "europe",
    "notSameCountry0VAT",
    "defaultApplied",
  ]),
  z.boolean(),
])

export const invoiceLineSchema = z
  .object({
    product: z.string().min(1).describe("Existing Outvoicer product name"),
    amount: numberOrNumericStringSchema.describe("Product quantity as a number or numeric string"),
    unitPrice: numberOrNumericStringSchema.describe("Price override"),
    comment: z.string().optional(),
    exception: lineExceptionSchema.optional(),
  })
  .strict()

export const createInvoiceInputSchema = z
  .object({
    invoice: z
      .object({
        date: z.string().date(),
        client: z.string().min(1).describe("Resolved Outvoicer client ID"),
        lines: z
          .array(
            z
              .object({
                product: z.string().min(1).describe("Resolved Outvoicer product ID"),
                amount: numberOrNumericStringSchema,
                unitPrice: numberOrNumericStringSchema.optional(),
                comment: z.string().optional(),
                exception: lineExceptionSchema.optional(),
              })
              .strict()
          )
          .min(1),
      })
      .strict()
      .describe("The ready invoice payload returned by prepare-invoice"),
  })
  .strict()

export const invoiceIdInputSchema = z
  .object({
    invoiceId: z.string().min(1).describe("Invoice internal ID, or assigned invoice number"),
  })
  .strict()

export const reviewIdInputSchema = z
  .object({
    reviewId: z.string().uuid().describe("Single-use ID returned by review_invoice"),
  })
  .strict()

export const invoiceObjectSchema = z.record(z.string(), z.unknown())

// const clientContextSchema = z.object({
//   id: z.string(),
//   name: z.string(),
//   email: z.string().nullable().optional(),
//   regCode: z.union([z.string(), z.number()]).nullable().optional(),
// })

// const productContextSchema = z.object({
//   id: z.string(),
//   name: z.string(),
//   unit: z.string().nullable().optional(),
//   unitPrice: numberOrNumericStringSchema.optional(),
//   debit: z.string().nullable().optional(),
//   VATRate: z.number().nullable().optional(),
// })

export const createInvoiceOutputSchema = z.object({
  status: z.literal("created"),
  invoice: z.object({ id: z.string() }).strict(),
})

export const reviewInvoiceOutputSchema = z.object({
  reviewId: z.string().uuid(),
  invoiceId: z.string(),
  invoiceNumber: z.union([z.string(), z.number()]).optional(),
  pdfSha256: z.string(),
  pdfResourceUri: z.string(),
  expiresAt: z.string(),
})

export const sendInvoiceOutputSchema = z.object({
  sent: z.boolean(),
  reason: z.string().optional(),
  invoice: invoiceObjectSchema.optional(),
})

export type CreateInvoiceInput = z.infer<typeof createInvoiceInputSchema>
export type CompleteInvoiceInput = {
  date: string
  client: string
  lines: z.infer<typeof invoiceLineSchema>[]
}
export type Invoice = Record<string, unknown>

export const prepareInvoiceInputSchema = z
  .object({
    date: z
      .string()
      .date()
      .default(() => new Date().toISOString().slice(0, 10)),
    clientIdentifier: z.string().trim().optional().describe("Client ID or name"),
    clientId: z.string().optional().describe("Selected client ID"),
    clientName: z.string().optional().describe("Selected client name"),
    lines: z
      .array(
        z
          .object({
            productId: z.string().optional().describe("Selected product ID"),
            productIdentifier: z.string().trim().optional().describe("Product ID or name"),
            amount: numberOrNumericStringSchema.optional(),
            unitPrice: numberOrNumericStringSchema.optional(),
            comment: z.string().optional(),
            exception: lineExceptionSchema.optional(),
          })
          .strict()
      )
      .default([{}]),
  })
  .strict()

export const preparedInvoiceSchema = z
  .object({
    date: z.string().date(),
    client: z.string().min(1),
    lines: z
      .array(
        z
          .object({
            product: z.string().min(1),
            amount: numberOrNumericStringSchema,
            unitPrice: numberOrNumericStringSchema.optional(),
            comment: z.string().optional(),
            exception: lineExceptionSchema.optional(),
          })
          .strict()
      )
      .min(1),
  })
  .strict()

export const clientSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export const prepareInvoiceOutputSchema = z.object({
  status: z.enum(["missing_client", "missing_products", "missing_amount", "ready"]),
  clientId: z.string().optional(),
  clientName: z.string().optional(),
  context: z
    .union([
      z.object({
        query: z.string().optional(),
        clients: z.array(clientSchema).max(10),
        hasMore: z.boolean(),
      }),
      z.object({
        lineIndex: z.number().int().nonnegative(),
        query: z.string().optional(),
        products: z.array(productSchema).max(10),
        hasMore: z.boolean(),
      }),
      z.object({
        lineIndex: z.number().int().nonnegative(),
        productId: z.string(),
      }),
    ])
    .optional(),
  invoice: preparedInvoiceSchema.optional(),
})
