# PrismSplit API Contract

> REST API specification for PrismSplit v1.0  
> Frontend ↔ Backend interface documentation

---

## 🔐 Authentication

All endpoints (except auth) require Bearer token:

```
Authorization: Bearer <access_token>
```

### Base URL
- **Development:** `http://localhost:3000/api`
- **Production:** `https://api.prismsplit.com/v1`

---

## 📡 Endpoints

### Authentication

#### `POST /auth/signup`
Create new account.

**Request:**
```typescript
{
  email: string;
  password: string;
  full_name: string;
}
```

**Response:** `201 Created`
```typescript
{
  user: User;
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}
```

---

#### `POST /auth/login`
Login with email/password.

**Request:**
```typescript
{
  email: string;
  password: string;
}
```

**Response:** `200 OK`
```typescript
{
  user: User;
  session: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}
```

---

#### `POST /auth/login/google`
OAuth with Google.

**Request:**
```typescript
{
  id_token: string;  // From Google Sign-In
}
```

---

#### `POST /auth/logout`
End session.

**Response:** `204 No Content`

---

#### `POST /auth/refresh`
Refresh access token.

**Request:**
```typescript
{
  refresh_token: string;
}
```

---

#### `GET /auth/me`
Get current user.

**Response:** `200 OK`
```typescript
{
  user: User;
}
```

---

### Users

#### `PATCH /users/me`
Update current user profile.

**Request:**
```typescript
{
  full_name?: string;
  avatar_url?: string;
}
```

---

### Groups

#### `GET /groups`
List user's groups.

**Response:** `200 OK`
```typescript
{
  groups: GroupWithBalance[];
}
```

---

#### `POST /groups`
Create new group.

**Request:**
```typescript
{
  name: string;
  emoji?: string;  // Default: '👥'
  currency?: string;  // Default: 'USD'
}
```

**Response:** `201 Created`
```typescript
{
  group: Group;
  invite_code: string;
}
```

---

#### `GET /groups/:id`
Get group details.

**Response:** `200 OK`
```typescript
{
  group: Group;
  members: GroupMember[];
  your_balance: number;
}
```

---

#### `PATCH /groups/:id`
Update group (admin only).

**Request:**
```typescript
{
  name?: string;
  emoji?: string;
}
```

---

#### `DELETE /groups/:id`
Delete group (admin only). All bills are deleted.

**Response:** `204 No Content`

---

#### `POST /groups/:id/invite/regenerate`
Generate new invite code/link.

**Response:** `200 OK`
```typescript
{
  invite_code: string;
  invite_link: string;
  expires_at: string;
}
```

---

#### `POST /groups/join`
Join group via invite code.

**Request:**
```typescript
{
  invite_code: string;
}
```

**Response:** `200 OK`
```typescript
{
  group: Group;
}
```

---

#### `DELETE /groups/:id/members/:userId`
Remove member from group (admin only).

**Response:** `204 No Content`

---

#### `POST /groups/:id/leave`
Leave a group.

**Response:** `204 No Content`

---

### Bills

#### `GET /groups/:groupId/bills`
List bills in a group.

**Query Params:**
- `status`: 'draft' | 'shared' | 'finalized' (optional)
- `limit`: number (default: 20)
- `cursor`: string (pagination)

**Response:** `200 OK`
```typescript
{
  bills: BillSummary[];
  next_cursor: string | null;
}
```

---

#### `POST /groups/:groupId/bills`
Create new bill.

**Request:**
```typescript
{
  title: string;
  category?: Category;
  bill_date?: string;  // ISO date
  paid_by?: string;  // User ID, defaults to current user
  items: {
    name: string;
    price: number;
    quantity?: number;
  }[];
  tax_amount?: number;
  tip_amount?: number;
}
```

**Response:** `201 Created`
```typescript
{
  bill: Bill;
}
```

---

#### `GET /bills/:id`
Get bill with all items and splits.

**Response:** `200 OK`
```typescript
{
  bill: Bill;
  items: BillItemWithSplits[];
  summary: {
    subtotal: number;
    tax: number;
    tip: number;
    total: number;
    user_shares: UserShare[];
  };
}
```

---

#### `PATCH /bills/:id`
Update bill (creator only, before finalized).

**Request:**
```typescript
{
  title?: string;
  category?: Category;
  tax_amount?: number;
  tip_amount?: number;
}
```

---

#### `POST /bills/:id/share`
Share bill with group (enables self-select).

**Response:** `200 OK`
```typescript
{
  bill: Bill;  // status: 'shared'
}
```

---

