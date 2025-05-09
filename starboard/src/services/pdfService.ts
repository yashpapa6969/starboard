import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}`;

export interface UploadUrlResponse {
  uploadUrl: string;
  fileName: string;
  expiresIn: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  rawResponse?: any;
  error?: string;
}

export interface OcrResult {
  text: string;
  rawData: any;
}

export const pdfService = {
  async getUploadUrl(): Promise<ApiResponse<UploadUrlResponse>> {
    try {
      const response: AxiosResponse = await axios.post(`${API_BASE_URL}/generate-upload-url`, {
        fileType: 'application/pdf'
      });
      
      return {
        success: true,
        data: response.data,
        rawResponse: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        data: {} as UploadUrlResponse,
        error: error.message,
        rawResponse: error.response?.data
      };
    }
  },

  async uploadPdfToUrl(uploadUrl: string, file: File): Promise<ApiResponse<void>> {
    try {
      const response = await axios.put(uploadUrl, file, {
        headers: {
          'Content-Type': 'application/pdf'
        }
      });
      
      return {
        success: response.status === 200,
        data: undefined,
        rawResponse: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        data: undefined,
        error: error.message,
        rawResponse: error.response?.data
      };
    }
  },

  async processOcr(fileName: string): Promise<ApiResponse<OcrResult>> {
    try {
      const response: AxiosResponse = await axios.post(`${API_BASE_URL}/v1/ocr`, {
        fileName
      });
      
      return {
        success: true,
        data: {
          text: response.data.text || '',
          rawData: response.data
        },
        rawResponse: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        data: { text: '', rawData: null },
        error: error.message,
        rawResponse: error.response?.data
      };
    }
  }
}; 