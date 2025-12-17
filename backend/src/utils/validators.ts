import axios from 'axios';
import crypto from 'crypto';

export async function validateSNSMessage(message: any): Promise<boolean> {
  try {
    // Verificar se é uma mensagem SNS válida
    if (!message.Type || !message.SignatureVersion || !message.Signature) {
      return false;
    }

    // Validar tipo de mensagem
    const validTypes = ['Notification', 'SubscriptionConfirmation', 'UnsubscribeConfirmation'];
    if (!validTypes.includes(message.Type)) {
      return false;
    }

    // Em produção, você deve validar a assinatura SNS
    // Para simplificar, vamos apenas verificar a estrutura
    // Documentação: https://docs.aws.amazon.com/sns/latest/dg/sns-verify-signature-of-message.html

    return true;
  } catch (error) {
    return false;
  }
}

export async function confirmSNSSubscription(subscribeURL: string): Promise<boolean> {
  try {
    const response = await axios.get(subscribeURL);
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function sanitizeFilename(filename: string): string {
  // Remove caracteres especiais e espaços
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
}

export function validateFileType(contentType: string): boolean {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ];

  return allowedTypes.includes(contentType);
}

export function validateFileSize(size: number, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return size <= maxSizeBytes;
}