#### `POST /bills/:id/finalize`
Lock bill (no more changes).

**Response:** `200 OK`
```typescript
{
  bill: Bill;  // status: 'finalized'
}
```

---

#### `DELETE /bills/:id`
Delete bill (creator only).

**Response:** `204 No Content`

---

### Bill Items

#### `POST /bills/:billId/items`
Add item to bill.

**Request:**
```typescript
{
  name: string;
  price: number;
  quantity?: number;
}
```

---

#### `PATCH /bills/:billId/items/:itemId`
Update item.

**Request:**
```typescript
{
  name?: string;
  price?: number;
  quantity?: number;
}
```

---

#### `DELETE /bills/:billId/items/:itemId`
Remove item.

**Response:** `204 No Content`

---

### Item Splits (Self-Select)

#### `POST /bills/:billId/items/:itemId/join`
Join an item split (self-select).

**Request:**
```typescript
{
  split_type?: 'equal' | 'percentage' | 'amount';
  percentage?: number;  // If split_type = 'percentage'
  amount?: number;  // If split_type = 'amount'
}
```

**Response:** `200 OK`
```typescript
{
  item: BillItemWithSplits;
}
```

---

#### `DELETE /bills/:billId/items/:itemId/leave`
Leave an item split.

**Response:** `204 No Content`

---

#### `PATCH /bills/:billId/items/:itemId/splits/:userId`
Update someone's split (bill creator only).

**Request:**
```typescript
{
  split_type: 'equal' | 'percentage' | 'amount';
  percentage?: number;
  amount?: number;
}
```

---

### Settlements

#### `GET /groups/:groupId/settlements`
List settlements in group.

**Response:** `200 OK`
```typescript
{
  settlements: Settlement[];
}
```

---

#### `POST /groups/:groupId/settlements`
Record a settlement (external payment).

**Request:**
```typescript
{
  to_user: string;  // User ID receiving payment
  amount: number;
  notes?: string;
}
```

**Response:** `201 Created`
```typescript
{
  settlement: Settlement;
}
```

---

### Activity

#### `GET /activity`
Get activity feed for current user.

**Query Params:**
- `group_id`: string (optional - filter by group)
- `limit`: number (default: 20)
- `cursor`: string (pagination)

**Response:** `200 OK`
```typescript
{
  activities: Activity[];
  next_cursor: string | null;
}
```

---

### Balances

#### `GET /groups/:groupId/balances`
Get all member balances in a group.

**Response:** `200 OK`
```typescript
{
  balances: MemberBalance[];
}
```

---

#### `GET /balances/summary`
Get user's total balance across all groups.

**Response:** `200 OK`
```typescript
{
  total_owed: number;  // What others owe you
  total_owing: number;  // What you owe others
  net_balance: number;
  by_group: GroupBalanceSummary[];
}
```

---

## 📦 Type Definitions

```typescript
// === Core Models ===

interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
}

interface Group {
  id: string;
  name: string;
  emoji: string;
  currency: string;
  invite_code: string;
  created_by: string;
  created_at: string;
  member_count: number;
}

interface GroupMember {
  id: string;
  user_id: string;
  user: User;
  role: 'admin' | 'member';
  color_index: number;  // 0-5 for avatar colors
  joined_at: string;
}

interface GroupWithBalance extends Group {
  your_balance: number;
  last_activity_at: string;
}

// === Bills ===

type Category = 
  | 'groceries' 
  | 'dining' 
  | 'transport' 
  | 'utilities' 
  | 'entertainment' 
  | 'travel' 
  | 'shopping'
  | 'other';

type BillStatus = 'draft' | 'shared' | 'finalized';

interface Bill {
  id: string;
  group_id: string;
  title: string;
  total_amount: number;
  tax_amount: number;
  tip_amount: number;
  paid_by: string;
  payer: User;
  category: Category;
  status: BillStatus;
  bill_date: string;
  created_at: string;
}

interface BillSummary extends Bill {
  item_count: number;
  your_share: number;
  participant_count: number;
  participant_avatars: string[];  // First 3 user IDs
}

interface BillItem {
  id: string;
  bill_id: string;
  name: string;
  price: number;
  quantity: number;
  sort_order: number;
}

interface ItemSplit {
  id: string;
  item_id: string;
  user_id: string;
  user: User;
  split_type: 'equal' | 'percentage' | 'amount';
  amount: number;
  percentage: number | null;
  color_index: number;
}

interface BillItemWithSplits extends BillItem {
  splits: ItemSplit[];
  total_claimed: number;  // Sum of split amounts
  unclaimed: number;  // Price - total_claimed
}

interface UserShare {
  user_id: string;
  user: User;
  amount: number;
  item_count: number;
}

// === Settlements ===

interface Settlement {
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

type ActivityType = 
  | 'bill_created'
  | 'bill_shared'
  | 'bill_finalized'
  | 'item_selected'
  | 'settlement_created'
  | 'member_joined';

interface Activity {
  id: string;
  group_id: string;
  group: { name: string; emoji: string };
  user_id: string;
  user: User;
  type: ActivityType;
  entity_type: 'bill' | 'settlement' | 'group';
  entity_id: string;
  metadata: Record<string, any>;
  created_at: string;
}

// === Balances ===

interface MemberBalance {
  user_id: string;
  user: User;
  balance: number;  // Positive = they owe you, negative = you owe them
  color_index: number;
}

interface GroupBalanceSummary {
  group_id: string;
  group_name: string;
  group_emoji: string;
  balance: number;
}
```

