# PrismSplit Database Schema

> PostgreSQL database design for PrismSplit v1.0 (Finance MVP)  
> Uses Supabase with Row Level Security (RLS)

---

## 📊 Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────────┐       ┌─────────────┐
│   users     │       │  group_members  │       │   groups    │
├─────────────┤       ├─────────────────┤       ├─────────────┤
│ id (PK)     │◄──────│ user_id (FK)    │       │ id (PK)     │
│ email       │       │ group_id (FK)   │──────►│ name        │
│ full_name   │       │ role            │       │ emoji       │
│ avatar_url  │       │ joined_at       │       │ currency    │
│ created_at  │       │ color_index     │       │ created_by  │
└─────────────┘       └─────────────────┘       │ created_at  │
                                                └─────────────┘
                                                       │
                              ┌────────────────────────┘
                              ▼
                      ┌─────────────────┐
                      │     bills       │
                      ├─────────────────┤
                      │ id (PK)         │
                      │ group_id (FK)   │
                      │ title           │
                      │ total_amount    │
                      │ paid_by (FK)    │
                      │ category        │
                      │ status          │
                      │ created_at      │
                      └────────┬────────┘
                               │
              ┌────────────────┴────────────────┐
              ▼                                 ▼
      ┌───────────────┐                ┌─────────────────┐
      │  bill_items   │                │   settlements   │
      ├───────────────┤                ├─────────────────┤
      │ id (PK)       │                │ id (PK)         │
      │ bill_id (FK)  │                │ group_id (FK)   │
      │ name          │                │ from_user (FK)  │
      │ price         │                │ to_user (FK)    │
      │ quantity      │                │ amount          │
      │ created_at    │                │ created_at      │
      └───────┬───────┘                └─────────────────┘
              │
              ▼
      ┌───────────────┐
      │  item_splits  │
      ├───────────────┤
      │ id (PK)       │
      │ item_id (FK)  │
      │ user_id (FK)  │
      │ split_type    │
      │ amount        │
      │ percentage    │
      │ created_at    │
      └───────────────┘
