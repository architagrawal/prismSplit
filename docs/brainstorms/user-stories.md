# User Stories

## Personas

### 1. The Roommate Coordinator (Primary)
- **Name:** Alex
- **Age:** 26
- **Context:** Lives with 5 roommates, does weekly grocery shopping
- **Pain:** Spends 30 min/week calculating complex splits
- **Goal:** Quick, accurate splitting without spreadsheets

### 2. The Trip Planner (Secondary)
- **Name:** Maya
- **Age:** 32
- **Context:** Organizes group trips 3-4 times a year
- **Pain:** Tracking varied expenses (hotels, food, activities) across 8 people
- **Goal:** Fair splits that account for who participated in what

### 3. The Casual User (Tertiary)
- **Name:** Jordan
- **Age:** 22
- **Context:** Occasional dinners with friends, rarely splits bills
- **Pain:** Apps are too complex for simple needs
- **Goal:** Split a dinner in under 30 seconds

---

## Epic 1: Group Creation & Management

### US-GRP-01: Create a Group
**As** Alex (Roommate Coordinator)  
**I want to** create a new group for my roommates  
**So that** we can track shared expenses together

**Acceptance Criteria:**
- [ ] Can set group name
- [ ] Can add group emoji/icon
- [ ] Can set currency (USD by default)
- [ ] Group is created and user becomes admin

---

### US-GRP-02: Invite via QR Code
**As** Maya (Trip Planner)  
**I want to** invite friends by showing a QR code from my phone  
**So that** they can join instantly without typing anything

**Acceptance Criteria:**
- [ ] Group settings shows QR code
- [ ] QR code contains invite link
- [ ] Scanning QR opens app or app store
- [ ] Friend sees group join confirmation

---

### US-GRP-03: Invite via Link/Code
**As** Alex  
**I want to** share an invite link in our WhatsApp group  
**So that** all roommates can join

**Acceptance Criteria:**
- [ ] Can generate shareable link
- [ ] Can see 6-character invite code
- [ ] Link expires after 7 days (configurable)
- [ ] Can regenerate invite

---

## Epic 2: Bill Creation (Speed Parser)

### US-BILL-01: Fast Item Entry
**As** Alex  
**I want to** enter 20 grocery items in under 60 seconds  
**So that** logging bills doesn't feel like a chore

**Acceptance Criteria:**
- [ ] Continuous spreadsheet-style input
- [ ] Type name → Next → Price → Next → Qty → Done → New row
- [ ] Running total updates live
- [ ] Keyboard stays open during input

---

### US-BILL-02: Quantity Expansion
**As** Alex  
**I want to** enter "Milk x2, $12" and have it create 2 separate items  
**So that** each bottle can be split independently

**Acceptance Criteria:**
- [ ] Quantity field (default 1)
- [ ] At split time, "Milk x2" becomes "Milk (1)" and "Milk (2)"
- [ ] Each can have different participants

---

### US-BILL-03: Quick Bill
**As** Jordan (Casual User)  
**I want to** split a $45 Uber ride equally without entering items  
**So that** I can finish in seconds

**Acceptance Criteria:**
- [ ] "Quick Bill" option at bill creation
- [ ] Enter: Description, Amount, Group
- [ ] Choose: Equal, Select People, or Just Me
- [ ] No self-select (creator assigns)

---

### US-BILL-04: Add Category
**As** Alex  
**I want to** tag my bill as "🍔 Food"  
**So that** I can see my spending by category later

**Acceptance Criteria:**
- [ ] Optional category dropdown
- [ ] 8 preset categories with icons
- [ ] Category shown on bill card

---

## Epic 3: Self-Select Splitting

### US-SEL-01: View Items to Select
**As** a roommate (Sam)  
**I want to** see all items Alex added with their prices  
**So that** I know what I can claim

**Acceptance Criteria:**
- [ ] See item list with names and prices
- [ ] See who else has selected each item (avatars)
- [ ] See unclaimed items highlighted

---

### US-SEL-02: Tap to Join
**As** Sam  
**I want to** tap "Tomatoes" to add myself to that split  
**So that** I pay my share

