# PrismSplit - Detailed Screen Prompts for UI/UX Design

> **Design Inspiration:** Tabbie, SplitZ, Spliter, Easy Split, Cash App, Venmo  
> **Theme:** Refined Pastel - Light mode (default) with Dark mode alternative  
> **Style:** Modern, friendly, approachable with lavender and peach accents

---

## 📐 Design System Summary

### ☀️ Light Mode Colors (Default)
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | #FEFDFB | Warm cream background |
| `--bg-surface` | #FFFBF5 | Cards, containers (cream white) |
| `--bg-elevated` | #F5F3FF | Modals, inputs (subtle lavender tint) |
| `--accent-primary` | #A78BFA | Lavender primary |
| `--accent-secondary` | #FDBA74 | Peach secondary |
| `--accent-gradient` | #A78BFA → #FDBA74 | FAB, primary CTAs |
| `--success-text` | #059669 | Money owed to you (darker for readability) |
| `--success-bg` | #D1FAE5 | Success backgrounds (soft mint) |
| `--success-light` | #86EFAC | Sage green for icons |
| `--error-text` | #F87171 | Money you owe (vibrant coral) |
| `--error-bg` | #FEE2E2 | Error backgrounds (soft pink) |
| `--error-light` | #FDA4AF | Soft rose for warnings |
| `--warning` | #D97706 | Warnings, unclaimed items |
| `--info` | #7DD3FC | Sky blue |
| `--text-primary` | #1C1917 | Charcoal headings |
| `--text-secondary` | #78716C | Warm gray body text |
| `--text-muted` | #A8A29E | Light warm gray hints |
| `--border` | #E5E5E5 | Subtle neutral borders |

### 🌙 Dark Mode Colors (Alternative)
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | #09090B | Near black background |
| `--bg-surface` | #18181B | Cards, containers |
| `--bg-elevated` | #27272A | Modals, overlays |
| `--accent-primary` | #A78BFA | Lavender (same) |
| `--accent-gradient` | #A78BFA → #FDBA74 | FAB, CTAs |
| `--success` | #10B981 | Emerald green |
| `--success-bg` | #10B98115 | Success backgrounds |
| `--error` | #F87171 | Coral (same) |
| `--error-bg` | #F8717115 | Error backgrounds |
| `--warning` | #F59E0B | Amber |
| `--text-primary` | #FAFAFA | Near white headings |
| `--text-secondary` | #A1A1AA | Gray body text |
| `--text-muted` | #71717A | Hints, placeholders |
| `--border` | #3F3F46 | Borders |

### Person Colors (Avatars - Same Both Themes)
| Person | Color | Hex |
|--------|-------|-----|
| Person 1 | Lavender | #A78BFA |
| Person 2 | Sky Blue | #7DD3FC |
| Person 3 | Sage | #86EFAC |
| Person 4 | Peach | #FDBA74 |
| Person 5 | Rose | #FDA4AF |
| Person 6 | Mint | #6EE7B7 |

### Typography
- **Font:** Inter (or SF Pro for iOS)
- **Headings:** 600-700 weight
- **Body:** 400-500 weight
- **Numbers/Amounts:** Tabular nums, 600 weight

### Spacing & Radius
- Card padding: 16px
- Card radius: 16px
- Button radius: 12px
- Avatar size: 32px (small), 40px (medium)
- Bottom nav height: 80px

---

## 🖼️ Screen-by-Screen Prompts

---

### Screen 1: Onboarding (Welcome Screens)

**Purpose:** First-time user experience, 4 swipeable screens that delight and educate

**Prompt:**
```
Design a stunning 4-screen onboarding flow for "PrismSplit" bill splitting app. Use warm, inviting pastel colors with lavender and peach accents.

GLOBAL STYLE:
- Background: Warm cream gradient (#FEFDFB → #F5F3FF)
- Primary accent: Lavender (#A78BFA)
- Secondary accent: Peach (#FDBA74)  
- Text: Charcoal (#1C1917) for headlines, warm gray (#78716C) for body
- Illustrations: Soft, friendly 3D or isometric style with pastel colors
- Typography: Inter font, headlines 28px bold, body 16px regular

SCREEN 1 - "NO MORE AWKWARD MATH":
- Full-bleed illustration: Friends at a restaurant table with a giant receipt, looking stressed
- One friend holds up phone showing PrismSplit - everyone smiles
- Headline: "No More Awkward Math"
- Subtext: "Split any bill item-by-item. Fair, fast, frustration-free."
- Bottom: Pagination dots (4 total), lavender active dot
- "Skip" link top-right (charcoal text, subtle)
- Large "Next" button - lavender-to-peach gradient pill

SCREEN 2 - "TAP YOUR ITEMS":
- Illustration: Phone screen showing item list with colorful avatar circles below each item
- Animated touch indicator tapping items
- Headline: "Tap What's Yours"
- Subtext: "Just tap the items you ordered. We handle the rest."
- Visual: Show colored split bar at bottom of items
- Continue button with gradient

SCREEN 3 - "SEE THE SPLIT INSTANTLY":
- Illustration: Receipt transforming into a visual split with colored segments
- Avatars (lavender, sky blue, sage, peach circles) connecting to items
- Headline: "Crystal Clear Splits"
- Subtext: "Color-coded avatars show exactly who pays what. No confusion."
- Animated prism logo reflecting colors

SCREEN 4 - "READY IN SECONDS":
- Illustration: Clock/stopwatch with items flying into a phone
- Speed lines and sparkles
- Headline: "20 Items in 60 Seconds"
- Subtext: "Our Speed Parser makes adding items lightning fast."
- Final CTA section with crystal prism logo (animated shimmer)
- Two buttons stacked:
  - "Get Started" - large lavender-peach gradient button
  - "I have an account" - text link below

ANIMATIONS:
- Parallax on illustrations as user swipes
- Dots animate with spring physics
- Gradient buttons pulse subtly on hover
- Illustrations have floating/breathing micro-motion

Style: Warm, friendly, approachable. NOT corporate. Feel like helping a friend split a bill. Soft shadows, rounded corners (16px), generous whitespace.
```

