/**
 * PrismSplit TypeScript Models
 * 
 * Core domain models matching the API contract.
 */

// === Core Models ===

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  color_index?: number; // 0-5 for avatar colors
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  emoji: string;
  currency: string;
  invite_code: string;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  member_count: number;
  your_balance?: number; // Current user's balance in group
}

export interface GroupMember {
  id: string;
  user_id: string;
  user: User;
  role: 'admin' | 'member';
  color_index: number; // 0-5 for avatar colors
  joined_at: string;
}

export interface GroupWithBalance extends Group {
  your_balance: number;
  last_activity_at: string;
}

// === Bills ===

export type Category =
  | 'groceries'
  | 'dining'
  | 'transport'
  | 'utilities'
  | 'entertainment'
  | 'travel'
  | 'shopping'
  | 'transfer'
  | 'other';

// No bill status - bills are instantly visible to group when saved
// All bills are always editable, balances update dynamically

export interface Bill {
  id: string;
  group_id: string;
  title: string;
  total_amount: number;
  tax_amount: number;
  tip_amount: number;
  discount_amount?: number; // Overall bill discount (always proportional)
  tax_split_mode?: 'equal' | 'proportional';
  tip_split_mode?: 'equal' | 'proportional'; // Defaults to equal if undefined
  paid_by?: string;
  payer: { id: string; full_name: string }; // Partial user for display
  category: Category;
  bill_date: string;
  created_at: string;
  updated_at?: string; // Track when bill was last modified
  last_edited_by?: string; // User ID who made last edit
  your_share?: number; // Current user's share
  participant_avatars?: string[]; // For list display
  is_itemized?: boolean; // True if bill has itemized splits
}

export interface BillSummary extends Bill {
  item_count: number;
  your_share: number;
  participant_count: number;
  participant_avatars: string[]; // First 3 user IDs
}

export interface BillItem {
  id: string;
  bill_id: string;
  name: string;
  price: number;
  quantity: number;
  discount?: number; // Total discount for this line item (not per unit)
  category?: Category; // Optional override for item-specific category
  sort_order: number;
}

export type SplitType = 'equal' | 'percentage' | 'amount';

export interface ItemSplit {
  id: string;
  item_id: string;
  user_id: string;
  user: User;
  split_type: SplitType;
  amount: number;
  percentage: number | null;
  color_index: number;
}

export interface BillItemWithSplits extends BillItem {
  splits: ItemSplit[];
  total_claimed: number; // Sum of split amounts
  unclaimed: number; // Price - total_claimed
}

export interface UserShare {
  user_id: string;
  user: User;
  amount: number;
  item_count: number;
}

// === Settlements ===

export interface Settlement {
  id: string;
  group_id: string;
  from_user: string;
  to_user: string;
  from: User;
  to: User;
  amount: number;
  notes: string | null;
  created_at: string;
}

// === Activity ===

export type ActivityType =
  | 'bill_created'
  | 'bill_updated'
  | 'bill_deleted'
  | 'bill_shared'
  | 'bill_finalized'
  | 'item_selected'
  | 'split_joined'
  | 'split_left'
  | 'split_changed'
  | 'settlement_created'
  | 'payment'
  | 'member_joined';

export interface Activity {
  id: string;
  group_id: string;
  group: { id: string; name: string; emoji: string };
  user_id: string;
  user: User;
  type: ActivityType;
  entity_type: 'bill' | 'settlement' | 'group';
  entity_id: string;
  metadata: Record<string, unknown>;
  is_read?: boolean;
  created_at: string;
}

// === Balances ===

export interface MemberBalance {
  user_id: string;
  user: User;
  balance: number; // Positive = they owe you, negative = you owe them
  color_index: number;
}

export interface GroupBalanceSummary {
  group_id: string;
  group_name: string;
  group_emoji: string;
  balance: number;
}

// === Category Icons ===

export const categoryIcons: Record<Category, string> = {
  groceries: '🛒',
  dining: '🍔',
  transport: '🚗',
  utilities: '💡',
  entertainment: '🎮',
  travel: '✈️',
  shopping: '🛍️',
  transfer: '💸',
  other: '📦',
};

// === Currency ===

export const supportedCurrencies = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'] as const;
export type Currency = typeof supportedCurrencies[number];

export const currencySymbols: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  CAD: 'C$',
  AUD: 'A$',
};
