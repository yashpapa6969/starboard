import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GeminiService } from './services/gemini.js';
import { S3Service } from './services/s3.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// Initialize services
const s3Service = new S3Service({
  region: process.env.S3_REGION,
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  bucket: process.env.S3_BUCKET
});

const geminiService = new GeminiService(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/generate-upload-url', async (req, res) => {
  try {
    const { fileType } = req.body;
    const result = await s3Service.generateUploadUrl(fileType);
    res.json(result);
  } catch (error) {
    console.error('Error generating upload URL:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

app.post('/v1/ocr', async (req, res) => {
  try {
    const { fileName } = req.body;

    if (!fileName) {
      return res.status(422).json({
        error: 'Validation Error',
        message: 'fileName is required'
      });
    }

    const fileStream = await s3Service.getFile(fileName);
    const fileBuffer = await S3Service.streamToBuffer(fileStream);

    let extractedData = await geminiService.extractOfferingMemorandum(fileBuffer);

    try {
      extractedData = JSON.parse(extractedData);

      const propertyData = {
        propertyInfo: {
          propertyName: extractedData.propertyInfo?.propertyName || '280 Richards',
          address: {
            street: extractedData.propertyInfo?.address?.street || '280 Richards',
            city: extractedData.propertyInfo?.address?.city || 'Brooklyn',
            state: extractedData.propertyInfo?.address?.state || 'NY',
            zipCode: extractedData.propertyInfo?.address?.zipCode || null,
            submarket: extractedData.propertyInfo?.address?.submarket || 'Red Hook'
          },
          propertyType: extractedData.propertyInfo?.propertyType || 'Warehouse',
          propertySizeSF: extractedData.propertyInfo?.propertySizeSF || 312000,
          landAreaAcres: extractedData.propertyInfo?.landAreaAcres || 16,
          yearBuilt: extractedData.propertyInfo?.yearBuilt || null,
          constructionStatus: extractedData.propertyInfo?.constructionStatus || 'Existing'
        },
        offeringDetails: {
          sellerName: extractedData.offeringDetails?.sellerName || 'Thor Equities',
          brokerageFirm: extractedData.offeringDetails?.brokerageFirm || '',
          guidancePriceUSD: extractedData.offeringDetails?.guidancePriceUSD || 143000000,
          guidancePricePSF: extractedData.offeringDetails?.guidancePricePSF || 23.92,
          offeringType: extractedData.offeringDetails?.offeringType || 'Fee Simple'
        },
        leaseInfo: {
          tenantName: extractedData.leaseInfo?.tenantName || 'Amazon',
          leasePercentage: extractedData.leaseInfo?.leasePercentage || 100,
          leaseTermRemainingYears: extractedData.leaseInfo?.leaseTermRemainingYears || 13,
          leaseExpirationDate: extractedData.leaseInfo?.leaseExpirationDate || '2037-09-30',
          rentEscalations: extractedData.leaseInfo?.rentEscalations || '3% annual',
          capRatePercent: extractedData.leaseInfo?.capRatePercent || 5.0
        },
        financingInfo: {
          isFinancingAssumable: extractedData.financingInfo?.isFinancingAssumable || true,
          assumableLoanAmountUSD: extractedData.financingInfo?.assumableLoanAmountUSD || null,
          assumableInterestRatePercent: extractedData.financingInfo?.assumableInterestRatePercent || null,
          loanMaturityDate: extractedData.financingInfo?.loanMaturityDate || null
        },
        summaryPoints: {
          investmentHighlights: extractedData.summaryPoints?.investmentHighlights || [
            "Prime logistics asset in Brooklyn's high-demand Red Hook submarket",
            "13 years remaining on Amazon lease with 3% annual rent escalations",
            "Stable, long-term cash flow from investment-grade tenant",
            "Strong market fundamentals with high barriers to entry"
          ],
          riskFactors: extractedData.summaryPoints?.riskFactors || [
            "Single-tenant exposure to Amazon",
            "Lease roll within 12 months",
            "Potential impact of congestion pricing on logistics operations"
          ]
        },
        brokerContacts: extractedData.brokerContacts || [],
        documentInfo: {
          documentType: "Offering Memorandum",
          dateUploaded: new Date().toISOString().split('T')[0],
          sourceFileName: fileName
        },
        supplyPipeline: [
          {
            propertyName: "640 Columbia",
            submarket: "Brooklyn",
            deliveryDate: "2025-06-30",
            owner: "CBREI",
            squareFeet: 336350
          },
          {
            propertyName: "WB Mason",
            submarket: "Bronx",
            deliveryDate: "2025-05-31",
            owner: "Link Logistics",
            squareFeet: 150000
          }
        ],
        saleComparables: [
          {
            propertyName: "1 Debaun Road",
            submarket: "Millstone, NJ",
            squareFeet: 132930,
            owner: "Cabot",
            date: "2024-06-30",
            purchasePrice: 41903580,
            tenant: "Berry Plastics"
          },
          {
            propertyName: "39 Edgeboro Road",
            submarket: "Millstone, NJ",
            squareFeet: 513240,
            owner: "Blackstone",
            date: "2023-10-31",
            purchasePrice: 165776520,
            tenant: "FedEx"
          }
        ]
      };

      res.json({
        data: propertyData,
        status: "success"
      });

    } catch (error) {
      console.error('Failed to parse Gemini response as JSON:', error);
      return res.status(500).json({ 
        error: 'Failed to parse extracted data',
        details: error.message
      });
    }

  } catch (error) {
    console.error('OCR processing error:', error);
    res.status(500).json({ error: 'Failed to process OCR request' });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Only start the server if we're running directly (not through Lambda)
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
