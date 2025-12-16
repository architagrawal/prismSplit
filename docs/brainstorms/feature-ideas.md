# Feature Ideas

## Core Features (MVP v1.0) — Finance Only

### Authentication

- [ ] Email/password login
- [ ] Google OAuth
- [ ] Logout
- [ ] Session persistence
- [ ] Password reset via email

### Onboarding

- [ ] Welcome screens (3-4 swipeable cards)
- [ ] Quick account setup
- [ ] Demo group with sample bill (optional)
- [ ] Tooltip highlights on first use
- [ ] Skip option for returning users

### Groups

- [ ] Create new group
- [ ] View group list
- [ ] View group details
- [ ] Add/remove members
- [ ] Invite via link, code, or **QR code**
- [ ] Delete group
- [ ] Group privacy (only members see content)
- [ ] Set currency at group creation

### Bills (Self-Select Model)

- [x] **Compact Bill List:** High-density view grouped by date
- [x] **Month/Day Headers:** Bills grouped by month then day (no repetitive dates)
- [x] **Sticky Month Headers:** Using SectionList, month headers stick with monthly totals
- [x] **Horizontal Hero Header:** Group info left, overlapping avatars right (compact layout)
- [x] **Credit Card Payer Badge:** Payer shown as credit card icon with initials on category icon corner
- [x] **Itemized Bill Indicator:** ClipboardList icon after title for bills with multiple items
- [x] **Color-coded Balance:** Green (lent), Red (borrowed), Grey (not involved/paid) - emphasized over amount
- [x] **My View Toggle:** Filter to show only items user is involved in
- [x] **Settle Up Button:** Quick access when balance ≠ $0
- [ ] Create new bill (Itemized or Quick)
- [ ] **Speed Parser:** Fast item entry with auto-focus flow
- [ ] Quantity input → expands to separate rows at split time
- [ ] Tax and tip distribution (proportional)
- [ ] Bills saved instantly visible to group (no draft/status)
- [ ] Participants self-select their items
- [ ] Real-time sync of selections
- [ ] Edit bill after sharing (resets selections)
- [ ] **Soft delete:** Restorable for 30 days

### Quick Bill Mode

- [ ] Simple bill without itemization
- [ ] Description, amount, group
- [ ] Split: Equal, Select People, Just Me
- [ ] Creator assigns directly (no self-select)

### Splits (Per-Item Level)

- [ ] Equal split (divide by N participants)
- [ ] Custom percentage split
- [ ] Custom amount split
- [ ] Expand arrow (▼) for custom options
- [ ] Add someone else to a split
- [ ] Remove yourself from a split

### Visual Split Indicators

- [ ] Colored avatar icons per person
- [ ] **Max 3 avatars** + "+N" overflow
- [ ] **Thin color bar (3-4px)** showing proportions
- [ ] Unclaimed items show warning state

### Expense Categories

- [ ] Optional category tag per bill
- [ ] Preset icons: 🍔 Food, 🏠 Home, 🚗 Transport, ✈️ Travel, 🛒 Shopping, 🎮 Entertainment, 💊 Health, 📦 Other
- [ ] Category badge on bill cards
- [ ] Filter by category

### Balance & Settlement

- [ ] See current balance per group
- [ ] See total owed / owed to you
- [ ] See balance per person
- [ ] Mark as settled
- [ ] Payment history
- [ ] **Settle Up** flow with confirmation

### Activity Feed

- [ ] View recent activity (new bills, settlements, selections)
- [ ] Activity across all groups
- [ ] Tap to navigate to detail
- [ ] Filter by type

### Notifications

- [ ] New bill shared → all group members
- [ ] Someone selected items → bill creator
- [ ] Bill finalized → all participants
- [ ] Settlement complete → person owed
- [ ] Added to group → new member
- [ ] Reminder/nudge sent → person who owes

### Receipt Sharing

- [ ] Share final receipt as image (PNG)
- [ ] Download as PDF
- [ ] Share via native share sheet

### Search & Filter

- [ ] Search bills by name, group, or item
- [ ] Filter by date range
- [ ] Filter by person
- [ ] Filter by category
- [ ] Filter by category

### Offline Mode

- [ ] Local storage when offline
- [ ] Sync to server when online
- [ ] Offline indicator banner
- [ ] Read-only access to existing bills

### Accessibility

- [ ] Screen reader support
- [ ] 44x44px minimum touch targets
- [ ] 4.5:1 color contrast ratio
- [ ] Dynamic font sizes
- [ ] Focus states visible

---

