import { UserRole } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface SESNotification {
  Type: string;
  MessageId: string;
  TopicArn: string;
  Subject?: string;
  Message: string;
  Timestamp: string;
  SignatureVersion: string;
  Signature: string;
  SigningCertURL: string;
  UnsubscribeURL: string;
}

export interface SESMessage {
  mail: {
    timestamp: string;
    source: string;
    messageId: string;
    destination: string[];
    headersTruncated: boolean;
    headers: Array<{ name: string; value: string }>;
    commonHeaders: {
      returnPath: string;
      from: string[];
      date: string;
      to: string[];
      messageId: string;
      subject: string;
    };
  };
  receipt: {
    timestamp: string;
    processingTimeMillis: number;
    recipients: string[];
    spamVerdict: { status: string };
    virusVerdict: { status: string };
    spfVerdict: { status: string };
    dkimVerdict: { status: string };
    dmarcVerdict: { status: string };
    action: {
      type: string;
      topicArn: string;
    };
  };
  content: string;
}

export interface ParsedEmail {
  from: {
    name?: string;
    address: string;
  };
  to: Array<{ name?: string; address: string }>;
  subject: string;
  messageId: string;
  inReplyTo?: string;
  references?: string[];
  text?: string;
  html?: string;
  attachments: Array<{
    filename: string;
    contentType: string;
    size: number;
    content: Buffer;
  }>;
  date: Date;
}

export interface WebhookEvent {
  event: string;
  timestamp: string;
  ticket: {
    id: string;
    status: string;
    priority: string;
    customer: {
      name?: string;
      email: string;
    };
    subject: string;
    latest_message?: {
      from: string;
      body: string;
      date: string;
    };
    tags: string[];
  };
}
