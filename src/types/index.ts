/**
 * PrismSplit API Types Index
 * 
 * Re-exports all types for easy importing.
 */

export * from './models';

// API Request/Response Types

export interface ApiResponse<T> {
  data: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  next_cursor: string | null;
}

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthResponse {
  user: import('./models').User;
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}

// Bills
export interface CreateBillRequest {
  title: string;
  category?: import('./models').Category;
  bill_date?: string;
  paid_by?: string;
  items: {
    name: string;
    price: number;
    quantity?: number;
  }[];
  tax_amount?: number;
  tip_amount?: number;
}

export interface JoinItemRequest {
  split_type?: import('./models').SplitType;
  percentage?: number;
  amount?: number;
}

// Groups
export interface CreateGroupRequest {
  name: string;
  emoji?: string;
  currency?: string;
}

// Settlements
export interface CreateSettlementRequest {
  to_user: string;
  amount: number;
  notes?: string;
}