---

## 🔄 Real-time Subscriptions

For Self-Select feature, subscribe to WebSocket channels:

### Subscribe to Bill Updates
```typescript
// Channel: bill:{billId}
// Events:
// - item_split:created
// - item_split:deleted
// - item_split:updated
// - bill:status_changed

{
  event: 'item_split:created',
  payload: {
    item_id: string;
    split: ItemSplit;
  }
}
```

---

## ❌ Error Responses

All errors follow this format:

```typescript
{
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  }
}
```

### Common Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `unauthorized` | 401 | Invalid or missing token |
| `forbidden` | 403 | Insufficient permissions |
| `not_found` | 404 | Resource doesn't exist |
| `validation_error` | 400 | Invalid request body |
| `conflict` | 409 | Already exists (e.g., duplicate) |
| `rate_limited` | 429 | Too many requests |

---

## 🔮 v2+ Extensibility (Planned Endpoints)

> These endpoints will be added in future versions. The current API is designed to extend without breaking changes.

### v1.1: Recurring Bills
```typescript
// GET /groups/:groupId/recurring-bills
// POST /groups/:groupId/recurring-bills
// PATCH /recurring-bills/:id
// DELETE /recurring-bills/:id

interface RecurringBill {
  id: string;
  group_id: string;
  template_bill: Bill;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'yearly';
  next_due_date: string;
  is_active: boolean;
}
```

### v2.0: Shopping Lists (Pantry World)
```typescript
// GET /groups/:groupId/shopping-lists
// POST /groups/:groupId/shopping-lists
// GET /shopping-lists/:id
// POST /shopping-lists/:id/items
// POST /shopping-lists/:id/checkout → Creates Bill (Wormhole)

interface ShoppingList {
  id: string;
  group_id: string;
  name: string;
  status: 'active' | 'purchased' | 'cancelled';
  purchased_bill_id: string | null;  // Wormhole to Finance World
  items: ShoppingItem[];
}

interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  estimated_price: number | null;
  added_by: User;
  split_requests: ShoppingItemRequest[];
}
```

### v2.0: Inventory / Stock Status
```typescript
// GET /groups/:groupId/inventory
// PATCH /inventory/:id/status

interface InventoryItem {
  id: string;
  name: string;
  stock_status: 'in_stock' | 'low' | 'out_of_stock';
  last_purchased_at: string;
  source_bill_item_id: string;  // Wormhole back to bill
  participants: string[];  // User IDs who can update status
}
```

### v3.0: Payment Links
```typescript
// POST /settlements/:id/pay → Returns payment deeplink
// GET /settlements/:id/status

interface PaymentLink {
  provider: 'venmo' | 'paypal' | 'cashapp';
  deeplink_url: string;
  status: 'pending' | 'completed';
}
```

### Type Extensions (Backward Compatible)

These optional fields will be added to existing types:

```typescript
// Bill (v2)
interface Bill {
  // ... existing fields
  source_shopping_list_id?: string;  // v2: Wormhole from shopping list
  is_recurring?: boolean;  // v1.1: Created from template
  recurring_bill_id?: string;  // v1.1: Source template
}

// BillItem (v2)
interface BillItem {
  // ... existing fields
  source_shopping_item_id?: string;  // v2: Wormhole from shopping item
  inventory_id?: string;  // v2: Created inventory entry
}

// Activity (v2)
type ActivityType = 
  // ... existing types
  | 'shopping_list_created'
  | 'shopping_list_purchased'
  | 'stock_status_changed'
  | 'recurring_bill_created';
```

---

*This API contract defines the frontend-backend interface. Implementation details are in the private backend repository.*
