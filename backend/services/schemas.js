import { SchemaType } from '@google/generative-ai';
export const offeringMemorandumSchema = {
    type: SchemaType.OBJECT,
    description: 'Real Estate Offering Memorandum details',
    properties: {
      propertyInfo: {
        type: SchemaType.OBJECT,
        description: 'Basic property information and characteristics',
        properties: {
          propertyName: {
            type: SchemaType.STRING,
            description: 'Name of the property (e.g., "280 Richards")',
            nullable: false,
          },
          address: {
            type: SchemaType.OBJECT,
            description: 'Property address details',
            properties: {
              street: {
                type: SchemaType.STRING,
                description: 'Street address',
                nullable: false,
              },
              city: {
                type: SchemaType.STRING,
                description: 'City name',
                nullable: false,
              },
              state: {
                type: SchemaType.STRING,
                description: 'State abbreviation',
                nullable: false,
              },
              zipCode: {
                type: SchemaType.STRING,
                description: 'Postal code',
                nullable: true,
              },
              submarket: {
                type: SchemaType.STRING,
                description: 'Submarket or district name',
                nullable: true,
              },
            },
            required: ['street', 'city', 'state'],
          },
          propertyType: {
            type: SchemaType.STRING,
            description: 'Type of property (e.g., "Logistics Facility", "Warehouse", "Industrial")',
            nullable: false,
          },
          propertySizeSF: {
            type: SchemaType.NUMBER,
            description: 'Total property size in square feet',
            nullable: false,
          },
          landAreaAcres: {
            type: SchemaType.NUMBER,
            description: 'Land area in acres',
            nullable: true,
          },
          yearBuilt: {
            type: SchemaType.NUMBER,
            description: 'Year the property was built',
            nullable: true,
          },
          constructionStatus: {
            type: SchemaType.STRING,
            description: 'Current construction status (e.g., "New Construction", "Existing")',
            nullable: true,
          },
        },
        required: ['propertyName', 'address', 'propertyType', 'propertySizeSF'],
      },
      offeringDetails: {
        type: SchemaType.OBJECT,
        description: 'Details about the property offering',
        properties: {
          sellerName: {
            type: SchemaType.STRING,
            description: 'Name of the selling entity',
            nullable: true,
          },
          brokerageFirm: {
            type: SchemaType.STRING,
            description: 'Name of the brokerage firm',
            nullable: false,
          },
          guidancePriceUSD: {
            type: SchemaType.NUMBER,
            description: 'Asking price in USD',
            nullable: false,
          },
          guidancePricePSF: {
            type: SchemaType.NUMBER,
            description: 'Price per square foot',
            nullable: true,
          },
          offeringType: {
            type: SchemaType.STRING,
            description: 'Type of offering (e.g., "Fee Simple", "Leasehold")',
            nullable: true,
          },
        },
        required: ['brokerageFirm', 'guidancePriceUSD'],
      },
      leaseInfo: {
        type: SchemaType.OBJECT,
        description: 'Lease and tenant information',
        properties: {
          tenantName: {
            type: SchemaType.STRING,
            description: 'Name of primary tenant',
            nullable: false,
          },
          leasePercentage: {
            type: SchemaType.NUMBER,
            description: 'Percentage of property that is leased',
            nullable: false,
          },
          leaseTermRemainingYears: {
            type: SchemaType.NUMBER,
            description: 'Remaining years on the lease',
            nullable: true,
          },
          leaseExpirationDate: {
            type: SchemaType.STRING,
            description: 'Lease expiration date in YYYY-MM-DD format',
            nullable: true,
          },
          rentEscalations: {
            type: SchemaType.STRING,
            description: 'Description of rent escalation structure',
            nullable: true,
          },
          capRatePercent: {
            type: SchemaType.NUMBER,
            description: 'Capitalization rate as a percentage',
            nullable: true,
          },
        },
        required: ['tenantName', 'leasePercentage'],
      },
      financingInfo: {
        type: SchemaType.OBJECT,
        description: 'Financing details and terms',
        properties: {
          isFinancingAssumable: {
            type: SchemaType.BOOLEAN,
            description: 'Whether existing financing can be assumed',
            nullable: false,
          },
          assumableLoanAmountUSD: {
            type: SchemaType.NUMBER,
            description: 'Amount of assumable loan in USD',
            nullable: true,
          },
          assumableInterestRatePercent: {
            type: SchemaType.NUMBER,
            description: 'Interest rate of assumable loan as a percentage',
            nullable: true,
          },
          loanMaturityDate: {
            type: SchemaType.STRING,
            description: 'Loan maturity date in YYYY-MM-DD format',
            nullable: true,
          },
        },
        required: ['isFinancingAssumable'],
      },
      summaryPoints: {
        type: SchemaType.OBJECT,
        description: 'Key points and considerations about the property',
        properties: {
          investmentHighlights: {
            type: SchemaType.ARRAY,
            description: 'List of key investment highlights',
            items: {
              type: SchemaType.STRING,
              description: 'Individual investment highlight',
            },
          },
          riskFactors: {
            type: SchemaType.ARRAY,
            description: 'List of potential risk factors',
            items: {
              type: SchemaType.STRING,
              description: 'Individual risk factor',
            },
          },
        },
        required: ['investmentHighlights', 'riskFactors'],
      },
      brokerContacts: {
        type: SchemaType.ARRAY,
        description: 'List of broker contact information',
        items: {
          type: SchemaType.OBJECT,
          properties: {
            name: {
              type: SchemaType.STRING,
              description: 'Broker name',
              nullable: false,
            },
            title: {
              type: SchemaType.STRING,
              description: 'Broker title',
              nullable: false,
            },
            phone: {
              type: SchemaType.STRING,
              description: 'Contact phone number',
              nullable: false,
            },
            email: {
              type: SchemaType.STRING,
              description: 'Contact email address',
              nullable: false,
            },
          },
          required: ['name', 'title', 'phone', 'email'],
        },
      },
      documentInfo: {
        type: SchemaType.OBJECT,
        description: 'Document metadata',
        properties: {
          documentType: {
            type: SchemaType.STRING,
            description: 'Type of document',
            nullable: false,
          },
          dateUploaded: {
            type: SchemaType.STRING,
            description: 'Date the document was uploaded in YYYY-MM-DD format',
            nullable: false,
          },
          sourceFileName: {
            type: SchemaType.STRING,
            description: 'Original filename of the document',
            nullable: false,
          },
        },
        required: ['documentType', 'dateUploaded', 'sourceFileName'],
      },
    },
    required: ['propertyInfo', 'offeringDetails', 'leaseInfo', 'documentInfo'],
  };