**Acceptance Criteria:**
- [ ] Tap anywhere on item row to join
- [ ] My avatar appears on the item
- [ ] "Your share" counter updates live
- [ ] Color bar updates with my color

---

### US-SEL-03: Custom Split
**As** Sam  
**I want to** pay only 25% of the Rice instead of equal  
**So that** I pay proportionally to how much I'll use

**Acceptance Criteria:**
- [ ] Tap expand arrow (▼) to open options
- [ ] Choose: Equal, Custom %, or Custom $
- [ ] See current split breakdown
- [ ] Changes reflect immediately

---

### US-SEL-04: Add Someone Else
**As** Alex  
**I want to** assign the "Eggs" to Jordan who forgot to select  
**So that** nothing stays unclaimed

**Acceptance Criteria:**
- [ ] Expand arrow → "+ Add someone else"
- [ ] Select from group members
- [ ] Person is added to split

---

## Epic 4: Balances & Settlement

### US-BAL-01: View Who Owes Me
**As** Alex  
**I want to** see at a glance who owes me money  
**So that** I can follow up

**Acceptance Criteria:**
- [ ] Home shows total balance
- [ ] Tap to see breakdown by person
- [ ] Green = owed to me, Red = I owe

---

### US-BAL-02: Settle Up
**As** Sam  
**I want to** mark that I paid Alex $28.50  
**So that** our balance is cleared

**Acceptance Criteria:**
- [ ] Tap "Settle Up" on Alex's balance
- [ ] Pre-filled with full amount
- [ ] Confirm settlement
- [ ] Balance updates to $0

---

### US-BAL-03: Remind Someone
**As** Alex  
**I want to** send a nudge to Sam who hasn't paid  
**So that** I don't have to text awkwardly

**Acceptance Criteria:**
- [ ] "Remind" button on pending balance
- [ ] Sam receives push notification
- [ ] Rate limited (1 per 24 hours)

---

## Epic 5: Receipt & Sharing

### US-REC-01: View Final Receipt
**As** Alex  
**I want to** see a nice receipt-style summary of the bill  
**So that** everyone knows who owes what

**Acceptance Criteria:**
- [ ] Items listed with avatars below each
- [ ] Tax/tip breakdown
- [ ] "Who Owes What" section with amounts

---

### US-REC-02: Share Receipt
**As** Alex  
**I want to** share the receipt image to our WhatsApp group  
**So that** everyone has a record

**Acceptance Criteria:**
- [ ] "Share" button generates image
- [ ] Opens native share sheet
- [ ] Can share to any app

---

## Epic 6: Recurring Bills (v1.1)

### US-REC-01: Set Up Recurring
**As** Alex  
**I want to** set up Netflix as a monthly recurring bill  
**So that** it auto-creates every month

**Acceptance Criteria:**
- [ ] Toggle "Recurring" on bill creation
- [ ] Choose frequency (weekly, monthly, etc.)
- [ ] Set due date
- [ ] Bill auto-creates 3 days before

---

## Epic 7: Analytics (v1.1)

### US-ANA-01: Monthly Summary
**As** Alex  
**I want to** see how much I spent this month by category  
**So that** I can budget better

**Acceptance Criteria:**
- [ ] Insights tab/section
- [ ] Pie chart by category
- [ ] Total monthly amount
- [ ] Comparison to last month

---

## Epic 8: Onboarding

### US-ONB-01: First Time Experience
**As** a new user  
**I want to** understand what PrismSplit does in 30 seconds  
**So that** I can decide to sign up

**Acceptance Criteria:**
- [ ] 3-4 welcome screens
- [ ] Key features highlighted
- [ ] Skip option
- [ ] Create Account / Sign In at end

---

### US-ONB-02: Speed Parser Tutorial
**As** Alex (first time creating a bill)  
**I want to** see a short tooltip explaining Speed Parser  
**So that** I know how to use it efficiently

**Acceptance Criteria:**
- [ ] Tooltip on first Speed Parser use
- [ ] Shows: "Type → Next → Price → Done → New row"
- [ ] Dismissible, don't show again option
