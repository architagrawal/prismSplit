/**
 * PrismSplit Demo Data
 * 
 * Mock data for development and testing.
 * Diverse data to showcase all app features.
 */

import type {
  User,
  GroupWithBalance,
  GroupMember,
  BillSummary,
  BillItemWithSplits,
  Activity,
  MemberBalance,
} from '@/types/models';

// === Demo Users ===

export const demoUsers: User[] = [
  {
    id: 'user-1',
    email: 'alex@example.com',
    full_name: 'Alex Johnson',
    avatar_url: null,
    color_index: 0,
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'user-2',
    email: 'sam@example.com',
    full_name: 'Sam Wilson',
    avatar_url: null,
    color_index: 1,
    created_at: '2024-01-20T14:30:00Z',
  },
  {
    id: 'user-3',
    email: 'jordan@example.com',
    full_name: 'Jordan Lee',
    avatar_url: null,
    color_index: 2,
    created_at: '2024-02-01T09:15:00Z',
  },
  {
    id: 'user-4',
    email: 'casey@example.com',
    full_name: 'Casey Chen',
    avatar_url: null,
    color_index: 3,
    created_at: '2024-02-10T16:45:00Z',
  },
  {
    id: 'user-5',
    email: 'morgan@example.com',
    full_name: 'Morgan Taylor',
    avatar_url: null,
    color_index: 4,
    created_at: '2024-03-05T11:20:00Z',
  },
  {
    id: 'user-6',
    email: 'riley@example.com',
    full_name: 'Riley Garcia',
    avatar_url: null,
    color_index: 5,
    created_at: '2024-03-12T15:10:00Z',
  },
  {
    id: 'user-7',
    email: 'taylor@example.com',
    full_name: 'Taylor Brown',
    avatar_url: null,
    color_index: 0, // Cycles back
    created_at: '2024-04-01T10:00:00Z',
  },
  {
    id: 'user-8',
    email: 'avery@example.com',
    full_name: 'Avery Smith',
    avatar_url: null,
    color_index: 1, // Cycles back
    created_at: '2024-04-15T14:30:00Z',
  },
];

export const currentUser = demoUsers[0]; // Alex is the current user

// === Demo Groups ===

export const demoGroups: GroupWithBalance[] = [
  {
    id: 'group-1',
    name: 'Roommates',
    emoji: '🏠',
    currency: 'USD',
    invite_code: 'ROOM23',
    created_by: 'user-1',
    created_at: '2024-01-15T10:00:00Z',
    member_count: 4,
    your_balance: 47.5,
    last_activity_at: '2024-12-15T18:30:00Z',
  },
  {
    id: 'group-2',
    name: 'Trip Squad',
    emoji: '✈️',
    currency: 'USD',
    invite_code: 'TRIP24',
    created_by: 'user-2',
    created_at: '2024-06-01T12:00:00Z',
    member_count: 3,
    your_balance: -125.0,
    last_activity_at: '2024-12-14T14:20:00Z',
  },
  {
    id: 'group-3',
    name: 'Office Lunch',
    emoji: '🍕',
    currency: 'USD',
    invite_code: 'LUNCH1',
    created_by: 'user-1',
    created_at: '2024-09-15T08:00:00Z',
    member_count: 6,
    your_balance: 0,
    last_activity_at: '2024-12-13T12:45:00Z',
  },
  {
    id: 'group-4',
    name: 'Family Dinner',
    emoji: '👨‍👩‍👧‍👦',
    currency: 'USD',
    invite_code: 'FAM2024',
    created_by: 'user-2',
    created_at: '2024-10-01T10:00:00Z',
    member_count: 8,
    your_balance: -65.0,
    last_activity_at: '2024-12-12T19:30:00Z',
  },
  {
    id: 'group-5',
    name: 'Weekend Hikers',
    emoji: '🥾',
    currency: 'USD',
    invite_code: 'HIKE22',
    created_by: 'user-1',
    created_at: '2024-11-01T08:00:00Z',
    member_count: 2,
    your_balance: 22.5,
    last_activity_at: '2024-12-10T15:00:00Z',
  },
  {
    id: 'group-6',
    name: 'Game Night',
    emoji: '🎮',
    currency: 'USD',
    invite_code: 'GAME99',
    created_by: 'user-2',
    created_at: '2024-11-15T19:00:00Z',
    member_count: 5,
    your_balance: -18.75,
    last_activity_at: '2024-12-11T22:00:00Z',
  },
  {
    id: 'group-7',
    name: 'Book Club',
    emoji: '📚',
    currency: 'USD',
    invite_code: 'BOOKS1',
    created_by: 'user-3',
    created_at: '2024-12-01T14:00:00Z',
    member_count: 7,
    your_balance: 0,
    last_activity_at: '2024-12-08T16:00:00Z',
  },
];

