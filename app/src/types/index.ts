// Type definitions for the app
export interface Group {
  id: string;
  name: string;
  created_at: string;
}

export interface Bill {
  id: string;
  group_id: string;
  title: string;
  amount: number;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}
