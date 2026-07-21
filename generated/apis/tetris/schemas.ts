const CreateAndPrintInvoice = {
  body: {
    type: "object",
    description:
      "Payload for creating an invoice. Requires that the referenced client and product ids exist (and, for forwarding endpoints, are already sent to the accounting software).",
    required: ["client", "lines"],
    properties: {
      client: { type: "string", description: "Existing client id", examples: ["yescapital"] },
      lines: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          description:
            "Invoice line when creating an invoice. `product` must reference an existing product id.",
          required: ["product", "amount"],
          properties: {
            product: { type: "string", examples: ["hammer"] },
            amount: {
              description:
                'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
              oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
              examples: ["3.63"],
            },
            unitPrice: {
              description:
                'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
              oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
              examples: ["3.63"],
            },
            comment: { type: "string" },
            exception: {
              description:
                "Explains why a certain VAT rate was chosen for a line. `false` or `null` means the invoice was imported from elsewhere and this system is not used.",
              oneOf: [
                {
                  type: "string",
                  enum: [
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
                  ],
                },
                { type: "boolean" },
              ],
            },
          },
          additionalProperties: true,
        },
      },
    },
    additionalProperties: true,
    $schema: "http://json-schema.org/draft-04/schema#",
  },
  response: {
    "200": {
      type: "object",
      description:
        "Full sales invoice as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example).",
      properties: {
        id: {
          type: "string",
          description: "Internal id; usable immediately after creation",
          examples: ["69f2212bac38fd7df540535a"],
        },
        nr: {
          description:
            "Invoice number; assigned when the PDF is first generated. May be returned as a string or a number.",
          oneOf: [{ type: "string" }, { type: "integer" }],
          examples: ["200669"],
        },
        date: {
          type: "string",
          description: "Invoice date as a Unix timestamp in milliseconds (string)",
          examples: ["1782766800000"],
        },
        due: {
          type: "string",
          description: "Due date as a Unix timestamp in milliseconds (string)",
          examples: ["1783976400000"],
        },
        dateFormated: { type: "string", examples: ["2026-06-30"] },
        dueFormated: { type: "string", examples: ["2026-07-14"] },
        seller: {
          type: "object",
          description:
            "Seller (your company) block embedded in an invoice; also the shape returned by PUT /company",
          properties: {
            name: { type: "string", examples: ["CostPocket SIA"] },
            regCode: { type: "string", examples: ["40203537286"] },
            taxVAT: { type: "boolean", examples: [true] },
            VATNumber: { type: "string", examples: ["LV40203537286"] },
            address: { type: "string", examples: ["Eduarda Smiļģa iela 32 - 19"] },
            zip: { type: "string", examples: ["LV-1002"] },
            city: { type: "string", examples: ["Rīga"] },
            country: { type: "string", examples: ["Latvia"] },
            currency: { type: "string", examples: ["EUR"] },
            debit: { type: "string", description: "Default sales account", examples: ["3000"] },
            email: { type: "string", format: "email", examples: ["support@outvoicer.com"] },
            dueDays: { type: "integer", examples: [14] },
            lastInvoice: { type: "integer", examples: [200668] },
            prefix: {
              type: "string",
              description:
                "Invoice number prefix; useful to avoid duplicate number clashes in the accounting software",
              examples: ["Outvoicer-"],
            },
            bankAccounts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer", examples: [1] },
                  IBAN: { type: "string", examples: ["LV94HABA0551056496751"] },
                  bank: { type: "string", examples: ["SWEDBANK AS"] },
                  swift: { type: "string", examples: ["HABALV22"] },
                },
              },
            },
          },
          additionalProperties: true,
        },
        buyer: {
          type: "object",
          description:
            "Full client object as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example), and some legacy fields may have mixed types.",
          required: ["id", "name"],
          properties: {
            id: { type: "string", examples: ["yescapital"] },
            name: { type: "string", examples: ["Yes Capital OY"] },
            regCode: { oneOf: [{ type: "string" }, { type: "number" }], examples: ["17527906"] },
            taxVAT: {
              description:
                'Legacy data may contain boolean, string ("true"/"false") or number (0/1); semantically a boolean.',
              oneOf: [{ type: "boolean" }, { type: "string" }, { type: "integer" }],
              examples: [true],
            },
            VATNumber: {
              oneOf: [{ type: "string" }, { type: "integer" }, { type: "boolean" }],
              examples: ["EE101884549"],
            },
            address: { type: "string", examples: ["Roosikrantsi tn 11"] },
            city: { type: "string", examples: ["Tallinn"] },
            country: { type: "string", examples: ["Estonia"] },
            zip: { oneOf: [{ type: "string" }, { type: "integer" }], examples: ["10119"] },
            email: { type: "string", format: "email", examples: ["email@email.ee"] },
            refNumber: { type: "string", examples: ["599773"] },
            discount: {
              description: "Customer discount as a percentage; may be a number or numeric string",
              oneOf: [{ type: "number" }, { type: "string" }],
              examples: ["10"],
            },
            language: { type: "string", examples: ["ee"] },
            meritId: {
              type: "string",
              description: "Id of the client in the connected accounting software (e.g. Merit)",
            },
          },
          additionalProperties: true,
        },
        lines: {
          type: "array",
          items: {
            type: "object",
            description: "Invoice line as returned by the API",
            properties: {
              id: { type: "string", examples: ["sakuma-menesa-plans"] },
              product: { type: "string", examples: ["sakuma-menesa-plans"] },
              name: { type: "string", examples: ["Sākuma Mēneša plāns"] },
              VATRate: {
                type: "number",
                description: "Always a JSON number, e.g. 21 or 21.5",
                examples: [21],
              },
              unitPrice: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              unit: { type: "string", examples: ["pc"] },
              amount: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              rounding: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              comment: { type: "string", examples: ["string"] },
              debit: { type: "string", description: "Sales revenue account", examples: ["3000"] },
              subtotal: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              VAT: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              total: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
            },
            additionalProperties: true,
          },
        },
        currency: { type: "string", examples: ["EUR"] },
        subtotal: {
          description:
            'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
          oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
          examples: ["3.63"],
        },
        VAT: {
          description:
            'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
          oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
          examples: ["3.63"],
        },
        total: {
          description:
            'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
          oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
          examples: ["3.63"],
        },
        sent: { type: "boolean", examples: [true] },
        status: { type: "string", examples: ["sent"] },
      },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "400": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const CreateAndSendInvoice = {
  body: {
    type: "object",
    description:
      "Payload for creating an invoice. Requires that the referenced client and product ids exist (and, for forwarding endpoints, are already sent to the accounting software).",
    required: ["client", "lines"],
    properties: {
      client: { type: "string", description: "Existing client id", examples: ["yescapital"] },
      lines: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          description:
            "Invoice line when creating an invoice. `product` must reference an existing product id.",
          required: ["product", "amount"],
          properties: {
            product: { type: "string", examples: ["hammer"] },
            amount: {
              description:
                'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
              oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
              examples: ["3.63"],
            },
            unitPrice: {
              description:
                'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
              oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
              examples: ["3.63"],
            },
            comment: { type: "string" },
            exception: {
              description:
                "Explains why a certain VAT rate was chosen for a line. `false` or `null` means the invoice was imported from elsewhere and this system is not used.",
              oneOf: [
                {
                  type: "string",
                  enum: [
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
                  ],
                },
                { type: "boolean" },
              ],
            },
          },
          additionalProperties: true,
        },
      },
    },
    additionalProperties: true,
    $schema: "http://json-schema.org/draft-04/schema#",
  },
  response: {
    "200": {
      type: "object",
      description:
        "Full sales invoice as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example).",
      properties: {
        id: {
          type: "string",
          description: "Internal id; usable immediately after creation",
          examples: ["69f2212bac38fd7df540535a"],
        },
        nr: {
          description:
            "Invoice number; assigned when the PDF is first generated. May be returned as a string or a number.",
          oneOf: [{ type: "string" }, { type: "integer" }],
          examples: ["200669"],
        },
        date: {
          type: "string",
          description: "Invoice date as a Unix timestamp in milliseconds (string)",
          examples: ["1782766800000"],
        },
        due: {
          type: "string",
          description: "Due date as a Unix timestamp in milliseconds (string)",
          examples: ["1783976400000"],
        },
        dateFormated: { type: "string", examples: ["2026-06-30"] },
        dueFormated: { type: "string", examples: ["2026-07-14"] },
        seller: {
          type: "object",
          description:
            "Seller (your company) block embedded in an invoice; also the shape returned by PUT /company",
          properties: {
            name: { type: "string", examples: ["CostPocket SIA"] },
            regCode: { type: "string", examples: ["40203537286"] },
            taxVAT: { type: "boolean", examples: [true] },
            VATNumber: { type: "string", examples: ["LV40203537286"] },
            address: { type: "string", examples: ["Eduarda Smiļģa iela 32 - 19"] },
            zip: { type: "string", examples: ["LV-1002"] },
            city: { type: "string", examples: ["Rīga"] },
            country: { type: "string", examples: ["Latvia"] },
            currency: { type: "string", examples: ["EUR"] },
            debit: { type: "string", description: "Default sales account", examples: ["3000"] },
            email: { type: "string", format: "email", examples: ["support@outvoicer.com"] },
            dueDays: { type: "integer", examples: [14] },
            lastInvoice: { type: "integer", examples: [200668] },
            prefix: {
              type: "string",
              description:
                "Invoice number prefix; useful to avoid duplicate number clashes in the accounting software",
              examples: ["Outvoicer-"],
            },
            bankAccounts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer", examples: [1] },
                  IBAN: { type: "string", examples: ["LV94HABA0551056496751"] },
                  bank: { type: "string", examples: ["SWEDBANK AS"] },
                  swift: { type: "string", examples: ["HABALV22"] },
                },
              },
            },
          },
          additionalProperties: true,
        },
        buyer: {
          type: "object",
          description:
            "Full client object as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example), and some legacy fields may have mixed types.",
          required: ["id", "name"],
          properties: {
            id: { type: "string", examples: ["yescapital"] },
            name: { type: "string", examples: ["Yes Capital OY"] },
            regCode: { oneOf: [{ type: "string" }, { type: "number" }], examples: ["17527906"] },
            taxVAT: {
              description:
                'Legacy data may contain boolean, string ("true"/"false") or number (0/1); semantically a boolean.',
              oneOf: [{ type: "boolean" }, { type: "string" }, { type: "integer" }],
              examples: [true],
            },
            VATNumber: {
              oneOf: [{ type: "string" }, { type: "integer" }, { type: "boolean" }],
              examples: ["EE101884549"],
            },
            address: { type: "string", examples: ["Roosikrantsi tn 11"] },
            city: { type: "string", examples: ["Tallinn"] },
            country: { type: "string", examples: ["Estonia"] },
            zip: { oneOf: [{ type: "string" }, { type: "integer" }], examples: ["10119"] },
            email: { type: "string", format: "email", examples: ["email@email.ee"] },
            refNumber: { type: "string", examples: ["599773"] },
            discount: {
              description: "Customer discount as a percentage; may be a number or numeric string",
              oneOf: [{ type: "number" }, { type: "string" }],
              examples: ["10"],
            },
            language: { type: "string", examples: ["ee"] },
            meritId: {
              type: "string",
              description: "Id of the client in the connected accounting software (e.g. Merit)",
            },
          },
          additionalProperties: true,
        },
        lines: {
          type: "array",
          items: {
            type: "object",
            description: "Invoice line as returned by the API",
            properties: {
              id: { type: "string", examples: ["sakuma-menesa-plans"] },
              product: { type: "string", examples: ["sakuma-menesa-plans"] },
              name: { type: "string", examples: ["Sākuma Mēneša plāns"] },
              VATRate: {
                type: "number",
                description: "Always a JSON number, e.g. 21 or 21.5",
                examples: [21],
              },
              unitPrice: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              unit: { type: "string", examples: ["pc"] },
              amount: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              rounding: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              comment: { type: "string", examples: ["string"] },
              debit: { type: "string", description: "Sales revenue account", examples: ["3000"] },
              subtotal: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              VAT: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              total: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
            },
            additionalProperties: true,
          },
        },
        currency: { type: "string", examples: ["EUR"] },
        subtotal: {
          description:
            'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
          oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
          examples: ["3.63"],
        },
        VAT: {
          description:
            'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
          oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
          examples: ["3.63"],
        },
        total: {
          description:
            'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
          oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
          examples: ["3.63"],
        },
        sent: { type: "boolean", examples: [true] },
        status: { type: "string", examples: ["sent"] },
      },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "400": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "409": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const CreateClient = {
  body: {
    type: "object",
    description:
      "Client payload for POST /client, PUT /client/{clientId}, POST /client/post-or-overwrite and POST /client/post-forward-and-overwrite",
    required: ["id", "name"],
    properties: {
      id: { type: "string", examples: ["yescapital"] },
      name: { type: "string", examples: ["Yes Capital OY"] },
      regCode: { oneOf: [{ type: "string" }, { type: "number" }], examples: ["12710066"] },
      address: { type: "string", examples: ["Virulainen 4"] },
      zip: { oneOf: [{ type: "string" }, { type: "integer" }], examples: ["10140"] },
      city: { type: "string", examples: ["Helsinki"] },
      email: {
        type: "string",
        format: "email",
        description: "E-mail where the invoice is sent to; must validate",
        examples: ["billing@yescapital.co"],
      },
      country: {
        type: "string",
        description: "Must be a real country name for VAT to validate",
        examples: ["Finland"],
      },
      taxVAT: { type: "boolean", examples: [true] },
      VATNumber: { type: "string", examples: ["FI12345679"] },
      refNumber: { type: "string", examples: ["130239"] },
      discount: {
        description: "Customer discount as a percentage; number or numeric string",
        oneOf: [{ type: "number" }, { type: "string" }],
        examples: ["10"],
      },
      language: {
        type: "string",
        description: "Language the customer receives invoices in (e.g. `lv`, `et`, `fi`, `en`)",
        examples: ["lv"],
      },
    },
    additionalProperties: true,
    $schema: "http://json-schema.org/draft-04/schema#",
  },
  response: {
    "200": {
      type: "object",
      description:
        "Full client object as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example), and some legacy fields may have mixed types.",
      required: ["id", "name"],
      properties: {
        id: { type: "string", examples: ["yescapital"] },
        name: { type: "string", examples: ["Yes Capital OY"] },
        regCode: { oneOf: [{ type: "string" }, { type: "number" }], examples: ["17527906"] },
        taxVAT: {
          description:
            'Legacy data may contain boolean, string ("true"/"false") or number (0/1); semantically a boolean.',
          oneOf: [{ type: "boolean" }, { type: "string" }, { type: "integer" }],
          examples: [true],
        },
        VATNumber: {
          oneOf: [{ type: "string" }, { type: "integer" }, { type: "boolean" }],
          examples: ["EE101884549"],
        },
        address: { type: "string", examples: ["Roosikrantsi tn 11"] },
        city: { type: "string", examples: ["Tallinn"] },
        country: { type: "string", examples: ["Estonia"] },
        zip: { oneOf: [{ type: "string" }, { type: "integer" }], examples: ["10119"] },
        email: { type: "string", format: "email", examples: ["email@email.ee"] },
        refNumber: { type: "string", examples: ["599773"] },
        discount: {
          description: "Customer discount as a percentage; may be a number or numeric string",
          oneOf: [{ type: "number" }, { type: "string" }],
          examples: ["10"],
        },
        language: { type: "string", examples: ["ee"] },
        meritId: {
          type: "string",
          description: "Id of the client in the connected accounting software (e.g. Merit)",
        },
      },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "400": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const CreateCompany = {
  body: {
    type: "object",
    description:
      'Seller company settings. All fields are optional — send only the ones you want to set/update (e.g. just { "prefix": "api" }). The data store is NoSQL, so extra fields are allowed.',
    properties: {
      name: { type: "string", examples: ["CostPocket SIA"] },
      regCode: { type: "string", examples: ["40203537286"] },
      taxVAT: { type: "boolean", examples: [true] },
      VATNumber: { type: "string", examples: ["LV40203537286"] },
      address: { type: "string", examples: ["Eduarda Smiļģa iela 32 - 19"] },
      zip: { type: "string", examples: ["LV-1002"] },
      city: { type: "string", examples: ["Rīga"] },
      country: { type: "string", examples: ["Latvia"] },
      currency: { type: "string", examples: ["EUR"] },
      debit: { type: "string", description: "Default sales revenue account", examples: ["3000"] },
      email: { type: "string", format: "email", examples: ["support@outvoicer.com"] },
      dueDays: { type: "integer", examples: [14] },
      prefix: {
        type: "string",
        description:
          "Invoice number prefix; useful to avoid duplicate invoice numbers in the accounting software",
        examples: ["api"],
      },
      bankAccounts: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "integer", examples: [1] },
            IBAN: { type: "string", examples: ["LV94HABA0551056496751"] },
            bank: { type: "string", examples: ["SWEDBANK AS"] },
            swift: { type: "string", examples: ["HABALV22"] },
          },
        },
      },
    },
    additionalProperties: true,
    $schema: "http://json-schema.org/draft-04/schema#",
  },
  response: {
    "200": {
      type: "object",
      description:
        "Seller (your company) block embedded in an invoice; also the shape returned by PUT /company",
      properties: {
        name: { type: "string", examples: ["CostPocket SIA"] },
        regCode: { type: "string", examples: ["40203537286"] },
        taxVAT: { type: "boolean", examples: [true] },
        VATNumber: { type: "string", examples: ["LV40203537286"] },
        address: { type: "string", examples: ["Eduarda Smiļģa iela 32 - 19"] },
        zip: { type: "string", examples: ["LV-1002"] },
        city: { type: "string", examples: ["Rīga"] },
        country: { type: "string", examples: ["Latvia"] },
        currency: { type: "string", examples: ["EUR"] },
        debit: { type: "string", description: "Default sales account", examples: ["3000"] },
        email: { type: "string", format: "email", examples: ["support@outvoicer.com"] },
        dueDays: { type: "integer", examples: [14] },
        lastInvoice: { type: "integer", examples: [200668] },
        prefix: {
          type: "string",
          description:
            "Invoice number prefix; useful to avoid duplicate number clashes in the accounting software",
          examples: ["Outvoicer-"],
        },
        bankAccounts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "integer", examples: [1] },
              IBAN: { type: "string", examples: ["LV94HABA0551056496751"] },
              bank: { type: "string", examples: ["SWEDBANK AS"] },
              swift: { type: "string", examples: ["HABALV22"] },
            },
          },
        },
      },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "400": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const CreateInvoice = {
  body: {
    type: "object",
    description:
      "Payload for creating an invoice. Requires that the referenced client and product ids exist (and, for forwarding endpoints, are already sent to the accounting software).",
    required: ["client", "lines"],
    properties: {
      client: { type: "string", description: "Existing client id", examples: ["yescapital"] },
      lines: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          description:
            "Invoice line when creating an invoice. `product` must reference an existing product id.",
          required: ["product", "amount"],
          properties: {
            product: { type: "string", examples: ["hammer"] },
            amount: {
              description:
                'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
              oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
              examples: ["3.63"],
            },
            unitPrice: {
              description:
                'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
              oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
              examples: ["3.63"],
            },
            comment: { type: "string" },
            exception: {
              description:
                "Explains why a certain VAT rate was chosen for a line. `false` or `null` means the invoice was imported from elsewhere and this system is not used.",
              oneOf: [
                {
                  type: "string",
                  enum: [
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
                  ],
                },
                { type: "boolean" },
              ],
            },
          },
          additionalProperties: true,
        },
      },
    },
    additionalProperties: true,
    $schema: "http://json-schema.org/draft-04/schema#",
  },
  response: {
    "200": {
      type: "object",
      description:
        "Full sales invoice as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example).",
      properties: {
        id: {
          type: "string",
          description: "Internal id; usable immediately after creation",
          examples: ["69f2212bac38fd7df540535a"],
        },
        nr: {
          description:
            "Invoice number; assigned when the PDF is first generated. May be returned as a string or a number.",
          oneOf: [{ type: "string" }, { type: "integer" }],
          examples: ["200669"],
        },
        date: {
          type: "string",
          description: "Invoice date as a Unix timestamp in milliseconds (string)",
          examples: ["1782766800000"],
        },
        due: {
          type: "string",
          description: "Due date as a Unix timestamp in milliseconds (string)",
          examples: ["1783976400000"],
        },
        dateFormated: { type: "string", examples: ["2026-06-30"] },
        dueFormated: { type: "string", examples: ["2026-07-14"] },
        seller: {
          type: "object",
          description:
            "Seller (your company) block embedded in an invoice; also the shape returned by PUT /company",
          properties: {
            name: { type: "string", examples: ["CostPocket SIA"] },
            regCode: { type: "string", examples: ["40203537286"] },
            taxVAT: { type: "boolean", examples: [true] },
            VATNumber: { type: "string", examples: ["LV40203537286"] },
            address: { type: "string", examples: ["Eduarda Smiļģa iela 32 - 19"] },
            zip: { type: "string", examples: ["LV-1002"] },
            city: { type: "string", examples: ["Rīga"] },
            country: { type: "string", examples: ["Latvia"] },
            currency: { type: "string", examples: ["EUR"] },
            debit: { type: "string", description: "Default sales account", examples: ["3000"] },
            email: { type: "string", format: "email", examples: ["support@outvoicer.com"] },
            dueDays: { type: "integer", examples: [14] },
            lastInvoice: { type: "integer", examples: [200668] },
            prefix: {
              type: "string",
              description:
                "Invoice number prefix; useful to avoid duplicate number clashes in the accounting software",
              examples: ["Outvoicer-"],
            },
            bankAccounts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer", examples: [1] },
                  IBAN: { type: "string", examples: ["LV94HABA0551056496751"] },
                  bank: { type: "string", examples: ["SWEDBANK AS"] },
                  swift: { type: "string", examples: ["HABALV22"] },
                },
              },
            },
          },
          additionalProperties: true,
        },
        buyer: {
          type: "object",
          description:
            "Full client object as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example), and some legacy fields may have mixed types.",
          required: ["id", "name"],
          properties: {
            id: { type: "string", examples: ["yescapital"] },
            name: { type: "string", examples: ["Yes Capital OY"] },
            regCode: { oneOf: [{ type: "string" }, { type: "number" }], examples: ["17527906"] },
            taxVAT: {
              description:
                'Legacy data may contain boolean, string ("true"/"false") or number (0/1); semantically a boolean.',
              oneOf: [{ type: "boolean" }, { type: "string" }, { type: "integer" }],
              examples: [true],
            },
            VATNumber: {
              oneOf: [{ type: "string" }, { type: "integer" }, { type: "boolean" }],
              examples: ["EE101884549"],
            },
            address: { type: "string", examples: ["Roosikrantsi tn 11"] },
            city: { type: "string", examples: ["Tallinn"] },
            country: { type: "string", examples: ["Estonia"] },
            zip: { oneOf: [{ type: "string" }, { type: "integer" }], examples: ["10119"] },
            email: { type: "string", format: "email", examples: ["email@email.ee"] },
            refNumber: { type: "string", examples: ["599773"] },
            discount: {
              description: "Customer discount as a percentage; may be a number or numeric string",
              oneOf: [{ type: "number" }, { type: "string" }],
              examples: ["10"],
            },
            language: { type: "string", examples: ["ee"] },
            meritId: {
              type: "string",
              description: "Id of the client in the connected accounting software (e.g. Merit)",
            },
          },
          additionalProperties: true,
        },
        lines: {
          type: "array",
          items: {
            type: "object",
            description: "Invoice line as returned by the API",
            properties: {
              id: { type: "string", examples: ["sakuma-menesa-plans"] },
              product: { type: "string", examples: ["sakuma-menesa-plans"] },
              name: { type: "string", examples: ["Sākuma Mēneša plāns"] },
              VATRate: {
                type: "number",
                description: "Always a JSON number, e.g. 21 or 21.5",
                examples: [21],
              },
              unitPrice: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              unit: { type: "string", examples: ["pc"] },
              amount: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              rounding: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              comment: { type: "string", examples: ["string"] },
              debit: { type: "string", description: "Sales revenue account", examples: ["3000"] },
              subtotal: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              VAT: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              total: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
            },
            additionalProperties: true,
          },
        },
        currency: { type: "string", examples: ["EUR"] },
        subtotal: {
          description:
            'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
          oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
          examples: ["3.63"],
        },
        VAT: {
          description:
            'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
          oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
          examples: ["3.63"],
        },
        total: {
          description:
            'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
          oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
          examples: ["3.63"],
        },
        sent: { type: "boolean", examples: [true] },
        status: { type: "string", examples: ["sent"] },
      },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "400": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const CreateProduct = {
  body: {
    type: "object",
    description: "Product payload for POST /product and PUT /product/{productId}",
    required: ["id", "name", "unitPrice"],
    properties: {
      id: { type: "string", examples: ["hammer"] },
      name: { type: "string", examples: ["Hammer"] },
      unit: { type: "string", examples: ["pc"] },
      unitPrice: {
        description:
          'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
        oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
        examples: ["3.63"],
      },
      debit: {
        type: "string",
        description: "Sales revenue account in accounting for this product",
        examples: ["3015"],
      },
      VATRate: {
        type: "number",
        description:
          "Always a JSON number, e.g. 21 or 21.5. Overwrites the default VAT rate for this product.",
        examples: [21.5],
      },
    },
    additionalProperties: true,
    $schema: "http://json-schema.org/draft-04/schema#",
  },
  response: {
    "200": {
      type: "object",
      description:
        "Full product object as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example).",
      required: ["id", "name"],
      properties: {
        id: { type: "string", examples: ["hammer"] },
        name: { type: "string", examples: ["Hammer"] },
        unit: { type: "string", examples: ["pc"] },
        unitPrice: {
          description:
            'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
          oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
          examples: ["3.63"],
        },
        debit: {
          type: "string",
          description: "Sales revenue account in accounting for this product",
          examples: ["3015"],
        },
        VATRate: {
          type: "number",
          description:
            "Always a JSON number, e.g. 21 or 21.5. Overwrites the default VAT rate for this product.",
          examples: [21.5],
        },
      },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "400": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const CreateSendAndForwardInvoice = {
  body: {
    type: "object",
    description:
      "Payload for creating an invoice. Requires that the referenced client and product ids exist (and, for forwarding endpoints, are already sent to the accounting software).",
    required: ["client", "lines"],
    properties: {
      client: { type: "string", description: "Existing client id", examples: ["yescapital"] },
      lines: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          description:
            "Invoice line when creating an invoice. `product` must reference an existing product id.",
          required: ["product", "amount"],
          properties: {
            product: { type: "string", examples: ["hammer"] },
            amount: {
              description:
                'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
              oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
              examples: ["3.63"],
            },
            unitPrice: {
              description:
                'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
              oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
              examples: ["3.63"],
            },
            comment: { type: "string" },
            exception: {
              description:
                "Explains why a certain VAT rate was chosen for a line. `false` or `null` means the invoice was imported from elsewhere and this system is not used.",
              oneOf: [
                {
                  type: "string",
                  enum: [
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
                  ],
                },
                { type: "boolean" },
              ],
            },
          },
          additionalProperties: true,
        },
      },
    },
    additionalProperties: true,
    $schema: "http://json-schema.org/draft-04/schema#",
  },
  response: {
    "200": {
      type: "object",
      description:
        "Full sales invoice as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example).",
      properties: {
        id: {
          type: "string",
          description: "Internal id; usable immediately after creation",
          examples: ["69f2212bac38fd7df540535a"],
        },
        nr: {
          description:
            "Invoice number; assigned when the PDF is first generated. May be returned as a string or a number.",
          oneOf: [{ type: "string" }, { type: "integer" }],
          examples: ["200669"],
        },
        date: {
          type: "string",
          description: "Invoice date as a Unix timestamp in milliseconds (string)",
          examples: ["1782766800000"],
        },
        due: {
          type: "string",
          description: "Due date as a Unix timestamp in milliseconds (string)",
          examples: ["1783976400000"],
        },
        dateFormated: { type: "string", examples: ["2026-06-30"] },
        dueFormated: { type: "string", examples: ["2026-07-14"] },
        seller: {
          type: "object",
          description:
            "Seller (your company) block embedded in an invoice; also the shape returned by PUT /company",
          properties: {
            name: { type: "string", examples: ["CostPocket SIA"] },
            regCode: { type: "string", examples: ["40203537286"] },
            taxVAT: { type: "boolean", examples: [true] },
            VATNumber: { type: "string", examples: ["LV40203537286"] },
            address: { type: "string", examples: ["Eduarda Smiļģa iela 32 - 19"] },
            zip: { type: "string", examples: ["LV-1002"] },
            city: { type: "string", examples: ["Rīga"] },
            country: { type: "string", examples: ["Latvia"] },
            currency: { type: "string", examples: ["EUR"] },
            debit: { type: "string", description: "Default sales account", examples: ["3000"] },
            email: { type: "string", format: "email", examples: ["support@outvoicer.com"] },
            dueDays: { type: "integer", examples: [14] },
            lastInvoice: { type: "integer", examples: [200668] },
            prefix: {
              type: "string",
              description:
                "Invoice number prefix; useful to avoid duplicate number clashes in the accounting software",
              examples: ["Outvoicer-"],
            },
            bankAccounts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer", examples: [1] },
                  IBAN: { type: "string", examples: ["LV94HABA0551056496751"] },
                  bank: { type: "string", examples: ["SWEDBANK AS"] },
                  swift: { type: "string", examples: ["HABALV22"] },
                },
              },
            },
          },
          additionalProperties: true,
        },
        buyer: {
          type: "object",
          description:
            "Full client object as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example), and some legacy fields may have mixed types.",
          required: ["id", "name"],
          properties: {
            id: { type: "string", examples: ["yescapital"] },
            name: { type: "string", examples: ["Yes Capital OY"] },
            regCode: { oneOf: [{ type: "string" }, { type: "number" }], examples: ["17527906"] },
            taxVAT: {
              description:
                'Legacy data may contain boolean, string ("true"/"false") or number (0/1); semantically a boolean.',
              oneOf: [{ type: "boolean" }, { type: "string" }, { type: "integer" }],
              examples: [true],
            },
            VATNumber: {
              oneOf: [{ type: "string" }, { type: "integer" }, { type: "boolean" }],
              examples: ["EE101884549"],
            },
            address: { type: "string", examples: ["Roosikrantsi tn 11"] },
            city: { type: "string", examples: ["Tallinn"] },
            country: { type: "string", examples: ["Estonia"] },
            zip: { oneOf: [{ type: "string" }, { type: "integer" }], examples: ["10119"] },
            email: { type: "string", format: "email", examples: ["email@email.ee"] },
            refNumber: { type: "string", examples: ["599773"] },
            discount: {
              description: "Customer discount as a percentage; may be a number or numeric string",
              oneOf: [{ type: "number" }, { type: "string" }],
              examples: ["10"],
            },
            language: { type: "string", examples: ["ee"] },
            meritId: {
              type: "string",
              description: "Id of the client in the connected accounting software (e.g. Merit)",
            },
          },
          additionalProperties: true,
        },
        lines: {
          type: "array",
          items: {
            type: "object",
            description: "Invoice line as returned by the API",
            properties: {
              id: { type: "string", examples: ["sakuma-menesa-plans"] },
              product: { type: "string", examples: ["sakuma-menesa-plans"] },
              name: { type: "string", examples: ["Sākuma Mēneša plāns"] },
              VATRate: {
                type: "number",
                description: "Always a JSON number, e.g. 21 or 21.5",
                examples: [21],
              },
              unitPrice: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              unit: { type: "string", examples: ["pc"] },
              amount: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              rounding: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              comment: { type: "string", examples: ["string"] },
              debit: { type: "string", description: "Sales revenue account", examples: ["3000"] },
              subtotal: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              VAT: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              total: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
            },
            additionalProperties: true,
          },
        },
        currency: { type: "string", examples: ["EUR"] },
        subtotal: {
          description:
            'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
          oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
          examples: ["3.63"],
        },
        VAT: {
          description:
            'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
          oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
          examples: ["3.63"],
        },
        total: {
          description:
            'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
          oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
          examples: ["3.63"],
        },
        sent: { type: "boolean", examples: [true] },
        status: { type: "string", examples: ["sent"] },
      },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "400": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "409": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const DeleteBearerToken = {
  response: {
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const DeleteClient = {
  metadata: {
    allOf: [
      {
        type: "object",
        properties: {
          clientId: {
            type: "string",
            $schema: "http://json-schema.org/draft-04/schema#",
            description: "Client id, e.g. `yescapital`",
          },
        },
        required: ["clientId"],
      },
    ],
  },
  response: {
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "404": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const DeleteClientFromIntegration = {
  metadata: {
    allOf: [
      {
        type: "object",
        properties: {
          clientId: {
            type: "string",
            $schema: "http://json-schema.org/draft-04/schema#",
            description: "Client id, e.g. `yescapital`",
          },
        },
        required: ["clientId"],
      },
    ],
  },
  response: {
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "404": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "501": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const DeleteClientKey = {
  metadata: {
    allOf: [
      {
        type: "object",
        properties: {
          clientId: {
            type: "string",
            $schema: "http://json-schema.org/draft-04/schema#",
            description: "Client id, e.g. `yescapital`",
          },
          keyname: {
            type: "string",
            $schema: "http://json-schema.org/draft-04/schema#",
            description: "Name of the client field to delete, e.g. `finvoice` or `discount`",
          },
        },
        required: ["clientId", "keyname"],
      },
    ],
  },
  response: {
    "200": {
      type: "object",
      description:
        "Full client object as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example), and some legacy fields may have mixed types.",
      required: ["id", "name"],
      properties: {
        id: { type: "string", examples: ["yescapital"] },
        name: { type: "string", examples: ["Yes Capital OY"] },
        regCode: { oneOf: [{ type: "string" }, { type: "number" }], examples: ["17527906"] },
        taxVAT: {
          description:
            'Legacy data may contain boolean, string ("true"/"false") or number (0/1); semantically a boolean.',
          oneOf: [{ type: "boolean" }, { type: "string" }, { type: "integer" }],
          examples: [true],
        },
        VATNumber: {
          oneOf: [{ type: "string" }, { type: "integer" }, { type: "boolean" }],
          examples: ["EE101884549"],
        },
        address: { type: "string", examples: ["Roosikrantsi tn 11"] },
        city: { type: "string", examples: ["Tallinn"] },
        country: { type: "string", examples: ["Estonia"] },
        zip: { oneOf: [{ type: "string" }, { type: "integer" }], examples: ["10119"] },
        email: { type: "string", format: "email", examples: ["email@email.ee"] },
        refNumber: { type: "string", examples: ["599773"] },
        discount: {
          description: "Customer discount as a percentage; may be a number or numeric string",
          oneOf: [{ type: "number" }, { type: "string" }],
          examples: ["10"],
        },
        language: { type: "string", examples: ["ee"] },
        meritId: {
          type: "string",
          description: "Id of the client in the connected accounting software (e.g. Merit)",
        },
      },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "404": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const DeleteInvoiceFromIntegration = {
  metadata: {
    allOf: [
      {
        type: "object",
        properties: {
          id: {
            type: "string",
            $schema: "http://json-schema.org/draft-04/schema#",
            description:
              "Invoice internal id (e.g. `68b544f233f9e94dcfc24dd3`) or invoice number (e.g. `1234`; assigned when the PDF is first generated).",
          },
        },
        required: ["id"],
      },
    ],
  },
  response: {
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "404": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "501": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const DeleteProduct = {
  metadata: {
    allOf: [
      {
        type: "object",
        properties: {
          productId: {
            type: "string",
            $schema: "http://json-schema.org/draft-04/schema#",
            description: "Product id, e.g. `hammer`",
          },
        },
        required: ["productId"],
      },
    ],
  },
  response: {
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "404": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const DeleteProductFromIntegration = {
  metadata: {
    allOf: [
      {
        type: "object",
        properties: {
          productId: {
            type: "string",
            $schema: "http://json-schema.org/draft-04/schema#",
            description: "Product id, e.g. `hammer`",
          },
        },
        required: ["productId"],
      },
    ],
  },
  response: {
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "404": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "501": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const EinvoiceInvoice = {
  body: {
    type: "object",
    additionalProperties: false,
    $schema: "http://json-schema.org/draft-04/schema#",
  },
  metadata: {
    allOf: [
      {
        type: "object",
        properties: {
          id: {
            type: "string",
            $schema: "http://json-schema.org/draft-04/schema#",
            description:
              "Invoice internal id (e.g. `68b544f233f9e94dcfc24dd3`) or invoice number (e.g. `1234`; assigned when the PDF is first generated).",
          },
        },
        required: ["id"],
      },
    ],
  },
  response: {
    "200": {
      type: "object",
      description:
        "Full sales invoice as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example).",
      properties: {
        id: {
          type: "string",
          description: "Internal id; usable immediately after creation",
          examples: ["69f2212bac38fd7df540535a"],
        },
        nr: {
          description:
            "Invoice number; assigned when the PDF is first generated. May be returned as a string or a number.",
          oneOf: [{ type: "string" }, { type: "integer" }],
          examples: ["200669"],
        },
        date: {
          type: "string",
          description: "Invoice date as a Unix timestamp in milliseconds (string)",
          examples: ["1782766800000"],
        },
        due: {
          type: "string",
          description: "Due date as a Unix timestamp in milliseconds (string)",
          examples: ["1783976400000"],
        },
        dateFormated: { type: "string", examples: ["2026-06-30"] },
        dueFormated: { type: "string", examples: ["2026-07-14"] },
        seller: {
          type: "object",
          description:
            "Seller (your company) block embedded in an invoice; also the shape returned by PUT /company",
          properties: {
            name: { type: "string", examples: ["CostPocket SIA"] },
            regCode: { type: "string", examples: ["40203537286"] },
            taxVAT: { type: "boolean", examples: [true] },
            VATNumber: { type: "string", examples: ["LV40203537286"] },
            address: { type: "string", examples: ["Eduarda Smiļģa iela 32 - 19"] },
            zip: { type: "string", examples: ["LV-1002"] },
            city: { type: "string", examples: ["Rīga"] },
            country: { type: "string", examples: ["Latvia"] },
            currency: { type: "string", examples: ["EUR"] },
            debit: { type: "string", description: "Default sales account", examples: ["3000"] },
            email: { type: "string", format: "email", examples: ["support@outvoicer.com"] },
            dueDays: { type: "integer", examples: [14] },
            lastInvoice: { type: "integer", examples: [200668] },
            prefix: {
              type: "string",
              description:
                "Invoice number prefix; useful to avoid duplicate number clashes in the accounting software",
              examples: ["Outvoicer-"],
            },
            bankAccounts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer", examples: [1] },
                  IBAN: { type: "string", examples: ["LV94HABA0551056496751"] },
                  bank: { type: "string", examples: ["SWEDBANK AS"] },
                  swift: { type: "string", examples: ["HABALV22"] },
                },
              },
            },
          },
          additionalProperties: true,
        },
        buyer: {
          type: "object",
          description:
            "Full client object as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example), and some legacy fields may have mixed types.",
          required: ["id", "name"],
          properties: {
            id: { type: "string", examples: ["yescapital"] },
            name: { type: "string", examples: ["Yes Capital OY"] },
            regCode: { oneOf: [{ type: "string" }, { type: "number" }], examples: ["17527906"] },
            taxVAT: {
              description:
                'Legacy data may contain boolean, string ("true"/"false") or number (0/1); semantically a boolean.',
              oneOf: [{ type: "boolean" }, { type: "string" }, { type: "integer" }],
              examples: [true],
            },
            VATNumber: {
              oneOf: [{ type: "string" }, { type: "integer" }, { type: "boolean" }],
              examples: ["EE101884549"],
            },
            address: { type: "string", examples: ["Roosikrantsi tn 11"] },
            city: { type: "string", examples: ["Tallinn"] },
            country: { type: "string", examples: ["Estonia"] },
            zip: { oneOf: [{ type: "string" }, { type: "integer" }], examples: ["10119"] },
            email: { type: "string", format: "email", examples: ["email@email.ee"] },
            refNumber: { type: "string", examples: ["599773"] },
            discount: {
              description: "Customer discount as a percentage; may be a number or numeric string",
              oneOf: [{ type: "number" }, { type: "string" }],
              examples: ["10"],
            },
            language: { type: "string", examples: ["ee"] },
            meritId: {
              type: "string",
              description: "Id of the client in the connected accounting software (e.g. Merit)",
            },
          },
          additionalProperties: true,
        },
        lines: {
          type: "array",
          items: {
            type: "object",
            description: "Invoice line as returned by the API",
            properties: {
              id: { type: "string", examples: ["sakuma-menesa-plans"] },
              product: { type: "string", examples: ["sakuma-menesa-plans"] },
              name: { type: "string", examples: ["Sākuma Mēneša plāns"] },
              VATRate: {
                type: "number",
                description: "Always a JSON number, e.g. 21 or 21.5",
                examples: [21],
              },
              unitPrice: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              unit: { type: "string", examples: ["pc"] },
              amount: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              rounding: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              comment: { type: "string", examples: ["string"] },
              debit: { type: "string", description: "Sales revenue account", examples: ["3000"] },
              subtotal: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              VAT: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              total: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
            },
            additionalProperties: true,
          },
        },
        currency: { type: "string", examples: ["EUR"] },
        subtotal: {
          description:
            'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
          oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
          examples: ["3.63"],
        },
        VAT: {
          description:
            'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
          oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
          examples: ["3.63"],
        },
        total: {
          description:
            'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
          oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
          examples: ["3.63"],
        },
        sent: { type: "boolean", examples: [true] },
        status: { type: "string", examples: ["sent"] },
      },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "404": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "409": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const EmailInvoice = {
  body: {
    type: "object",
    additionalProperties: false,
    $schema: "http://json-schema.org/draft-04/schema#",
  },
  metadata: {
    allOf: [
      {
        type: "object",
        properties: {
          id: {
            type: "string",
            $schema: "http://json-schema.org/draft-04/schema#",
            description:
              "Invoice internal id (e.g. `68b544f233f9e94dcfc24dd3`) or invoice number (e.g. `1234`; assigned when the PDF is first generated).",
          },
        },
        required: ["id"],
      },
    ],
  },
  response: {
    "200": {
      type: "object",
      description:
        "Full sales invoice as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example).",
      properties: {
        id: {
          type: "string",
          description: "Internal id; usable immediately after creation",
          examples: ["69f2212bac38fd7df540535a"],
        },
        nr: {
          description:
            "Invoice number; assigned when the PDF is first generated. May be returned as a string or a number.",
          oneOf: [{ type: "string" }, { type: "integer" }],
          examples: ["200669"],
        },
        date: {
          type: "string",
          description: "Invoice date as a Unix timestamp in milliseconds (string)",
          examples: ["1782766800000"],
        },
        due: {
          type: "string",
          description: "Due date as a Unix timestamp in milliseconds (string)",
          examples: ["1783976400000"],
        },
        dateFormated: { type: "string", examples: ["2026-06-30"] },
        dueFormated: { type: "string", examples: ["2026-07-14"] },
        seller: {
          type: "object",
          description:
            "Seller (your company) block embedded in an invoice; also the shape returned by PUT /company",
          properties: {
            name: { type: "string", examples: ["CostPocket SIA"] },
            regCode: { type: "string", examples: ["40203537286"] },
            taxVAT: { type: "boolean", examples: [true] },
            VATNumber: { type: "string", examples: ["LV40203537286"] },
            address: { type: "string", examples: ["Eduarda Smiļģa iela 32 - 19"] },
            zip: { type: "string", examples: ["LV-1002"] },
            city: { type: "string", examples: ["Rīga"] },
            country: { type: "string", examples: ["Latvia"] },
            currency: { type: "string", examples: ["EUR"] },
            debit: { type: "string", description: "Default sales account", examples: ["3000"] },
            email: { type: "string", format: "email", examples: ["support@outvoicer.com"] },
            dueDays: { type: "integer", examples: [14] },
            lastInvoice: { type: "integer", examples: [200668] },
            prefix: {
              type: "string",
              description:
                "Invoice number prefix; useful to avoid duplicate number clashes in the accounting software",
              examples: ["Outvoicer-"],
            },
            bankAccounts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer", examples: [1] },
                  IBAN: { type: "string", examples: ["LV94HABA0551056496751"] },
                  bank: { type: "string", examples: ["SWEDBANK AS"] },
                  swift: { type: "string", examples: ["HABALV22"] },
                },
              },
            },
          },
          additionalProperties: true,
        },
        buyer: {
          type: "object",
          description:
            "Full client object as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example), and some legacy fields may have mixed types.",
          required: ["id", "name"],
          properties: {
            id: { type: "string", examples: ["yescapital"] },
            name: { type: "string", examples: ["Yes Capital OY"] },
            regCode: { oneOf: [{ type: "string" }, { type: "number" }], examples: ["17527906"] },
            taxVAT: {
              description:
                'Legacy data may contain boolean, string ("true"/"false") or number (0/1); semantically a boolean.',
              oneOf: [{ type: "boolean" }, { type: "string" }, { type: "integer" }],
              examples: [true],
            },
            VATNumber: {
              oneOf: [{ type: "string" }, { type: "integer" }, { type: "boolean" }],
              examples: ["EE101884549"],
            },
            address: { type: "string", examples: ["Roosikrantsi tn 11"] },
            city: { type: "string", examples: ["Tallinn"] },
            country: { type: "string", examples: ["Estonia"] },
            zip: { oneOf: [{ type: "string" }, { type: "integer" }], examples: ["10119"] },
            email: { type: "string", format: "email", examples: ["email@email.ee"] },
            refNumber: { type: "string", examples: ["599773"] },
            discount: {
              description: "Customer discount as a percentage; may be a number or numeric string",
              oneOf: [{ type: "number" }, { type: "string" }],
              examples: ["10"],
            },
            language: { type: "string", examples: ["ee"] },
            meritId: {
              type: "string",
              description: "Id of the client in the connected accounting software (e.g. Merit)",
            },
          },
          additionalProperties: true,
        },
        lines: {
          type: "array",
          items: {
            type: "object",
            description: "Invoice line as returned by the API",
            properties: {
              id: { type: "string", examples: ["sakuma-menesa-plans"] },
              product: { type: "string", examples: ["sakuma-menesa-plans"] },
              name: { type: "string", examples: ["Sākuma Mēneša plāns"] },
              VATRate: {
                type: "number",
                description: "Always a JSON number, e.g. 21 or 21.5",
                examples: [21],
              },
              unitPrice: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              unit: { type: "string", examples: ["pc"] },
              amount: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              rounding: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              comment: { type: "string", examples: ["string"] },
              debit: { type: "string", description: "Sales revenue account", examples: ["3000"] },
              subtotal: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              VAT: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              total: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
            },
            additionalProperties: true,
          },
        },
        currency: { type: "string", examples: ["EUR"] },
        subtotal: {
          description:
            'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
          oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
          examples: ["3.63"],
        },
        VAT: {
          description:
            'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
          oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
          examples: ["3.63"],
        },
        total: {
          description:
            'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
          oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
          examples: ["3.63"],
        },
        sent: { type: "boolean", examples: [true] },
        status: { type: "string", examples: ["sent"] },
      },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "404": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "409": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const ForwardClient = {
  body: {
    type: "object",
    additionalProperties: false,
    $schema: "http://json-schema.org/draft-04/schema#",
  },
  metadata: {
    allOf: [
      {
        type: "object",
        properties: {
          clientId: {
            type: "string",
            $schema: "http://json-schema.org/draft-04/schema#",
            description: "Client id, e.g. `yescapital`",
          },
        },
        required: ["clientId"],
      },
    ],
  },
  response: {
    "200": {
      type: "object",
      description:
        "Full client object as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example), and some legacy fields may have mixed types.",
      required: ["id", "name"],
      properties: {
        id: { type: "string", examples: ["yescapital"] },
        name: { type: "string", examples: ["Yes Capital OY"] },
        regCode: { oneOf: [{ type: "string" }, { type: "number" }], examples: ["17527906"] },
        taxVAT: {
          description:
            'Legacy data may contain boolean, string ("true"/"false") or number (0/1); semantically a boolean.',
          oneOf: [{ type: "boolean" }, { type: "string" }, { type: "integer" }],
          examples: [true],
        },
        VATNumber: {
          oneOf: [{ type: "string" }, { type: "integer" }, { type: "boolean" }],
          examples: ["EE101884549"],
        },
        address: { type: "string", examples: ["Roosikrantsi tn 11"] },
        city: { type: "string", examples: ["Tallinn"] },
        country: { type: "string", examples: ["Estonia"] },
        zip: { oneOf: [{ type: "string" }, { type: "integer" }], examples: ["10119"] },
        email: { type: "string", format: "email", examples: ["email@email.ee"] },
        refNumber: { type: "string", examples: ["599773"] },
        discount: {
          description: "Customer discount as a percentage; may be a number or numeric string",
          oneOf: [{ type: "number" }, { type: "string" }],
          examples: ["10"],
        },
        language: { type: "string", examples: ["ee"] },
        meritId: {
          type: "string",
          description: "Id of the client in the connected accounting software (e.g. Merit)",
        },
      },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "404": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const ForwardInvoice = {
  body: {
    type: "object",
    additionalProperties: false,
    $schema: "http://json-schema.org/draft-04/schema#",
  },
  metadata: {
    allOf: [
      {
        type: "object",
        properties: {
          id: {
            type: "string",
            $schema: "http://json-schema.org/draft-04/schema#",
            description:
              "Invoice internal id (e.g. `68b544f233f9e94dcfc24dd3`) or invoice number (e.g. `1234`; assigned when the PDF is first generated).",
          },
        },
        required: ["id"],
      },
    ],
  },
  response: {
    "200": {
      type: "object",
      description:
        "Full sales invoice as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example).",
      properties: {
        id: {
          type: "string",
          description: "Internal id; usable immediately after creation",
          examples: ["69f2212bac38fd7df540535a"],
        },
        nr: {
          description:
            "Invoice number; assigned when the PDF is first generated. May be returned as a string or a number.",
          oneOf: [{ type: "string" }, { type: "integer" }],
          examples: ["200669"],
        },
        date: {
          type: "string",
          description: "Invoice date as a Unix timestamp in milliseconds (string)",
          examples: ["1782766800000"],
        },
        due: {
          type: "string",
          description: "Due date as a Unix timestamp in milliseconds (string)",
          examples: ["1783976400000"],
        },
        dateFormated: { type: "string", examples: ["2026-06-30"] },
        dueFormated: { type: "string", examples: ["2026-07-14"] },
        seller: {
          type: "object",
          description:
            "Seller (your company) block embedded in an invoice; also the shape returned by PUT /company",
          properties: {
            name: { type: "string", examples: ["CostPocket SIA"] },
            regCode: { type: "string", examples: ["40203537286"] },
            taxVAT: { type: "boolean", examples: [true] },
            VATNumber: { type: "string", examples: ["LV40203537286"] },
            address: { type: "string", examples: ["Eduarda Smiļģa iela 32 - 19"] },
            zip: { type: "string", examples: ["LV-1002"] },
            city: { type: "string", examples: ["Rīga"] },
            country: { type: "string", examples: ["Latvia"] },
            currency: { type: "string", examples: ["EUR"] },
            debit: { type: "string", description: "Default sales account", examples: ["3000"] },
            email: { type: "string", format: "email", examples: ["support@outvoicer.com"] },
            dueDays: { type: "integer", examples: [14] },
            lastInvoice: { type: "integer", examples: [200668] },
            prefix: {
              type: "string",
              description:
                "Invoice number prefix; useful to avoid duplicate number clashes in the accounting software",
              examples: ["Outvoicer-"],
            },
            bankAccounts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer", examples: [1] },
                  IBAN: { type: "string", examples: ["LV94HABA0551056496751"] },
                  bank: { type: "string", examples: ["SWEDBANK AS"] },
                  swift: { type: "string", examples: ["HABALV22"] },
                },
              },
            },
          },
          additionalProperties: true,
        },
        buyer: {
          type: "object",
          description:
            "Full client object as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example), and some legacy fields may have mixed types.",
          required: ["id", "name"],
          properties: {
            id: { type: "string", examples: ["yescapital"] },
            name: { type: "string", examples: ["Yes Capital OY"] },
            regCode: { oneOf: [{ type: "string" }, { type: "number" }], examples: ["17527906"] },
            taxVAT: {
              description:
                'Legacy data may contain boolean, string ("true"/"false") or number (0/1); semantically a boolean.',
              oneOf: [{ type: "boolean" }, { type: "string" }, { type: "integer" }],
              examples: [true],
            },
            VATNumber: {
              oneOf: [{ type: "string" }, { type: "integer" }, { type: "boolean" }],
              examples: ["EE101884549"],
            },
            address: { type: "string", examples: ["Roosikrantsi tn 11"] },
            city: { type: "string", examples: ["Tallinn"] },
            country: { type: "string", examples: ["Estonia"] },
            zip: { oneOf: [{ type: "string" }, { type: "integer" }], examples: ["10119"] },
            email: { type: "string", format: "email", examples: ["email@email.ee"] },
            refNumber: { type: "string", examples: ["599773"] },
            discount: {
              description: "Customer discount as a percentage; may be a number or numeric string",
              oneOf: [{ type: "number" }, { type: "string" }],
              examples: ["10"],
            },
            language: { type: "string", examples: ["ee"] },
            meritId: {
              type: "string",
              description: "Id of the client in the connected accounting software (e.g. Merit)",
            },
          },
          additionalProperties: true,
        },
        lines: {
          type: "array",
          items: {
            type: "object",
            description: "Invoice line as returned by the API",
            properties: {
              id: { type: "string", examples: ["sakuma-menesa-plans"] },
              product: { type: "string", examples: ["sakuma-menesa-plans"] },
              name: { type: "string", examples: ["Sākuma Mēneša plāns"] },
              VATRate: {
                type: "number",
                description: "Always a JSON number, e.g. 21 or 21.5",
                examples: [21],
              },
              unitPrice: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              unit: { type: "string", examples: ["pc"] },
              amount: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              rounding: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              comment: { type: "string", examples: ["string"] },
              debit: { type: "string", description: "Sales revenue account", examples: ["3000"] },
              subtotal: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              VAT: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              total: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
            },
            additionalProperties: true,
          },
        },
        currency: { type: "string", examples: ["EUR"] },
        subtotal: {
          description:
            'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
          oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
          examples: ["3.63"],
        },
        VAT: {
          description:
            'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
          oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
          examples: ["3.63"],
        },
        total: {
          description:
            'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
          oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
          examples: ["3.63"],
        },
        sent: { type: "boolean", examples: [true] },
        status: { type: "string", examples: ["sent"] },
      },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "404": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "409": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "501": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const ForwardProduct = {
  body: {
    type: "object",
    additionalProperties: false,
    $schema: "http://json-schema.org/draft-04/schema#",
  },
  metadata: {
    allOf: [
      {
        type: "object",
        properties: {
          productId: {
            type: "string",
            $schema: "http://json-schema.org/draft-04/schema#",
            description: "Product id, e.g. `hammer`",
          },
        },
        required: ["productId"],
      },
    ],
  },
  response: {
    "200": {
      type: "object",
      description:
        "Full product object as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example).",
      required: ["id", "name"],
      properties: {
        id: { type: "string", examples: ["hammer"] },
        name: { type: "string", examples: ["Hammer"] },
        unit: { type: "string", examples: ["pc"] },
        unitPrice: {
          description:
            'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
          oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
          examples: ["3.63"],
        },
        debit: {
          type: "string",
          description: "Sales revenue account in accounting for this product",
          examples: ["3015"],
        },
        VATRate: {
          type: "number",
          description:
            "Always a JSON number, e.g. 21 or 21.5. Overwrites the default VAT rate for this product.",
          examples: [21.5],
        },
      },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "404": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "501": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const GenerateBearerToken = {
  response: {
    "200": {
      type: "object",
      properties: {
        token: {
          type: "string",
          description: "The Bearer token to use in the Authorization header",
        },
      },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const GetClient = {
  metadata: {
    allOf: [
      {
        type: "object",
        properties: {
          clientId: {
            type: "string",
            $schema: "http://json-schema.org/draft-04/schema#",
            description: "Client id, e.g. `yescapital`",
          },
        },
        required: ["clientId"],
      },
    ],
  },
  response: {
    "200": {
      type: "object",
      description:
        "Full client object as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example), and some legacy fields may have mixed types.",
      required: ["id", "name"],
      properties: {
        id: { type: "string", examples: ["yescapital"] },
        name: { type: "string", examples: ["Yes Capital OY"] },
        regCode: { oneOf: [{ type: "string" }, { type: "number" }], examples: ["17527906"] },
        taxVAT: {
          description:
            'Legacy data may contain boolean, string ("true"/"false") or number (0/1); semantically a boolean.',
          oneOf: [{ type: "boolean" }, { type: "string" }, { type: "integer" }],
          examples: [true],
        },
        VATNumber: {
          oneOf: [{ type: "string" }, { type: "integer" }, { type: "boolean" }],
          examples: ["EE101884549"],
        },
        address: { type: "string", examples: ["Roosikrantsi tn 11"] },
        city: { type: "string", examples: ["Tallinn"] },
        country: { type: "string", examples: ["Estonia"] },
        zip: { oneOf: [{ type: "string" }, { type: "integer" }], examples: ["10119"] },
        email: { type: "string", format: "email", examples: ["email@email.ee"] },
        refNumber: { type: "string", examples: ["599773"] },
        discount: {
          description: "Customer discount as a percentage; may be a number or numeric string",
          oneOf: [{ type: "number" }, { type: "string" }],
          examples: ["10"],
        },
        language: { type: "string", examples: ["ee"] },
        meritId: {
          type: "string",
          description: "Id of the client in the connected accounting software (e.g. Merit)",
        },
      },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "404": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const GetClientBalance = {
  response: {
    "200": {
      type: "object",
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "501": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const GetClientChannel = {
  metadata: {
    allOf: [
      {
        type: "object",
        properties: {
          clientId: {
            type: "string",
            $schema: "http://json-schema.org/draft-04/schema#",
            description: "Client id, e.g. `yescapital`",
          },
        },
        required: ["clientId"],
      },
    ],
  },
  response: {
    "200": {
      type: "object",
      description: "Client's current invoice delivery channel / e-invoice eligibility",
      properties: {
        email: { type: "string", format: "email" },
        delivery: {
          type: "string",
          description:
            "How the invoice is delivered to the client. Unknown values default to Email.\n\n`Email` `Einvoice` `EinvoiceBank`",
          enum: ["Email", "Einvoice", "EinvoiceBank"],
        },
        finvoice: {
          type: "object",
          description: "Finnish e-invoice (Finvoice) address of the client",
          properties: {
            address: { type: "string" },
            service_identifier: { type: "string" },
            type: { type: "string" },
          },
          required: ["address", "service_identifier"],
        },
      },
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "404": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const GetClientInvoices = {
  metadata: {
    allOf: [
      {
        type: "object",
        properties: {
          name: {
            type: "string",
            $schema: "http://json-schema.org/draft-04/schema#",
            description: "Client identifier / name",
          },
        },
        required: ["name"],
      },
    ],
  },
  response: {
    "200": {
      type: "array",
      items: {
        type: "object",
        description:
          "Full sales invoice as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example).",
        properties: {
          id: {
            type: "string",
            description: "Internal id; usable immediately after creation",
            examples: ["69f2212bac38fd7df540535a"],
          },
          nr: {
            description:
              "Invoice number; assigned when the PDF is first generated. May be returned as a string or a number.",
            oneOf: [{ type: "string" }, { type: "integer" }],
            examples: ["200669"],
          },
          date: {
            type: "string",
            description: "Invoice date as a Unix timestamp in milliseconds (string)",
            examples: ["1782766800000"],
          },
          due: {
            type: "string",
            description: "Due date as a Unix timestamp in milliseconds (string)",
            examples: ["1783976400000"],
          },
          dateFormated: { type: "string", examples: ["2026-06-30"] },
          dueFormated: { type: "string", examples: ["2026-07-14"] },
          seller: {
            type: "object",
            description:
              "Seller (your company) block embedded in an invoice; also the shape returned by PUT /company",
            properties: {
              name: { type: "string", examples: ["CostPocket SIA"] },
              regCode: { type: "string", examples: ["40203537286"] },
              taxVAT: { type: "boolean", examples: [true] },
              VATNumber: { type: "string", examples: ["LV40203537286"] },
              address: { type: "string", examples: ["Eduarda Smiļģa iela 32 - 19"] },
              zip: { type: "string", examples: ["LV-1002"] },
              city: { type: "string", examples: ["Rīga"] },
              country: { type: "string", examples: ["Latvia"] },
              currency: { type: "string", examples: ["EUR"] },
              debit: { type: "string", description: "Default sales account", examples: ["3000"] },
              email: { type: "string", format: "email", examples: ["support@outvoicer.com"] },
              dueDays: { type: "integer", examples: [14] },
              lastInvoice: { type: "integer", examples: [200668] },
              prefix: {
                type: "string",
                description:
                  "Invoice number prefix; useful to avoid duplicate number clashes in the accounting software",
                examples: ["Outvoicer-"],
              },
              bankAccounts: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "integer", examples: [1] },
                    IBAN: { type: "string", examples: ["LV94HABA0551056496751"] },
                    bank: { type: "string", examples: ["SWEDBANK AS"] },
                    swift: { type: "string", examples: ["HABALV22"] },
                  },
                },
              },
            },
            additionalProperties: true,
          },
          buyer: {
            type: "object",
            description:
              "Full client object as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example), and some legacy fields may have mixed types.",
            required: ["id", "name"],
            properties: {
              id: { type: "string", examples: ["yescapital"] },
              name: { type: "string", examples: ["Yes Capital OY"] },
              regCode: { oneOf: [{ type: "string" }, { type: "number" }], examples: ["17527906"] },
              taxVAT: {
                description:
                  'Legacy data may contain boolean, string ("true"/"false") or number (0/1); semantically a boolean.',
                oneOf: [{ type: "boolean" }, { type: "string" }, { type: "integer" }],
                examples: [true],
              },
              VATNumber: {
                oneOf: [{ type: "string" }, { type: "integer" }, { type: "boolean" }],
                examples: ["EE101884549"],
              },
              address: { type: "string", examples: ["Roosikrantsi tn 11"] },
              city: { type: "string", examples: ["Tallinn"] },
              country: { type: "string", examples: ["Estonia"] },
              zip: { oneOf: [{ type: "string" }, { type: "integer" }], examples: ["10119"] },
              email: { type: "string", format: "email", examples: ["email@email.ee"] },
              refNumber: { type: "string", examples: ["599773"] },
              discount: {
                description: "Customer discount as a percentage; may be a number or numeric string",
                oneOf: [{ type: "number" }, { type: "string" }],
                examples: ["10"],
              },
              language: { type: "string", examples: ["ee"] },
              meritId: {
                type: "string",
                description: "Id of the client in the connected accounting software (e.g. Merit)",
              },
            },
            additionalProperties: true,
          },
          lines: {
            type: "array",
            items: {
              type: "object",
              description: "Invoice line as returned by the API",
              properties: {
                id: { type: "string", examples: ["sakuma-menesa-plans"] },
                product: { type: "string", examples: ["sakuma-menesa-plans"] },
                name: { type: "string", examples: ["Sākuma Mēneša plāns"] },
                VATRate: {
                  type: "number",
                  description: "Always a JSON number, e.g. 21 or 21.5",
                  examples: [21],
                },
                unitPrice: {
                  description:
                    'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                  oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                  examples: ["3.63"],
                },
                unit: { type: "string", examples: ["pc"] },
                amount: {
                  description:
                    'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                  oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                  examples: ["3.63"],
                },
                rounding: {
                  description:
                    'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                  oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                  examples: ["3.63"],
                },
                comment: { type: "string", examples: ["string"] },
                debit: { type: "string", description: "Sales revenue account", examples: ["3000"] },
                subtotal: {
                  description:
                    'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                  oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                  examples: ["3.63"],
                },
                VAT: {
                  description:
                    'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                  oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                  examples: ["3.63"],
                },
                total: {
                  description:
                    'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                  oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                  examples: ["3.63"],
                },
              },
              additionalProperties: true,
            },
          },
          currency: { type: "string", examples: ["EUR"] },
          subtotal: {
            description:
              'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
            oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
            examples: ["3.63"],
          },
          VAT: {
            description:
              'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
            oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
            examples: ["3.63"],
          },
          total: {
            description:
              'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
            oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
            examples: ["3.63"],
          },
          sent: { type: "boolean", examples: [true] },
          status: { type: "string", examples: ["sent"] },
        },
        additionalProperties: true,
      },
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const GetClients = {
  response: {
    "200": {
      type: "array",
      items: {
        type: "object",
        description:
          "Full client object as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example), and some legacy fields may have mixed types.",
        required: ["id", "name"],
        properties: {
          id: { type: "string", examples: ["yescapital"] },
          name: { type: "string", examples: ["Yes Capital OY"] },
          regCode: { oneOf: [{ type: "string" }, { type: "number" }], examples: ["17527906"] },
          taxVAT: {
            description:
              'Legacy data may contain boolean, string ("true"/"false") or number (0/1); semantically a boolean.',
            oneOf: [{ type: "boolean" }, { type: "string" }, { type: "integer" }],
            examples: [true],
          },
          VATNumber: {
            oneOf: [{ type: "string" }, { type: "integer" }, { type: "boolean" }],
            examples: ["EE101884549"],
          },
          address: { type: "string", examples: ["Roosikrantsi tn 11"] },
          city: { type: "string", examples: ["Tallinn"] },
          country: { type: "string", examples: ["Estonia"] },
          zip: { oneOf: [{ type: "string" }, { type: "integer" }], examples: ["10119"] },
          email: { type: "string", format: "email", examples: ["email@email.ee"] },
          refNumber: { type: "string", examples: ["599773"] },
          discount: {
            description: "Customer discount as a percentage; may be a number or numeric string",
            oneOf: [{ type: "number" }, { type: "string" }],
            examples: ["10"],
          },
          language: { type: "string", examples: ["ee"] },
          meritId: {
            type: "string",
            description: "Id of the client in the connected accounting software (e.g. Merit)",
          },
        },
        additionalProperties: true,
      },
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const GetCompany = {
  response: {
    "200": {
      type: "object",
      description:
        "Seller (your company) block embedded in an invoice; also the shape returned by PUT /company",
      properties: {
        name: { type: "string", examples: ["CostPocket SIA"] },
        regCode: { type: "string", examples: ["40203537286"] },
        taxVAT: { type: "boolean", examples: [true] },
        VATNumber: { type: "string", examples: ["LV40203537286"] },
        address: { type: "string", examples: ["Eduarda Smiļģa iela 32 - 19"] },
        zip: { type: "string", examples: ["LV-1002"] },
        city: { type: "string", examples: ["Rīga"] },
        country: { type: "string", examples: ["Latvia"] },
        currency: { type: "string", examples: ["EUR"] },
        debit: { type: "string", description: "Default sales account", examples: ["3000"] },
        email: { type: "string", format: "email", examples: ["support@outvoicer.com"] },
        dueDays: { type: "integer", examples: [14] },
        lastInvoice: { type: "integer", examples: [200668] },
        prefix: {
          type: "string",
          description:
            "Invoice number prefix; useful to avoid duplicate number clashes in the accounting software",
          examples: ["Outvoicer-"],
        },
        bankAccounts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "integer", examples: [1] },
              IBAN: { type: "string", examples: ["LV94HABA0551056496751"] },
              bank: { type: "string", examples: ["SWEDBANK AS"] },
              swift: { type: "string", examples: ["HABALV22"] },
            },
          },
        },
      },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const GetInvoice = {
  metadata: {
    allOf: [
      {
        type: "object",
        properties: {
          id: {
            type: "string",
            $schema: "http://json-schema.org/draft-04/schema#",
            description:
              "Invoice internal id (e.g. `68b544f233f9e94dcfc24dd3`) or invoice number (e.g. `1234`; assigned when the PDF is first generated).",
          },
        },
        required: ["id"],
      },
    ],
  },
  response: {
    "200": {
      type: "object",
      description:
        "Full sales invoice as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example).",
      properties: {
        id: {
          type: "string",
          description: "Internal id; usable immediately after creation",
          examples: ["69f2212bac38fd7df540535a"],
        },
        nr: {
          description:
            "Invoice number; assigned when the PDF is first generated. May be returned as a string or a number.",
          oneOf: [{ type: "string" }, { type: "integer" }],
          examples: ["200669"],
        },
        date: {
          type: "string",
          description: "Invoice date as a Unix timestamp in milliseconds (string)",
          examples: ["1782766800000"],
        },
        due: {
          type: "string",
          description: "Due date as a Unix timestamp in milliseconds (string)",
          examples: ["1783976400000"],
        },
        dateFormated: { type: "string", examples: ["2026-06-30"] },
        dueFormated: { type: "string", examples: ["2026-07-14"] },
        seller: {
          type: "object",
          description:
            "Seller (your company) block embedded in an invoice; also the shape returned by PUT /company",
          properties: {
            name: { type: "string", examples: ["CostPocket SIA"] },
            regCode: { type: "string", examples: ["40203537286"] },
            taxVAT: { type: "boolean", examples: [true] },
            VATNumber: { type: "string", examples: ["LV40203537286"] },
            address: { type: "string", examples: ["Eduarda Smiļģa iela 32 - 19"] },
            zip: { type: "string", examples: ["LV-1002"] },
            city: { type: "string", examples: ["Rīga"] },
            country: { type: "string", examples: ["Latvia"] },
            currency: { type: "string", examples: ["EUR"] },
            debit: { type: "string", description: "Default sales account", examples: ["3000"] },
            email: { type: "string", format: "email", examples: ["support@outvoicer.com"] },
            dueDays: { type: "integer", examples: [14] },
            lastInvoice: { type: "integer", examples: [200668] },
            prefix: {
              type: "string",
              description:
                "Invoice number prefix; useful to avoid duplicate number clashes in the accounting software",
              examples: ["Outvoicer-"],
            },
            bankAccounts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer", examples: [1] },
                  IBAN: { type: "string", examples: ["LV94HABA0551056496751"] },
                  bank: { type: "string", examples: ["SWEDBANK AS"] },
                  swift: { type: "string", examples: ["HABALV22"] },
                },
              },
            },
          },
          additionalProperties: true,
        },
        buyer: {
          type: "object",
          description:
            "Full client object as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example), and some legacy fields may have mixed types.",
          required: ["id", "name"],
          properties: {
            id: { type: "string", examples: ["yescapital"] },
            name: { type: "string", examples: ["Yes Capital OY"] },
            regCode: { oneOf: [{ type: "string" }, { type: "number" }], examples: ["17527906"] },
            taxVAT: {
              description:
                'Legacy data may contain boolean, string ("true"/"false") or number (0/1); semantically a boolean.',
              oneOf: [{ type: "boolean" }, { type: "string" }, { type: "integer" }],
              examples: [true],
            },
            VATNumber: {
              oneOf: [{ type: "string" }, { type: "integer" }, { type: "boolean" }],
              examples: ["EE101884549"],
            },
            address: { type: "string", examples: ["Roosikrantsi tn 11"] },
            city: { type: "string", examples: ["Tallinn"] },
            country: { type: "string", examples: ["Estonia"] },
            zip: { oneOf: [{ type: "string" }, { type: "integer" }], examples: ["10119"] },
            email: { type: "string", format: "email", examples: ["email@email.ee"] },
            refNumber: { type: "string", examples: ["599773"] },
            discount: {
              description: "Customer discount as a percentage; may be a number or numeric string",
              oneOf: [{ type: "number" }, { type: "string" }],
              examples: ["10"],
            },
            language: { type: "string", examples: ["ee"] },
            meritId: {
              type: "string",
              description: "Id of the client in the connected accounting software (e.g. Merit)",
            },
          },
          additionalProperties: true,
        },
        lines: {
          type: "array",
          items: {
            type: "object",
            description: "Invoice line as returned by the API",
            properties: {
              id: { type: "string", examples: ["sakuma-menesa-plans"] },
              product: { type: "string", examples: ["sakuma-menesa-plans"] },
              name: { type: "string", examples: ["Sākuma Mēneša plāns"] },
              VATRate: {
                type: "number",
                description: "Always a JSON number, e.g. 21 or 21.5",
                examples: [21],
              },
              unitPrice: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              unit: { type: "string", examples: ["pc"] },
              amount: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              rounding: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              comment: { type: "string", examples: ["string"] },
              debit: { type: "string", description: "Sales revenue account", examples: ["3000"] },
              subtotal: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              VAT: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              total: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
            },
            additionalProperties: true,
          },
        },
        currency: { type: "string", examples: ["EUR"] },
        subtotal: {
          description:
            'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
          oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
          examples: ["3.63"],
        },
        VAT: {
          description:
            'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
          oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
          examples: ["3.63"],
        },
        total: {
          description:
            'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
          oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
          examples: ["3.63"],
        },
        sent: { type: "boolean", examples: [true] },
        status: { type: "string", examples: ["sent"] },
      },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "404": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const GetInvoiceJpg = {
  metadata: {
    allOf: [
      {
        type: "object",
        properties: {
          id: {
            type: "string",
            $schema: "http://json-schema.org/draft-04/schema#",
            description:
              "Invoice internal id (e.g. `68b544f233f9e94dcfc24dd3`) or invoice number (e.g. `1234`; assigned when the PDF is first generated).",
          },
        },
        required: ["id"],
      },
    ],
  },
  response: {
    "200": { type: "string", format: "binary", $schema: "http://json-schema.org/draft-04/schema#" },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "404": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const GetInvoicePdf = {
  metadata: {
    allOf: [
      {
        type: "object",
        properties: {
          id: {
            type: "string",
            $schema: "http://json-schema.org/draft-04/schema#",
            description:
              "Invoice internal id (e.g. `68b544f233f9e94dcfc24dd3`) or invoice number (e.g. `1234`; assigned when the PDF is first generated).",
          },
        },
        required: ["id"],
      },
    ],
  },
  response: {
    "200": { type: "string", format: "binary", $schema: "http://json-schema.org/draft-04/schema#" },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "404": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const GetInvoices = {
  response: {
    "200": {
      type: "array",
      items: {
        type: "object",
        description:
          "Full sales invoice as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example).",
        properties: {
          id: {
            type: "string",
            description: "Internal id; usable immediately after creation",
            examples: ["69f2212bac38fd7df540535a"],
          },
          nr: {
            description:
              "Invoice number; assigned when the PDF is first generated. May be returned as a string or a number.",
            oneOf: [{ type: "string" }, { type: "integer" }],
            examples: ["200669"],
          },
          date: {
            type: "string",
            description: "Invoice date as a Unix timestamp in milliseconds (string)",
            examples: ["1782766800000"],
          },
          due: {
            type: "string",
            description: "Due date as a Unix timestamp in milliseconds (string)",
            examples: ["1783976400000"],
          },
          dateFormated: { type: "string", examples: ["2026-06-30"] },
          dueFormated: { type: "string", examples: ["2026-07-14"] },
          seller: {
            type: "object",
            description:
              "Seller (your company) block embedded in an invoice; also the shape returned by PUT /company",
            properties: {
              name: { type: "string", examples: ["CostPocket SIA"] },
              regCode: { type: "string", examples: ["40203537286"] },
              taxVAT: { type: "boolean", examples: [true] },
              VATNumber: { type: "string", examples: ["LV40203537286"] },
              address: { type: "string", examples: ["Eduarda Smiļģa iela 32 - 19"] },
              zip: { type: "string", examples: ["LV-1002"] },
              city: { type: "string", examples: ["Rīga"] },
              country: { type: "string", examples: ["Latvia"] },
              currency: { type: "string", examples: ["EUR"] },
              debit: { type: "string", description: "Default sales account", examples: ["3000"] },
              email: { type: "string", format: "email", examples: ["support@outvoicer.com"] },
              dueDays: { type: "integer", examples: [14] },
              lastInvoice: { type: "integer", examples: [200668] },
              prefix: {
                type: "string",
                description:
                  "Invoice number prefix; useful to avoid duplicate number clashes in the accounting software",
                examples: ["Outvoicer-"],
              },
              bankAccounts: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "integer", examples: [1] },
                    IBAN: { type: "string", examples: ["LV94HABA0551056496751"] },
                    bank: { type: "string", examples: ["SWEDBANK AS"] },
                    swift: { type: "string", examples: ["HABALV22"] },
                  },
                },
              },
            },
            additionalProperties: true,
          },
          buyer: {
            type: "object",
            description:
              "Full client object as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example), and some legacy fields may have mixed types.",
            required: ["id", "name"],
            properties: {
              id: { type: "string", examples: ["yescapital"] },
              name: { type: "string", examples: ["Yes Capital OY"] },
              regCode: { oneOf: [{ type: "string" }, { type: "number" }], examples: ["17527906"] },
              taxVAT: {
                description:
                  'Legacy data may contain boolean, string ("true"/"false") or number (0/1); semantically a boolean.',
                oneOf: [{ type: "boolean" }, { type: "string" }, { type: "integer" }],
                examples: [true],
              },
              VATNumber: {
                oneOf: [{ type: "string" }, { type: "integer" }, { type: "boolean" }],
                examples: ["EE101884549"],
              },
              address: { type: "string", examples: ["Roosikrantsi tn 11"] },
              city: { type: "string", examples: ["Tallinn"] },
              country: { type: "string", examples: ["Estonia"] },
              zip: { oneOf: [{ type: "string" }, { type: "integer" }], examples: ["10119"] },
              email: { type: "string", format: "email", examples: ["email@email.ee"] },
              refNumber: { type: "string", examples: ["599773"] },
              discount: {
                description: "Customer discount as a percentage; may be a number or numeric string",
                oneOf: [{ type: "number" }, { type: "string" }],
                examples: ["10"],
              },
              language: { type: "string", examples: ["ee"] },
              meritId: {
                type: "string",
                description: "Id of the client in the connected accounting software (e.g. Merit)",
              },
            },
            additionalProperties: true,
          },
          lines: {
            type: "array",
            items: {
              type: "object",
              description: "Invoice line as returned by the API",
              properties: {
                id: { type: "string", examples: ["sakuma-menesa-plans"] },
                product: { type: "string", examples: ["sakuma-menesa-plans"] },
                name: { type: "string", examples: ["Sākuma Mēneša plāns"] },
                VATRate: {
                  type: "number",
                  description: "Always a JSON number, e.g. 21 or 21.5",
                  examples: [21],
                },
                unitPrice: {
                  description:
                    'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                  oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                  examples: ["3.63"],
                },
                unit: { type: "string", examples: ["pc"] },
                amount: {
                  description:
                    'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                  oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                  examples: ["3.63"],
                },
                rounding: {
                  description:
                    'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                  oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                  examples: ["3.63"],
                },
                comment: { type: "string", examples: ["string"] },
                debit: { type: "string", description: "Sales revenue account", examples: ["3000"] },
                subtotal: {
                  description:
                    'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                  oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                  examples: ["3.63"],
                },
                VAT: {
                  description:
                    'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                  oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                  examples: ["3.63"],
                },
                total: {
                  description:
                    'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                  oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                  examples: ["3.63"],
                },
              },
              additionalProperties: true,
            },
          },
          currency: { type: "string", examples: ["EUR"] },
          subtotal: {
            description:
              'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
            oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
            examples: ["3.63"],
          },
          VAT: {
            description:
              'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
            oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
            examples: ["3.63"],
          },
          total: {
            description:
              'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
            oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
            examples: ["3.63"],
          },
          sent: { type: "boolean", examples: [true] },
          status: { type: "string", examples: ["sent"] },
        },
        additionalProperties: true,
      },
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const GetInvoicesByMonth = {
  metadata: {
    allOf: [
      {
        type: "object",
        properties: {
          year: {
            type: "integer",
            examples: [2026],
            $schema: "http://json-schema.org/draft-04/schema#",
          },
          month: {
            type: "integer",
            minimum: 1,
            maximum: 12,
            examples: [6],
            $schema: "http://json-schema.org/draft-04/schema#",
          },
        },
        required: ["year", "month"],
      },
    ],
  },
  response: {
    "200": {
      type: "array",
      items: {
        type: "object",
        description:
          "Full sales invoice as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example).",
        properties: {
          id: {
            type: "string",
            description: "Internal id; usable immediately after creation",
            examples: ["69f2212bac38fd7df540535a"],
          },
          nr: {
            description:
              "Invoice number; assigned when the PDF is first generated. May be returned as a string or a number.",
            oneOf: [{ type: "string" }, { type: "integer" }],
            examples: ["200669"],
          },
          date: {
            type: "string",
            description: "Invoice date as a Unix timestamp in milliseconds (string)",
            examples: ["1782766800000"],
          },
          due: {
            type: "string",
            description: "Due date as a Unix timestamp in milliseconds (string)",
            examples: ["1783976400000"],
          },
          dateFormated: { type: "string", examples: ["2026-06-30"] },
          dueFormated: { type: "string", examples: ["2026-07-14"] },
          seller: {
            type: "object",
            description:
              "Seller (your company) block embedded in an invoice; also the shape returned by PUT /company",
            properties: {
              name: { type: "string", examples: ["CostPocket SIA"] },
              regCode: { type: "string", examples: ["40203537286"] },
              taxVAT: { type: "boolean", examples: [true] },
              VATNumber: { type: "string", examples: ["LV40203537286"] },
              address: { type: "string", examples: ["Eduarda Smiļģa iela 32 - 19"] },
              zip: { type: "string", examples: ["LV-1002"] },
              city: { type: "string", examples: ["Rīga"] },
              country: { type: "string", examples: ["Latvia"] },
              currency: { type: "string", examples: ["EUR"] },
              debit: { type: "string", description: "Default sales account", examples: ["3000"] },
              email: { type: "string", format: "email", examples: ["support@outvoicer.com"] },
              dueDays: { type: "integer", examples: [14] },
              lastInvoice: { type: "integer", examples: [200668] },
              prefix: {
                type: "string",
                description:
                  "Invoice number prefix; useful to avoid duplicate number clashes in the accounting software",
                examples: ["Outvoicer-"],
              },
              bankAccounts: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "integer", examples: [1] },
                    IBAN: { type: "string", examples: ["LV94HABA0551056496751"] },
                    bank: { type: "string", examples: ["SWEDBANK AS"] },
                    swift: { type: "string", examples: ["HABALV22"] },
                  },
                },
              },
            },
            additionalProperties: true,
          },
          buyer: {
            type: "object",
            description:
              "Full client object as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example), and some legacy fields may have mixed types.",
            required: ["id", "name"],
            properties: {
              id: { type: "string", examples: ["yescapital"] },
              name: { type: "string", examples: ["Yes Capital OY"] },
              regCode: { oneOf: [{ type: "string" }, { type: "number" }], examples: ["17527906"] },
              taxVAT: {
                description:
                  'Legacy data may contain boolean, string ("true"/"false") or number (0/1); semantically a boolean.',
                oneOf: [{ type: "boolean" }, { type: "string" }, { type: "integer" }],
                examples: [true],
              },
              VATNumber: {
                oneOf: [{ type: "string" }, { type: "integer" }, { type: "boolean" }],
                examples: ["EE101884549"],
              },
              address: { type: "string", examples: ["Roosikrantsi tn 11"] },
              city: { type: "string", examples: ["Tallinn"] },
              country: { type: "string", examples: ["Estonia"] },
              zip: { oneOf: [{ type: "string" }, { type: "integer" }], examples: ["10119"] },
              email: { type: "string", format: "email", examples: ["email@email.ee"] },
              refNumber: { type: "string", examples: ["599773"] },
              discount: {
                description: "Customer discount as a percentage; may be a number or numeric string",
                oneOf: [{ type: "number" }, { type: "string" }],
                examples: ["10"],
              },
              language: { type: "string", examples: ["ee"] },
              meritId: {
                type: "string",
                description: "Id of the client in the connected accounting software (e.g. Merit)",
              },
            },
            additionalProperties: true,
          },
          lines: {
            type: "array",
            items: {
              type: "object",
              description: "Invoice line as returned by the API",
              properties: {
                id: { type: "string", examples: ["sakuma-menesa-plans"] },
                product: { type: "string", examples: ["sakuma-menesa-plans"] },
                name: { type: "string", examples: ["Sākuma Mēneša plāns"] },
                VATRate: {
                  type: "number",
                  description: "Always a JSON number, e.g. 21 or 21.5",
                  examples: [21],
                },
                unitPrice: {
                  description:
                    'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                  oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                  examples: ["3.63"],
                },
                unit: { type: "string", examples: ["pc"] },
                amount: {
                  description:
                    'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                  oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                  examples: ["3.63"],
                },
                rounding: {
                  description:
                    'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                  oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                  examples: ["3.63"],
                },
                comment: { type: "string", examples: ["string"] },
                debit: { type: "string", description: "Sales revenue account", examples: ["3000"] },
                subtotal: {
                  description:
                    'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                  oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                  examples: ["3.63"],
                },
                VAT: {
                  description:
                    'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                  oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                  examples: ["3.63"],
                },
                total: {
                  description:
                    'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                  oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                  examples: ["3.63"],
                },
              },
              additionalProperties: true,
            },
          },
          currency: { type: "string", examples: ["EUR"] },
          subtotal: {
            description:
              'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
            oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
            examples: ["3.63"],
          },
          VAT: {
            description:
              'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
            oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
            examples: ["3.63"],
          },
          total: {
            description:
              'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
            oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
            examples: ["3.63"],
          },
          sent: { type: "boolean", examples: [true] },
          status: { type: "string", examples: ["sent"] },
        },
        additionalProperties: true,
      },
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const GetProduct = {
  metadata: {
    allOf: [
      {
        type: "object",
        properties: {
          productId: {
            type: "string",
            $schema: "http://json-schema.org/draft-04/schema#",
            description: "Product id, e.g. `hammer`",
          },
        },
        required: ["productId"],
      },
    ],
  },
  response: {
    "200": {
      type: "object",
      description:
        "Full product object as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example).",
      required: ["id", "name"],
      properties: {
        id: { type: "string", examples: ["hammer"] },
        name: { type: "string", examples: ["Hammer"] },
        unit: { type: "string", examples: ["pc"] },
        unitPrice: {
          description:
            'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
          oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
          examples: ["3.63"],
        },
        debit: {
          type: "string",
          description: "Sales revenue account in accounting for this product",
          examples: ["3015"],
        },
        VATRate: {
          type: "number",
          description:
            "Always a JSON number, e.g. 21 or 21.5. Overwrites the default VAT rate for this product.",
          examples: [21.5],
        },
      },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "404": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const GetProducts = {
  response: {
    "200": {
      type: "array",
      items: {
        type: "object",
        description:
          "Full product object as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example).",
        required: ["id", "name"],
        properties: {
          id: { type: "string", examples: ["hammer"] },
          name: { type: "string", examples: ["Hammer"] },
          unit: { type: "string", examples: ["pc"] },
          unitPrice: {
            description:
              'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
            oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
            examples: ["3.63"],
          },
          debit: {
            type: "string",
            description: "Sales revenue account in accounting for this product",
            examples: ["3015"],
          },
          VATRate: {
            type: "number",
            description:
              "Always a JSON number, e.g. 21 or 21.5. Overwrites the default VAT rate for this product.",
            examples: [21.5],
          },
        },
        additionalProperties: true,
      },
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const ImportClientsFromIntegration = {
  response: {
    "200": {
      type: "array",
      items: {
        type: "object",
        description:
          "Full client object as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example), and some legacy fields may have mixed types.",
        required: ["id", "name"],
        properties: {
          id: { type: "string", examples: ["yescapital"] },
          name: { type: "string", examples: ["Yes Capital OY"] },
          regCode: { oneOf: [{ type: "string" }, { type: "number" }], examples: ["17527906"] },
          taxVAT: {
            description:
              'Legacy data may contain boolean, string ("true"/"false") or number (0/1); semantically a boolean.',
            oneOf: [{ type: "boolean" }, { type: "string" }, { type: "integer" }],
            examples: [true],
          },
          VATNumber: {
            oneOf: [{ type: "string" }, { type: "integer" }, { type: "boolean" }],
            examples: ["EE101884549"],
          },
          address: { type: "string", examples: ["Roosikrantsi tn 11"] },
          city: { type: "string", examples: ["Tallinn"] },
          country: { type: "string", examples: ["Estonia"] },
          zip: { oneOf: [{ type: "string" }, { type: "integer" }], examples: ["10119"] },
          email: { type: "string", format: "email", examples: ["email@email.ee"] },
          refNumber: { type: "string", examples: ["599773"] },
          discount: {
            description: "Customer discount as a percentage; may be a number or numeric string",
            oneOf: [{ type: "number" }, { type: "string" }],
            examples: ["10"],
          },
          language: { type: "string", examples: ["ee"] },
          meritId: {
            type: "string",
            description: "Id of the client in the connected accounting software (e.g. Merit)",
          },
        },
        additionalProperties: true,
      },
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "501": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const ImportProductsFromIntegration = {
  response: {
    "200": {
      type: "array",
      items: {
        type: "object",
        description:
          "Full product object as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example).",
        required: ["id", "name"],
        properties: {
          id: { type: "string", examples: ["hammer"] },
          name: { type: "string", examples: ["Hammer"] },
          unit: { type: "string", examples: ["pc"] },
          unitPrice: {
            description:
              'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
            oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
            examples: ["3.63"],
          },
          debit: {
            type: "string",
            description: "Sales revenue account in accounting for this product",
            examples: ["3015"],
          },
          VATRate: {
            type: "number",
            description:
              "Always a JSON number, e.g. 21 or 21.5. Overwrites the default VAT rate for this product.",
            examples: [21.5],
          },
        },
        additionalProperties: true,
      },
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "501": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const PostForwardAndOverwriteClient = {
  body: {
    type: "object",
    description:
      "Client payload for POST /client, PUT /client/{clientId}, POST /client/post-or-overwrite and POST /client/post-forward-and-overwrite",
    required: ["id", "name"],
    properties: {
      id: { type: "string", examples: ["yescapital"] },
      name: { type: "string", examples: ["Yes Capital OY"] },
      regCode: { oneOf: [{ type: "string" }, { type: "number" }], examples: ["12710066"] },
      address: { type: "string", examples: ["Virulainen 4"] },
      zip: { oneOf: [{ type: "string" }, { type: "integer" }], examples: ["10140"] },
      city: { type: "string", examples: ["Helsinki"] },
      email: {
        type: "string",
        format: "email",
        description: "E-mail where the invoice is sent to; must validate",
        examples: ["billing@yescapital.co"],
      },
      country: {
        type: "string",
        description: "Must be a real country name for VAT to validate",
        examples: ["Finland"],
      },
      taxVAT: { type: "boolean", examples: [true] },
      VATNumber: { type: "string", examples: ["FI12345679"] },
      refNumber: { type: "string", examples: ["130239"] },
      discount: {
        description: "Customer discount as a percentage; number or numeric string",
        oneOf: [{ type: "number" }, { type: "string" }],
        examples: ["10"],
      },
      language: {
        type: "string",
        description: "Language the customer receives invoices in (e.g. `lv`, `et`, `fi`, `en`)",
        examples: ["lv"],
      },
    },
    additionalProperties: true,
    $schema: "http://json-schema.org/draft-04/schema#",
  },
  response: {
    "200": {
      type: "object",
      description:
        "Full client object as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example), and some legacy fields may have mixed types.",
      required: ["id", "name"],
      properties: {
        id: { type: "string", examples: ["yescapital"] },
        name: { type: "string", examples: ["Yes Capital OY"] },
        regCode: { oneOf: [{ type: "string" }, { type: "number" }], examples: ["17527906"] },
        taxVAT: {
          description:
            'Legacy data may contain boolean, string ("true"/"false") or number (0/1); semantically a boolean.',
          oneOf: [{ type: "boolean" }, { type: "string" }, { type: "integer" }],
          examples: [true],
        },
        VATNumber: {
          oneOf: [{ type: "string" }, { type: "integer" }, { type: "boolean" }],
          examples: ["EE101884549"],
        },
        address: { type: "string", examples: ["Roosikrantsi tn 11"] },
        city: { type: "string", examples: ["Tallinn"] },
        country: { type: "string", examples: ["Estonia"] },
        zip: { oneOf: [{ type: "string" }, { type: "integer" }], examples: ["10119"] },
        email: { type: "string", format: "email", examples: ["email@email.ee"] },
        refNumber: { type: "string", examples: ["599773"] },
        discount: {
          description: "Customer discount as a percentage; may be a number or numeric string",
          oneOf: [{ type: "number" }, { type: "string" }],
          examples: ["10"],
        },
        language: { type: "string", examples: ["ee"] },
        meritId: {
          type: "string",
          description: "Id of the client in the connected accounting software (e.g. Merit)",
        },
      },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "400": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const PostOrOverwriteClient = {
  body: {
    type: "object",
    description:
      "Client payload for POST /client, PUT /client/{clientId}, POST /client/post-or-overwrite and POST /client/post-forward-and-overwrite",
    required: ["id", "name"],
    properties: {
      id: { type: "string", examples: ["yescapital"] },
      name: { type: "string", examples: ["Yes Capital OY"] },
      regCode: { oneOf: [{ type: "string" }, { type: "number" }], examples: ["12710066"] },
      address: { type: "string", examples: ["Virulainen 4"] },
      zip: { oneOf: [{ type: "string" }, { type: "integer" }], examples: ["10140"] },
      city: { type: "string", examples: ["Helsinki"] },
      email: {
        type: "string",
        format: "email",
        description: "E-mail where the invoice is sent to; must validate",
        examples: ["billing@yescapital.co"],
      },
      country: {
        type: "string",
        description: "Must be a real country name for VAT to validate",
        examples: ["Finland"],
      },
      taxVAT: { type: "boolean", examples: [true] },
      VATNumber: { type: "string", examples: ["FI12345679"] },
      refNumber: { type: "string", examples: ["130239"] },
      discount: {
        description: "Customer discount as a percentage; number or numeric string",
        oneOf: [{ type: "number" }, { type: "string" }],
        examples: ["10"],
      },
      language: {
        type: "string",
        description: "Language the customer receives invoices in (e.g. `lv`, `et`, `fi`, `en`)",
        examples: ["lv"],
      },
    },
    additionalProperties: true,
    $schema: "http://json-schema.org/draft-04/schema#",
  },
  response: {
    "200": {
      type: "object",
      description:
        "Full client object as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example), and some legacy fields may have mixed types.",
      required: ["id", "name"],
      properties: {
        id: { type: "string", examples: ["yescapital"] },
        name: { type: "string", examples: ["Yes Capital OY"] },
        regCode: { oneOf: [{ type: "string" }, { type: "number" }], examples: ["17527906"] },
        taxVAT: {
          description:
            'Legacy data may contain boolean, string ("true"/"false") or number (0/1); semantically a boolean.',
          oneOf: [{ type: "boolean" }, { type: "string" }, { type: "integer" }],
          examples: [true],
        },
        VATNumber: {
          oneOf: [{ type: "string" }, { type: "integer" }, { type: "boolean" }],
          examples: ["EE101884549"],
        },
        address: { type: "string", examples: ["Roosikrantsi tn 11"] },
        city: { type: "string", examples: ["Tallinn"] },
        country: { type: "string", examples: ["Estonia"] },
        zip: { oneOf: [{ type: "string" }, { type: "integer" }], examples: ["10119"] },
        email: { type: "string", format: "email", examples: ["email@email.ee"] },
        refNumber: { type: "string", examples: ["599773"] },
        discount: {
          description: "Customer discount as a percentage; may be a number or numeric string",
          oneOf: [{ type: "number" }, { type: "string" }],
          examples: ["10"],
        },
        language: { type: "string", examples: ["ee"] },
        meritId: {
          type: "string",
          description: "Id of the client in the connected accounting software (e.g. Merit)",
        },
      },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "400": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const PrintInvoice = {
  body: {
    type: "object",
    additionalProperties: false,
    $schema: "http://json-schema.org/draft-04/schema#",
  },
  metadata: {
    allOf: [
      {
        type: "object",
        properties: {
          id: {
            type: "string",
            $schema: "http://json-schema.org/draft-04/schema#",
            description:
              "Invoice internal id (e.g. `68b544f233f9e94dcfc24dd3`) or invoice number (e.g. `1234`; assigned when the PDF is first generated).",
          },
        },
        required: ["id"],
      },
    ],
  },
  response: {
    "200": {
      type: "object",
      description:
        "Full sales invoice as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example).",
      properties: {
        id: {
          type: "string",
          description: "Internal id; usable immediately after creation",
          examples: ["69f2212bac38fd7df540535a"],
        },
        nr: {
          description:
            "Invoice number; assigned when the PDF is first generated. May be returned as a string or a number.",
          oneOf: [{ type: "string" }, { type: "integer" }],
          examples: ["200669"],
        },
        date: {
          type: "string",
          description: "Invoice date as a Unix timestamp in milliseconds (string)",
          examples: ["1782766800000"],
        },
        due: {
          type: "string",
          description: "Due date as a Unix timestamp in milliseconds (string)",
          examples: ["1783976400000"],
        },
        dateFormated: { type: "string", examples: ["2026-06-30"] },
        dueFormated: { type: "string", examples: ["2026-07-14"] },
        seller: {
          type: "object",
          description:
            "Seller (your company) block embedded in an invoice; also the shape returned by PUT /company",
          properties: {
            name: { type: "string", examples: ["CostPocket SIA"] },
            regCode: { type: "string", examples: ["40203537286"] },
            taxVAT: { type: "boolean", examples: [true] },
            VATNumber: { type: "string", examples: ["LV40203537286"] },
            address: { type: "string", examples: ["Eduarda Smiļģa iela 32 - 19"] },
            zip: { type: "string", examples: ["LV-1002"] },
            city: { type: "string", examples: ["Rīga"] },
            country: { type: "string", examples: ["Latvia"] },
            currency: { type: "string", examples: ["EUR"] },
            debit: { type: "string", description: "Default sales account", examples: ["3000"] },
            email: { type: "string", format: "email", examples: ["support@outvoicer.com"] },
            dueDays: { type: "integer", examples: [14] },
            lastInvoice: { type: "integer", examples: [200668] },
            prefix: {
              type: "string",
              description:
                "Invoice number prefix; useful to avoid duplicate number clashes in the accounting software",
              examples: ["Outvoicer-"],
            },
            bankAccounts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer", examples: [1] },
                  IBAN: { type: "string", examples: ["LV94HABA0551056496751"] },
                  bank: { type: "string", examples: ["SWEDBANK AS"] },
                  swift: { type: "string", examples: ["HABALV22"] },
                },
              },
            },
          },
          additionalProperties: true,
        },
        buyer: {
          type: "object",
          description:
            "Full client object as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example), and some legacy fields may have mixed types.",
          required: ["id", "name"],
          properties: {
            id: { type: "string", examples: ["yescapital"] },
            name: { type: "string", examples: ["Yes Capital OY"] },
            regCode: { oneOf: [{ type: "string" }, { type: "number" }], examples: ["17527906"] },
            taxVAT: {
              description:
                'Legacy data may contain boolean, string ("true"/"false") or number (0/1); semantically a boolean.',
              oneOf: [{ type: "boolean" }, { type: "string" }, { type: "integer" }],
              examples: [true],
            },
            VATNumber: {
              oneOf: [{ type: "string" }, { type: "integer" }, { type: "boolean" }],
              examples: ["EE101884549"],
            },
            address: { type: "string", examples: ["Roosikrantsi tn 11"] },
            city: { type: "string", examples: ["Tallinn"] },
            country: { type: "string", examples: ["Estonia"] },
            zip: { oneOf: [{ type: "string" }, { type: "integer" }], examples: ["10119"] },
            email: { type: "string", format: "email", examples: ["email@email.ee"] },
            refNumber: { type: "string", examples: ["599773"] },
            discount: {
              description: "Customer discount as a percentage; may be a number or numeric string",
              oneOf: [{ type: "number" }, { type: "string" }],
              examples: ["10"],
            },
            language: { type: "string", examples: ["ee"] },
            meritId: {
              type: "string",
              description: "Id of the client in the connected accounting software (e.g. Merit)",
            },
          },
          additionalProperties: true,
        },
        lines: {
          type: "array",
          items: {
            type: "object",
            description: "Invoice line as returned by the API",
            properties: {
              id: { type: "string", examples: ["sakuma-menesa-plans"] },
              product: { type: "string", examples: ["sakuma-menesa-plans"] },
              name: { type: "string", examples: ["Sākuma Mēneša plāns"] },
              VATRate: {
                type: "number",
                description: "Always a JSON number, e.g. 21 or 21.5",
                examples: [21],
              },
              unitPrice: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              unit: { type: "string", examples: ["pc"] },
              amount: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              rounding: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              comment: { type: "string", examples: ["string"] },
              debit: { type: "string", description: "Sales revenue account", examples: ["3000"] },
              subtotal: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              VAT: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              total: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
            },
            additionalProperties: true,
          },
        },
        currency: { type: "string", examples: ["EUR"] },
        subtotal: {
          description:
            'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
          oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
          examples: ["3.63"],
        },
        VAT: {
          description:
            'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
          oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
          examples: ["3.63"],
        },
        total: {
          description:
            'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
          oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
          examples: ["3.63"],
        },
        sent: { type: "boolean", examples: [true] },
        status: { type: "string", examples: ["sent"] },
      },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "404": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const SearchClients = {
  metadata: {
    allOf: [
      {
        type: "object",
        properties: {
          name: {
            type: "string",
            $schema: "http://json-schema.org/draft-04/schema#",
            description: "Name (or part of a name) to search for",
          },
        },
        required: ["name"],
      },
    ],
  },
  response: {
    "200": {
      type: "array",
      items: {
        type: "object",
        description:
          "Full client object as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example), and some legacy fields may have mixed types.",
        required: ["id", "name"],
        properties: {
          id: { type: "string", examples: ["yescapital"] },
          name: { type: "string", examples: ["Yes Capital OY"] },
          regCode: { oneOf: [{ type: "string" }, { type: "number" }], examples: ["17527906"] },
          taxVAT: {
            description:
              'Legacy data may contain boolean, string ("true"/"false") or number (0/1); semantically a boolean.',
            oneOf: [{ type: "boolean" }, { type: "string" }, { type: "integer" }],
            examples: [true],
          },
          VATNumber: {
            oneOf: [{ type: "string" }, { type: "integer" }, { type: "boolean" }],
            examples: ["EE101884549"],
          },
          address: { type: "string", examples: ["Roosikrantsi tn 11"] },
          city: { type: "string", examples: ["Tallinn"] },
          country: { type: "string", examples: ["Estonia"] },
          zip: { oneOf: [{ type: "string" }, { type: "integer" }], examples: ["10119"] },
          email: { type: "string", format: "email", examples: ["email@email.ee"] },
          refNumber: { type: "string", examples: ["599773"] },
          discount: {
            description: "Customer discount as a percentage; may be a number or numeric string",
            oneOf: [{ type: "number" }, { type: "string" }],
            examples: ["10"],
          },
          language: { type: "string", examples: ["ee"] },
          meritId: {
            type: "string",
            description: "Id of the client in the connected accounting software (e.g. Merit)",
          },
        },
        additionalProperties: true,
      },
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const SendInvoice = {
  body: {
    type: "object",
    additionalProperties: false,
    $schema: "http://json-schema.org/draft-04/schema#",
  },
  metadata: {
    allOf: [
      {
        type: "object",
        properties: {
          id: {
            type: "string",
            $schema: "http://json-schema.org/draft-04/schema#",
            description:
              "Invoice internal id (e.g. `68b544f233f9e94dcfc24dd3`) or invoice number (e.g. `1234`; assigned when the PDF is first generated).",
          },
        },
        required: ["id"],
      },
    ],
  },
  response: {
    "200": {
      type: "object",
      description:
        "Full sales invoice as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example).",
      properties: {
        id: {
          type: "string",
          description: "Internal id; usable immediately after creation",
          examples: ["69f2212bac38fd7df540535a"],
        },
        nr: {
          description:
            "Invoice number; assigned when the PDF is first generated. May be returned as a string or a number.",
          oneOf: [{ type: "string" }, { type: "integer" }],
          examples: ["200669"],
        },
        date: {
          type: "string",
          description: "Invoice date as a Unix timestamp in milliseconds (string)",
          examples: ["1782766800000"],
        },
        due: {
          type: "string",
          description: "Due date as a Unix timestamp in milliseconds (string)",
          examples: ["1783976400000"],
        },
        dateFormated: { type: "string", examples: ["2026-06-30"] },
        dueFormated: { type: "string", examples: ["2026-07-14"] },
        seller: {
          type: "object",
          description:
            "Seller (your company) block embedded in an invoice; also the shape returned by PUT /company",
          properties: {
            name: { type: "string", examples: ["CostPocket SIA"] },
            regCode: { type: "string", examples: ["40203537286"] },
            taxVAT: { type: "boolean", examples: [true] },
            VATNumber: { type: "string", examples: ["LV40203537286"] },
            address: { type: "string", examples: ["Eduarda Smiļģa iela 32 - 19"] },
            zip: { type: "string", examples: ["LV-1002"] },
            city: { type: "string", examples: ["Rīga"] },
            country: { type: "string", examples: ["Latvia"] },
            currency: { type: "string", examples: ["EUR"] },
            debit: { type: "string", description: "Default sales account", examples: ["3000"] },
            email: { type: "string", format: "email", examples: ["support@outvoicer.com"] },
            dueDays: { type: "integer", examples: [14] },
            lastInvoice: { type: "integer", examples: [200668] },
            prefix: {
              type: "string",
              description:
                "Invoice number prefix; useful to avoid duplicate number clashes in the accounting software",
              examples: ["Outvoicer-"],
            },
            bankAccounts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "integer", examples: [1] },
                  IBAN: { type: "string", examples: ["LV94HABA0551056496751"] },
                  bank: { type: "string", examples: ["SWEDBANK AS"] },
                  swift: { type: "string", examples: ["HABALV22"] },
                },
              },
            },
          },
          additionalProperties: true,
        },
        buyer: {
          type: "object",
          description:
            "Full client object as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example), and some legacy fields may have mixed types.",
          required: ["id", "name"],
          properties: {
            id: { type: "string", examples: ["yescapital"] },
            name: { type: "string", examples: ["Yes Capital OY"] },
            regCode: { oneOf: [{ type: "string" }, { type: "number" }], examples: ["17527906"] },
            taxVAT: {
              description:
                'Legacy data may contain boolean, string ("true"/"false") or number (0/1); semantically a boolean.',
              oneOf: [{ type: "boolean" }, { type: "string" }, { type: "integer" }],
              examples: [true],
            },
            VATNumber: {
              oneOf: [{ type: "string" }, { type: "integer" }, { type: "boolean" }],
              examples: ["EE101884549"],
            },
            address: { type: "string", examples: ["Roosikrantsi tn 11"] },
            city: { type: "string", examples: ["Tallinn"] },
            country: { type: "string", examples: ["Estonia"] },
            zip: { oneOf: [{ type: "string" }, { type: "integer" }], examples: ["10119"] },
            email: { type: "string", format: "email", examples: ["email@email.ee"] },
            refNumber: { type: "string", examples: ["599773"] },
            discount: {
              description: "Customer discount as a percentage; may be a number or numeric string",
              oneOf: [{ type: "number" }, { type: "string" }],
              examples: ["10"],
            },
            language: { type: "string", examples: ["ee"] },
            meritId: {
              type: "string",
              description: "Id of the client in the connected accounting software (e.g. Merit)",
            },
          },
          additionalProperties: true,
        },
        lines: {
          type: "array",
          items: {
            type: "object",
            description: "Invoice line as returned by the API",
            properties: {
              id: { type: "string", examples: ["sakuma-menesa-plans"] },
              product: { type: "string", examples: ["sakuma-menesa-plans"] },
              name: { type: "string", examples: ["Sākuma Mēneša plāns"] },
              VATRate: {
                type: "number",
                description: "Always a JSON number, e.g. 21 or 21.5",
                examples: [21],
              },
              unitPrice: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              unit: { type: "string", examples: ["pc"] },
              amount: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              rounding: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              comment: { type: "string", examples: ["string"] },
              debit: { type: "string", description: "Sales revenue account", examples: ["3000"] },
              subtotal: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              VAT: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
              total: {
                description:
                  'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
                oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
                examples: ["3.63"],
              },
            },
            additionalProperties: true,
          },
        },
        currency: { type: "string", examples: ["EUR"] },
        subtotal: {
          description:
            'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
          oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
          examples: ["3.63"],
        },
        VAT: {
          description:
            'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
          oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
          examples: ["3.63"],
        },
        total: {
          description:
            'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
          oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
          examples: ["3.63"],
        },
        sent: { type: "boolean", examples: [true] },
        status: { type: "string", examples: ["sent"] },
      },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "404": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "409": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const TestToken = {
  response: {
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const UpdateClient = {
  body: {
    type: "object",
    description:
      "Client payload for POST /client, PUT /client/{clientId}, POST /client/post-or-overwrite and POST /client/post-forward-and-overwrite",
    required: ["id", "name"],
    properties: {
      id: { type: "string", examples: ["yescapital"] },
      name: { type: "string", examples: ["Yes Capital OY"] },
      regCode: { oneOf: [{ type: "string" }, { type: "number" }], examples: ["12710066"] },
      address: { type: "string", examples: ["Virulainen 4"] },
      zip: { oneOf: [{ type: "string" }, { type: "integer" }], examples: ["10140"] },
      city: { type: "string", examples: ["Helsinki"] },
      email: {
        type: "string",
        format: "email",
        description: "E-mail where the invoice is sent to; must validate",
        examples: ["billing@yescapital.co"],
      },
      country: {
        type: "string",
        description: "Must be a real country name for VAT to validate",
        examples: ["Finland"],
      },
      taxVAT: { type: "boolean", examples: [true] },
      VATNumber: { type: "string", examples: ["FI12345679"] },
      refNumber: { type: "string", examples: ["130239"] },
      discount: {
        description: "Customer discount as a percentage; number or numeric string",
        oneOf: [{ type: "number" }, { type: "string" }],
        examples: ["10"],
      },
      language: {
        type: "string",
        description: "Language the customer receives invoices in (e.g. `lv`, `et`, `fi`, `en`)",
        examples: ["lv"],
      },
    },
    additionalProperties: true,
    $schema: "http://json-schema.org/draft-04/schema#",
  },
  metadata: {
    allOf: [
      {
        type: "object",
        properties: {
          clientId: {
            type: "string",
            $schema: "http://json-schema.org/draft-04/schema#",
            description: "Client id, e.g. `yescapital`",
          },
        },
        required: ["clientId"],
      },
    ],
  },
  response: {
    "200": {
      type: "object",
      description:
        "Full client object as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example), and some legacy fields may have mixed types.",
      required: ["id", "name"],
      properties: {
        id: { type: "string", examples: ["yescapital"] },
        name: { type: "string", examples: ["Yes Capital OY"] },
        regCode: { oneOf: [{ type: "string" }, { type: "number" }], examples: ["17527906"] },
        taxVAT: {
          description:
            'Legacy data may contain boolean, string ("true"/"false") or number (0/1); semantically a boolean.',
          oneOf: [{ type: "boolean" }, { type: "string" }, { type: "integer" }],
          examples: [true],
        },
        VATNumber: {
          oneOf: [{ type: "string" }, { type: "integer" }, { type: "boolean" }],
          examples: ["EE101884549"],
        },
        address: { type: "string", examples: ["Roosikrantsi tn 11"] },
        city: { type: "string", examples: ["Tallinn"] },
        country: { type: "string", examples: ["Estonia"] },
        zip: { oneOf: [{ type: "string" }, { type: "integer" }], examples: ["10119"] },
        email: { type: "string", format: "email", examples: ["email@email.ee"] },
        refNumber: { type: "string", examples: ["599773"] },
        discount: {
          description: "Customer discount as a percentage; may be a number or numeric string",
          oneOf: [{ type: "number" }, { type: "string" }],
          examples: ["10"],
        },
        language: { type: "string", examples: ["ee"] },
        meritId: {
          type: "string",
          description: "Id of the client in the connected accounting software (e.g. Merit)",
        },
      },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "400": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "404": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const UpdateClientChannel = {
  metadata: {
    allOf: [
      {
        type: "object",
        properties: {
          clientId: {
            type: "string",
            $schema: "http://json-schema.org/draft-04/schema#",
            description: "Client id, e.g. `yescapital`",
          },
        },
        required: ["clientId"],
      },
    ],
  },
  response: {
    "200": {
      type: "object",
      description: "Client's current invoice delivery channel / e-invoice eligibility",
      properties: {
        email: { type: "string", format: "email" },
        delivery: {
          type: "string",
          description:
            "How the invoice is delivered to the client. Unknown values default to Email.\n\n`Email` `Einvoice` `EinvoiceBank`",
          enum: ["Email", "Einvoice", "EinvoiceBank"],
        },
        finvoice: {
          type: "object",
          description: "Finnish e-invoice (Finvoice) address of the client",
          properties: {
            address: { type: "string" },
            service_identifier: { type: "string" },
            type: { type: "string" },
          },
          required: ["address", "service_identifier"],
        },
      },
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "404": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const UpdateCompany = {
  body: {
    type: "object",
    description:
      'Seller company settings. All fields are optional — send only the ones you want to set/update (e.g. just { "prefix": "api" }). The data store is NoSQL, so extra fields are allowed.',
    properties: {
      name: { type: "string", examples: ["CostPocket SIA"] },
      regCode: { type: "string", examples: ["40203537286"] },
      taxVAT: { type: "boolean", examples: [true] },
      VATNumber: { type: "string", examples: ["LV40203537286"] },
      address: { type: "string", examples: ["Eduarda Smiļģa iela 32 - 19"] },
      zip: { type: "string", examples: ["LV-1002"] },
      city: { type: "string", examples: ["Rīga"] },
      country: { type: "string", examples: ["Latvia"] },
      currency: { type: "string", examples: ["EUR"] },
      debit: { type: "string", description: "Default sales revenue account", examples: ["3000"] },
      email: { type: "string", format: "email", examples: ["support@outvoicer.com"] },
      dueDays: { type: "integer", examples: [14] },
      prefix: {
        type: "string",
        description:
          "Invoice number prefix; useful to avoid duplicate invoice numbers in the accounting software",
        examples: ["api"],
      },
      bankAccounts: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "integer", examples: [1] },
            IBAN: { type: "string", examples: ["LV94HABA0551056496751"] },
            bank: { type: "string", examples: ["SWEDBANK AS"] },
            swift: { type: "string", examples: ["HABALV22"] },
          },
        },
      },
    },
    additionalProperties: true,
    $schema: "http://json-schema.org/draft-04/schema#",
  },
  response: {
    "200": {
      type: "object",
      description:
        "Seller (your company) block embedded in an invoice; also the shape returned by PUT /company",
      properties: {
        name: { type: "string", examples: ["CostPocket SIA"] },
        regCode: { type: "string", examples: ["40203537286"] },
        taxVAT: { type: "boolean", examples: [true] },
        VATNumber: { type: "string", examples: ["LV40203537286"] },
        address: { type: "string", examples: ["Eduarda Smiļģa iela 32 - 19"] },
        zip: { type: "string", examples: ["LV-1002"] },
        city: { type: "string", examples: ["Rīga"] },
        country: { type: "string", examples: ["Latvia"] },
        currency: { type: "string", examples: ["EUR"] },
        debit: { type: "string", description: "Default sales account", examples: ["3000"] },
        email: { type: "string", format: "email", examples: ["support@outvoicer.com"] },
        dueDays: { type: "integer", examples: [14] },
        lastInvoice: { type: "integer", examples: [200668] },
        prefix: {
          type: "string",
          description:
            "Invoice number prefix; useful to avoid duplicate number clashes in the accounting software",
          examples: ["Outvoicer-"],
        },
        bankAccounts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "integer", examples: [1] },
              IBAN: { type: "string", examples: ["LV94HABA0551056496751"] },
              bank: { type: "string", examples: ["SWEDBANK AS"] },
              swift: { type: "string", examples: ["HABALV22"] },
            },
          },
        },
      },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "400": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const UpdateProduct = {
  body: {
    type: "object",
    description: "Product payload for POST /product and PUT /product/{productId}",
    required: ["id", "name", "unitPrice"],
    properties: {
      id: { type: "string", examples: ["hammer"] },
      name: { type: "string", examples: ["Hammer"] },
      unit: { type: "string", examples: ["pc"] },
      unitPrice: {
        description:
          'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
        oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
        examples: ["3.63"],
      },
      debit: {
        type: "string",
        description: "Sales revenue account in accounting for this product",
        examples: ["3015"],
      },
      VATRate: {
        type: "number",
        description:
          "Always a JSON number, e.g. 21 or 21.5. Overwrites the default VAT rate for this product.",
        examples: [21.5],
      },
    },
    additionalProperties: true,
    $schema: "http://json-schema.org/draft-04/schema#",
  },
  metadata: {
    allOf: [
      {
        type: "object",
        properties: {
          productId: {
            type: "string",
            $schema: "http://json-schema.org/draft-04/schema#",
            description: "Product id, e.g. `hammer`",
          },
        },
        required: ["productId"],
      },
    ],
  },
  response: {
    "200": {
      type: "object",
      description:
        "Full product object as returned by the API. The data store is NoSQL, so extra fields may be present (see `additionalProperty` in the example).",
      required: ["id", "name"],
      properties: {
        id: { type: "string", examples: ["hammer"] },
        name: { type: "string", examples: ["Hammer"] },
        unit: { type: "string", examples: ["pc"] },
        unitPrice: {
          description:
            'Numeric value that may arrive as a JSON number or as a numeric string, e.g. 3, 3.63, "3.63" or 13.21488. The most normalised form is "3.00", but several workflows (including import-only flows that don\'t recalculate) are supported.',
          oneOf: [{ type: "number" }, { type: "string", pattern: "^-?\\d+(\\.\\d+)?$" }],
          examples: ["3.63"],
        },
        debit: {
          type: "string",
          description: "Sales revenue account in accounting for this product",
          examples: ["3015"],
        },
        VATRate: {
          type: "number",
          description:
            "Always a JSON number, e.g. 21 or 21.5. Overwrites the default VAT rate for this product.",
          examples: [21.5],
        },
      },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "400": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "404": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const ValidateClientVat = {
  metadata: {
    allOf: [
      {
        type: "object",
        properties: {
          clientId: {
            type: "string",
            $schema: "http://json-schema.org/draft-04/schema#",
            description: "Client id, e.g. `yescapital`",
          },
        },
        required: ["clientId"],
      },
    ],
  },
  response: {
    "200": {
      type: "object",
      description: "Result of validating a VAT number against the EU VIES service",
      properties: {
        valid: {
          type: "boolean",
          description: "Whether the VAT number is valid in VIES",
          examples: [true],
        },
        countryCode: { type: "string", examples: ["EE"] },
        vatNumber: { type: "string", examples: ["101884549"] },
        name: {
          type: "string",
          description: "Registered company name returned by VIES",
          examples: ["Yes Capital OY"],
        },
        address: {
          type: "string",
          description: "Registered address returned by VIES",
          examples: ["Roosikrantsi tn 11, Tallinn"],
        },
      },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "404": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const ViewBearerToken = {
  response: {
    "200": {
      type: "object",
      properties: {
        token: {
          type: "string",
          description: "The Bearer token to use in the Authorization header",
        },
      },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const ViewClientInIntegration = {
  metadata: {
    allOf: [
      {
        type: "object",
        properties: {
          clientId: {
            type: "string",
            $schema: "http://json-schema.org/draft-04/schema#",
            description: "Client id, e.g. `yescapital`",
          },
        },
        required: ["clientId"],
      },
    ],
  },
  response: {
    "200": {
      type: "object",
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "404": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "501": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const ViewClientsInIntegration = {
  response: {
    "200": {
      type: "array",
      items: { type: "object", additionalProperties: true },
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "501": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const ViewInvoiceInIntegration = {
  metadata: {
    allOf: [
      {
        type: "object",
        properties: {
          id: {
            type: "string",
            $schema: "http://json-schema.org/draft-04/schema#",
            description:
              "Invoice internal id (e.g. `68b544f233f9e94dcfc24dd3`) or invoice number (e.g. `1234`; assigned when the PDF is first generated).",
          },
        },
        required: ["id"],
      },
    ],
  },
  response: {
    "200": {
      type: "object",
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "404": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "501": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const ViewInvoicesInIntegration = {
  response: {
    "200": {
      type: "array",
      items: { type: "object", additionalProperties: true },
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "501": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const ViewProductInIntegration = {
  metadata: {
    allOf: [
      {
        type: "object",
        properties: {
          productId: {
            type: "string",
            $schema: "http://json-schema.org/draft-04/schema#",
            description: "Product id, e.g. `hammer`",
          },
        },
        required: ["productId"],
      },
    ],
  },
  response: {
    "200": {
      type: "object",
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "404": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "501": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
const ViewProductsInIntegration = {
  response: {
    "200": {
      type: "array",
      items: { type: "object", additionalProperties: true },
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "401": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
    "501": {
      type: "object",
      properties: { error: { type: "string" }, message: { type: "string" } },
      additionalProperties: true,
      $schema: "http://json-schema.org/draft-04/schema#",
    },
  },
} as const
export {
  CreateAndPrintInvoice,
  CreateAndSendInvoice,
  CreateClient,
  CreateCompany,
  CreateInvoice,
  CreateProduct,
  CreateSendAndForwardInvoice,
  DeleteBearerToken,
  DeleteClient,
  DeleteClientFromIntegration,
  DeleteClientKey,
  DeleteInvoiceFromIntegration,
  DeleteProduct,
  DeleteProductFromIntegration,
  EinvoiceInvoice,
  EmailInvoice,
  ForwardClient,
  ForwardInvoice,
  ForwardProduct,
  GenerateBearerToken,
  GetClient,
  GetClientBalance,
  GetClientChannel,
  GetClientInvoices,
  GetClients,
  GetCompany,
  GetInvoice,
  GetInvoiceJpg,
  GetInvoicePdf,
  GetInvoices,
  GetInvoicesByMonth,
  GetProduct,
  GetProducts,
  ImportClientsFromIntegration,
  ImportProductsFromIntegration,
  PostForwardAndOverwriteClient,
  PostOrOverwriteClient,
  PrintInvoice,
  SearchClients,
  SendInvoice,
  TestToken,
  UpdateClient,
  UpdateClientChannel,
  UpdateCompany,
  UpdateProduct,
  ValidateClientVat,
  ViewBearerToken,
  ViewClientInIntegration,
  ViewClientsInIntegration,
  ViewInvoiceInIntegration,
  ViewInvoicesInIntegration,
  ViewProductInIntegration,
  ViewProductsInIntegration,
}
