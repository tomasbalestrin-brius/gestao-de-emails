import { z } from 'zod';

export const snsNotificationSchema = z.object({
  Type: z.string(),
  MessageId: z.string(),
  TopicArn: z.string().optional(),
  Subject: z.string().optional(),
  Message: z.string(),
  Timestamp: z.string(),
  SignatureVersion: z.string(),
  Signature: z.string(),
  SigningCertURL: z.string(),
  UnsubscribeURL: z.string().optional(),
  SubscribeURL: z.string().optional(),
});

export type SNSNotification = z.infer<typeof snsNotificationSchema>;