```

---

## 📋 Table Definitions

### 1. `users`

User accounts (synced with Supabase Auth).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | User's unique ID (matches auth.users.id) |
| `email` | `text` | UNIQUE, NOT NULL | Email address |
| `full_name` | `text` | NOT NULL | Display name |
| `avatar_url` | `text` | NULLABLE | Profile photo URL |
| `created_at` | `timestamptz` | DEFAULT `now()` | Account creation time |
| `updated_at` | `timestamptz` | DEFAULT `now()` | Last profile update |

#### Indexes
- `users_email_idx` on `email`

---

### 2. `groups`

Expense groups (Roommates, Trips, etc.).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | Group ID |
| `name` | `text` | NOT NULL, max 50 chars | Group name |
| `emoji` | `text` | DEFAULT '👥' | Group avatar emoji |
| `currency` | `text` | NOT NULL, DEFAULT 'USD' | ISO currency code |
| `invite_code` | `text` | UNIQUE, 6 chars | Invite code for joining |
| `invite_expires_at` | `timestamptz` | NULLABLE | When invite expires |
| `created_by` | `uuid` | FK → users.id | Group creator |
| `created_at` | `timestamptz` | DEFAULT `now()` | Creation time |
| `updated_at` | `timestamptz` | DEFAULT `now()` | Last update |

#### Indexes
- `groups_invite_code_idx` on `invite_code`
- `groups_created_by_idx` on `created_by`

---

### 3. `group_members`

Users within groups (many-to-many).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | Membership ID |
| `group_id` | `uuid` | FK → groups.id, ON DELETE CASCADE | Group |
| `user_id` | `uuid` | FK → users.id, ON DELETE CASCADE | User |
| `role` | `text` | DEFAULT 'member' | 'admin' or 'member' |
| `color_index` | `int` | NOT NULL, 0-5 | Avatar color (0=lavender, 1=sky, 2=sage, 3=peach, 4=rose, 5=mint) |
| `joined_at` | `timestamptz` | DEFAULT `now()` | When user joined |

#### Constraints
- UNIQUE (`group_id`, `user_id`) — No duplicate memberships

#### Indexes
- `group_members_user_idx` on `user_id`
- `group_members_group_idx` on `group_id`

---

### 4. `bills`

Expense records within groups.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | Bill ID |
| `group_id` | `uuid` | FK → groups.id, ON DELETE CASCADE | Parent group |
| `title` | `text` | NOT NULL, max 100 chars | Bill description |
| `total_amount` | `numeric(12,2)` | NOT NULL, CHECK > 0 | Total bill amount |
| `paid_by` | `uuid` | FK → users.id | Who paid |
| `category` | `text` | DEFAULT 'general' | Category: groceries, dining, transport, utilities, entertainment, travel, other |
| `status` | `text` | DEFAULT 'draft' | 'draft', 'shared', 'finalized' |
| `bill_date` | `date` | DEFAULT `CURRENT_DATE` | Date of expense |
| `tax_amount` | `numeric(12,2)` | DEFAULT 0 | Tax |
| `tip_amount` | `numeric(12,2)` | DEFAULT 0 | Tip |
| `notes` | `text` | NULLABLE | Optional notes |
| `created_at` | `timestamptz` | DEFAULT `now()` | Creation time |
| `updated_at` | `timestamptz` | DEFAULT `now()` | Last update |

#### Indexes
- `bills_group_idx` on `group_id`
- `bills_paid_by_idx` on `paid_by`
- `bills_status_idx` on `status`

---

### 5. `bill_items`

Individual items within a bill.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | Item ID |
| `bill_id` | `uuid` | FK → bills.id, ON DELETE CASCADE | Parent bill |
| `name` | `text` | NOT NULL | Item name |
| `price` | `numeric(12,2)` | NOT NULL, CHECK >= 0 | Item price |
| `quantity` | `int` | DEFAULT 1, CHECK > 0 | Quantity |
| `sort_order` | `int` | DEFAULT 0 | Display order |
| `created_at` | `timestamptz` | DEFAULT `now()` | Creation time |

#### Indexes
- `bill_items_bill_idx` on `bill_id`

---

### 6. `item_splits`

How each item is split between users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | Split ID |
| `item_id` | `uuid` | FK → bill_items.id, ON DELETE CASCADE | Parent item |
| `user_id` | `uuid` | FK → users.id, ON DELETE CASCADE | User in split |
| `split_type` | `text` | NOT NULL | 'equal', 'percentage', 'amount' |
| `amount` | `numeric(12,2)` | NOT NULL | User's share in currency |
| `percentage` | `numeric(5,2)` | NULLABLE | Percentage if applicable |
| `created_at` | `timestamptz` | DEFAULT `now()` | Creation time |
| `updated_at` | `timestamptz` | DEFAULT `now()` | Last update |

#### Constraints
- UNIQUE (`item_id`, `user_id`) — One split per user per item

#### Indexes
- `item_splits_item_idx` on `item_id`
- `item_splits_user_idx` on `user_id`

---

### 7. `settlements`

Payment records between users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | Settlement ID |
| `group_id` | `uuid` | FK → groups.id, ON DELETE CASCADE | Group context |
| `from_user` | `uuid` | FK → users.id | Who paid |
| `to_user` | `uuid` | FK → users.id | Who received |
| `amount` | `numeric(12,2)` | NOT NULL, CHECK > 0 | Settlement amount |
| `notes` | `text` | NULLABLE | Optional note |
| `created_at` | `timestamptz` | DEFAULT `now()` | When settled |

#### Indexes
- `settlements_group_idx` on `group_id`
- `settlements_users_idx` on (`from_user`, `to_user`)

---

### 8. `activity_log`

Activity feed entries.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | Activity ID |
| `group_id` | `uuid` | FK → groups.id, ON DELETE CASCADE | Group context |
| `user_id` | `uuid` | FK → users.id | Actor |
| `type` | `text` | NOT NULL | Event type (see below) |
| `entity_type` | `text` | NULLABLE | 'bill', 'settlement', 'group', 'member' |
| `entity_id` | `uuid` | NULLABLE | Related entity ID |
| `metadata` | `jsonb` | DEFAULT '{}' | Additional data |
| `created_at` | `timestamptz` | DEFAULT `now()` | Event time |

#### Activity Types
- `bill_created`, `bill_shared`, `bill_finalized`, `bill_deleted`
- `item_selected`, `item_unselected`, `split_updated`
- `settlement_created`
- `member_joined`, `member_left`, `member_invited`

#### Indexes
- `activity_group_idx` on `group_id`
- `activity_created_idx` on `created_at DESC`

---

### 9. `group_invites`

Pending invitations to groups.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | Invite ID |
| `group_id` | `uuid` | FK → groups.id, ON DELETE CASCADE | Target group |
| `invited_by` | `uuid` | FK → users.id | Who invited |
| `invited_email` | `text` | NULLABLE | Email if inviting non-user |
| `status` | `text` | DEFAULT 'pending' | 'pending', 'accepted', 'declined', 'expired' |
| `created_at` | `timestamptz` | DEFAULT `now()` | Invite time |
| `expires_at` | `timestamptz` | DEFAULT `now() + interval '7 days'` | Expiration |

---

## 🔐 Row Level Security (RLS) Policies

### Users Table
```sql
-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