---

### Screen 2: Sign Up / Login

**Purpose:** Account creation and authentication - clean, fast, trustworthy

**Prompt:**
```
Design Sign Up and Login screens for PrismSplit with warm pastel aesthetic.

SIGN UP SCREEN:
- Background: Warm cream (#FEFDFB)
- Top: Back arrow (charcoal), "Create Account" title (28px bold)
- Logo: Crystal prism icon with lavender-peach gradient, subtle shimmer

HERO SECTION:
- Friendly tagline: "Let's get you set up 👋"
- Subtext: "Split bills with friends in under 60 seconds"

FORM SECTION (white card #FFFBF5, 16px padding, 16px radius, subtle shadow):
- "Your name" input field with smile icon
  - Placeholder: "What should we call you?"
- "Email" input field with mail icon
- "Password" input field with lock icon + show/hide toggle
- Input style: 
  - Background: #FFFBF5
  - Border: 1px solid #E5E5E5
  - Focus: Lavender border (#A78BFA), subtle glow
  - Text: #1C1917
  - Placeholder: #A8A29E
  - Height: 52px, radius: 12px

BUTTONS:
- "Create Account" - full-width lavender-peach gradient button (52px height)
- Divider: "or continue with" (gray line with text)
- Social buttons side-by-side:
  - Google button (white bg, subtle border, Google colors logo)
  - Apple button (black bg, white Apple logo)

BOTTOM (fixed):
- "Already splitting bills? Sign In" - gray text with lavender "Sign In" link
- Terms: "By signing up, you agree to our Terms and Privacy Policy"

LOGIN SCREEN:
- Similar warm layout
- "Welcome back! 👋" headline
- Subtext: "Your friends are waiting for you"
- Email and Password fields only
- "Forgot Password?" link (lavender text) below password
- "Sign In" gradient button
- "New here? Create Account" at bottom
- Optional: "Continue with Face ID" button (for returning users)

MICRO-INTERACTIONS:
- Input fields animate up when focused
- Success checkmark appears after valid email
- Button ripple effect on tap
- Smooth keyboard avoidance

Style: Warm, trustworthy, fast. Minimal friction. Social login prominent for quick signup.
```

---

### Screen 3: Home Dashboard

**Purpose:** Main landing screen, balance overview, quick actions

**Prompt:**
```
Design the Home Dashboard screen for PrismSplit with pastel light theme.

BACKGROUND: Warm cream (#FEFDFB)

HEADER:
- Top-left: "Hi, Alex 👋" greeting (24px semibold, charcoal)
- User avatar: Lavender circle with white "A" (40px)
- Top-right: Notification bell icon with red badge dot (if notifications)

BALANCE CARD (Hero - with subtle glow):
- Full-width card with rounded corners (16px)
- Background: White (#FFFBF5) with lavender border (#A78BFA30)
- Subtle glow: 0 0 40px rgba(167, 139, 250, 0.15)
- "Your Balance" label (14px, warm gray #78716C)
- Large amount: "+$142.50" (40px bold, sage green #059669) if owed
- Or: "-$85.00" (40px bold, coral #F87171) if owing
- Subtext: "across 3 groups" (14px warm gray)
- Right side: Small trend arrow icon

QUICK ACTIONS ROW (horizontal, evenly spaced):
- 4 circular icon buttons (48px each):
  - "Add Bill" (receipt icon) - lavender bg (#A78BFA), white icon
  - "Settle Up" (checkmark icon) - sage bg (#86EFAC), white icon
  - "Groups" (users icon) - sky blue bg (#7DD3FC), white icon
  - "Activity" (clock icon) - peach bg (#FDBA74), white icon
- Labels below each: 12px, warm gray

RECENT ACTIVITY SECTION:
- Section header: "Recent Activity" (18px semibold) + "See All" link (lavender)
- 3 activity cards (white #FFFBF5, subtle shadow):
  - Each shows: Emoji icon, description, amount (colored), timestamp
  - Example: "🍕 Pizza Night - You owe $28.50 - 2h ago"
  - Amount: Coral for owe, sage for owed

YOUR GROUPS SECTION:
- Section header: "Your Groups" (18px semibold)
- Horizontal scrollable cards (140px width):
  - Group emoji/avatar
  - Group name (14px semibold)
  - Balance: "+$45" (sage) or "-$20" (coral)
  - Member count: "4 members" (12px gray)
  - Subtle border, rounded corners

BOTTOM NAVIGATION:
- Background: White (#FFFBF5) with subtle top border
- 5 items: Home, Activity, [FAB], Groups, Profile
- FAB: Elevated 56px circle, lavender-peach gradient, white "+" icon
- FAB glow: 0 4px 16px rgba(167,139,250,0.3)
- Active tab: Lavender icon + label, inactive: gray

Style: Clean, airy, premium. Generous whitespace. Feels like a modern banking app but friendlier.
```

---

### Screen 4: Groups List

**Purpose:** View all groups user belongs to

