/**
 * PrismSplit Demo Data
 * 
 * Mock data for development and testing.
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
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'user-2',
    email: 'sam@example.com',
    full_name: 'Sam Wilson',
    avatar_url: null,
    created_at: '2024-01-20T14:30:00Z',
  },
  {
    id: 'user-3',
    email: 'jordan@example.com',
    full_name: 'Jordan Lee',
    avatar_url: null,
    created_at: '2024-02-01T09:15:00Z',
  },
  {
    id: 'user-4',
    email: 'casey@example.com',
    full_name: 'Casey Chen',
    avatar_url: null,
    created_at: '2024-02-10T16:45:00Z',
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
    last_activity_at: '2024-12-10T18:30:00Z',
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
    your_balance: -25.0,
    last_activity_at: '2024-12-08T14:20:00Z',
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
    your_balance: 12.75,
    last_activity_at: '2024-12-09T12:45:00Z',
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
};

// === Demo Bills ===

export const demoBills: BillSummary[] = [
  {
    id: 'bill-1',
    group_id: 'group-1',
    title: 'Costco Grocery',
    total_amount: 142.5,
    tax_amount: 8.5,
    tip_amount: 0,
    paid_by: 'user-1',
    payer: demoUsers[0],
    category: 'groceries',
    status: 'finalized',
    bill_date: '2024-12-10',
    created_at: '2024-12-10T18:30:00Z',
    item_count: 8,
    your_share: 35.5,
    participant_count: 4,
    participant_avatars: ['user-1', 'user-2', 'user-3'],
  },
  {
    id: 'bill-2',
    group_id: 'group-1',
    title: 'Utilities - December',
    total_amount: 180.0,
    tax_amount: 0,
    tip_amount: 0,
    paid_by: 'user-2',
    payer: demoUsers[1],
    category: 'utilities',
    status: 'shared',
    bill_date: '2024-12-05',
    created_at: '2024-12-05T09:00:00Z',
    item_count: 3,
    your_share: 45.0,
    participant_count: 4,
    participant_avatars: ['user-1', 'user-2', 'user-3'],
  },
  {
    id: 'bill-3',
    group_id: 'group-2',
    title: 'Ski Trip Cabin',
    total_amount: 450.0,
    tax_amount: 35.0,
    tip_amount: 0,
    paid_by: 'user-2',
    payer: demoUsers[1],
    category: 'travel',
    status: 'finalized',
    bill_date: '2024-12-08',
    created_at: '2024-12-08T14:20:00Z',
    item_count: 1,
    your_share: 150.0,
    participant_count: 3,
    participant_avatars: ['user-1', 'user-2', 'user-3'],
  },
];

// === Demo Bill Items (for Costco Grocery) ===

export const demoBillItems: BillItemWithSplits[] = [
  {
    id: 'item-1',
    bill_id: 'bill-1',
    name: 'Organic Milk 2-pack',
    price: 8.99,
    quantity: 1,
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
    sort_order: 3,
    splits: [],
    total_claimed: 0,
    unclaimed: 22.0, // Unclaimed!
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
    metadata: { title: 'Costco Grocery', amount: 142.5 },
    created_at: '2024-12-10T18:30:00Z',
  },
  {
    id: 'act-2',
    group_id: 'group-1',
    group: { id: 'group-1', name: 'Roommates', emoji: '🏠' },
    user_id: 'user-2',
    user: demoUsers[1],
    type: 'item_selected',
    entity_type: 'bill',
    entity_id: 'bill-1',
    metadata: { item_name: 'Organic Milk 2-pack' },
    created_at: '2024-12-10T18:45:00Z',
  },
  {
    id: 'act-3',
    group_id: 'group-1',
    group: { id: 'group-1', name: 'Roommates', emoji: '🏠' },
    user_id: 'user-3',
    user: demoUsers[2],
    type: 'settlement_created',
    entity_type: 'settlement',
    entity_id: 'settle-1',
    metadata: { amount: 25.0, to_user: 'Alex Johnson' },
    created_at: '2024-12-09T14:00:00Z',
  },
];

// === Demo Balances ===

export const demoBalances: MemberBalance[] = [
  { user_id: 'user-2', user: demoUsers[1], balance: -15.5, color_index: 1 }, // You owe them
  { user_id: 'user-3', user: demoUsers[2], balance: 32.0, color_index: 2 },  // They owe you
  { user_id: 'user-4', user: demoUsers[3], balance: 31.0, color_index: 3 },  // They owe you
];