// === Demo Group Members ===

export const demoGroupMembers: Record<string, GroupMember[]> = {
  'group-1': [
    { id: 'gm-1', user_id: 'user-1', user: demoUsers[0], role: 'admin', color_index: 0, joined_at: '2024-01-15T10:00:00Z' },
    { id: 'gm-2', user_id: 'user-2', user: demoUsers[1], role: 'member', color_index: 1, joined_at: '2024-01-16T11:00:00Z' },
    { id: 'gm-3', user_id: 'user-3', user: demoUsers[2], role: 'member', color_index: 2, joined_at: '2024-01-17T09:30:00Z' },
    { id: 'gm-4', user_id: 'user-4', user: demoUsers[3], role: 'member', color_index: 3, joined_at: '2024-02-10T16:45:00Z' },
  ],
  'group-2': [
    { id: 'gm-5', user_id: 'user-1', user: demoUsers[0], role: 'member', color_index: 0, joined_at: '2024-06-01T12:00:00Z' },
    { id: 'gm-6', user_id: 'user-2', user: demoUsers[1], role: 'admin', color_index: 1, joined_at: '2024-06-01T12:00:00Z' },
    { id: 'gm-7', user_id: 'user-3', user: demoUsers[2], role: 'member', color_index: 2, joined_at: '2024-06-02T10:00:00Z' },
  ],
  'group-3': [
    { id: 'gm-8', user_id: 'user-1', user: demoUsers[0], role: 'admin', color_index: 0, joined_at: '2024-09-15T08:00:00Z' },
    { id: 'gm-9', user_id: 'user-2', user: demoUsers[1], role: 'member', color_index: 1, joined_at: '2024-09-15T08:30:00Z' },
    { id: 'gm-10', user_id: 'user-3', user: demoUsers[2], role: 'member', color_index: 2, joined_at: '2024-09-15T09:00:00Z' },
    { id: 'gm-11', user_id: 'user-4', user: demoUsers[3], role: 'member', color_index: 3, joined_at: '2024-09-16T10:00:00Z' },
    { id: 'gm-12', user_id: 'user-5', user: demoUsers[4], role: 'member', color_index: 4, joined_at: '2024-09-17T11:00:00Z' },
    { id: 'gm-13', user_id: 'user-6', user: demoUsers[5], role: 'member', color_index: 5, joined_at: '2024-09-18T12:00:00Z' },
  ],
  'group-4': [
    { id: 'gm-14', user_id: 'user-1', user: demoUsers[0], role: 'member', color_index: 0, joined_at: '2024-10-01T10:00:00Z' },
    { id: 'gm-15', user_id: 'user-2', user: demoUsers[1], role: 'admin', color_index: 1, joined_at: '2024-10-01T10:00:00Z' },
    { id: 'gm-16', user_id: 'user-3', user: demoUsers[2], role: 'member', color_index: 2, joined_at: '2024-10-01T10:30:00Z' },
    { id: 'gm-17', user_id: 'user-4', user: demoUsers[3], role: 'member', color_index: 3, joined_at: '2024-10-02T11:00:00Z' },
    { id: 'gm-18', user_id: 'user-5', user: demoUsers[4], role: 'member', color_index: 4, joined_at: '2024-10-02T12:00:00Z' },
    { id: 'gm-19', user_id: 'user-6', user: demoUsers[5], role: 'member', color_index: 5, joined_at: '2024-10-03T09:00:00Z' },
    { id: 'gm-20', user_id: 'user-7', user: demoUsers[6], role: 'member', color_index: 6, joined_at: '2024-10-03T10:00:00Z' },
    { id: 'gm-21', user_id: 'user-8', user: demoUsers[7], role: 'member', color_index: 7, joined_at: '2024-10-04T11:00:00Z' },
  ],
  'group-5': [
    { id: 'gm-22', user_id: 'user-1', user: demoUsers[0], role: 'admin', color_index: 0, joined_at: '2024-11-01T08:00:00Z' },
    { id: 'gm-23', user_id: 'user-2', user: demoUsers[1], role: 'member', color_index: 1, joined_at: '2024-11-01T08:30:00Z' },
  ],
  'group-6': [
    { id: 'gm-24', user_id: 'user-1', user: demoUsers[0], role: 'member', color_index: 0, joined_at: '2024-11-15T19:00:00Z' },
    { id: 'gm-25', user_id: 'user-2', user: demoUsers[1], role: 'admin', color_index: 1, joined_at: '2024-11-15T19:00:00Z' },
    { id: 'gm-26', user_id: 'user-3', user: demoUsers[2], role: 'member', color_index: 2, joined_at: '2024-11-15T19:30:00Z' },
    { id: 'gm-27', user_id: 'user-4', user: demoUsers[3], role: 'member', color_index: 3, joined_at: '2024-11-16T18:00:00Z' },
    { id: 'gm-28', user_id: 'user-5', user: demoUsers[4], role: 'member', color_index: 4, joined_at: '2024-11-16T19:00:00Z' },
  ],
  'group-7': [
    { id: 'gm-29', user_id: 'user-1', user: demoUsers[0], role: 'member', color_index: 0, joined_at: '2024-12-01T14:00:00Z' },
    { id: 'gm-30', user_id: 'user-2', user: demoUsers[1], role: 'member', color_index: 1, joined_at: '2024-12-01T14:00:00Z' },
    { id: 'gm-31', user_id: 'user-3', user: demoUsers[2], role: 'admin', color_index: 2, joined_at: '2024-12-01T14:00:00Z' },
    { id: 'gm-32', user_id: 'user-4', user: demoUsers[3], role: 'member', color_index: 3, joined_at: '2024-12-01T14:30:00Z' },
    { id: 'gm-33', user_id: 'user-5', user: demoUsers[4], role: 'member', color_index: 4, joined_at: '2024-12-02T15:00:00Z' },
    { id: 'gm-34', user_id: 'user-6', user: demoUsers[5], role: 'member', color_index: 5, joined_at: '2024-12-02T16:00:00Z' },
    { id: 'gm-35', user_id: 'user-7', user: demoUsers[6], role: 'member', color_index: 6, joined_at: '2024-12-03T14:00:00Z' },
  ],
};