**Prompt:**
```
Design the Groups List screen for PrismSplit with pastel light theme.

BACKGROUND: Warm cream (#FEFDFB)

HEADER:
- Title: "Groups" (28px bold, charcoal #1C1917)
- Right icons: Search magnifier, Plus icon (create group) - warm gray
- Safe area padding at top

SEARCH BAR (optional, expandable):
- When search icon tapped: Input field slides in from right
- Background: White (#FFFBF5), subtle border
- Placeholder: "Search groups..." 
- Lavender focus border

GROUPS LIST (Vertical scroll):
Each group card (white #FFFBF5, 16px radius, 16px padding, subtle shadow):
- Left: Group avatar (48px, emoji or 2-letter initials in colored peach circle)
- Center:
  - Group name (16px semibold, charcoal): "Roommates 🏠"
  - Member count: "6 members" (14px, warm gray #78716C)
  - Last activity: "Last bill: 2 days ago" (12px, light gray #A8A29E)
- Right:
  - Balance amount: "+$45.50" (sage #059669) or "-$28.00" (coral #F87171)
  - Chevron arrow (light gray)

GROUP CARDS EXAMPLES:
1. "Roommates 🏠" - 6 members - "+$125.50" (sage)
2. "Trip Squad ✈️" - 4 members - "-$85.00" (coral)
3. "Office Lunch 🍕" - 8 members - "$0.00" (gray, "settled")
4. "Family 👨‍👩‍👧" - 4 members - "+$50.00" (sage)

EMPTY STATE (if no groups):
- Friendly illustration of 3 people connecting phones
- "No groups yet!" (20px semibold)
- "Create a group to start splitting bills with friends" (14px gray)
- Lavender-peach gradient "Create Group" button

FAB OVERLAY:
- Floating 56px circle, lavender-peach gradient
- White "+" icon
- Positioned bottom-right with 16px padding
- Glow shadow: 0 4px 16px rgba(167,139,250,0.3)

Style: Clean, airy, cards feel touchable. Balance colors should pop against white cards.
```

---

### Screen 5: Group Detail

**Purpose:** View group bills, members, and group-level balance

**Prompt:**
```
Design the Group Detail screen for PrismSplit with pastel light theme.

BACKGROUND: Warm cream (#FEFDFB)

HEADER:
- Back arrow (left, charcoal)
- Group name: "Roommates 🏠" (18px semibold, center)
- Settings gear icon (right) - tapping opens group settings
- QR code icon (right) - for quick invite

GROUP BALANCE CARD (Hero):
- Full-width white card (#FFFBF5), 16px radius, subtle shadow
- Lavender left accent border (4px)
- "Your Balance in this Group" label (14px gray)
- Amount: "+$125.50" (32px bold, sage) or "-$85.00" (coral)
- Visual: Mini segmented bar showing owed vs owing
- "Settle Up" button (sage bg, white text) - only if you owe

MEMBERS SECTION:
- "Members" header (16px semibold) + "Invite" link (lavender)
- Horizontal row of member avatars (40px colored circles):
  - (A) lavender, (S) sky blue, (J) sage, (M) peach, (L) rose, (K) mint
- Tap avatar to see individual balance with that person
- "+2" overflow indicator if more than 6

TABS (Segmented Control):
- Three tabs: "Bills" | "Balances" | "Activity"
- Active tab: Lavender fill, white text
- Inactive: White fill, gray text
- Pill-style rounded corners

BILLS TAB (Default):
- "Add Bill" button (top-right, lavender outlined)
- Bills list (reverse chronological):

Bill Card (white, subtle shadow):
- Left: Category emoji (🛒)
- Center:
  - Bill name: "Costco Grocery" (16px semibold)
  - "Paid by Alex • Dec 10" (14px gray)
  - Category badge: "Shopping" (12px, lavender bg)
- Right:
  - Total: "$142.50" (16px semibold)
  - Your share: "-$28.50" (14px, coral)
  - Status badge: "Pending" (peach) or "Finalized" (sage)
- Bottom of card: Avatar dots showing participants

BALANCES TAB:
- List of members with individual balance
- "(A) Alex owes you $45.00" - sage amount, "Remind" button
- "(S) You owe Sam $12.00" - coral amount, "Pay" button

ACTIVITY TAB:
- Timeline of group activity
- "Alex added Costco Grocery • 2 days ago"

EMPTY STATE (no bills):
- Illustration of receipt with sparkles
- "No bills yet in this group"
- "Add the first bill to start tracking"
- "Add Bill" button
  - Created by: "Paid by Alex • Dec 10" (gray)
  - Status badge: "Draft" (yellow) or "Finalized" (green) or "Settled" (gray)
- Right:
  - Total: "$142.50"
  - Your share: "-$28.50" (red, smaller)
- Bottom: Avatar dots showing participants

BALANCES TAB:
- List of members with individual balance
- Example: "(A) Alex owes you $45.00" with green amount
- "Remind" button beside each

EMPTY STATE:
- "No bills yet"
- "Add the first bill to this group"
- "Add Bill" button

Style: Organized, tabbed interface. Bills should be scannable. Use status badges prominently.
```

---

### Screen 6: Create Bill - Step 1 (Bill Info)

**Purpose:** Enter bill name, select group, choose bill type