### Groups Table
```sql
-- Members can view groups they belong to
CREATE POLICY "Members can view groups" ON groups
  FOR SELECT USING (
    id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );
```

### Bills Table
```sql
-- Members can view bills in their groups
CREATE POLICY "Members can view bills" ON bills
  FOR SELECT USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

-- Members can create bills in their groups
CREATE POLICY "Members can create bills" ON bills
  FOR INSERT WITH CHECK (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );
```

---

## 📈 Computed Values (Views/Functions)

### Balance Calculation
```sql
-- Get user's balance within a group
CREATE FUNCTION get_group_balance(p_group_id uuid, p_user_id uuid)
RETURNS numeric AS $$
  SELECT 
    COALESCE(SUM(CASE 
      WHEN b.paid_by = p_user_id THEN b.total_amount - is_total.user_share
      ELSE -is_total.user_share
    END), 0)
  FROM bills b
  JOIN (
    SELECT bi.bill_id, SUM(its.amount) as user_share
    FROM bill_items bi
    JOIN item_splits its ON its.item_id = bi.id
    WHERE its.user_id = p_user_id
    GROUP BY bi.bill_id
  ) is_total ON is_total.bill_id = b.id
  WHERE b.group_id = p_group_id
$$ LANGUAGE sql;
```

---

## 🔄 Real-time Subscriptions

Enable real-time for Self-Select feature:

```sql
-- Enable real-time on item_splits
ALTER PUBLICATION supabase_realtime ADD TABLE item_splits;

-- Enable real-time on bills (for status changes)
ALTER PUBLICATION supabase_realtime ADD TABLE bills;
```

---

## 🔮 v2 Extensibility (Future-Proofing)

> The following considerations ensure v2+ features can be added without breaking changes.

### Reserved Fields (Already in v1 Schema)

| Table | Field | v1 Use | v2 Use |
|-------|-------|--------|--------|
| `bills` | `notes` | Optional notes | Link to source shopping list |
| `bill_items` | (add later) | - | `source_shopping_item_id` FK |
| `activity_log` | `entity_type` | 'bill', 'settlement' | + 'shopping_list', 'inventory' |
| `activity_log` | `metadata` | JSONB | Can store any additional data |

### Planned v2 Tables (NOT Created in v1)