// === Demo Bills - Diverse data across multiple months and days ===

export const demoBills: BillSummary[] = [
  // ===== GROUP 1: Roommates =====
  
  // === EDGE CASE SCENARIOS ===
  
  // Edge Case 1: User paid, share = total (paid only for self)
  {
    id: 'bill-edge-1',
    group_id: 'group-1',
    title: 'Personal Amazon Order',
    total_amount: 45.99,
    tax_amount: 3.68,
    tip_amount: 2.00,
    paid_by: 'user-1', // Alex paid
    payer: demoUsers[0],
    category: 'shopping',
    bill_date: '2024-12-15',
    created_at: '2024-12-15T22:00:00Z',
    item_count: 5, // Itemized bill with 5 items
    your_share: 45.99, // Share = total (no one owes Alex)
    participant_count: 1,
    participant_avatars: ['user-1'],
  },
  
  // Edge Case 2: User paid, share = 0 (paid entirely for others - gift/treat)
  {
    id: 'bill-edge-2',
    group_id: 'group-1',
    title: 'Birthday Gift for Jordan',
    total_amount: 75.00,
    tax_amount: 6.00,
    tip_amount: 2.00,
    paid_by: 'user-1', // Alex paid
    payer: demoUsers[0],
    category: 'other',
    bill_date: '2024-12-15',
    created_at: '2024-12-15T16:00:00Z',
    item_count: 1,
    your_share: 0, // Alex paid but gets nothing (lent full amount)
    participant_count: 2,
    participant_avatars: ['user-2', 'user-4'],
  },
  
  // Edge Case 3: Small amount (cents only)
  {
    id: 'bill-edge-3',
    group_id: 'group-1',
    title: 'Coffee Tip Jar',
    total_amount: 2.50,
    tax_amount: 0,
    tip_amount: 0,
    paid_by: 'user-2', // Sam paid
    payer: demoUsers[1],
    category: 'dining',
    bill_date: '2024-12-15',
    created_at: '2024-12-15T09:00:00Z',
    item_count: 1,
    your_share: 0.63, // Very small amount
    participant_count: 4,
    participant_avatars: ['user-1', 'user-2', 'user-3', 'user-4'],
  },
  
  // Edge Case 4: Large amount
  {
    id: 'bill-edge-4',
    group_id: 'group-1',
    title: 'New Couch for Living Room',
    total_amount: 1299.99,
    tax_amount: 104.00,
    tip_amount: 0,
    paid_by: 'user-1', // Alex paid
    payer: demoUsers[0],
    category: 'shopping',
    bill_date: '2024-12-14',
    created_at: '2024-12-14T15:00:00Z',
    item_count: 1,
    your_share: 325.00, // 1/4 of amount
    participant_count: 4,
    participant_avatars: ['user-1', 'user-2', 'user-3', 'user-4'],
  },

  // === REGULAR SCENARIOS ===
  
  // December 2024 - Multiple days, multiple bills per day
  {
    id: 'bill-1',
    group_id: 'group-1',
    title: 'Costco Grocery Run',
    total_amount: 182.45,
    tax_amount: 12.45,
    tip_amount: 1.00,
    discount_amount: 5.00,
    paid_by: 'user-1', // Alex paid (current user) - "you lent"
    payer: demoUsers[0],
    category: 'groceries',
    bill_date: '2024-12-15',
    created_at: '2024-12-15T18:30:00Z',
    item_count: 12,
    your_share: 41.28, // Less than total, so Alex lent money
    participant_count: 4,
    participant_avatars: ['user-1', 'user-2', 'user-3', 'user-4'],
  },
  {
    id: 'bill-2',
    group_id: 'group-1',
    title: 'Pizza Night',
    total_amount: 58.50,
    tax_amount: 5.50,
    tip_amount: 10.00,
    discount_amount: 10.00, // Coupon
    paid_by: 'user-2', // Sam paid - "you borrowed"
    payer: demoUsers[1],
    category: 'dining',
    bill_date: '2024-12-15',
    created_at: '2024-12-15T21:00:00Z',
    item_count: 4,
    your_share: 13.90,
    participant_count: 4,
    participant_avatars: ['user-1', 'user-2', 'user-3', 'user-4'],
  },
  {
    id: 'bill-3',
    group_id: 'group-1',
    title: 'Netflix Subscription',
    total_amount: 22.99,
    tax_amount: 0,
    tip_amount: 0,
    paid_by: 'user-3', // Jordan paid - but Alex NOT involved
    payer: demoUsers[2],
    category: 'entertainment',
    bill_date: '2024-12-15',
    created_at: '2024-12-15T10:00:00Z',
    item_count: 1,
    your_share: 0, // Alex not involved - "not involved"
    participant_count: 2,
    participant_avatars: ['user-3', 'user-4'],
  },
  
  // More "Not Involved" bills on same day as others
  {
    id: 'bill-not-1',
    group_id: 'group-1',
    title: 'Sam & Jordan Lunch',
    total_amount: 34.50,
    tax_amount: 2.76,
    tip_amount: 5.18,
    paid_by: 'user-2', // Sam paid - Alex NOT involved
    payer: demoUsers[1],
    category: 'dining',
    bill_date: '2024-12-15',
    created_at: '2024-12-15T12:30:00Z',
    item_count: 2,
    your_share: 0, // Not involved
    participant_count: 2,
    participant_avatars: ['user-2', 'user-3'],
  },
  {
    id: 'bill-not-2',
    group_id: 'group-1',
    title: 'Casey Gym Membership',
    total_amount: 49.99,
    tax_amount: 0,
    tip_amount: 0,
    paid_by: 'user-4', // Casey paid - Alex NOT involved
    payer: demoUsers[3],
    category: 'other',
    bill_date: '2024-12-14',
    created_at: '2024-12-14T08:00:00Z',
    item_count: 1,
    your_share: 0, // Not involved
    participant_count: 1,
    participant_avatars: ['user-4'],
  },
  {
    id: 'bill-not-3',
    group_id: 'group-1',
    title: 'Jordan & Casey Movie',
    total_amount: 28.00,
    tax_amount: 0,
    tip_amount: 0,
    paid_by: 'user-3', // Jordan paid - Alex NOT involved
    payer: demoUsers[2],
    category: 'entertainment',
    bill_date: '2024-12-12',
    created_at: '2024-12-12T19:00:00Z',
    item_count: 2,
    your_share: 0, // Not involved
    participant_count: 2,
    participant_avatars: ['user-3', 'user-4'],
  },
  {
    id: 'bill-4',
    group_id: 'group-1',
    title: 'Electric Bill - December',
    total_amount: 145.00,
    tax_amount: 0,
    tip_amount: 0,
    paid_by: 'user-1', // Alex paid (current user)
    payer: demoUsers[0],
    category: 'utilities',
    bill_date: '2024-12-12',
    created_at: '2024-12-12T09:00:00Z',
    item_count: 1,
    your_share: 36.25, // Equal split 4 ways
    participant_count: 4,
    participant_avatars: ['user-1', 'user-2', 'user-3', 'user-4'],
  },
  {
    id: 'bill-5',
    group_id: 'group-1',
    title: 'Target Household Items',
    total_amount: 89.99,
    tax_amount: 7.20,
    tip_amount: 0,
    paid_by: 'user-4', // Casey paid
    payer: demoUsers[3],
    category: 'shopping',
    bill_date: '2024-12-10',
    created_at: '2024-12-10T15:30:00Z',
    item_count: 6,
    your_share: 22.50,
    participant_count: 4,
    participant_avatars: ['user-1', 'user-2', 'user-3', 'user-4'],
  },
  {
    id: 'bill-6',
    group_id: 'group-1',
    title: 'Spotify Family Plan',
    total_amount: 16.99,
    tax_amount: 0,
    tip_amount: 0,
    paid_by: 'user-2', // Sam paid - Alex NOT involved
    payer: demoUsers[1],
    category: 'entertainment',
    bill_date: '2024-12-10',
    created_at: '2024-12-10T11:00:00Z',
    item_count: 1,
    your_share: 0, // Not involved
    participant_count: 2,
    participant_avatars: ['user-2', 'user-3'],
  },
  
  // November 2024
  {
    id: 'bill-7',
    group_id: 'group-1',
    title: 'Thanksgiving Dinner',
    total_amount: 219.00,
    tax_amount: 18.50,
    tip_amount: 0,
    discount_amount: 15.50, // Store savings
    paid_by: 'user-1', // Alex paid
    payer: demoUsers[0],
    category: 'groceries',
    bill_date: '2024-11-28',
    created_at: '2024-11-28T14:00:00Z',
    item_count: 15,
    your_share: 54.42,
    participant_count: 4,
    participant_avatars: ['user-1', 'user-2', 'user-3', 'user-4'],
  },
  {
    id: 'bill-8',
    group_id: 'group-1',
    title: 'Internet Bill - November',
    total_amount: 89.99,
    tax_amount: 0,
    tip_amount: 0,
    paid_by: 'user-3', // Jordan paid
    payer: demoUsers[2],
    category: 'utilities',
    bill_date: '2024-11-15',
    created_at: '2024-11-15T10:00:00Z',
    item_count: 1,
    your_share: 22.50,
    participant_count: 4,
    participant_avatars: ['user-1', 'user-2', 'user-3', 'user-4'],
  },
  {
    id: 'bill-9',
    group_id: 'group-1',
    title: 'Internet Bill - November',
    total_amount: 89.99,
    tax_amount: 0,
    tip_amount: 0,
    paid_by: 'user-3', // Jordan paid
    payer: demoUsers[2],
    category: 'utilities',
    bill_date: '2024-11-15',
    created_at: '2024-11-15T10:00:00Z',
    item_count: 1,
    your_share: 22.50,
    participant_count: 4,
    participant_avatars: ['user-1', 'user-2', 'user-3', 'user-4'],
  },
  {
    id: 'bill-10',
    group_id: 'group-1',
    title: 'Internet Bill - November',
    total_amount: 89.99,
    tax_amount: 0,
    tip_amount: 0,
    paid_by: 'user-3', // Jordan paid
    payer: demoUsers[2],
    category: 'utilities',
    bill_date: '2024-11-15',
    created_at: '2024-11-15T10:00:00Z',
    item_count: 1,
    your_share: 22.50,
    participant_count: 4,
    participant_avatars: ['user-1', 'user-2', 'user-3', 'user-4'],
  },
  {
    id: 'bill-11',
    group_id: 'group-1',
    title: 'Internet Bill - November',
    total_amount: 89.99,
    tax_amount: 0,
    tip_amount: 0,
    paid_by: 'user-3', // Jordan paid
    payer: demoUsers[2],
    category: 'utilities',
    bill_date: '2024-11-15',
    created_at: '2024-11-15T10:00:00Z',
    item_count: 1,
    your_share: 22.50,
    participant_count: 4,
    participant_avatars: ['user-1', 'user-2', 'user-3', 'user-4'],
  },
  {
    id: 'bill-12',
    group_id: 'group-1',
    title: 'Internet Bill - November',
    total_amount: 89.99,
    tax_amount: 0,
    tip_amount: 0,
    paid_by: 'user-3', // Jordan paid
    payer: demoUsers[2],
    category: 'utilities',
    bill_date: '2024-11-15',
    created_at: '2024-11-15T10:00:00Z',
    item_count: 1,
    your_share: 22.50,
    participant_count: 4,
    participant_avatars: ['user-1', 'user-2', 'user-3', 'user-4'],
  },
  {
    id: 'bill-13',
    group_id: 'group-1',
    title: 'Game Night Snacks',
    total_amount: 40.00,
    tax_amount: 3.60,
    tip_amount: 0,
    discount_amount: 5.00, // Snack promo
    paid_by: 'user-4', // Casey paid
    payer: demoUsers[3],
    category: 'dining',
    bill_date: '2024-11-10',
    created_at: '2024-11-10T20:00:00Z',
    item_count: 5,
    your_share: 9.89,
    participant_count: 4,
    participant_avatars: ['user-1', 'user-2', 'user-3', 'user-4'],
  },

  // October 2024
  {
    id: 'bill-14',
    group_id: 'group-1',
    title: 'Halloween Party',
    total_amount: 156.00,
    tax_amount: 12.00,
    tip_amount: 0,
    paid_by: 'user-2', // Sam paid
    payer: demoUsers[1],
    category: 'entertainment',
    bill_date: '2024-10-31',
    created_at: '2024-10-31T16:00:00Z',
    item_count: 8,
    your_share: 39.00,
    participant_count: 4,
    participant_avatars: ['user-1', 'user-2', 'user-3', 'user-4'],
  },
  {
    id: 'bill-15',
    group_id: 'group-1',
    title: 'Halloween Party',
    total_amount: 156.00,
    tax_amount: 12.00,
    tip_amount: 0,
    paid_by: 'user-2', // Sam paid
    payer: demoUsers[1],
    category: 'entertainment',
    bill_date: '2024-10-31',
    created_at: '2024-10-31T16:00:00Z',
    item_count: 8,
    your_share: 39.00,
    participant_count: 4,
    participant_avatars: ['user-1', 'user-2', 'user-3', 'user-4'],
  },
  {
    id: 'bill-16',
    group_id: 'group-1',
    title: 'Halloween Party',
    total_amount: 156.00,
    tax_amount: 12.00,
    tip_amount: 0,
    paid_by: 'user-2', // Sam paid
    payer: demoUsers[1],
    category: 'entertainment',
    bill_date: '2024-10-31',
    created_at: '2024-10-31T16:00:00Z',
    item_count: 8,
    your_share: 39.00,
    participant_count: 4,
    participant_avatars: ['user-1', 'user-2', 'user-3', 'user-4'],
  },

  // ===== GROUP 2: Trip Squad =====
  
  {
    id: 'bill-17',
    group_id: 'group-2',
    title: 'Ski Trip Cabin',
    total_amount: 600.00,
    tax_amount: 52.00,
    tip_amount: 0,
    discount_amount: 50.00, // Early bird
    paid_by: 'user-2', // Sam paid
    payer: demoUsers[1],
    category: 'travel',
    bill_date: '2024-12-14',
    created_at: '2024-12-14T14:20:00Z',
    item_count: 1,
    your_share: 198.56,
    participant_count: 3,
    participant_avatars: ['user-1', 'user-2', 'user-3'],
  },
  {
    id: 'bill-18',
    group_id: 'group-2',
    title: 'Ski Lift Passes',
    total_amount: 375.00,
    tax_amount: 30.00,
    tip_amount: 0,
    paid_by: 'user-1', // Alex paid
    payer: demoUsers[0],
    category: 'entertainment',
    bill_date: '2024-12-14',
    created_at: '2024-12-14T09:00:00Z',
    item_count: 3,
    your_share: 125.00,
    participant_count: 3,
    participant_avatars: ['user-1', 'user-2', 'user-3'],
  },
  {
    id: 'bill-19',
    group_id: 'group-2',
    title: 'Mountain Restaurant',
    total_amount: 127.50,
    tax_amount: 10.20,
    tip_amount: 19.13,
    paid_by: 'user-3', // Jordan paid
    payer: demoUsers[2],
    category: 'dining',
    bill_date: '2024-12-13',
    created_at: '2024-12-13T13:00:00Z',
    item_count: 6,
    your_share: 42.50,
    participant_count: 3,
    participant_avatars: ['user-1', 'user-2', 'user-3'],
  },
  {
    id: 'bill-20',
    group_id: 'group-2',
    title: 'Gas for Road Trip',
    total_amount: 85.00,
    tax_amount: 0,
    tip_amount: 0,
    paid_by: 'user-1', // Alex paid
    payer: demoUsers[0],
    category: 'transport',
    bill_date: '2024-12-12',
    created_at: '2024-12-12T08:00:00Z',
    item_count: 1,
    your_share: 28.33,
    participant_count: 3,
    participant_avatars: ['user-1', 'user-2', 'user-3'],
  },

  // ===== GROUP 3: Office Lunch =====
  
  {
    id: 'bill-21',
    group_id: 'group-3',
    title: 'Friday Team Pizza',
    total_amount: 95.00,
    tax_amount: 7.60,
    tip_amount: 19.00,
    paid_by: 'user-5', // Morgan paid - but Alex not involved
    payer: demoUsers[4],
    category: 'dining',
    bill_date: '2024-12-13',
    created_at: '2024-12-13T12:45:00Z',
    item_count: 5,
    your_share: 0, // Not involved
    participant_count: 4,
    participant_avatars: ['user-2', 'user-4', 'user-5', 'user-6'],
  },
  {
    id: 'bill-22',
    group_id: 'group-3',
    title: 'Coffee Run',
    total_amount: 42.50,
    tax_amount: 3.40,
    tip_amount: 6.38,
    paid_by: 'user-1', // Alex paid
    payer: demoUsers[0],
    category: 'dining',
    bill_date: '2024-12-12',
    created_at: '2024-12-12T10:30:00Z',
    item_count: 6,
    your_share: 8.50,
    participant_count: 5,
    participant_avatars: ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'],
  },
  {
    id: 'bill-23',
    group_id: 'group-3',
    title: 'Sushi Lunch',
    total_amount: 156.00,
    tax_amount: 12.48,
    tip_amount: 23.40,
    paid_by: 'user-6', // Riley paid
    payer: demoUsers[5],
    category: 'dining',
    bill_date: '2024-12-11',
    created_at: '2024-12-11T13:00:00Z',
    item_count: 8,
    your_share: 32.00,
    participant_count: 6,
    participant_avatars: ['user-1', 'user-2', 'user-3', 'user-4', 'user-5', 'user-6'],
  },
  {
    id: 'bill-24',
    group_id: 'group-3',
    title: 'Birthday Cake for Sam',
    total_amount: 45.00,
    tax_amount: 3.60,
    tip_amount: 0,
    paid_by: 'user-3', // Jordan paid - Alex not involved
    payer: demoUsers[2],
    category: 'other',
    bill_date: '2024-12-10',
    created_at: '2024-12-10T16:00:00Z',
    item_count: 1,
    your_share: 0, // Not involved (it's for Sam)
    participant_count: 5,
    participant_avatars: ['user-3', 'user-4', 'user-5', 'user-6'],
  },
];

