# OCR Backend - AWS Lambda Deployment

This is the backend service for the OCR application, configured to run on AWS Lambda with API Gateway.

## Prerequisites

1. AWS CLI installed and configured
2. AWS SAM CLI installed
3. Node.js 18.x or later
4. An AWS S3 bucket for file storage
5. A Google Cloud Gemini API key

## Deployment Steps

1. First, build the application:
   ```bash
   npm run build
   ```

2. Deploy using SAM CLI:
   ```bash
   sam deploy --guided
   ```

   During the guided deployment, you'll need to provide:
   - Stack name (e.g., ocr-backend)
   - AWS Region
   - Environment (dev/prod)
   - S3 bucket name
   - S3 access key and secret
   - Gemini API key

3. After deployment, SAM will output the API Gateway endpoint URL.

## Environment Variables

The following environment variables are required:

- `S3_REGION`: AWS region for S3
- `S3_BUCKET`: S3 bucket name
- `S3_ACCESS_KEY`: AWS access key
- `S3_SECRET_KEY`: AWS secret key
- `GEMINI_API_KEY`: Google Cloud Gemini API key

These are automatically set in the Lambda environment through the SAM template.

## API Endpoints

- `GET /health`: Health check endpoint
- `POST /generate-upload-url`: Generate pre-signed S3 URL for file upload
- `POST /v1/ocr`: Process document using OCR

## Local Development

For local development:
```bash
npm run dev
```

## Security Notes

- Make sure to never commit sensitive credentials to version control
- Use AWS Secrets Manager or Parameter Store for production credentials
- Regularly rotate access keys 