```sql
-- v2.0: Shopping Lists (Pantry World)
-- CREATE TABLE shopping_lists (
--   id uuid PRIMARY KEY,
--   group_id uuid REFERENCES groups(id),
--   name text NOT NULL,
--   status text DEFAULT 'active',  -- 'active', 'purchased', 'cancelled'
--   purchased_bill_id uuid REFERENCES bills(id),  -- Wormhole link
--   created_by uuid REFERENCES users(id),
--   created_at timestamptz DEFAULT now()
-- );

-- v2.0: Shopping List Items
-- CREATE TABLE shopping_items (
--   id uuid PRIMARY KEY,
--   list_id uuid REFERENCES shopping_lists(id),
--   name text NOT NULL,
--   quantity int DEFAULT 1,
--   estimated_price numeric(12,2),
--   added_by uuid REFERENCES users(id),
--   created_at timestamptz DEFAULT now()
-- );

-- v2.0: Pre-purchase Split Requests
-- CREATE TABLE shopping_item_requests (
--   id uuid PRIMARY KEY,
--   item_id uuid REFERENCES shopping_items(id),
--   user_id uuid REFERENCES users(id),
--   split_type text,
--   percentage numeric(5,2),
--   status text DEFAULT 'pending',  -- 'pending', 'approved', 'declined'
--   created_at timestamptz DEFAULT now()
-- );

-- v2.0: Inventory / Stock Status
-- CREATE TABLE inventory_items (
--   id uuid PRIMARY KEY,
--   group_id uuid REFERENCES groups(id),
--   bill_item_id uuid REFERENCES bill_items(id),  -- Wormhole link
--   name text NOT NULL,
--   stock_status text DEFAULT 'in_stock',  -- 'in_stock', 'low', 'out_of_stock'
--   last_purchased_at timestamptz,
--   participants uuid[],  -- Users who can mark stock status
--   created_at timestamptz DEFAULT now()
-- );

-- v1.1: Recurring Bills
-- CREATE TABLE recurring_bills (
--   id uuid PRIMARY KEY,
--   group_id uuid REFERENCES groups(id),
--   template_bill_id uuid REFERENCES bills(id),  -- Template to copy from
--   frequency text NOT NULL,  -- 'weekly', 'biweekly', 'monthly', 'yearly'
--   day_of_week int,  -- 0-6 for weekly
--   day_of_month int,  -- 1-31 for monthly
--   next_due_date date,
--   is_active boolean DEFAULT true,
--   created_by uuid REFERENCES users(id),
--   created_at timestamptz DEFAULT now()
-- );

-- v3.0: Payment Integrations
-- CREATE TABLE payment_links (
--   id uuid PRIMARY KEY,
--   settlement_id uuid REFERENCES settlements(id),
--   provider text NOT NULL,  -- 'venmo', 'paypal', 'cashapp'
--   external_id text,
--   deeplink_url text,
--   status text DEFAULT 'pending',
--   created_at timestamptz DEFAULT now()
-- );
```

### Migration Strategy

When adding v2 features:

1. **Shopping Lists → Bills (Wormhole)**
   - `shopping_lists.purchased_bill_id` links to the bill created at checkout
   - Bill creation copies items from shopping list
   - `bill_items` gets optional `source_shopping_item_id`

2. **Bills → Inventory (Wormhole)**
   - `inventory_items.bill_item_id` links back to purchase
   - Auto-create inventory entry when bill is finalized

3. **Stock Status**
   - Only users in `item_splits` for that item can update stock
   - Tri-state: `in_stock` → `low` → `out_of_stock`

4. **Twin Worlds UI**
   - Frontend only - no schema change needed
   - Group could have `default_world` preference

### Frontend Considerations

| v2 Feature | Frontend Preparation |
|------------|----------------------|
| **Twin Worlds toggle** | Design navigation to support mode switch |
| **Wormhole transitions** | Use navigation params to pass context |
| **Shopping lists** | Reuse ItemRow component pattern |
| **Stock badges** | Component can be added to existing item displays |
| **OCR scanning** | Camera button placeholder in Speed Parser |
| **Recurring bills** | Add "repeat" icon to bill creation flow |

### API Extensibility

Current endpoints are designed for extension:

```typescript
// v1 - Bills get items
GET /bills/:id → { bill, items, splits }

// v2 - Can add source shopping list
GET /bills/:id → { bill, items, splits, source_list?: ShoppingList }

// v2 - New endpoints (non-breaking)
GET /groups/:id/shopping-lists
POST /groups/:id/shopping-lists
POST /shopping-lists/:id/checkout → creates Bill (Wormhole)
```

---

*This schema supports all v1.0 features and is designed for seamless v2.0 expansion.*
