# PrismSplit - Comprehensive Figma Make Prompts

Premium mobile app design prompts based on research from Cash App, Venmo, Tabbie, and modern fintech UX best practices.

---

## 🎯 DESIGN PHILOSOPHY

1. **Cash App approach**: Bold, minimal, tool-focused (not social clutter)
2. **Tabbie inspiration**: Receipt-style bills, colored avatars per item
3. **Venmo learning**: Bottom nav over hamburger, quick actions
4. **Splitwise fixes**: Show WHO OWES prominently, not buried in bills
5. **Modern fintech**: Glassmorphism, vibrant gradients, micro-interactions

---

## 🚀 MASTER PROMPT FOR FIGMA MAKE

```
Create a premium mobile expense splitting app called "PrismSplit" with a modern fintech aesthetic inspired by Cash App's bold simplicity, Tabbie's receipt-style bills, and Venmo's approachability.

============================
DESIGN SYSTEM (Critical - Follow Exactly)
============================

THEME: Dual theme support - Light mode (default) with Dark mode alternative

============================
☀️ LIGHT MODE COLORS (Default):
============================
Background:         #FEFDFB (warm cream)
Surface (cards):    #FFFBF5 (cream white)
Surface Elevated:   #F5F3FF (subtle lavender tint)
Border:             #E5E5E5

Primary (Lavender):  #A78BFA (main brand color)
Secondary (Peach):   #FDBA74 (warm accent)
Primary Gradient:    linear-gradient(135deg, #A78BFA 0%, #FDBA74 100%)

Text Primary:        #1C1917 (charcoal)
Text Secondary:      #78716C (warm gray)
Text Muted:          #A8A29E (light warm gray)

Success Text:        #059669 (darker emerald for readability - money owed TO you)
Success Background:  #D1FAE5 (soft mint)
Success Light:       #86EFAC (sage green for icons)

Error Text:          #F87171 (vibrant coral - money you OWE)
Error Background:    #FEE2E2 (soft pink)
Error Light:         #FDA4AF (soft rose for warnings)

Warning:             #D97706 (darker amber - unclaimed items)
Warning Background:  #FEF3C7 (soft yellow)

Info:                #7DD3FC (sky blue)

Effects:
- Card shadow: 0 1px 3px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)
- FAB shadow: 0 4px 16px rgba(167,139,250,0.3), 0 8px 32px rgba(167,139,250,0.15)
- Glow (balance card): 0 0 40px rgba(167,139,250,0.15)
- Selected highlight: background #F5F3FF, border 2px solid #A78BFA

============================
🌙 DARK MODE COLORS (Alternative):
============================
Background:         #09090B (rich near-black)
Surface (cards):    #18181B
Surface Elevated:   #27272A (inputs, modals)
Border:             #3F3F46

Primary:            #A78BFA (lavender - same)
Primary Dark:       #8B5CF6 (pressed states)
Primary Gradient:   linear-gradient(135deg, #A78BFA 0%, #FDBA74 100%)

Text Primary:       #FAFAFA (white)
Text Secondary:     #A1A1AA
Text Muted:         #71717A

Success:            #10B981 (emerald)
Success Background: #10B98115
Error:              #F87171 (coral - same)
Error Background:   #F8717115
Warning:            #F59E0B (amber)

Effects:
- Card shadow: 0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)
- FAB glow: 0 4px 20px rgba(167,139,250,0.4)
- Glass effect: background rgba(255,255,255,0.05), blur 12px
- Glass purple: background rgba(167,139,250,0.1), blur 12px

============================
PERSON AVATAR COLORS (both themes):
============================
Person 1: #A78BFA (Lavender)
Person 2: #7DD3FC (Sky Blue)
Person 3: #86EFAC (Sage)
Person 4: #FDBA74 (Peach)
Person 5: #FDA4AF (Rose)
Person 6: #6EE7B7 (Mint)

CATEGORY ICONS:
🍔 Food, 🏠 Home, 🚗 Transport, ✈️ Travel, 🛒 Shopping, 🎮 Entertainment, 💊 Health, 📦 Other

TYPOGRAPHY: Inter font family
- Display: 32px/Bold/-0.02em (large hero numbers)
- H1: 28px/Bold/-0.02em
- H2: 24px/Semibold
- H3: 18px/Semibold
- Body: 16px/Regular
- Caption: 14px/Regular
- Small: 12px/Medium/0.02em (uppercase labels)

SPACING: 4, 8, 12, 16, 24, 32, 48px

BORDER RADIUS:
- Small elements: 8px
- Cards: 12px
- Large cards/modals: 16px
- Pills/FAB: 9999px (fully rounded)

COMPONENT NOTES:
- Split color bar: 4px height at bottom of item rows
- Receipt card: Cream paper (#FFFBF5) on warm background (#FEFDFB)
- Selected items: Lavender tint background (#F5F3FF) with 2px lavender border
- Gradients: Always lavender-to-peach for primary actions

============================
SCREENS TO BUILD (16 Total)
============================

SCREEN 1: Onboarding (4 Swipeable Cards) - PASTEL THEME
- Background: Warm cream gradient (#FEFDFB → #F5F3FF)
- Card 1: Illustration of friends at table with giant receipt
  - "No More Awkward Math" headline 28px charcoal
  - "Split any bill item-by-item. Fair, fast, frustration-free." in #78716C
- Card 2: Phone with colorful avatar circles on items
  - "Tap What's Yours" headline
  - "Just tap the items you ordered"
- Card 3: Receipt transforming into visual split
  - "Crystal Clear Splits"
  - "Color-coded avatars show exactly who pays what"
- Card 4: Clock with items flying into phone
  - "20 Items in 60 Seconds"
  - PrismSplit prism logo (animated shimmer)
  - [Get Started] lavender-peach gradient button
  - [I have an account] text link
- Bottom: Pagination dots (lavender active), "Skip" top-right charcoal

SCREEN 2: Login/Sign Up - PASTEL THEME
- Background: Warm cream #FEFDFB
- Header: Back arrow charcoal + "Create Account" 28px semibold
- Hero: "Let's get you set up 👋" + subtext
- Form card (white #FFFBF5, subtle shadow):
  - "Your name" input with smile icon
  - Email input with mail icon
  - Password input with lock + show/hide
  - Focus state: lavender border + subtle glow
- [Create Account] full-width lavender-peach gradient button
- Divider: "or continue with"
- Social row: [Google white] [Apple black] buttons side-by-side
- Bottom link: "Already splitting bills? Sign In" (lavender link)

SCREEN 3: Home Dashboard - PASTEL THEME (MOST IMPORTANT)
- Background: Warm cream #FEFDFB
- Header: "Hi, Alex 👋" left (24px semibold), notification bell right
- Balance Card (Hero, white with lavender glow):
  - "Your Balance" label (14px gray)
  - "+$142.50" (40px bold, sage #059669) or "-$85.00" (coral #F87171)
  - Subtext: "across 3 groups"
  - Subtle glow: 0 0 40px rgba(167,139,250,0.15)
- Quick Actions Row: 4 circular 48px buttons
  - Add Bill (lavender #A78BFA), Settle Up (sage #86EFAC)
  - Groups (sky #7DD3FC), Activity (peach #FDBA74)
- "Recent Activity" section:
  - 3 white cards with emoji icons, descriptions, colored amounts
- "Your Groups" horizontal scroll:
  - Group cards: emoji, name, "+$45" (sage) or "-$20" (coral), member count
- Bottom Navigation: White #FFFBF5 with top border
  - Home, Activity, [FAB], Groups, Profile
  - FAB: 56px lavender-peach gradient with glow, "+" white icon

SCREEN 4: Groups List - PASTEL THEME
- Background: Warm cream #FEFDFB
- Header: "Groups" title 28px bold charcoal, search + add icons
- Search bar: White #FFFBF5, lavender focus border
- Group cards (vertical list):
  - Left: 48px emoji avatar in peach circle
  - Center: Group name (16px semibold), "X members", "Last bill: X days ago"
  - Right: Balance (+$45.50 sage or -$28.00 coral), gray chevron
  - Background: White #FFFBF5, subtle shadow, radius 16px
- Empty state: Illustration + "No groups yet!" + lavender button
- FAB at bottom-right with lavender glow

SCREEN 5: Group Detail - PASTEL THEME
- Background: Warm cream #FEFDFB
- Header: Back charcoal, emoji + "Roommates 🏠", settings + QR icons
- Balance Card: White with 4px lavender left border
  - "+$125.50" (32px bold sage), "Settle Up" button (sage bg)
- Members Section: "Members" + "Invite" link
  - Horizontal avatars (40px colored circles: lavender, sky, sage, peach, rose, mint)
  - Show max 6 + "+N" overflow
- Tabs: Pills - Bills (lavender active) | Balances | Activity
- Bills Tab (default):
  - "Add Bill" button (lavender outlined)
  - Bill cards: Category emoji, name, "Paid by Alex", "$142.50", status badge (peach/sage)
  - Avatar dots at bottom of each card
- Balances Tab: Per-member balance with sage/coral amounts, "Remind"/"Pay" buttons

SCREEN 6: Create Bill - Step 1 (Info) - PASTEL THEME
- Background: Warm cream #FEFDFB
- Header: "✕" close charcoal, "New Bill" title 18px, progress dots (1 of 3 lavender)
- Bill Type Selector (2 large cards):
  - "Itemized Bill" - Receipt icon, "Add items with splits" - 2px lavender border if selected
  - "Quick Bill" - Lightning icon, "Simple total split" - gray border
- Form (white card, shadow):
  - "What's this for?" input with lavender focus
  - "Which group?" dropdown with emoji: "🏠 Roommates"
  - "Who paid?" - Default "(A) You", tap opens member sheet
  - "Category" - Horizontal scroll of chips (🛒 selected = lavender bg)
- [Continue to Items →] lavender-peach gradient button

SCREEN 7: Speed Parser (Add Items) - PASTEL THEME
- Background: Warm cream #FEFDFB
- Header: Back charcoal, "Add Items", Running total "$47.50" (lavender, bold, live)
- Progress: Dot 2 of 3 lavender
- Instruction banner: Light lavender bg (#F5F3FF), "Type → Next → Price → Done → New row"
- Item rows (white card, spreadsheet-style):
  - [Item Name    ] [$Price] [Qty +/-] [✕]
  - Completed rows: Sage left border (#86EFAC)
  - Last row: Empty, auto-focused, lavender border
- Tax/Tip section: "+ Add Tax/Tip" link (lavender)
  - Expanded: Tax [__%] or [$__], Tip pills [10%] [15%] [20%] (lavender selected)
- Footer (sticky, white with shadow):
  - Subtotal, Tax, Tip, **Total: $44.92** (18px bold)
  - [Share with Group →] lavender-peach gradient button

SCREEN 8: Participant Self-Select View - PASTEL THEME
- Background: Warm cream #FEFDFB
- Header: Back charcoal, "Costco Grocery", "Your share: $12.50" (lavender, live)
- Subheader: "Paid by Alex • $142.50 • Dec 10" + "Tap items you're splitting" (lavender)
- Items List (white cards):
  - Item name + price + expand arrow (▼)
  - Below: Colored avatar circles (24px max 3 + "+N", overlapping -4px)
    - Colors: Lavender, Sky, Sage, Peach, Rose, Mint
  - Bottom: 4px color bar showing proportional segments
  - States:
    - Unclaimed: Gray dashed bar, "⚠️ No one yet" (yellow badge)
    - Others selected: Their avatars, "Tap to join" (lavender)
    - You're in: Lavender bg tint (#F5F3FF), 2px lavender border, "✓ You're in" (sage badge)
- Fixed Bottom (white card):
  - "Your Share: $12.50" (28px bold lavender)
  - [Confirm] lavender-peach gradient button

SCREEN 9: Expanded Item Options (Bottom Sheet) - PASTEL THEME
- Overlay: Semi-transparent #00000040
- Sheet: White #FFFBF5, slides up with spring, drag handle gray, 24px radius
- Header: "Rice 10lb" (18px bold), "$18.00" (lavender), close ✕
- YOUR SHARE section (card):
  - Radio options (44px touch targets):
    - ● Equal with others - $3.00 (sage)
    - ○ Custom percentage [__]% → $__
    - ○ Custom amount $[__]
  - Radio selected: Lavender filled dot
- CURRENT SPLIT section:
  - List: Colored avatar + Name + Amount (your row = lavender bg tint)
  - Total: $18.00 = item price
  - 8px color bar visualization
- [+ Add someone to this item] lavender outlined button
- [Leave this item] coral text, no bg
- [Save Changes] lavender-peach gradient button

SCREEN 10: Final Bill Receipt (Tabbie-style) - PASTEL THEME
- Background: Warm cream #FEFDFB
- Receipt card (white #FFFBF5, paper-style, centered):
  - Max width 340px, subtle shadow
  - Header: "💎 PrismSplit" + "Split smarter, not harder"
  - Dashed line separator (gray)
  - Bill name: "Costco Grocery" (18px bold)
  - Date: "Dec 10, 2024 • Paid by Alex" + "🛒 Shopping" badge
  - Dashed line
  - Items list:
    - Name + Price right-aligned
    - Below each: Colored avatar circles (🟣A) (🔵S) (🟢Y) or +N
  - Dashed line
  - Subtotal, Tax (8.5%), ══════, **TOTAL** (bold)
  - Double line separator
  - "WHO OWES WHAT" section:
    - 2x3 grid of person mini-cards
    - Avatar + Name + Amount (sage if owed, coral if owes)
    - Payer card: Sage bg, "PAID ✓"
- Action buttons below receipt:
  - [Share Receipt] lavender outlined + icon
  - [Download] peach outlined + icon

SCREEN 11: Quick Bill - PASTEL THEME
- Background: Warm cream #FEFDFB
- Header: "✕" charcoal, "Quick Bill" 18px
- Hero: ⚡ icon on lavender circle + "Split a simple expense in seconds"
- Form (white card):
  - "What for?" large input, lavender focus
  - "Amount" - Large $ input, numeric keyboard
  - "Group" dropdown: "🏠 Roommates  ▼"
  - "Category" - Horizontal scroll chips
  - "How to split?" - 3 toggle cards:
    - Equal (👥) - Lavender when selected
    - Select People (☑️) - Gray
    - Just Me (👤) - Gray
  - If "Select People": Member checkboxes with colored avatars, live per-person amount
- [Create Bill] purple button

SCREEN 12: Friends List
- Header: "Friends", search icon, add icon
- Summary card: "You are owed $142.50 total"
- Filter tabs: All | Owe You | You Owe | Settled
- Friends list (white cards):
  - Avatar (40px colored circle) + Name (16px semibold)
  - Groups in common (12px gray italic)
  - Balance amount (sage/coral)
  - [Remind] sage outlined or [Pay] coral outlined button
- Empty state: Illustration + "No friends yet!"

SCREEN 13: Account Settings - PASTEL THEME
- Background: Warm cream #FEFDFB
- Profile card (white, centered):
  - Large avatar (80px, lavender circle with white initial)
  - Name (20px semibold), Email (14px gray)
  - [Edit Profile] lavender outlined
- Settings sections (white cards, grouped):
  - PREFERENCES: 🔔 Notifications, 💱 Currency, 🌙 Dark Mode (lavender toggles)
  - YOUR STUFF: 👥 Your Groups (5), ✉️ Pending Invites (2 peach badge)
  - ACCOUNT: 🔐 Password, 🔗 Linked Accounts, 📤 Export
  - ABOUT: ❓ Help, 📜 Terms, 🔒 Privacy, ℹ️ Version 1.0.0
  - [Sign Out] coral text, [Delete Account] gray text

SCREEN 14: Activity Feed - PASTEL THEME
- Background: Warm cream #FEFDFB
- Header: "Activity" 28px bold charcoal, Filter icon
- Filter pills: [All] [Bills] [Settlements] [Groups ▼] (lavender active)
- Activity list (grouped by date):
  - Date headers: Lavender bg tint (#F5F3FF)
  - "Today" / "Yesterday" / "Dec 8"
  - Cards (white, colored left border by type):
    - 🧾 New bill: "Costco" in Roommates - "-$28.50" coral - [View →] lavender
    - ✅ Settlement: Sam paid you $45.00 sage - Sage border
    - 👆 Selection: Jordan selected items - 5h ago
    - 💜 Added to group: Alex added you to "Trip Squad" - Lavender border
- Empty state: Illustration + "No activity yet"

SCREEN 15: QR Code Invite - PASTEL THEME
- Background: Warm cream #FEFDFB
- Card (white, centered, subtle shadow):
  - Header: Group emoji 🏠 + "Roommates" (24px bold)
  - Large QR code (180px, lavender corner accents)
  - "Scan to join instantly" (14px gray)
  - Divider with "OR"
  - Invite link: "prism.split/j/ABC123" + [Copy] lavender
  - Invite code: "ABC123" large + [Copy] lavender
  - [Share Invite] full-width lavender-peach gradient + share icon
  - "Expires in 5 days" (12px gray) • "Regenerate" link (lavender)

SCREEN 16: Settle Up Flow (Bottom Sheet) - PASTEL THEME
- Sheet: White #FFFBF5, slides up, drag handle gray
- Header: "Settle up with Alex" (20px semibold), close ✕
- (🟣A) Avatar + "Alex is owed"
- Large amount: "$45.50" (28px bold, coral)
- Divider
- "How much?" (14px gray)
  - Pre-filled input with full amount, lavender focus
  - Quick pills: [Full $45.50] [20] [$10] [Custom] (lavender selected)
- Note: "Record as paid externally (Venmo, Cash, etc.)" (14px gray)
- [Confirm Settlement] sage bg, white text
- Success state:
  - Full-screen sage gradient overlay
  - Large white checkmark animation (80px, draws in)
  - "Settled!" (28px bold white)
  - "You paid Alex $45.50" (16px white)
  - [Done] white outlined button
  - 🎊 Confetti animation

============================
PROTOTYPE CONNECTIONS
============================

1. Onboarding → Sign Up / Sign In
2. Sign In → Home Dashboard
3. Home → Tap group → Group Detail
4. Home → Tap balance → Friends (filtered)
5. Home → FAB → Choose Bill Type → Add Bill
6. Groups List → Tap group → Group Detail
7. Group Detail → Add Bill → Speed Parser
8. Group Detail → Tap bill → Final Receipt
9. Final Receipt → Share → Native share
10. Speed Parser → Share with Group → Self-Select View
11. Self-Select → Tap item → Expanded Options
12. Self-Select → Confirm → Final Receipt
13. Group Settings → Invite → QR Code screen
14. Friends → Settle Up → Settlement sheet
15. Activity → Tap item → Relevant detail

============================
KEY DESIGN REQUIREMENTS - PASTEL THEME
============================

1. Background: Warm cream #FEFDFB throughout
2. Cards: White #FFFBF5 with subtle shadows
3. Primary gradient: Lavender #A78BFA → Peach #FDBA74
4. Avatar colors: Lavender, Sky, Sage, Peach, Rose, Mint
5. Success amounts: Sage #059669 (light) / #10B981 (dark)
6. Error amounts: Coral #F87171
7. Item rows show avatars (max 3) + 4px color bar
8. Self-Select: Tap-to-join, lavender selected state
9. Speed Parser: Auto-focus keyboard, sage completed rows
10. Receipt: Paper-style on warm cream (not dark anymore)
11. Balance card: Subtle lavender glow effect
12. FAB: Lavender-peach gradient with glow
13. Buttons: 52px height, 12px radius
14. Minimum 44px touch targets
15. 16px horizontal padding throughout

Build all 16 screens with prototype connections. Premium pastel fintech aesthetic with Self-Select and Speed Parser as key differentiators.
```

---

## 📝 Follow-up Response (if Figma Make asks questions)

> "Build all 16 screens with exact pastel theme specifications. Key elements:
> 1. **Background**: Warm cream #FEFDFB, cards white #FFFBF5
> 2. **Speed Parser** - Spreadsheet-style, sage completed rows, lavender focus
> 3. **Self-Select** - Tap items to join, avatars + 4px color bars, lavender selected bg
> 4. **Receipt style** - Paper card on cream background with avatars per item
> 5. **Colors**: Lavender primary, Peach secondary, Sage success, Coral error
> 6. Create all prototype connections for a complete clickable flow."

---

## 🎨 Single Screen Prompts

For tools that work better with one screen at a time, see `design/screen-prompts.md`.