**Prompt:**
```
Design the Create Bill screen (Step 1) for PrismSplit with pastel light theme.

BACKGROUND: Warm cream (#FEFDFB)

HEADER:
- "✕" close button (left, charcoal)
- "New Bill" title (18px semibold, center)
- "Next" text button (right, lavender #A78BFA, disabled: gray #A8A29E)
- Progress: 3 dots below header (dot 1 lavender, others gray outline)

BILL TYPE SELECTOR:
Two tappable cards side by side (48% width each, 12px gap):

Card 1 - "Itemized Bill" (selected):
- Background: White (#FFFBF5)
- Border: 2px solid lavender (#A78BFA)
- Icon: Receipt/list icon (lavender)
- Title: "Itemized Bill" (16px semibold)
- Subtitle: "Add items with individual splits" (14px gray)
- Check indicator: Lavender circle with white checkmark

Card 2 - "Quick Bill":
- Background: White (#FFFBF5)
- Border: 1px solid #E5E5E5
- Icon: Lightning bolt (gray)
- Title: "Quick Bill" (16px semibold, gray)
- Subtitle: "Simple total split" (14px gray)

FORM SECTION (white card, subtle shadow):

"What's this for?" Input:
- Label above (14px semibold, charcoal)
- Large input: 52px height, 12px radius
- Placeholder: "e.g., Costco Grocery" (gray)
- Focus: Lavender border + subtle glow

"Which group?" Dropdown:
- Shows selected group with emoji: "🏠 Roommates"
- Chevron down arrow
- On tap: Bottom sheet with group list

"Who paid?" Selector:
- Shows avatar + name: "(A) You paid"
- Tap to change: Bottom sheet with member list

"Category" (Optional):
- Horizontal scroll of category chips
- 🛒 Shopping (selected, lavender bg)
- 🍔 Food, 🏠 Home, ✈️ Travel, etc.

CONTINUE BUTTON (fixed bottom):
- Full-width lavender-peach gradient
- "Continue to Items →"
- 52px height, 12px radius
- Disabled state: gray bg

Style: Clean form with generous spacing. Focus states should feel responsive.
```

---

### Screen 7: Create Bill - Step 2 (Speed Parser / Add Items)

**Purpose:** Fast item entry with Speed Parser interface

**Prompt:**
```
Design the Speed Parser screen for PrismSplit with pastel light theme. This is the CORE feature.

BACKGROUND: Warm cream (#FEFDFB)

HEADER:
- Back arrow (left, charcoal)
- "Add Items" title (18px semibold, center)
- Running total: "$47.50" (right, lavender #A78BFA, bold, updates live)
- Progress: Dot 2 of 3 lavender filled

INSTRUCTION BANNER (subtle):
- Light lavender background (#F5F3FF)
- Icon: Lightning bolt
- Text: "Type → Next → Price → Done → New row" (14px)
- Dismissible with X

ITEMS LIST (spreadsheet-style):
White card containing item rows:

ROW TEMPLATE:
┌─────────────────────────────────────────────────────────────┐
│ [Item Name Input  ] [$Price  ] [Qty +/-] [✕]               │
└─────────────────────────────────────────────────────────────┘

POPULATED EXAMPLE:
Row 1: [Tomatoes        ] [$4.50  ] [1] [✕] ✓ (checkmark = complete)
Row 2: [Milk            ] [$6.00  ] [2] [✕] ✓ (shows "x2")
Row 3: [Rice 10lb       ] [$18.00 ] [1] [✕] ✓
Row 4: [Cheese          ] [$8.00  ] [1] [✕] ✓
Row 5: [________________] [$__.__] [1] ← Auto-focused, cursor blinking

INPUT STYLING:
- Background: #FFFBF5
- Border: 1px solid #E5E5E5
- Focus: Lavender border
- Completed row: Subtle sage left border (#86EFAC)
- Text: Charcoal #1C1917
- Delete X: Light gray, red on hover

+ ADD TAX/TIP (Expandable section):
- Collapsed state: "+ Add Tax/Tip" link (lavender)
- Expanded:
  - Tax: [___%] or [$___] toggle
  - Tip preset pills: [10%] [15%] [20%] [Custom]
  - Tip pills: Lavender bg when selected

SUMMARY FOOTER (sticky above keyboard):
- White background, top border
- Subtotal: $36.50
- Tax (8%): $2.92
- Tip: $5.50
- ─────────────
- **Total: $44.92** (18px bold)

CONTINUE BUTTON:
- "Share with Group →" (lavender-peach gradient)
- Disabled if no items

KEYBOARD NOTES:
- Name: Text keyboard → "Next" advances
- Price: Numeric pad → "Next" advances
- Qty: Numeric pad → "Done" creates new row

Style: Feels like a smart spreadsheet. Running total animates on update. Completed rows have subtle sage indicator.
```

---

### Screen 8: Participant Selection View (Self-Select)

**Purpose:** Group members tap items to join splits. Color-coded avatars below each item.