// === Demo Bill Items (for Costco Grocery) ===

export const demoBillItems: BillItemWithSplits[] = [
  {
    id: 'item-1',
    bill_id: 'bill-1',
    name: 'Organic Milk 2-pack',
    price: 8.99,
    quantity: 3,
    discount: 1.50, // Display discount per item row logic? No, model says total discount for line.
    category: 'groceries',
    sort_order: 0,
    splits: [
      { id: 's1', item_id: 'item-1', user_id: 'user-1', user: demoUsers[0], split_type: 'equal', amount: 4.5, percentage: null, color_index: 0 },
      { id: 's2', item_id: 'item-1', user_id: 'user-2', user: demoUsers[1], split_type: 'equal', amount: 4.49, percentage: null, color_index: 1 },
    ],
    total_claimed: 8.99,
    unclaimed: 0,
  },
  {
    id: 'item-2',
    bill_id: 'bill-1',
    name: 'Rice 10lb bag',
    price: 18.99,
    quantity: 1,
    category: 'groceries',
    sort_order: 1,
    splits: [
      { id: 's3', item_id: 'item-2', user_id: 'user-1', user: demoUsers[0], split_type: 'percentage', amount: 9.5, percentage: 50, color_index: 0 },
      { id: 's4', item_id: 'item-2', user_id: 'user-3', user: demoUsers[2], split_type: 'percentage', amount: 4.75, percentage: 25, color_index: 2 },
      { id: 's5', item_id: 'item-2', user_id: 'user-4', user: demoUsers[3], split_type: 'percentage', amount: 4.74, percentage: 25, color_index: 3 },
    ],
    total_claimed: 18.99,
    unclaimed: 0,
  },
  {
    id: 'item-3',
    bill_id: 'bill-1',
    name: 'Chocolate Bars 12-pack',
    price: 12.5,
    quantity: 1,
    category: 'groceries',
    sort_order: 2,
    splits: [
      { id: 's6', item_id: 'item-3', user_id: 'user-2', user: demoUsers[1], split_type: 'equal', amount: 12.5, percentage: null, color_index: 1 },
    ],
    total_claimed: 12.5,
    unclaimed: 0,
  },
  {
    id: 'item-4',
    bill_id: 'bill-1',
    name: 'Paper Towels',
    price: 22.0,
    quantity: 1,
    category: 'shopping',
    sort_order: 3,
    splits: [],
    total_claimed: 0,
    unclaimed: 22.0, // Unclaimed!
  },
  {
    id: 'item-5',
    bill_id: 'bill-1',
    name: 'Frozen Pizza 4-pack',
    price: 24.99,
    quantity: 1,
    category: 'groceries',
    sort_order: 4,
    splits: [
      { id: 's7', item_id: 'item-5', user_id: 'user-1', user: demoUsers[0], split_type: 'equal', amount: 6.25, percentage: null, color_index: 0 },
      { id: 's8', item_id: 'item-5', user_id: 'user-2', user: demoUsers[1], split_type: 'equal', amount: 6.25, percentage: null, color_index: 1 },
      { id: 's9', item_id: 'item-5', user_id: 'user-3', user: demoUsers[2], split_type: 'equal', amount: 6.25, percentage: null, color_index: 2 },
      { id: 's10', item_id: 'item-5', user_id: 'user-4', user: demoUsers[3], split_type: 'equal', amount: 6.24, percentage: null, color_index: 3 },
    ],
    total_claimed: 24.99,
    unclaimed: 0,
  },
  {
    id: 'item-6',
    bill_id: 'bill-1',
    name: 'Laundry Detergent',
    price: 19.99,
    quantity: 1,
    category: 'shopping',
    sort_order: 5,
    splits: [
      { id: 's11', item_id: 'item-6', user_id: 'user-1', user: demoUsers[0], split_type: 'equal', amount: 5.00, percentage: null, color_index: 0 },
      { id: 's12', item_id: 'item-6', user_id: 'user-2', user: demoUsers[1], split_type: 'equal', amount: 5.00, percentage: null, color_index: 1 },
      { id: 's13', item_id: 'item-6', user_id: 'user-3', user: demoUsers[2], split_type: 'equal', amount: 5.00, percentage: null, color_index: 2 },
      { id: 's14', item_id: 'item-6', user_id: 'user-4', user: demoUsers[3], split_type: 'equal', amount: 4.99, percentage: null, color_index: 3 },
    ],
    total_claimed: 19.99,
    unclaimed: 0,
  },
];

