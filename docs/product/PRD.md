# PrismSplit - Product Requirements Document

**Version:** 1.0  
**Date:** December 9, 2024  
**Author:** PrismSplit Team  
**Status:** Approved ✅

---

## Executive Summary

**PrismSplit** is a modern expense-sharing application designed to replace Splitwise with a focus on **granular item-level splitting** and a clean, intuitive user experience. 

### v1.0 Focus: Finance (Splitwise Replacement)

The MVP focuses on core expense splitting functionality — creating groups, logging bills with itemized splits, tracking balances, and settling up. This allows for a fast release cycle while laying the foundation for future features.

### Vision Statement

> Make shared expenses effortless with intuitive item-level splitting and a beautiful, modern interface.

### Key Differentiators (v1)

| Feature | Splitwise | PrismSplit |
|---------|-----------|------------|
| Item-level splits | ❌ Basic | ✅ Per-item with mixed logic |
| Modern UI/UX | Cluttered | Clean, intuitive |
| Split types | Limited | Equal, personal, select people, percentage, custom |
| Mobile-first | Both | ✅ React Native, beautiful design |

---

## Problem Statement

### The Pain Point

Roommates and friend groups frequently share expenses for groceries, household supplies, and subscriptions. Current solutions like Splitwise require users to:

1. **Calculate splits manually** — When a grocery cart has 20-30 items with different split logic, users must calculate on paper before entering totals
2. **Handle complex splits painfully** — Items like "rice split 50%-25%-12.5%-12.5%" require manual math
3. **Deal with cluttered UI** — Splitwise has become bloated and hard to navigate

### Example Scenario

> A group of 6 roommates shops at Costco weekly. The cart includes:
> - Tomatoes → split equally among all 6
> - Milk → personal to one person
> - Bread → split between only 2 people
> - Rice (10 lb) → split 50%, 25%, 12.5%, 12.5%
>
> With PrismSplit, users can enter each item with its own split logic, and the app calculates who owes what automatically.

### Market Opportunity

- Splitwise has 50M+ downloads but a cluttered, dated UI
- Growing demand for household expense management
- Opportunity for a modern, mobile-first experience

---

## Target Users

### Primary Persona: The Roommate Coordinator

- **Demographics:** 22-35, urban, shares housing with 2-6 people
- **Behavior:** Does weekly grocery shopping, manages shared subscriptions
- **Pain:** Spends 15-30 minutes per week calculating splits
- **Goal:** Quick, accurate splitting without spreadsheets

### Secondary Persona: The Trip Planner

- **Demographics:** 25-45, organizes group trips
- **Behavior:** Books shared accommodations, restaurants, activities
- **Pain:** Tracking varied expenses across multiple people
- **Goal:** Fair splits that account for who participated in what

### Tertiary Persona: The Casual User

- **Demographics:** Any age, occasional expense sharing
- **Behavior:** Dinner with friends, occasional group purchases
- **Pain:** Doesn't want to download a complex app for simple needs
- **Goal:** Quick, minimal-friction expense logging

---

## MVP Scope (Version 1.0)

### In Scope ✅

| Category | Features |
|----------|----------|
| **Authentication** | Email/password, Google OAuth, session persistence |
| **Groups** | Create, view, invite members, remove members, delete |
| **Bills** | Create bill, add items, assign splits per item, edit/delete |
| **Item Splits** | Equal, personal, select people, percentage, custom amount |
| **Balances** | View per group, per person, total owed/owing |
| **Settlement** | Mark as paid, payment history |
| **Activity** | Transaction history, recent activity feed |

### Out of Scope (Future Versions) ❌

| Version | Features |
|---------|----------|
| **v1.1** | Dark mode, push notifications, offline mode |
| **v2.0** | 📦 **Pantry World** — Shopping lists, pre-purchase splits, inventory, stock status |
| **v2.x** | Wormholes, Twin Worlds toggle, OCR receipt scanning |
| **v3.0** | Payment integration (Venmo/PayPal), recurring bills, analytics |

---

## Navigation Architecture

PrismSplit v1 uses a simple bottom navigation with 4 tabs + center FAB.

### App Structure

```
┌────────────────────────────────────────────────────────────────┐
│                         HEADER                                  │
│                    Screen-specific title                        │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│                      CONTENT AREA                              │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                    BOTTOM NAVIGATION                           │
│     👥 Groups    👤 Friends    [💵]    📊 Activity    ⚙️ Account │
└────────────────────────────────────────────────────────────────┘
```