**Prompt:**
```
Design the Participant Self-Select screen for PrismSplit with pastel light theme.

BACKGROUND: Warm cream (#FEFDFB)

HEADER:
- Back arrow (left, charcoal)
- Bill name: "Costco Grocery" (18px semibold, center)
- Your share: "$12.50" (right, lavender #A78BFA, updates live)

SUBHEADER:
- "Paid by Alex • $142.50 total • Dec 10" (14px, warm gray)
- "Tap items you're splitting" (instruction, lavender)

ITEMS LIST:
Each item is a tappable card with clear visual states.

ITEM CARD TEMPLATE:
┌─────────────────────────────────────────────────────────────┐
│  Item Name                               $Price          ▼ │
│  (A) (S) (Y)                             ← Avatar circles  │
│  ▔▔▔🟣▔▔▔▔▔🔵▔▔▔▔▔🟡▔▔                     ← Thin split bar │
└─────────────────────────────────────────────────────────────┘

ITEM CARD STYLING:
- Background: White (#FFFBF5)
- Border: 1px solid #E5E5E5
- Radius: 12px
- Padding: 16px
- Margin between: 8px

ITEM STATES:

1. UNCLAIMED (No one selected):
- Background: #FAFAFA (slightly gray tint)
- Yellow warning badge: "⚠️ No one yet"
- Dashed gray border on split bar
- "Tap to claim" hint (12px, gray)

2. OTHERS SELECTED (You haven't joined):
- Normal white background
- Shows other avatars: (A) lavender, (S) sky blue
- Split bar shows their colors
- "Tap to join" hint (12px, lavender)

3. YOU'RE IN (You selected this item):
- Lavender tint background (#F5F3FF)
- 2px lavender border (#A78BFA)
- Your avatar highlighted slightly larger
- "✓ You're in" badge (sage background)
- Split bar includes your color

4. MANY PEOPLE (3+ selected):
- Shows max 3 avatars + "+N" overflow
- Example: (A) (S) (Y) +3
- Split bar: 3 colors + gradient fade for "+3"

AVATAR CIRCLES:
- Size: 24px
- Overlap: 4px (like Tabbie)
- Colors: Lavender, Sky Blue, Sage, Peach, Rose, Mint
- 2px white border around each

SPLIT BAR:
- Height: 4px
- Position: Bottom of card, 16px inset
- Segments proportional to split percentage
- Smooth color transitions
- Animation: 200ms ease on changes

EXPAND ARROW (▼):
- Right side of row
- Light gray, rotates to ▲ when expanded
- Tapping opens custom split options

BOTTOM FIXED SECTION:
- White card with subtle top shadow
- "Your Share" label (14px, gray)
- Amount: "$12.50" (28px bold, lavender)
- "3 items selected" (14px gray)
- "Confirm" button (full-width lavender-peach gradient)

Style: Clean, responsive. Selection should feel instant with subtle pulse animation. Avatar appearances animate in 200ms.
```

---

### Screen 9: Expanded Item Options (Custom Split)

**Purpose:** When user taps ▼, shows detailed split options for that item

**Prompt:**
```
Design the Expanded Item Options bottom sheet for PrismSplit with pastel theme.

TRIGGER: User taps ▼ on "Rice 10lb - $18.00"

BOTTOM SHEET:
- Slides up from bottom with spring animation
- Background: White (#FFFBF5)
- Radius: 24px (top corners only)
- Drag handle: Gray pill at top

HEADER:
- Item name: "Rice 10lb" (18px bold, charcoal)
- Price: "$18.00" (18px semibold, lavender)
- Close button (✕) top-right

YOUR SHARE SECTION:
White card with radio options:
┌─────────────────────────────────────────────────────────────┐
│ YOUR SHARE (14px semibold label)                            │
│                                                             │
│ ● Equal with others          $3.00 (sage)                  │
│ ○ Custom percentage          [___]% → $____                │
│ ○ Custom amount              $[___]                        │
│                                                             │
│ [Leave this item] ← Coral text, no bg                      │
└─────────────────────────────────────────────────────────────┘

Radio button styling:
- Selected: Lavender filled circle
- Unselected: Gray outline
- Touch target: Full row (44px height)

CURRENT SPLIT BREAKDOWN:
List of participants with their shares:
┌─────────────────────────────────────────────────────────────┐
│ CURRENT SPLIT (14px semibold, gray)                         │
│                                                             │
│ (A) Alex             $4.50  "custom" badge (lavender)      │
│ (S) Sam              $3.00                                  │
│ (J) Jordan           $3.00                                  │
│ (Y) You              $3.00  ← Row has lavender bg tint     │
│ (M) Mike             $2.25                                  │
│ (L) Lisa             $2.25                                  │
│                      ─────                                  │
│ Total:              $18.00  (should = item price)          │
└─────────────────────────────────────────────────────────────┘

ADD SOMEONE ELSE:
- "+ Add someone to this item" button (lavender outlined)
- Tapping opens member picker with checkboxes

VISUAL SPLIT BAR (larger version):
- 8px height showing proportional segments
- Colored by person: lavender, sky, sage, peach, etc.

SAVE BUTTON (if changes made):
- "Save Changes" (lavender-peach gradient, full width)
- Disabled if no changes

Style: Clear, spacious bottom sheet. Real-time updates as user adjusts splits. Total should always equal item price.
```

---

### Screen 10: Final Bill Overview (Receipt Style)

**Purpose:** Digitized receipt showing all items with participant avatars and totals

