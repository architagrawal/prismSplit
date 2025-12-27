# PrismSplit Future Tasks / Roadmap

## Performance & Technical Debt

### Replace AsyncStorage with MMKV
- **Priority**: Medium
- **Status**: Pending
- **Description**: Migrate from AsyncStorage to MMKV for ~10x faster storage operations
- **Files to update**:
  - `src/lib/store/authStore.ts`
  - `src/lib/store/uiStore.ts`
- **Notes**: 
  - MMKV package is already installed (`react-native-mmkv@4.1.0`)
  - Previous attempt failed due to native module initialization issues
  - Requires a full `npx expo prebuild --clean` and native rebuild
  - Consider also using `react-native-encrypted-storage` for sensitive auth tokens

### Incremental Balance Calculation
- **Priority**: Low (optimize when needed)
- **Status**: Pending
- **Description**: Current triggers recalculate ALL balances for a group on every change. Optimize to only update affected user pairs.
- **When to optimize**:
  - Groups with 500+ bills showing noticeable delay
  - Currently: Full recalc is O(n) where n = bills in group
  - Target: Incremental is O(1) constant time
- **Options**:
  1. Delta updates - Calculate difference, apply to existing balances
  2. Debounce triggers - Batch multiple changes together
  3. Background recalc - Use pg_cron for async recalculation
- **Trade-off**: Current approach is simpler and always accurate; defer until actual performance issues observed

### Soft Delete Purge Job
- **Priority**: Medium (implement with soft delete)
- **Status**: Pending
- **Description**: Scheduled job to permanently delete records older than 90 days
- **Implementation**: Use **GitHub Actions** (free scheduled cron) to call a Supabase RPC:
  1. Create `purge_deleted_records()` RPC in Supabase
  2. Create `.github/workflows/purge-deleted.yml` with daily schedule
  3. Workflow calls RPC via `curl` to Supabase REST API
  ```yaml
  # .github/workflows/purge-deleted.yml
  name: Purge Deleted Records
  on:
    schedule:
      - cron: '0 3 * * *'  # Daily at 3 AM UTC
  jobs:
    purge:
      runs-on: ubuntu-latest
      steps:
        - run: |
            curl -X POST "${{ secrets.SUPABASE_URL }}/rest/v1/rpc/purge_deleted_records" \
              -H "apikey: ${{ secrets.SUPABASE_SERVICE_KEY }}" \
              -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_KEY }}"
  ```
- **Dependencies**: Soft delete columns must be added to all tables first

---

## UX Enhancements

### Push Notifications (Expo)
- **Priority**: High
- **Status**: Pending
- **Description**: Notify users of important events
- **Use Cases**:
  - "Bob added a new bill"
  - "Alice paid you $25"
  - "Bill finalized - all items claimed"
  - "Reminder: You owe $50"
- **Implementation**: Expo Push Notifications (free, unlimited)

### Lottie Animations
- **Priority**: Low (Polish)
- **Status**: Pending
- **Description**: Add micro-animations for delightful UX
- **Use Cases**:
  - Success checkmark on bill save
  - Confetti on settlement complete
  - Loading spinners with brand personality
- **Implementation**: `lottie-react-native` library (free)

---

## Features

### Non-Registered Participants (Guest Members)
- **Priority**: High
- **Status**: Pending
- **Description**: Allow adding friends to groups who don't have the app yet
- **Schema changes**:
  - Add `Participant` model (group-scoped, nullable `profile_id`)
  - Link participations to real users when they sign up
- **Value**: Groups can include people who haven't downloaded PrismSplit

### "On the Go" Bills (No Group Required)
- **Priority**: Medium
- **Status**: Pending
- **Description**: Create bills between friends without creating a group first
- **Use Case**: Quick one-time splits (e.g., coffee with a colleague)
- **Implementation Options**:
  1. Auto-create hidden "Virtual Group" under the hood
  2. Allow `group_id = null` for standalone bills
- **Value**: Reduces friction for casual expense sharing

