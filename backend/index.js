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
    } catch (error) {
      console.error('Failed to parse Gemini response as JSON:', error);
      return res.status(500).json({ 
        error: 'Failed to parse extracted data',
        details: error.message
      });
    }

    extractedData.documentInfo.dateUploaded = new Date().toISOString().split('T')[0];
    extractedData.documentInfo.sourceFileName = fileName;

    res.json({
      data: extractedData,
      status: "success"
    });

  } catch (error) {
    console.error('OCR processing error:', error);
    res.status(500).json({ error: 'Failed to process OCR request' });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