### Navigation Tabs

| Tab | Icon | Purpose |
|-----|------|---------|
| Groups | 👥 | List of groups, tap to see group details and bills |
| Friends | 👤 | All friends across groups, direct balances |
| **FAB** | 💵 | Quick Add Expense / New Bill |
| Activity | 📊 | Transaction history, settlements, recent activity |
| Account | ⚙️ | Profile, settings |

### Color Scheme

**Primary:** Purple #7C3AED  
**Background:** Dark #0F0F0F  
**Surface:** #1A1A1A  
**Success (owed to you):** #22C55E  
**Error (you owe):** #EF4444  

---

## Detailed Feature Requirements

### 1. Authentication

| Requirement | Priority | Description |
|-------------|----------|-------------|
| AUTH-01 | P0 | User can sign up with email and password |
| AUTH-02 | P0 | User can log in with existing credentials |
| AUTH-03 | P1 | User can sign in with Google OAuth |
| AUTH-04 | P0 | User can log out |
| AUTH-05 | P0 | Session persists across app restarts |
| AUTH-06 | P1 | Password reset via email |

---

### 2. Groups

| Requirement | Priority | Description |
|-------------|----------|-------------|
| GRP-01 | P0 | User can create a new group with a name |
| GRP-02 | P0 | User can view list of their groups |
| GRP-03 | P0 | User can view group details (members, bills) |
| GRP-04 | P0 | Existing members can invite others via email/link |
| GRP-05 | P1 | Group creator can remove members |
| GRP-06 | P2 | Group can be deleted (by creator only) |
| GRP-07 | P0 | Only group members can view group content (privacy) |

---

### 3. Bills (Self-Select Model)

> **Core Concept:** The bill creator enters items and prices. Participants then **self-select** which items they're splitting by tapping on items. This is participant-driven, not creator-assigned.

#### Bill Creation (Creator)

| Requirement | Priority | Description |
|-------------|----------|-------------|
| BILL-01 | P0 | Creator enters bill name and selects group |
| BILL-02 | P0 | Creator adds items with names, prices, and optional quantity |
| BILL-03 | P0 | Quantity expands at split time (e.g., "Milk x2" → 2 separate item rows) |
| BILL-04 | P0 | Creator can add tax and tip amounts |
| BILL-05 | P0 | Only creator can edit item names and prices |
| BILL-06 | P0 | Creator saves bill - instantly visible to group for selection |
| BILL-07 | P0 | Bills always editable - balances update dynamically when changes made |

#### Speed Parser Input Mode

> **Goal:** Input 20 items in under 60 seconds with minimal taps.

| Requirement | Priority | Description |
|-------------|----------|-------------|
| SPEED-01 | P0 | "Continuous spreadsheet" style input: vertical list of item rows |
| SPEED-02 | P0 | Each row: `[Name] [Price] [Qty]` fields |
| SPEED-03 | P0 | **Auto-focus flow:** Name → Next → Price → Next → Qty → Done → New row |
| SPEED-04 | P0 | Running total updates live as items are added |
| SPEED-05 | P0 | Swipe or X button to delete row |
| SPEED-06 | P1 | Keyboard stays open during entire input session |

**Mobile Keyboard Behavior:**

| Requirement | Priority | Description |
|-------------|----------|-------------|
| SPEED-M1 | P0 | Use native **"Next"** return key to advance between fields |
| SPEED-M2 | P0 | Auto-switch to **numeric keyboard** for Price & Qty fields |
| SPEED-M3 | P0 | **"Done"** on Qty field creates new row and focuses Name field |
| SPEED-M4 | P0 | Default Qty = **1** (pre-filled, user can skip) |
| SPEED-M5 | P0 | Tapping any empty field focuses it directly |

