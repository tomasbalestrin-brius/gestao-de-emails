import { describe, it, expect } from '@jest/globals';
import { parseEmail, extractEmailMetadata } from '../email-parser';

describe('Email Parser', () => {
  describe('parseEmail', () => {
    it('should parse simple email', async () => {
      const rawEmail = `From: sender@example.com
To: receiver@example.com
Subject: Test Email
Date: Thu, 19 Dec 2025 10:00:00 +0000
Content-Type: text/plain; charset=utf-8

Hello World!`;

      const result = await parseEmail(rawEmail);

      expect(result.from).toBeDefined();
      expect(result.to).toBeDefined();
      expect(result.subject).toBe('Test Email');
      expect(result.text).toContain('Hello World!');
    });

    it('should extract HTML content', async () => {
      const rawEmail = `From: sender@example.com
To: receiver@example.com
Subject: HTML Email
Content-Type: text/html; charset=utf-8

<html><body><p>HTML Content</p></body></html>`;

      const result = await parseEmail(rawEmail);

      expect(result.html).toContain('HTML Content');
    });

    it('should handle multipart emails', async () => {
      const rawEmail = `From: sender@example.com
To: receiver@example.com
Subject: Multipart Email
Content-Type: multipart/alternative; boundary="boundary123"

--boundary123
Content-Type: text/plain

Plain text version

--boundary123
Content-Type: text/html

<html><body>HTML version</body></html>

--boundary123--`;

      const result = await parseEmail(rawEmail);

      expect(result.text).toBeDefined();
      expect(result.html).toBeDefined();
    });
  });

  describe('extractEmailMetadata', () => {
    it('should extract sender information', () => {
      const email = {
        from: [{ address: 'sender@example.com', name: 'John Doe' }],
        to: [{ address: 'receiver@example.com' }],
        subject: 'Test',
        date: new Date(),
      };

      const metadata = extractEmailMetadata(email);

      expect(metadata.senderEmail).toBe('sender@example.com');
      expect(metadata.senderName).toBe('John Doe');
    });

    it('should handle missing sender name', () => {
      const email = {
        from: [{ address: 'sender@example.com' }],
        to: [{ address: 'receiver@example.com' }],
        subject: 'Test',
        date: new Date(),
      };

      const metadata = extractEmailMetadata(email);

      expect(metadata.senderEmail).toBe('sender@example.com');
      expect(metadata.senderName).toBe('sender@example.com');
    });

    it('should extract multiple recipients', () => {
      const email = {
        from: [{ address: 'sender@example.com' }],
        to: [
          { address: 'receiver1@example.com' },
          { address: 'receiver2@example.com' },
        ],
        subject: 'Test',
        date: new Date(),
      };

      const metadata = extractEmailMetadata(email);

      expect(metadata.recipients).toHaveLength(2);
      expect(metadata.recipients).toContain('receiver1@example.com');
      expect(metadata.recipients).toContain('receiver2@example.com');
    });

    it('should extract subject', () => {
      const email = {
        from: [{ address: 'sender@example.com' }],
        to: [{ address: 'receiver@example.com' }],
        subject: 'Important Message',
        date: new Date(),
      };

      const metadata = extractEmailMetadata(email);

      expect(metadata.subject).toBe('Important Message');
    });
  });
});
