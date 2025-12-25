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

---

## Bug Fixes

_Add known bugs to fix here_
