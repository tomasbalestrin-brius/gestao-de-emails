import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import r2Client from '../config/r2';
import logger from './logger.service';
import { randomUUID } from 'crypto';
import path from 'path';

export class R2Service {
  private bucketName: string;
  private publicUrl: string;

  constructor() {
    this.bucketName = process.env.R2_BUCKET_NAME || 'email-attachments';
    this.publicUrl = process.env.R2_PUBLIC_URL || '';
  }

  async uploadFile(
    fileBuffer: Buffer,
    filename: string,
    contentType: string
  ): Promise<{ key: string; url: string }> {
    try {
      // Gerar nome único para o arquivo
      const ext = path.extname(filename);
      const uniqueFilename = `${randomUUID()}${ext}`;
      const key = `attachments/${uniqueFilename}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
      });

      await r2Client.send(command);

      const url = `${this.publicUrl}/${key}`;

      logger.info('Arquivo enviado para R2 com sucesso', {
        key,
        filename,
        size: fileBuffer.length,
      });

      return { key, url };
    } catch (error: any) {
      logger.error('Erro ao enviar arquivo para R2', {
        error: error.message,
        filename,
      });
      throw error;
    }
  }

  async getFile(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const response = await r2Client.send(command);

      if (!response.Body) {
        throw new Error('Arquivo não encontrado');
      }

      // Converter stream para buffer
      const chunks: Uint8Array[] = [];
      for await (const chunk of response.Body as any) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error: any) {
      logger.error('Erro ao buscar arquivo do R2', {
        error: error.message,
        key,
      });
      throw error;
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await r2Client.send(command);

      logger.info('Arquivo deletado do R2 com sucesso', { key });
    } catch (error: any) {
      logger.error('Erro ao deletar arquivo do R2', {
        error: error.message,
        key,
      });
      throw error;
    }
  }

  async testConnection() {
    try {
      // Testar upload de um arquivo pequeno
      const testBuffer = Buffer.from('Test file content');
      const { key } = await this.uploadFile(testBuffer, 'test.txt', 'text/plain');

      // Deletar arquivo de teste
      await this.deleteFile(key);

      return { success: true, message: 'Conexão com R2 OK' };
    } catch (error: any) {
      logger.error('Erro ao testar conexão R2', { error: error.message });
      return { success: false, message: error.message };
    }
  }
}

export default new R2Service();