**Prompt:**
```
Design the Final Bill Overview in receipt style for PrismSplit with pastel theme.

BACKGROUND: Warm cream (#FEFDFB)

HEADER (Outside receipt):
- ✕ Close button (left, charcoal)
- "Edit Bill" link (right, lavender)

RECEIPT CARD (Centered, paper-style):
- Background: #FFFBF5 (cream white)
- Subtle shadow for paper depth
- Dashed borders for receipt feel
- Max width: 340px, centered

RECEIPT CONTENT:
┌─────────────────────────────────────────────────┐
│                                                 │
│           💎 PrismSplit                         │
│      "Split smarter, not harder"               │
│                                                 │
│  - - - - - - - - - - - - - - - - - - - - - -   │
│                                                 │
│  Costco Grocery                                 │
│  Dec 10, 2024 • Paid by Alex                   │
│  🛒 Shopping                                    │
│                                                 │
│  - - - - - - - - - - - - - - - - - - - - - -   │
│                                                 │
│  Tomatoes                          $4.50       │
│  (🟣A) (🔵S) (🟢Y)                              │
│                                                 │
│  Milk x2                          $12.00       │
│  (🟣A) (🟠Y)                                    │
│                                                 │
│  Rice 10lb                        $18.00       │
│  (🟣A) (🔵S) (🟢J) +3                           │
│                                                 │
│  Cheese                            $8.00       │
│  (🟠Y)                                          │
│                                                 │
│  - - - - - - - - - - - - - - - - - - - - - -   │
│                                                 │
│  Subtotal                         $42.50       │
│  Tax (8.5%)                        $3.61       │
│  ═══════════════════════════════════           │
│  TOTAL                            $46.11       │
│                                                 │
│  ═══════════════════════════════════           │
│                                                 │
│  WHO OWES WHAT                                 │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │(🟣) Alex │  │(🔵) Sam  │  │(🟢) Jordan│     │
│  │  PAID    │  │ $8.75    │  │  $5.50   │     │
│  │ ✓ Payer  │  │ owes Alex│  │ owes Alex│     │
│  └──────────┘  └──────────┘  └──────────┘     │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │(🟠) You  │  │(🌸) Mike │  │(🌿) Lisa │     │
│  │ $14.79   │  │  $8.42   │  │  $8.65   │     │
│  │ owes Alex│  │ owes Alex│  │ owes Alex│     │
│  └──────────┘  └──────────┘  └──────────┘     │
│                                                 │
└─────────────────────────────────────────────────┘

WHO OWES GRID:
- 2x3 or 3x2 grid of person cards
- Each card shows: Avatar, Name, Amount, Status
- Payer card: Sage bg, "PAID ✓"
- You card: Lavender tint bg, coral amount if owing

ACTION BUTTONS (Below receipt):
- "Share Receipt" (lavender outlined with share icon)
- "Download" (peach outlined with download icon)

ANIMATIONS:
- Receipt appears with subtle slide-up
- Avatars animate in sequentially
- Total counter animation

Style: Feels like holding a real receipt. Paper texture subtle. Numbers scannable. Clear visual of who owes what.                                                 │
└─────────────────────────────────────────────────┘

AVATARS: Colored circles with initials (same as everywhere)

ACTION BUTTONS (Below receipt):
- [📤 Share] - Share receipt as image
- [⬇️ Download] - Save as image/PDF

SETTLE UP SECTION (If viewing your own bill):
- List people who owe you with "Remind" buttons
- Or "Pay" buttons for people you owe

Style: Clean receipt aesthetic. Light card on dark background creates nice contrast. Dotted lines for separators. Bold for totals. Colored avatars should pop against the light background.
```

---

### Screen 11: Quick Bill (Simple Split)

**Purpose:** Fast bill creation without itemization

**Prompt:**
```
Design the Quick Bill screen for PrismSplit with pastel theme - for simple expenses.

BACKGROUND: Warm cream (#FEFDFB)

HEADER:
- ✕ Close (left, charcoal)
- "Quick Bill" (center, 18px semibold)
- "Save" (right, lavender #A78BFA, disabled: gray)

HERO SECTION:
- Icon: ⚡ Lightning bolt on lavender circle
- "Split a simple expense in seconds"

FORM (white card, subtle shadow):
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  What's this for?                                           │
│  [Uber to airport_________________________]                 │
│  Input: 52px height, 12px radius, lavender focus           │
│                                                             │
│  Amount                                                     │
│  [$] [45.00                              ]                 │
│  Large input, numeric keyboard auto-opens                   │
│                                                             │
│  Group                                                      │
│  [🏠 Roommates  ▼                         ]                │
│  Dropdown opens bottom sheet with group list               │
│                                                             │
│  Category                                                   │
│  [🚗 Transport  🍔 🏠 🛒 ✈️  →]                            │
│  Horizontal scroll of chips                                │
│                                                             │
│  How to split?                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│  │  Equal   │ │ Select   │ │ Just Me  │                   │
│  │   👥     │ │ People   │ │   👤     │                   │
│  │Selected  │ │          │ │          │                   │
│  │Lavender  │ │ Gray     │ │ Gray     │                   │
│  └──────────┘ └──────────┘ └──────────┘                   │
│                                                             │
│  [If "Select People" chosen:]                              │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ ☑ (🟣) Alex                             $11.25      │ │
│  │ ☑ (🔵) Sam                              $11.25      │ │
│  │ ☐ (🟢) Jordan                            —          │ │
│  │ ☑ (🟠) You                              $11.25      │ │
│  └──────────────────────────────────────────────────────┘ │
│  Per person: $11.25 (live update, lavender)               │
│                                                             │
└─────────────────────────────────────────────────────────────┘

SAVE BUTTON (fixed bottom):
- Full-width lavender-peach gradient
- "Create Bill" (white text)
- Disabled: gray bg

Style: Simple, fast. Split type cards should be clearly togglable. Member selection with checkboxes, amounts update live.
```

---

### Screen 12: Friends / Balances List

**Purpose:** See balances with all friends across groups

**Prompt:**
```
Design the Friends List screen for PrismSplit with pastel theme.

BACKGROUND: Warm cream (#FEFDFB)

HEADER:
- "Friends" title (28px bold, charcoal)
- Search icon (right, charcoal)
- "+" Add Friend icon (right)

SUMMARY CARD (Hero, white with subtle shadow):
- "Across all groups" label (14px gray)
- Net balance: "+$142.50" (32px bold, sage) or "-$85.00" (coral)
- Visual: Small gauge or bar showing owed vs owing

FILTER TABS (Pill-style):
- "All" | "Owe You" | "You Owe" | "Settled"
- Active: Lavender bg, white text
- Inactive: White bg, gray text
- Horizontal scroll if needed

FRIENDS LIST (white cards):
Each friend row:
┌─────────────────────────────────────────────────────────────┐
│ (🟣A) Alex                                      →          │
│       Roommates, Trip Squad (shared groups)                │
│       ─────────────────────                                │
│       Owes you: +$45.50 (sage)         [Remind] btn       │
└─────────────────────────────────────────────────────────────┘

ROW STYLING:
- Avatar: 40px colored circle
- Name: 16px semibold, charcoal
- Shared groups: 12px, warm gray, italic
- Amount: Right-aligned, colored (sage/coral)
- Button: Outlined, 32px height

FRIEND STATES:
- Owes you: Sage amount, "Remind" button (outlined sage)
- You owe: Coral amount, "Pay" button (outlined coral)
- Settled: Gray "$0.00" with "✓ Settled" badge

EMPTY STATE:
- Illustration of two people connecting phones
- "No friends yet!"
- "Start splitting with friends you trust"
- "Find Friends" lavender button

Style: Clean list with clear visual hierarchy. Balance colors should pop. Actions easily accessible.
```