// === Demo Activity ===

export const demoActivities: Activity[] = [
  {
    id: 'act-1',
    group_id: 'group-1',
    group: { id: 'group-1', name: 'Roommates', emoji: '🏠' },
    user_id: 'user-1',
    user: demoUsers[0],
    type: 'bill_created',
    entity_type: 'bill',
    entity_id: 'bill-1',
    metadata: { title: 'Costco Grocery Run', amount: 187.45 },
    created_at: '2024-12-15T18:30:00Z',
  },
  {
    id: 'act-2',
    group_id: 'group-1',
    group: { id: 'group-1', name: 'Roommates', emoji: '🏠' },
    user_id: 'user-2',
    user: demoUsers[1],
    type: 'bill_created',
    entity_type: 'bill',
    entity_id: 'bill-2',
    metadata: { title: 'Pizza Night', amount: 68.50 },
    created_at: '2024-12-15T21:00:00Z',
  },
  {
    id: 'act-3',
    group_id: 'group-2',
    group: { id: 'group-2', name: 'Trip Squad', emoji: '✈️' },
    user_id: 'user-2',
    user: demoUsers[1],
    type: 'bill_created',
    entity_type: 'bill',
    entity_id: 'bill-11',
    metadata: { title: 'Ski Trip Cabin', amount: 650.00 },
    created_at: '2024-12-14T14:20:00Z',
  },
  {
    id: 'act-4',
    group_id: 'group-1',
    group: { id: 'group-1', name: 'Roommates', emoji: '🏠' },
    user_id: 'user-2',
    user: demoUsers[1],
    type: 'item_selected',
    entity_type: 'bill',
    entity_id: 'bill-1',
    metadata: { item_name: 'Organic Milk 2-pack', bill_title: 'Costco Grocery Run' },
    created_at: '2024-12-15T18:45:00Z',
  },
  {
    id: 'act-5',
    group_id: 'group-1',
    group: { id: 'group-1', name: 'Roommates', emoji: '🏠' },
    user_id: 'user-3',
    user: demoUsers[2],
    type: 'settlement_created',
    entity_type: 'settlement',
    entity_id: 'settle-1',
    metadata: { amount: 25.0, to_user: 'Alex Johnson' },
    created_at: '2024-12-14T14:00:00Z',
  },
  {
    id: 'act-6',
    group_id: 'group-3',
    group: { id: 'group-3', name: 'Office Lunch', emoji: '🍕' },
    user_id: 'user-6',
    user: demoUsers[5],
    type: 'bill_created',
    entity_type: 'bill',
    entity_id: 'bill-17',
    metadata: { title: 'Sushi Lunch', amount: 156.00 },
    created_at: '2024-12-11T13:00:00Z',
  },
  {
    id: 'act-7',
    group_id: 'group-2',
    group: { id: 'group-2', name: 'Trip Squad', emoji: '✈️' },
    user_id: 'user-1',
    user: demoUsers[0],
    type: 'bill_created',
    entity_type: 'bill',
    entity_id: 'bill-12',
    metadata: { title: 'Ski Lift Passes', amount: 375.00 },
    created_at: '2024-12-14T09:00:00Z',
  },
  {
    id: 'act-8',
    group_id: 'group-1',
    group: { id: 'group-1', name: 'Roommates', emoji: '🏠' },
    user_id: 'user-4',
    user: demoUsers[3],
    type: 'member_joined',
    entity_type: 'group',
    entity_id: 'group-1',
    metadata: {},
    created_at: '2024-12-10T16:45:00Z',
  },
];

// === Demo Balances ===

export const demoBalances: MemberBalance[] = [
  { user_id: 'user-2', user: demoUsers[1], balance: -85.67, color_index: 1 }, // You owe Sam
  { user_id: 'user-3', user: demoUsers[2], balance: 52.25, color_index: 2 },  // Jordan owes you
  { user_id: 'user-4', user: demoUsers[3], balance: 31.00, color_index: 3 },  // Casey owes you
  { user_id: 'user-5', user: demoUsers[4], balance: -12.50, color_index: 4 }, // You owe Morgan
  { user_id: 'user-6', user: demoUsers[5], balance: 18.00, color_index: 5 },  // Riley owes you
];
