import { S3Client, PutObjectCommand, GetObjectCommand, CopyObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

export class S3Service {
  constructor(config) {
    this.s3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      }
    });
    this.bucket = config.bucket;
  }

  async generateUploadUrl(fileType = 'application/pdf') {
    try {
      const fileName = `${crypto.randomUUID()}.pdf`;
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: fileName,
        ContentType: fileType
      });

      const uploadUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

      return {
        uploadUrl,
        fileName,
        expiresIn: 3600
      };
    } catch (error) {
      console.error('Error generating upload URL:', error);
      throw new Error('Failed to generate upload URL');
    }
  }

  async getPresignedDownloadUrl(fileName) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: fileName,
        ResponseContentType: 'application/pdf'
      });
      return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
    } catch (error) {
      console.error('Error generating download URL:', error);
      throw new Error('Failed to generate download URL');
    }
  }

  async getFile(fileName) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: fileName
      });

      const { Body } = await this.s3Client.send(command);
      return Body;
    } catch (error) {
      console.error('Error getting file from S3:', error);
      throw new Error('Failed to get file from S3');
    }
  }

  // Utility function to convert stream to buffer
  static async streamToBuffer(stream) {
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  }
} 