---

### Screen 13: Account / Settings

**Purpose:** User profile and app settings

**Prompt:**
```
Design the Account/Settings screen for PrismSplit with pastel theme.

BACKGROUND: Warm cream (#FEFDFB)

HEADER:
- "Account" title (28px bold, charcoal)
- No back button (this is a root tab)

PROFILE CARD (White, subtle shadow, centered):
- Large avatar: 80px lavender circle with white initial "A"
- Name: "Alex Johnson" (20px semibold)
- Email: "alex@email.com" (14px, warm gray)
- "Edit Profile" button (lavender outlined, 36px height)
- Tap avatar to change photo

SETTINGS LIST (grouped sections, white cards):

--- PREFERENCES ---
| Setting           | Control         |
|-------------------|-----------------|
| 🔔 Notifications  | Toggle (lavender when on) |
| 💱 Currency       | "USD" → chevron |
| 🌙 Dark Mode      | Toggle (lavender when on) |
| 🎨 Theme Color    | Color dots selector |

--- YOUR STUFF ---
| Setting           | Detail          |
|-------------------|-----------------|
| 👥 Your Groups    | "5 groups" → chevron |
| ✉️ Pending Invites | "2 new" badge (peach) → |
| 📊 My Stats       | → opens analytics |

--- ACCOUNT ---
| Setting           | Control         |
|-------------------|-----------------|
| 🔐 Change Password | → chevron      |
| 🔗 Linked Accounts | Google ✓, Apple ✓ |
| 📤 Export Data    | → chevron      |

--- ABOUT ---
| Setting           | Control         |
|-------------------|-----------------|
| ❓ Help & FAQ     | → chevron      |
| 📜 Terms         | → chevron      |
| 🔒 Privacy       | → chevron      |
| ℹ️ Version        | "1.0.0" (gray) |

SIGN OUT (at bottom):
- "Sign Out" button (coral text, no bg, full width)
- Confirmation dialog on tap

DELETE ACCOUNT (subtle):
- "Delete Account" link (smaller, gray text)

Style: Organized, scannable. Toggle switches should use lavender when active. Clear section groupings with headers.
```
- "Privacy Policy" →
- "Version 1.0.0"

DANGER ZONE (Red section):
- "Sign Out" (red text)
- "Delete Account" (red text, with confirmation)

Style: Clean settings list, grouped logically. Toggles should be purple when on. Clear destructive action styling.
```

---

### Screen 14: Activity Feed

**Purpose:** Transaction history across all groups

**Prompt:**
```
Design the Activity Feed screen for PrismSplit with pastel theme.