### Simplified Settlements Algorithm
- **Priority**: Medium  
- **Status**: Pending
- **Description**: Calculate minimum transactions to settle all debts
- **Example**: Instead of A→B $20, B→C $15, A→C $10 → Show "A→C $30" (1 transaction)
- **Implementation**: Greedy algorithm matching largest debtors to creditors

### Multi-Currency Per Expense
- **Priority**: Medium
- **Status**: Pending
- **Description**: Support different currencies within the same group
- **Schema changes**:
  - Add `original_amount`, `original_currency`, `conversion_rate` to bills
  - Store converted amount in group's base currency
- **Value**: Perfect for travel groups with international spending

### Recurring Expenses
- **Priority**: Low
- **Status**: Pending
- **Description**: Auto-create bills on a schedule (daily/weekly/monthly)
- **Use cases**: Rent, subscriptions, utilities
- **Schema changes**: Add `RecurringExpenseLink` table, `recurrence_rule` column

### Rollback / Undo Support
- **Priority**: Low
- **Status**: Pending (V2/V3)
- **Description**: Allow users to undo the last edit to a bill
- **Implementation**:
  - Store 1-level snapshot of bill state before each save
  - Add "Undo Last Edit" button in bill detail screen
- **Value**: Safety net for accidental changes

### "Payer Not in Split" Indicator
- **Priority**: Low
- **Status**: Pending (V2 Polish)
- **Description**: Show clear visual when payer has $0 split but is owed money
- **Implementation**: Info chip/badge: "Alex paid but is not splitting this bill"
- **Value**: Prevents user confusion about balances

### Offline Conflict Handling
- **Priority**: Medium
- **Status**: Pending (V2)
- **Description**: Warn users when their offline edits conflict with online changes
- **Implementation**:
  - Check `updated_at` before saving
  - Show dialog: "This bill was edited by [User] while you were offline"
  - Options: "Overwrite" | "Discard My Changes" | "View Differences"
- **Value**: Prevents accidental data loss

### Custom Tax/Tip Splitting
- **Priority**: Low
- **Status**: Pending (V2)
- **Description**: Allow per-person custom amounts for Tax and Tip (like custom bill split)
- **Implementation**: New screen for entering custom tax/tip values per person
- **Value**: Handles edge cases where tip is split differently than the bill

### Multiple Payers per Bill
- **Priority**: Low (V2)
- **Status**: Pending
- **Description**: Allow multiple people to pay for a single bill
- **Current Limitation (V1)**: A bill has only one `paid_by` user
- **Mitigation**: Create two separate bills (Alice's share, Bob's share) or handle settlement externally
- **Complexity**: High (requires `bill_payers` table to track amounts per payer)

### Manual Exchange Rates
- **Priority**: Medium (V2)
- **Status**: Pending
- **Description**: Auto-fetch exchange rates or allow custom rate input
- **Current Limitation (V1)**: User must manually calculate and enter amount in Group Currency
- **Risk**: User enters wrong rate or forgets to convert
- **Value**: Critical for multi-currency groups (travel)

### Real-time Conflict Resolution (Smart Sync)
- **Priority**: Medium (V2)
- **Status**: Pending
- **Description**: Real-time merging of simultaneous edits
- **Current Limitation (V1)**: System uses **Optimistic Locking** (locks entire bill). If collision occurs, user must refresh and retry.
- **Improved Experience (V2)**:
  - Subscribe to real-time changes
  - Auto-merge non-conflicting edits (e.g. User A edits Item A, User B edits Item B)
  - Only prompt user on true conflicts


## 8. Future Ideas

- [ ] **Rollback / Undo:** Store 1-level snapshot before save. Allow "Undo Last Edit".
- [ ] **Debt Simplification:** Graph reduction algorithm (Splitwise-style).
- [ ] **Offline Conflict Handling:**
    *   Detect: Check `updated_at` timestamp before saving.
    *   Warn: "This bill was edited by [User] while you were offline."
    *   Choices: "Overwrite" | "Discard My Changes" | "View Differences"
- [ ] **Operational Transform:** Real-time conflict resolution for simultaneous edits.
---

## Bug Fixes

_Add known bugs to fix here_
