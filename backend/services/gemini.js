import { GoogleGenerativeAI } from '@google/generative-ai';
import { offeringMemorandumSchema } from '../schemas.js';


export class GeminiService {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async extractOfferingMemorandum(pdfBuffer) {
    try {
      // Initialize Gemini Vision model with schema configuration
      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.5-pro-preview-03-25",
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: offeringMemorandumSchema,
        },
      });

      // Convert buffer to base64
      const base64Image = pdfBuffer.toString('base64');

      // Call Gemini Vision API with structured prompt
      const result = await model.generateContent([
        {
          inlineData: {
            data: base64Image,
            mimeType: "application/pdf"
          }
        },
        {
          text: `Analyze this real estate offering memorandum and extract all available information. Return a JSON object matching the provided schema. For missing fields, use null for numbers and empty strings for text. Format dates as YYYY-MM-DD and ensure numeric values are actual numbers.

Focus on extracting:

1. Property Information:
   - Name, full address (street, city, state, zip, submarket)
   - Property type (e.g., logistics, warehouse, industrial)
   - Square footage, land area, year built, construction status

2. Offering Details:
   - Seller name, brokerage firm
   - Guidance price (USD), price per square foot
   - Offering type (e.g., fee simple)

3. Lease Information:
   - Primary tenant, percentage leased
   - Remaining lease term, expiration date
   - Rent escalations, cap rate

4. Financing Information:
   - Assumable status, loan amount
   - Interest rate, maturity date

5. Summary Points:
   - Investment highlights
   - Risk factors

6. Broker Contacts:
   - Name, title, phone, email

7. Document Info:
   - Set documentType to "Offering Memorandum"

Return only the JSON object with extracted data.`
        }
      ]);

      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to extract information from document');
    }
  }
} 