BACKGROUND: Warm cream (#FEFDFB)

HEADER:
- "Activity" title (28px bold, charcoal)
- Filter icon (right) → Opens filter bottom sheet

FILTER PILLS (Horizontal scroll, white bg):
- [All] [Bills] [Settlements] [Groups: All ▼]
- Active: Lavender bg, white text
- Inactive: White bg, gray text, subtle border

ACTIVITY LIST (Reverse chronological, grouped by day):

DATE HEADER:
- "Today" / "Yesterday" / "Dec 8, 2024"
- Sticky header, light lavender tint bg (#F5F3FF)

ACTIVITY CARDS (each is white #FFFBF5, subtle shadow):

Type 1 - NEW BILL:
┌─────────────────────────────────────────────────────────────┐
│ 🧾 New bill added                                2h ago    │
│ "Costco Grocery" in Roommates                              │
│ Paid by (🟣A) Alex • $142.50                               │
│ Your share: -$28.50 (coral)                                │
│ [View Bill →] (lavender text)                              │
└─────────────────────────────────────────────────────────────┘

Type 2 - SETTLEMENT:
┌─────────────────────────────────────────────────────────────┐
│ ✅ Settlement                                   Yesterday  │
│ (🔵S) Sam paid you $45.00 (sage)                           │
│ in Roommates                                               │
│ Sage left border accent                                    │
└─────────────────────────────────────────────────────────────┘

Type 3 - SOMEONE SELECTED:
┌─────────────────────────────────────────────────────────────┐
│ 👆 Selection update                               5h ago   │
│ (🟢J) Jordan selected items on "Costco Grocery"            │
│ Their share: $12.50                                        │
└─────────────────────────────────────────────────────────────┘

Type 4 - ADDED TO GROUP:
┌─────────────────────────────────────────────────────────────┐
│ � You're in!                                    2 days    │
│ (🟣A) Alex added you to "Trip Squad ✈️"                    │
│ [View Group →] (lavender text)                             │
│ Lavender left border accent                                │
└─────────────────────────────────────────────────────────────┘

EMPTY STATE:
- Illustration of clock with sparkles
- "No activity yet"
- "Your bill splits and settlements will appear here"

Style: Timeline feed with colored left borders by type. Tappable cards. Amounts colored (sage/coral). Avatars show who acted.
```

---

### Screen 15: Notifications / Invite Handling

**Purpose:** Push notification prompts and invite acceptance

**Prompt:**
```
Design Notification and Invite screens for PrismSplit with pastel theme.

BACKGROUND: Warm cream (#FEFDFB)

NOTIFICATION PERMISSION SCREEN:
- Full-screen with gradient header (lavender → peach)
- Large bell illustration (friendly, 3D-style)
- "Stay in the Loop 🔔" (28px bold)
- "Get notified when bills are added or friends pay you back" (16px gray)
- [Enable Notifications] lavender-peach gradient button
- [Maybe Later] gray text link below

IN-APP NOTIFICATION CENTER:
- Bell icon in header shows red badge count
- Full screen or dropdown list of notifications
- Each card: white #FFFBF5, subtle shadow
- Unread: Lavender left border (4px)
- Read: No border
- "Mark all read" link at top (lavender)

GROUP INVITE SCREEN (Opening invite link):
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│            You're invited to join! 🎉                       │
│                                                             │
│           [🏠 Large emoji, 64px]                            │
│           "Roommates"                                       │
│           (24px semibold, charcoal)                        │
│                                                             │
│           6 members • Created by Alex                       │
│           (14px gray)                                       │
│                                                             │
│           Member avatars: (🟣A)(🔵S)(🟢J)(🟠M)...           │
│           (overlapping 32px circles)                       │
│                                                             │
│           [Join Group] ← Lavender-peach gradient           │
│           [No thanks] ← Gray text link                     │
│                                                             │
│           Invite expires in 5 days (12px gray)             │
│                                                             │
└─────────────────────────────────────────────────────────────┘

INVITE CODE ENTRY:
- "Have an invite code?"
- 6 boxes for code input (like OTP)
- Auto-focus advances between boxes
- Lavender border on focused box
- [Join] gradient button

Style: Welcoming, friendly. Join button prominent. Decline de-emphasized.
```

---

### Screen 16: Settle Up Flow

**Purpose:** Mark payment as complete

**Prompt:**
```
Design the Settle Up flow for PrismSplit with pastel theme.

TRIGGER: User taps "Settle Up" for a specific balance

SETTLE UP SHEET (Bottom sheet, white bg):
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│ ─────────── (gray drag handle)                              │
│                                                             │
│ Settle up with Alex                                         │
│ (20px semibold, charcoal)                                  │
│                                                             │
│ (🟣A) Alex is owed                                         │
│     $45.50 (28px bold, coral)                              │
│                                                             │
│ ───────────────────────────────────────────                │
│                                                             │
│ How much?                                                   │
│ (14px gray)                                                 │
│                                                             │
│ [$45.50        ] ← Pre-filled, large input                 │
│                                                             │
│ Quick amounts:                                              │
│ [Full $45.50] [$20] [$10] [Custom]                         │
│ (Pill buttons, selected = lavender)                        │
│                                                             │
│ Payment method:                                             │
│ "Record as paid externally (Venmo, Cash, etc.)"            │
│ (14px gray, informational)                                 │
│                                                             │
│ [Confirm Settlement] ← Sage bg, white text                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘

CONFIRMATION SCREEN (After settling):
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│     BACKGROUND: Sage gradient overlay                       │
│                                                             │
│              ✓ (Large checkmark, 80px, white)              │
│              Animated draw-in                               │
│                                                             │
│              "Settled!" (28px bold, white)                 │
│                                                             │
│         You paid Alex $45.50                                │
│         (16px white)                                        │
│                                                             │
│         Balance: $0.00 ✓                                   │
│         (18px semibold, white)                             │
│                                                             │
│         [Done] ← White outlined button                     │
│                                                             │
│         🎊 Subtle confetti animation                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Style: Focused, simple flow. Pre-fill full amount. Sage success state. Celebrate with confetti!
```

---

## 📱 Component Library Summary

Include these reusable components in your design system:

| Component | Description |
|-----------|-------------|
| **Avatar** | Colored circle (24-40px), letter initial, colors: lavender/sky/sage/peach/rose/mint |
| **Avatar Stack** | Overlapping avatars (-4px), max 3 + "+N" overflow |
| **Balance Badge** | Sage/coral badge with amount (+/-) |
| **Split Bar** | 4px height, colored segments, proportional widths |
| **Primary Button** | Lavender-peach gradient, 52px height, 12px radius |
| **Secondary Button** | White bg, lavender border, lavender text |
| **Card** | White (#FFFBF5), 16px radius, subtle shadow |
| **Input Field** | White bg, 52px height, lavender focus border |
| **Bottom Nav** | White bg, 80px height, gradient FAB (center raised) |
| **List Item** | Avatar + content + action, lavender selected state |
| **Status Badge** | Pending (peach), Finalized (sage), Draft (gray) |
| **Tab Bar** | Pill segments, lavender active, white inactive |
| **Bottom Sheet** | White bg, 24px top radius, gray drag handle |

---

## 🎬 Animations & Micro-interactions

| Interaction | Animation |
|-------------|-----------|
| Tap item to select | Pulse/ripple + avatar scale-in (200ms) |
| Running total update | Counter slides up, lavender flash |
| Balance change | Odometer counter animation |
| FAB press | Scale 0.95 → 1.05 → 1.0, subtle bounce |
| Screen transitions | 250ms slide + fade |
| Success confirmation | Checkmark draws in + confetti burst |
| Real-time update | Avatar fades in (200ms ease) |
| Keyboard appear | Content shifts smoothly, FAB hides |

---

*End of Screen Prompts - Refined Pastel Theme*