## v1.1 Features (Post-MVP Polish)

### Recurring Bills

- [ ] Set bill as recurring
- [ ] Frequency: Weekly, Bi-weekly, Monthly, Yearly
- [ ] Auto-create N days before due
- [ ] Notification when auto-created
- [ ] Edit/pause/delete schedule

### Analytics & Insights

- [ ] Monthly spending summary
- [ ] Category breakdown pie chart
- [ ] Per-group spending bar chart
- [ ] Top 5 biggest expenses
- [ ] Month-over-month comparison

### Enhanced Features

- [ ] Remind feature (nudge with rate limit)
- [ ] Profile photos
- [ ] Dark mode toggle (currently default)
- [ ] Improved push notifications

---

## v2.0 Features — 📦 Pantry World

> **Note:** These features introduce the "Twin Worlds" pattern.

### OCR Receipt Scanning

- [ ] Camera button in Speed Parser
- [ ] Auto-extract item names and prices
- [ ] User reviews before saving
- [ ] Fallback to manual entry

### Collaborative Shopping Lists

- [ ] Create shopping list within a group
- [ ] Any group member can add items
- [ ] Request to join an item's split
- [ ] Convert list to bill when purchased

### Stock Status System

- [ ] Items default to "In Stock" after purchase
- [ ] Only participants can mark "Out of Stock"
- [ ] Join rules based on stock status

### Twin Worlds Navigation

- [ ] Top toggle: Finance ↔ Pantry
- [ ] Bottom nav changes per world
- [ ] Color scheme changes (Purple ↔ Green)

### Wormholes (Cross-World Transitions)

- [ ] Checkout Wormhole: Shopping List → Bill Detail
- [ ] Item Detail Wormhole: Bill Item → Inventory Item
- [ ] View Source Wormhole: Bill → Original List

---

## v3.0 Features — Payments & Growth

- [ ] Payment integration (Venmo, PayPal deeplinks)
- [ ] Calendar integration
- [ ] Export to CSV / Google Sheets
- [ ] Expense trends over time
- [ ] Public API for integrations

---

## User Stories

### As a group member (v1), I want to...

- Quickly add a bill after dining with friends
- See at a glance who owes me money
- Split a bill by specific items (not equally)
- Select only the items I'm paying for (self-select)
- Get notified when someone pays me back
- See my spending history with a group
- Join a group by scanning a QR code
- Share a receipt with everyone

### As a bill creator (v1), I want to...

- Enter 20+ items in under 60 seconds (Speed Parser)
- Add quantities (e.g., "Milk x2") as separate items
- Let others pick their own items
- See who hasn't selected yet
- Edit or delete a bill if I made a mistake
- Get notified when everyone has selected

### As a group admin (v1), I want to...

- Invite friends via link, code, or QR
- Remove inactive members
- Set group currency
- See group-level analytics

### As a user (v1.1), I want to...

- Set up recurring bills (rent, Netflix)
- See my monthly spending by category
- Get automatic reminders for recurring expenses

### As a user (v2 - Pantry), I want to...

- Add items to a shared shopping list before someone goes to the store
- Request to split an item with the person who added it
- See who's splitting each item on the list
- Scan a receipt and auto-populate items

---

## Competitive Analysis

| App | Strengths | Weaknesses |
|-----|-----------|------------|
| **Splitwise** | Full-featured, widely used | No item-level splits, cluttered UI |
| **Venmo** | Easy payments | Weak bill splitting, no groups |
| **Tricount** | Good for trips | Not for daily use |
| **Tab** | Simple | Limited features |
| **Tabbie** | Beautiful receipt UI | Unknown |

### PrismSplit Differentiators

**v1:**
- 🚀 **Speed Parser** — 20 items in 60 seconds
- 👆 **Self-Select splits** — Participants pick their own items
- 🎨 **Color-coded avatars** — See instantly who's splitting what
- 📱 **QR Code invites** — Join groups instantly
- 🏷️ **Expense categories** — Organize and analyze
- 💎 **Beautiful, modern UI** — Clean dark theme

**v2:**
- 📦 **Pre-purchase collaboration** — Plan splits BEFORE buying
- 📸 **OCR scanning** — Scan receipts to auto-populate
- 🌐 **Twin Worlds** — Finance and Pantry in one app

---

## Technical Considerations

- Keep app size small (<10MB)
- Offline-first architecture
- Fast load times (<2s cold start)
- Smooth animations (60fps)
- Accessible to screen readers
- Real-time sync via Supabase/WebSockets
- React Native + Expo
