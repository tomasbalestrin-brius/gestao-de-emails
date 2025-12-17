import { simpleParser, ParsedMail } from 'mailparser';
import { ParsedEmail } from '../types';

export async function parseRawEmail(rawEmail: string | Buffer): Promise<ParsedEmail> {
  const parsed: ParsedMail = await simpleParser(rawEmail);

  const result: ParsedEmail = {
    from: {
      name: parsed.from?.value[0]?.name,
      address: parsed.from?.value[0]?.address || '',
    },
    to: (parsed.to?.value || []).map(addr => ({
      name: addr.name,
      address: addr.address || '',
    })),
    subject: parsed.subject || '(Sem assunto)',
    messageId: parsed.messageId || '',
    inReplyTo: parsed.inReplyTo,
    references: parsed.references,
    text: parsed.text,
    html: parsed.html,
    attachments: (parsed.attachments || []).map(att => ({
      filename: att.filename || 'file',
      contentType: att.contentType,
      size: att.size,
      content: att.content,
    })),
    date: parsed.date || new Date(),
  };

  return result;
}

export function stripEmailSignature(text: string): string {
  // Remove assinaturas comuns de emails
  const signaturePatterns = [
    /--\s*\n/,
    /___+/,
    /Sent from /i,
    /Enviado do /i,
  ];

  let stripped = text;

  for (const pattern of signaturePatterns) {
    const match = stripped.match(pattern);
    if (match) {
      stripped = stripped.substring(0, match.index);
      break;
    }
  }

  return stripped.trim();
}

export function extractCustomerName(fromAddress: string, fromName?: string): string {
  if (fromName && fromName.trim()) {
    return fromName.trim();
  }

  // Tentar extrair nome do email
  const emailParts = fromAddress.split('@')[0];
  const name = emailParts.replace(/[._-]/g, ' ');

  return name.charAt(0).toUpperCase() + name.slice(1);
}
