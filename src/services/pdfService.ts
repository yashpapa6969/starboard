import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

interface UploadUrlResponse {
  uploadUrl: string;
  fileName: string;
  expiresIn: number;
}

export const pdfService = {
  async getUploadUrl(): Promise<UploadUrlResponse> {
    const response = await axios.post(`${API_BASE_URL}/generate-upload-url`, {
      fileType: 'application/pdf'
    });
    return response.data;
  },

  async uploadPdfToUrl(uploadUrl: string, file: File): Promise<void> {
    await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': 'application/pdf'
      }
    });
  },

  async processOcr(fileName: string): Promise<any> {
    const response = await axios.post(`${API_BASE_URL}/v1/ocr`, {
      fileName
    });
    return response.data;
  }
}; 