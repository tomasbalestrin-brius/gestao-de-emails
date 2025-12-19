import { describe, it, expect } from '@jest/globals';
import {
  isValidEmail,
  isValidPriority,
  isValidStatus,
  sanitizeHtml,
  validateTicketData,
} from '../validators';

describe('Validators', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('user.name@example.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user @example.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidPriority', () => {
    it('should validate correct priorities', () => {
      expect(isValidPriority('LOW')).toBe(true);
      expect(isValidPriority('MEDIUM')).toBe(true);
      expect(isValidPriority('HIGH')).toBe(true);
      expect(isValidPriority('URGENT')).toBe(true);
    });

    it('should reject invalid priorities', () => {
      expect(isValidPriority('CRITICAL')).toBe(false);
      expect(isValidPriority('low')).toBe(false);
      expect(isValidPriority('')).toBe(false);
      expect(isValidPriority('INVALID')).toBe(false);
    });
  });

  describe('isValidStatus', () => {
    it('should validate correct statuses', () => {
      expect(isValidStatus('OPEN')).toBe(true);
      expect(isValidStatus('IN_PROGRESS')).toBe(true);
      expect(isValidStatus('RESOLVED')).toBe(true);
      expect(isValidStatus('CLOSED')).toBe(true);
    });

    it('should reject invalid statuses', () => {
      expect(isValidStatus('PENDING')).toBe(false);
      expect(isValidStatus('open')).toBe(false);
      expect(isValidStatus('')).toBe(false);
      expect(isValidStatus('INVALID')).toBe(false);
    });
  });

  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      const input = '<p>Hello</p><script>alert("XSS")</script>';
      const output = sanitizeHtml(input);
      expect(output).not.toContain('script');
      expect(output).toContain('Hello');
    });

    it('should remove event handlers', () => {
      const input = '<p onclick="alert(\'XSS\')">Click me</p>';
      const output = sanitizeHtml(input);
      expect(output).not.toContain('onclick');
      expect(output).toContain('Click me');
    });

    it('should allow safe HTML tags', () => {
      const input = '<p><strong>Bold</strong> and <em>italic</em></p>';
      const output = sanitizeHtml(input);
      expect(output).toContain('strong');
      expect(output).toContain('em');
      expect(output).toContain('Bold');
      expect(output).toContain('italic');
    });

    it('should handle empty string', () => {
      expect(sanitizeHtml('')).toBe('');
    });

    it('should handle plain text', () => {
      const input = 'Plain text without HTML';
      expect(sanitizeHtml(input)).toBe(input);
    });
  });

  describe('validateTicketData', () => {
    it('should validate correct ticket data', () => {
      const data = {
        subject: 'Need help',
        customerEmail: 'customer@example.com',
        priority: 'HIGH',
        status: 'OPEN',
      };

      const result = validateTicketData(data);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject missing subject', () => {
      const data = {
        customerEmail: 'customer@example.com',
        priority: 'HIGH',
      };

      const result = validateTicketData(data);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Subject is required');
    });

    it('should reject invalid email', () => {
      const data = {
        subject: 'Need help',
        customerEmail: 'invalid-email',
        priority: 'HIGH',
      };

      const result = validateTicketData(data);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid email address');
    });

    it('should reject invalid priority', () => {
      const data = {
        subject: 'Need help',
        customerEmail: 'customer@example.com',
        priority: 'CRITICAL',
      };

      const result = validateTicketData(data);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid priority');
    });

    it('should reject subject that is too short', () => {
      const data = {
        subject: 'Hi',
        customerEmail: 'customer@example.com',
        priority: 'HIGH',
      };

      const result = validateTicketData(data);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Subject must be at least 3 characters');
    });
  });
});