**Input Flow Diagram:**
```
┌─────────────────────────────────────────────────────────────┐
│  Speed Parser                        Running Total: $34.50  │
├─────────────────────────────────────────────────────────────┤
│  [Tomatoes_____] [$4.50] [1]                           ✕   │
│  [Milk_________] [$6.00] [2]   ← "Milk x2" at split time  │
│  [Rice 10lb____] [$18.0] [1]                           ✕   │
│  [____________▌] [$____] [1]   ← Auto-focused new row      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │  1  2  3  4  5  6  7  8  9  0                       │   │
│  │  Q  W  E  R  T  Y  U  I  O  P                       │   │
│  │  ...                           [Next →] or [Done ✓] │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

#### Participant Selection

| Requirement | Priority | Description |
|-------------|----------|-------------|
| SEL-01 | P0 | Participant sees list of all items with prices |
| SEL-02 | P0 | **Tap anywhere on item row** = Join that item's split |
| SEL-03 | P0 | Tap again = Leave that item's split |
| SEL-04 | P0 | See running total of "Your share" as you select |
| SEL-05 | P0 | See who else has selected each item (avatar icons) |
| SEL-06 | P1 | **Real-time sync** — See others' selections live |
| SEL-07 | P0 | Save selections with "Confirm" button |
| SEL-08 | P0 | Can change selections anytime before settling |

#### Custom Splits (Expand Arrow)

| Requirement | Priority | Description |
|-------------|----------|-------------|
| CUST-01 | P0 | Tap expand arrow (▼) to open custom options |
| CUST-02 | P0 | Choose: Equal split, Custom %, or Custom $ |
| CUST-03 | P0 | See current split breakdown (all participants) |
| CUST-04 | P1 | Add someone else to an item's split |
| CUST-05 | P0 | Remove yourself from a split |

#### Unclaimed Items

| Requirement | Priority | Description |
|-------------|----------|-------------|
| UNC-01 | P0 | Items with no selections show warning state |
| UNC-02 | P0 | Any group member can assign unclaimed items |
| UNC-03 | P1 | Option to "Assign to creator" for unclaimed |

#### Tax & Tip Distribution

| Requirement | Priority | Description |
|-------------|----------|-------------|
| TAX-01 | P0 | Tax distributed **proportionally** to items selected |
| TAX-02 | P1 | Option for equal tax split among all participants |

---

### 4. Visual Split Indicators

| Requirement | Priority | Description |
|-------------|----------|-------------|
| VIS-01 | P0 | Each person has a unique color (purple, blue, green, etc.) |
| VIS-02 | P0 | Item rows show avatar icons of participants |
| VIS-03 | P0 | **Max 3 avatars** shown, then "+N more" for overflow |
| VIS-04 | P0 | **Thin color bar (3-4px)** below item showing split proportions |
| VIS-05 | P0 | Unclaimed items show gray warning state |

---

### 5. Balances & Settlement

| Requirement | Priority | Description |
|-------------|----------|-------------|
| BAL-01 | P0 | User can see their balance within a group |
| BAL-02 | P0 | User can see overall total owed and owing |
| BAL-03 | P0 | User can see balance breakdown per person |
| BAL-04 | P0 | User can mark a balance as "settled" |
| BAL-05 | P1 | Payment history log |

---

### 6. Activity Feed

| Requirement | Priority | Description |
|-------------|----------|-------------|
| ACT-01 | P0 | User can see recent activity (new bills, settlements) |
| ACT-02 | P1 | Activity shows across all groups |
| ACT-03 | P1 | Tap activity item to go to relevant detail |

---

### 7. Simple Bill Mode (Quick Bills)

> For expenses without itemization (taxi, coffee, dinner).

| Requirement | Priority | Description |
|-------------|----------|-------------|
| QUICK-01 | P1 | Option to create "Quick Bill" without items |
| QUICK-02 | P1 | Fields: Description, Total Amount, Group |
| QUICK-03 | P1 | Split options: Equal, Select People, Just Me |
| QUICK-04 | P1 | No participant self-select (creator assigns directly) |

```
┌─────────────────────────────────────────────────┐
│  Quick Bill                                     │
├─────────────────────────────────────────────────┤
│  What for? [Uber to airport_____]               │
│  Amount: [$45.00]                               │
│  Group: [▼ Trip Squad]                          │
│  Split: ○ Equal  ● Select people  ○ Just me     │
│                                                 │
│              [Create Bill]                      │
└─────────────────────────────────────────────────┘
```

---

### 8. Notifications

> Push notifications sent only to **concerned users** when action is taken.

| Trigger | Recipient | Priority |
|---------|-----------|----------|
| New bill shared | All group members | P1 |
| Someone selected items | Bill creator | P1 |
| All selections complete | Bill creator | P1 |
| Bill finalized | All participants | P1 |
| Someone settled with you | Person who was owed | P1 |
| Reminder/Nudge sent | Person who owes | P2 |
| Added to a group | New member | P1 |
| Unclaimed items (after 24h) | Members who haven't selected | P2 |

---

### 9. Onboarding

> First-time user experience inspired by Venmo, Cash App, and Splitwise.

| Requirement | Priority | Description |
|-------------|----------|-------------|
| ONBOARD-01 | P1 | Welcome screens (3-4 swipeable cards) explaining key features |
| ONBOARD-02 | P1 | Quick account setup (name, optional photo) |
| ONBOARD-03 | P2 | Demo group with sample bill to explore |
| ONBOARD-04 | P1 | Tooltip highlights on first use of Speed Parser |
| ONBOARD-05 | P1 | Skip option for returning users |

---

### 10. Invite Flow

> Easy group invites like WhatsApp/Splitwise.

| Requirement | Priority | Description |
|-------------|----------|-------------|
| INV-01 | P0 | **Share Link:** Generate unique invite URL |
| INV-02 | P0 | Link opens app (deep link) or app store if not installed |
| INV-03 | P1 | **Invite Code:** 6-character alphanumeric code |
| INV-04 | P2 | Search by username/email (if user exists) |
| INV-05 | P1 | Invite expires after 7 days (regeneratable) |
| INV-06 | P0 | Group creator can revoke pending invites |

---

### 11. Currency

| Requirement | Priority | Description |
|-------------|----------|-------------|
| CURR-01 | P0 | Currency set at **group creation** |
| CURR-02 | P0 | Single currency per group (no conversion) |
| CURR-03 | P1 | Support major currencies: USD, EUR, GBP, INR, CAD, AUD |
| CURR-04 | P2 | Group creator can change currency (if no active bills) |

---

### 12. Bill Management (Edit & Delete)

#### Edit Bill

| Requirement | Priority | Description |
|-------------|----------|-------------|
| EDIT-01 | P1 | Creator can edit bill **after sharing** (items, prices) |
| EDIT-02 | P1 | Participants notified of changes |
| EDIT-03 | P1 | Editing resets affected selections (participants re-select) |
| EDIT-04 | P1 | Cannot edit finalized/settled bills |

#### Delete Bill (Soft Delete)

| Requirement | Priority | Description |
|-------------|----------|-------------|
| DEL-01 | P1 | **Any group member** can delete a bill |
| DEL-02 | P1 | Soft delete: Bill hidden but restorable for **30 days** |
| DEL-03 | P1 | Balances immediately recalculated (expenses removed) |
| DEL-04 | P1 | Deleted bills visible in "Trash" section |
| DEL-05 | P1 | Restore option within 30 days (balances recalculated) |
| DEL-06 | P1 | After 30 days: Permanent deletion |

---

### 13. Receipt Sharing

| Requirement | Priority | Description |
|-------------|----------|-------------|
| SHARE-01 | P1 | Share final receipt as **image** (PNG) |
| SHARE-02 | P2 | Download as **PDF** |
| SHARE-03 | P1 | Share via native share sheet (WhatsApp, iMessage, etc.) |
| SHARE-04 | P1 | Receipt includes: Items, splits, totals, who owes what |

---

### 14. Remind Feature

| Requirement | Priority | Description |
|-------------|----------|-------------|
| REMIND-01 | P2 | "Nudge" button on pending balances |
| REMIND-02 | P2 | Sends push notification to person who owes |
| REMIND-03 | P2 | Rate limit: Max 1 nudge per person per 24 hours |
| REMIND-04 | P2 | Nudge shows in activity feed |

---

### 15. Search & Filter

| Requirement | Priority | Description |
|-------------|----------|-------------|
| SEARCH-01 | P2 | **Search bills** by name, group, or item |
| SEARCH-02 | P2 | **Filter by date range** |
| SEARCH-03 | P2 | **Filter by person** (bills involving specific member) |
| SEARCH-04 | P2 | **Filter by category** (groceries, dining, etc.) |
| SEARCH-05 | P2 | Search results show in unified list |
| SEARCH-06 | P2 | Filter accessible from Activity and Group screens |

---

### 16. Offline Mode & Sync

| Requirement | Priority | Description |
|-------------|----------|-------------|
| OFFLINE-01 | P2 | Bill editing data stored **locally** when offline |
| OFFLINE-02 | P2 | Visual indicator when offline (banner or icon) |
| OFFLINE-03 | P2 | Changes queued and **synced to server** when online |
| OFFLINE-04 | P2 | Sync to other group members after reconnection |
| OFFLINE-05 | P2 | Conflict resolution: Last-write-wins with notification |
| OFFLINE-06 | P2 | Read-only access to existing bills when offline |

---

### 17. Accessibility

| Requirement | Priority | Description |
|-------------|----------|-------------|
| A11Y-01 | P2 | **Screen reader** support (VoiceOver, TalkBack) |
| A11Y-02 | P2 | Minimum touch target: 44x44px |
| A11Y-03 | P2 | **Color contrast** ratio: 4.5:1 for text |
| A11Y-04 | P2 | Support **dynamic font sizes** (system settings) |
| A11Y-05 | P2 | All images have alt text |
| A11Y-06 | P2 | Focus states visible for keyboard navigation |

---

### 18. User Profile

| Requirement | Priority | Description |
|-------------|----------|-------------|
| PROF-01 | P0 | User has display name |
| PROF-02 | P2 | User assigned unique **accent color** (auto-generated) |
| PROF-03 | P2 | Color not changeable by user (maintains consistency) |
| PROF-04 | P2 | Avatar shows first letter of name with accent color background |
| PROF-05 | P2 | Optional: Profile photo (future enhancement) |

---

### 19. Expense Categories

> Optional tags for bills to enable organization and future analytics.

| Requirement | Priority | Description |
|-------------|----------|-------------|
| CAT-01 | P1 | Bills can have an optional **category** tag |
| CAT-02 | P1 | Preset categories with icons: 🍔 Food, 🏠 Home, 🚗 Transport, ✈️ Travel, 🛒 Shopping, 🎮 Entertainment, 💊 Health, 📦 Other |
| CAT-03 | P1 | Category shown as badge/icon on bill cards |
| CAT-04 | P2 | Filter bills by category in Search & Filter |
| CAT-05 | P2 | Category breakdown in Analytics (v1.1) |

---

### 20. QR Code Invites

> Quick group joining when together in person.

| Requirement | Priority | Description |
|-------------|----------|-------------|
| QR-01 | P1 | Group settings shows **scannable QR code** for invite |
| QR-02 | P1 | QR code contains invite link or code |
| QR-03 | P1 | "Scan to Join" button opens device camera |
| QR-04 | P1 | Scanning QR takes user directly to group join confirmation |
| QR-05 | P1 | QR code regeneratable (same as invite link) |

---

### 21. Recurring Bills (v1.1)

> Automatic bill creation for regular shared expenses.

| Requirement | Priority | Description |
|-------------|----------|-------------|
| RECUR-01 | P2 | Option to set a bill as **recurring** |
| RECUR-02 | P2 | Frequency options: Weekly, Bi-weekly, Monthly, Yearly |
| RECUR-03 | P2 | Set specific day (e.g., 1st of month, every Monday) |
| RECUR-04 | P2 | Auto-create bill N days before due (configurable, default 3) |
| RECUR-05 | P2 | Notification when recurring bill is auto-created |
| RECUR-06 | P2 | Edit/pause/delete recurring schedule |
| RECUR-07 | P2 | Recurring bills list in Group settings |

**Use Cases:**
- Rent ($1500, 1st of every month)
- Netflix ($22.99, monthly)
- House cleaning ($100, bi-weekly)
- Utilities (variable amount, monthly reminder only)

---

### 22. Analytics & Insights (v1.1)

> Spending summaries and category breakdowns.

| Requirement | Priority | Description |
|-------------|----------|-------------|
| ANAL-01 | P2 | "Insights" tab or section showing spending summary |
| ANAL-02 | P2 | **Monthly spending total** (what you paid out) |
| ANAL-03 | P2 | **Category breakdown** pie chart (requires categories) |
| ANAL-04 | P2 | **Per-group spending** bar chart |
| ANAL-05 | P2 | Top 5 biggest expenses list |
| ANAL-06 | P2 | Filter by date range (This month, Last month, Custom) |
| ANAL-07 | P2 | Comparison: "You spent 15% more than last month" |

---

### 23. OCR Receipt Scanning (v2.0)

> Camera-based receipt scanning for automatic item entry.

| Requirement | Priority | Description |
|-------------|----------|-------------|
| OCR-01 | P2 | Camera button in Speed Parser to scan receipt |
| OCR-02 | P2 | Auto-extract item names and prices from photo |
| OCR-03 | P2 | User reviews and edits extracted items before saving |
| OCR-04 | P2 | Support for common receipt formats |
| OCR-05 | P2 | Fallback to manual entry if OCR fails |

---

## User Flows

### Flow 1: Creator Creates Bill

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CREATOR: ADD BILL FLOW                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. TAP FAB             2. ENTER DETAILS        3. ADD ITEMS               │
│                                                                             │
│  ┌─────────────┐         ┌─────────────┐        ┌─────────────┐            │
│  │     💵      │   →     │ Bill Name:  │   →    │ Tomatoes    │            │
│  │   (FAB)     │         │ "Costco"    │        │       $4.50 │            │
│  │             │         │             │        │ Milk (x2)   │            │
│  │ "New Bill"  │         │ Group:      │        │      $12.00 │            │
│  └─────────────┘         │ "Roommates" │        │ Rice        │            │
│                          └─────────────┘        │      $18.00 │            │
│                                                 └─────────────┘            │
│                                                                             │
│  4. ADD TAX/TIP          5. SHARE                                          │
│                                                                             │
│  ┌─────────────┐         ┌─────────────┐                                   │
│  │ Subtotal:   │   →     │ ✓ Bill      │                                   │
│  │   $34.50    │         │   Created!  │                                   │
│  │ Tax: $2.93  │         │             │                                   │
│  │ Tip: $0.00  │         │ Shared to   │                                   │
│  │ ─────────── │         │ Roommates   │                                   │
│  │ Total:      │         │             │                                   │
│  │   $37.43    │         │ Waiting for │                                   │
│  │             │         │ selections  │                                   │
│  └─────────────┘         └─────────────┘                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Flow 2: Participant Selects Items (Self-Select)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                  PARTICIPANT: SELF-SELECT FLOW                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. OPEN BILL           2. TAP TO SELECT        3. CUSTOM (OPTIONAL)       │
│                                                                             │
│  ┌─────────────┐         ┌─────────────┐        ┌─────────────┐            │
│  │ New bill    │   →     │ Tomatoes    │   →    │ Rice 10lb   │            │
│  │ from Alex!  │         │ (A)(S)(Y) ✓ │        │ ────────────│            │
│  │             │         │ ▔▔▔▔▔▔▔▔▔▔  │        │ Your share: │            │
│  │ "Costco"    │         │ Milk        │        │ ○ Equal     │            │
│  │ $37.43      │         │ (A) tap→    │        │ ● Custom 25%│            │
│  │             │         │ ▔▔▔▔▔▔▔▔▔▔  │        │ ○ Amount $  │            │
│  │ [View]      │         │ Rice        │        │             │            │
│  └─────────────┘         │ (A)(S)(J) ▼ │        │ [+ Add Sam] │            │
│                          │ ▔▔▔▔▔▔▔▔▔▔  │        └─────────────┘            │
│                          │             │                                   │
│                          │ Your share: │                                   │
│                          │   $12.50    │                                   │
│                          │             │                                   │
│                          │ [Confirm]   │                                   │
│                          └─────────────┘                                   │
│                                                                             │
│  (A) = Avatar icons showing who's in each split                            │
│  ▔▔▔ = Thin color bar showing split proportions                            │
│  ▼   = Expand for custom options                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Flow 3: Final Bill Overview (Receipt)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     RECEIPT-STYLE BILL OVERVIEW                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                    ┌───────────────────────┐                               │
│                    │   🌟 PrismSplit       │                               │
│                    │   ─ ─ ─ ─ ─ ─ ─ ─ ─   │                               │
│                    │   Tomatoes    $4.50   │                               │
│                    │   (A)(S)(Y)           │                               │
│                    │                       │                               │
│                    │   Milk        $6.00   │                               │
│                    │   (A)(Y)              │                               │
│                    │                       │                               │
│                    │   Rice       $18.00   │                               │
│                    │   (A)(S)(J)(Y)        │                               │
│                    │   ─ ─ ─ ─ ─ ─ ─ ─ ─   │                               │
│                    │   Tax          $2.42  │                               │
│                    │   Total       $30.92  │                               │
│                    │   ═══════════════════ │                               │
│                    │   (A) Alex    $12.50  │                               │
│                    │   (S) Sam      $8.25  │                               │
│                    │   (J) Jordan   $4.50  │                               │
│                    │   (Y) You      $5.67  │                               │
│                    └───────────────────────┘                               │
│                                                                             │
│                    [Share]      [Download]                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Flow 4: View and Settle Balances

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SETTLE UP FLOW                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. VIEW HOME           2. TAP BALANCE          3. SETTLE                  │
│                                                                             │
│  ┌─────────────┐         ┌─────────────┐        ┌─────────────┐            │
│  │ You are     │   →     │ Alex        │   →    │ Confirm:    │            │
│  │ owed $47.50 │         │ owes you    │        │             │            │
│  │             │         │ $28.50      │        │ Alex paid   │            │
│  │ Roommates   │         │             │        │ you $28.50  │            │
│  │ +$35.50     │         │ [Remind]    │        │             │            │
│  │ Trip Squad  │         │ [Settle Up] │        │ [Confirm]   │            │
│  │ -$12.00     │         │             │        │             │            │
│  └─────────────┘         └─────────────┘        └─────────────┘            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Model Overview

### Core Entities

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA MODEL (v1)                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐        │
│  │   User   │──┬──▶│  Group   │─────▶│   Bill   │─────▶│ BillItem │        │
│  └──────────┘  │   └──────────┘      └──────────┘      └──────────┘        │
│                │                                             │              │
│                │                                             ▼              │
│                │                     ┌──────────┐      ┌──────────┐        │
│                └────────────────────▶│ Balance  │◀─────│  Split   │        │
│                                      └──────────┘      └──────────┘        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Relationships

| Entity | Relationships |
|--------|---------------|
| **User** | Belongs to many Groups, has many Balances |
| **Group** | Has many Users, Bills |
| **Bill** | Belongs to Group, has many BillItems, has paidBy User |
| **BillItem** | Belongs to Bill, has many Splits |
| **Split** | Belongs to BillItem, references User, has split_type and value |
| **Balance** | Between two Users within a Group |

---

## Success Metrics

### Launch Metrics (First 3 Months)

| Metric | Target |
|--------|--------|
| App downloads | 1,000 |
| Weekly active users | 300 |
| Groups created | 500 |
| Bills logged | 2,000 |

### Engagement Metrics

| Metric | Target |
|--------|--------|
| Avg bills per group | 5+ |
| Settlement completion rate | 80% |
| Return user rate (week 2) | 40% |

### North Star Metric

> **Weekly Active Splitters**: Number of users who participate in at least one bill split per week.

---

## Technical Requirements

### Platform Strategy

| Priority | Platform |
|----------|----------|
| P0 (MVP) | Mobile (iOS + Android) via React Native |
| P1 | Web app (shared codebase where possible) |

### Performance Requirements

| Metric | Target |
|--------|--------|
| App size | < 10 MB |
| Cold start | < 2 seconds |
| API response | < 200ms (p95) |

### Technology Stack (Proposed)

| Layer | Technology |
|-------|------------|
| Frontend | React Native + Expo |
| UI Framework | Tamagui (cross-platform) |
| State | Zustand or Jotai |
| Backend | TBD (Supabase, Firebase) |
| Database | PostgreSQL or Firestore |
| Auth | Firebase Auth or Supabase Auth |

---

## Appendix

### Glossary

| Term | Definition |
|------|------------|
| **Split** | The division of an item's cost among participants |
| **Bill** | A finalized expense record with prices and splits |
| **Settlement** | Marking a balance as paid/resolved |

### Design Decisions

| Decision | Choice | Notes |
|----------|--------|-------|
| **Currency handling** | Single currency per group | Simplifies calculations |
| **Rounding** | Max 2 decimal places | Fractional cents distributed via round-robin |
| **Debt simplification** | ❌ Disabled | Users see actual payment flows |
| **Notifications** | Push notifications only | Clean and sufficient for MVP |

---

## Future Roadmap: v2.0 Pantry World

> **Note:** The following features are planned for v2.0 after the Finance-only MVP is stable.

### Pantry Features (v2.0)

- 📋 Collaborative Shopping Lists
- 📦 Inventory tracking (in-stock / out-of-stock)
- 📨 Split request/approval before purchase
- 🔄 Late-join recalculation
- 🌐 Twin Worlds toggle (Finance ↔ Pantry)
- 🕳️ Wormhole transitions between worlds

This architecture is documented and ready for implementation in v2.0.

---

*Document Status: Approved ✅*
