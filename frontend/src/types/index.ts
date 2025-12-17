export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'AGENT';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Ticket {
  id: string;
  customer_email: string;
  customer_name?: string;
  subject: string;
  status: 'NEW' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED' | 'REOPENED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  tags: string[];
  created_at: string;
  updated_at: string;
  last_message_at: string;
  messages?: Message[];
  _count?: {
    messages: number;
  };
}

export interface Message {
  id: string;
  direction: 'INBOUND' | 'OUTBOUND';
  from_email: string;
  from_name?: string;
  to_email: string;
  subject: string;
  body_text: string;
  body_html?: string;
  sent_at: string;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  filename: string;
  content_type: string;
  size: number;
  r2_url: string;
}

export interface TicketListResponse {
  data: Ticket[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TicketStats {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
}
