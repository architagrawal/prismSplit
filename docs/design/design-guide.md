# PrismSplit UI/UX Design Guide

Comprehensive design system with refined pastel color palette for modern, friendly bill splitting.

---

## 📚 Research-Based Design Principles

### From Splitwise UX Case Studies

**Problems to Avoid:**
- ❌ Cluttered homepage with poor screen real estate usage
- ❌ Confusing navigation with repetive options
- ❌ Visual similarity between different split options
- ❌ Suboptimal color choices affecting readability
- ❌ Dated, sober design that doesn't appeal to younger users
- ❌ Endless list of bills without clear debt overview

**Solutions Implemented:**
- ✅ Show group debts prominently ("Who Owes" first)
- ✅ Clear progress bars for multi-step flows
- ✅ Distinct visual treatment for different split types
- ✅ Color-coded avatars per person
- ✅ Consistent UI elements with robust design system

### From Cash App Design

- Minimal, focused design prioritizing core functions
- Bold colors with approachable vibe
- Clarity, brilliance, and security as core principles
- Direct, tool-focused approach (less social clutter)

### From Tabbie Design

- Receipt-style bill overview (paper on warm background)
- Colored avatar circles per item showing who's splitting
- Clean, scannable item lists
- Visual "Who Owes What" summary

### From Venmo Design

- Bottom navigation bar (not hamburger menu)
- Vibrant contrasts
- Casual, approachable system image
- Quick transaction flows

### Essential Modern Fintech Patterns

1. **Zero-friction onboarding** — Minimal steps, biometric login
2. **Visual hierarchy** — Critical info prominently displayed
3. **Micro-interactions** — Haptic feedback, smooth animations
4. **Real-time feedback** — Instant confirmations, progress indicators
5. **Data visualization** — Charts make finances digestible
6. **Accessibility** — High contrast, screen reader compatible

---

## 🎨 PrismSplit Design System

### Theme Strategy

PrismSplit uses a **refined pastel palette** with Light Mode as default:
- **Light Mode (Default)**: Warm, friendly, approachable with lavender accents
- **Dark Mode (Alternative)**: Premium fintech aesthetic for low-light environments

---

### ☀️ Light Mode Color Palette (Default)

**Primary Colors:**
```
Lavender Primary:    #A78BFA  (Soft purple - main brand color)
Lavender Dark:       #8B5CF6  (Hover/pressed states)
Peach Secondary:     #FDBA74  (Warm accent, gradients)
Gradient Primary:    linear-gradient(135deg, #A78BFA 0%, #FDBA74 100%)
```

**Semantic Colors:**
```
Success Text:        #059669  (Darker emerald for readability - money owed TO you)
Success Background:  #D1FAE5  (Soft mint for badges, highlights)
Success Light:       #86EFAC  (Sage - for icons, secondary elements)

Error Text:          #F87171  (Vibrant coral - money you OWE)
Error Background:    #FEE2E2  (Soft pink for badges, alerts)
Error Light:         #FDA4AF  (Soft rose - for less critical warnings)

Warning:             #D97706  (Darker amber - unclaimed items)
Warning Background:  #FEF3C7  (Soft yellow)

Info:                #7DD3FC  (Sky blue)
Info Background:     #DBEAFE  (Soft blue)
```

**Neutral Colors (Light Theme):**
```
Background:      #FEFDFB  (Warm white/cream - easier on eyes than pure white)
Surface:         #FFFBF5  (Cream white - cards, containers)
Surface-2:       #F5F3FF  (Very subtle lavender tint - inputs, elevated)
Surface-3:       #E9D5FF  (Light lavender - hover states)
Border:          #E5E5E5  (Subtle neutral borders)
Border-Light:    #F3F4F6  (Very subtle dividers)
Text Primary:    #1C1917  (Charcoal - headings)
Text Secondary:  #78716C  (Warm gray - body text, descriptions)
Text Tertiary:   #A8A29E  (Light warm gray - hints, placeholders, disabled)
```

**Gradients & Effects:**
```
Gradient Primary:      linear-gradient(135deg, #A78BFA 0%, #FDBA74 100%)
Gradient Success:      linear-gradient(135deg, #86EFAC 0%, #6EE7B7 100%)
FAB Shadow:            0 4px 16px rgba(167, 139, 250, 0.3),
                       0 8px 32px rgba(167, 139, 250, 0.15)
Card Shadow:           0 1px 3px rgba(0, 0, 0, 0.08), 
                       0 2px 8px rgba(0, 0, 0, 0.04)
Success Highlight:     0 0 0 3px rgba(134, 239, 172, 0.2)
Error Highlight:       0 0 0 3px rgba(248, 113, 113, 0.2)
Glow (Balance Card):   0 0 40px rgba(167, 139, 250, 0.15)
```

---

### 🌙 Dark Mode Color Palette (Alternative)

**Primary Colors:**
```
Lavender Primary:    #A78BFA  (Same brand color)
Lavender Light:      #C4B5FD  (Hover states)
Peach Secondary:     #FDBA74  (Same warm accent)
Gradient Primary:    linear-gradient(135deg, #A78BFA 0%, #FDBA74 100%)
```

**Semantic Colors:**
```
Success:             #10B981  (Emerald)
Success Background:  #10B98115
Error:               #F87171  (Coral)
Error Background:    #F8717115
Warning:             #F59E0B  (Amber)
```

**Neutral Colors (Dark Theme):**
```
Background:      #09090B  (Near black - richer than pure black)
Surface:         #18181B  (Cards, containers)
Surface-2:       #27272A  (Inputs, modals, elevated)
Surface-3:       #3F3F46  (Hover states)
Border:          #3F3F46  (Subtle borders)
Text Primary:    #FAFAFA  (Near white - headings)
Text Secondary:  #A1A1AA  (Body text)
Text Tertiary:   #71717A  (Hints, placeholders)
```

**Effects:**
```
Card Shadow:     0 1px 2px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.2)
FAB Glow:        0 4px 20px rgba(167,139,250,0.4)
Glass Effect:    background: rgba(255, 255, 255, 0.05)
                 backdrop-filter: blur(12px)
```

---

### 🔄 Theme Token Mapping

Use these semantic tokens in code for automatic theme switching:

| Token | Light Mode | Dark Mode |
|-------|-----------|------------|
| `--color-bg` | #FEFDFB | #09090B |
| `--color-surface` | #FFFBF5 | #18181B |
| `--color-surface-elevated` | #F5F3FF | #27272A |
| `--color-border` | #E5E5E5 | #3F3F46 |
| `--color-text-primary` | #1C1917 | #FAFAFA |
| `--color-text-secondary` | #78716C | #A1A1AA |
| `--color-text-muted` | #A8A29E | #71717A |
| `--color-primary` | #A78BFA | #A78BFA |
| `--color-primary-bg` | #F5F3FF | #A78BFA15 |
| `--color-secondary` | #FDBA74 | #FDBA74 |
| `--color-success` | #059669 | #10B981 |
| `--color-success-bg` | #D1FAE5 | #10B98115 |
| `--color-error` | #F87171 | #F87171 |
| `--color-error-bg` | #FEE2E2 | #F8717115 |

---

### 🎨 Person Avatar Colors

Each group member is assigned a unique color (same for both themes):

| Order | Color | Hex | Use Case |
|-------|-------|-----|----------|
| 1 | Lavender | #A78BFA | Primary brand color |
| 2 | Sky Blue | #7DD3FC | Cool contrast |
| 3 | Sage | #86EFAC | Success-adjacent, fresh |
| 4 | Peach | #FDBA74 | Warm accent |
| 5 | Rose | #FDA4AF | Soft, approachable |
| 6 | Mint | #6EE7B7 | Fresh, vibrant |
| 7+ | Rotate from start | — | Cycle through colors |

---

### 📦 Category Icons

| Category | Icon | Use Case |
|----------|------|----------|
| Food & Dining | 🍔 | Restaurant, groceries |
| Home | 🏠 | Rent, utilities, supplies |
| Transport | 🚗 | Uber, gas, parking |
| Travel | ✈️ | Hotels, flights, activities |
| Shopping | 🛒 | General purchases |
| Entertainment | 🎮 | Movies, events, subs |
| Health | 💊 | Pharmacy, gym |
| Other | 📦 | Miscellaneous |

---

### 🔤 Typography

**Font Family:** Inter (or SF Pro for iOS native feel)

```
Display:     32px / 700 weight / -0.02em tracking
Heading 1:   28px / 700 weight / -0.02em tracking
Heading 2:   24px / 600 weight / -0.01em tracking
Heading 3:   18px / 600 weight / 0 tracking
Body:        16px / 400 weight / 0 tracking
Body Bold:   16px / 600 weight / 0 tracking
Caption:     14px / 400 weight / 0.01em tracking
Small:       12px / 500 weight / 0.02em tracking
```

---

### 📏 Spacing Scale

```
4px   - xs   (tight spacing, icon padding)
8px   - sm   (between related elements)
12px  - md   (standard element spacing)
16px  - lg   (section padding)
24px  - xl   (between sections)
32px  - 2xl  (major sections)
48px  - 3xl  (screen padding top/bottom)
```

---

### ⭕ Border Radius

```
4px   - xs   (small badges)
8px   - sm   (buttons, inputs)
12px  - md   (cards)
16px  - lg   (large cards, modals)
24px  - xl   (bottom sheets)
9999px - full (pills, FAB, avatars)
```

---

### 🎭 Shadows & Elevation

```
Elevation 1 (Cards):     
  0 1px 3px rgba(0, 0, 0, 0.08),
  0 2px 8px rgba(0, 0, 0, 0.04)

Elevation 2 (Modals):    
  0 4px 12px rgba(0, 0, 0, 0.12),
  0 8px 24px rgba(0, 0, 0, 0.08)

Elevation 3 (FAB):       
  0 4px 16px rgba(167, 139, 250, 0.3),
  0 8px 32px rgba(167, 139, 250, 0.15)
```

---

## 📐 Component Specifications

### Bottom Navigation Bar

```
Height: 80px + safe area (iOS) / 64px (Android)
Background: #FFFBF5 with subtle top border #E5E5E5
Items: 5 total (4 tabs + 1 center FAB)

Tab Item:
  - Icon: 24px, color #A8A29E (inactive) / #A78BFA (active)
  - Label: 11px, same colors
  - Active indicator: 4px pill below icon, #A78BFA

Center FAB:
  - Size: 56px circular
  - Background: Gradient (lavender to peach)
  - Icon: 24px white "+" or "$"
  - Shadow: Elevation 3 (lavender glow)
  - Position: -20px from nav bar top
```

### Cards

```
### Compact Bill Row (Group Detail View)

```
Header Layout (Horizontal Hero):
  [← Back]                                    [⚙️ Settings]
  
  [🏠 48px] [Roommates        ] [👤👤👤👤+2]
            [4 members • USD  ]  ← overlapping avatars
  
  [Balance: +$47.50]                    [Settle Up]
  
  [    Bills    |    Balances    ]
                              [👁 All Bills]

Bill List Layout:
  - Height: ~52px (High density)
  - Grouping: Bills grouped by Month > Day
  - Background: Transparent (list items)
  - Not Involved: 50% opacity (dimmed rows)

  Row Content:
  [Icon+Payer] [Gap 12px] [Title Row] [Flex] [Balance + Amount Stack]
  
  - Category Icon: 36px rounded square with emoji
  - Payer Badge: Credit card shaped (22x16px) in bottom-right corner
    - Uniform color (payer's avatar color)
    - White magnetic stripe at ~10% from top
    - Payer initials centered (7px bold white)
  - Title: 15px/500, truncated
  - Itemized Icon: ClipboardList (14px muted) after title if bill has items
  - Balance: Color-coded (14px/600, emphasized)
    - "you lent $X.XX" (Green) — User paid, lent to others
    - "you borrowed $X.XX" (Red) — User owes money
    - "you paid" (Gray) — User paid only for themselves
    - "not involved" (Gray) — yourShare = 0 and not payer
  - Amount: Total bill amount (12px/400 muted, below balance)

Sticky Month Headers (SectionList):
  - "December 2024    Your Total: $XXX.XX" (sticky on scroll)
  - Day: "Dec 10" (12px/500, with bottom border)

Interactive Elements:
  - My View Toggle: EyeClosed/Eye icon + "All Bills" / "Your Bills"
  - Settle Up Button: In balance row when balance ≠ $0
```

```
Balance Summary Card (with Glow):
  - Height: 120px
  - Background: #F5F3FF with lavender border
  - Border: 2px solid #A78BFA40
  - Border-radius: 16px
  - Glow: 0 0 40px rgba(167, 139, 250, 0.15)
  
  Layout:
  - "Your Balance" label (14px #78716C)
  - Amount (40px/700 #059669 or #F87171)
  - Subtitle (14px #78716C)
```

### Item Row (Self-Select View)

```
Item Row:
  - Height: 72-80px
  - Padding: 16px horizontal
  - Background: #FFFBF5 (normal), #F5F3FF (selected with lavender tint)
  - Border: 1px solid #E5E5E5
  - Selected border: 2px solid #A78BFA
  - Border-radius: 12px
  - Tap target: Entire row
  
  Layout:
  [Item name + price] [Flex] [Expand arrow ▼]
  [Avatar circles (max 3) + "+N" overflow]
  [Thin color bar 3-4px height]
  
  Avatar circles:
  - Size: 24px diameter
  - Overlap: 4px
  - Contains: First letter of name
  - Background: Person's assigned color
  - Border: 2px solid #FFFBF5
```

### Split Color Bar

```
Width: Full row width (minus 16px padding each side)
Height: 3-4px
Position: Bottom of item row (inset 16px)

Segments:
  - Width proportional to split percentage
  - Color matches person's avatar color
  - Smooth transitions on selection change (200ms ease)
  
States:
  - Unclaimed: Gray dashed stroke (#A8A29E)
  - Claimed: Solid color segments with smooth gradients between
```

### Buttons

```
Primary Button:
  - Height: 52px
  - Border-radius: 12px
  - Background: Gradient (#A78BFA to #FDBA74)
  - Text: 16px/600 white
  - Shadow: Elevation 1
  - Pressed: scale(0.98) + Elevation 2
  - Disabled: opacity 0.5

Secondary Button:
  - Same dimensions
  - Background: transparent
  - Border: 2px solid #A78BFA
  - Text: 16px/600 #A78BFA
  
Destructive Button:
  - Same dimensions
  - Background: #FEE2E2
  - Text: 16px/600 #F87171
```

### Input Fields

```
Height: 52px
Background: #FFFBF5
Border: 1px solid #E5E5E5
Border-radius: 12px
Padding: 16px

States:
  - Default: Border #E5E5E5
  - Focused: Border #A78BFA, subtle glow
  - Error: Border #F87171
  - Filled: Background #FFFBF5

Label: 14px/500 #78716C, 4px above input
Placeholder: 16px/400 #A8A29E
Value: 16px/400 #1C1917
```

### Speed Parser Input Row

```
Row height: 52px
Background: #FFFBF5
Border: 1px solid #E5E5E5
Border-radius: 8px
Layout: [Name 50%] [$ Price 25%] [Qty 15%] [✕ Delete 10%]

Keyboard behavior:
  - Name field: Text keyboard, "Next" return key
  - Price field: Numeric keyboard, "Next" return key
  - Qty field: Numeric keyboard, "Done" return key
  - Default Qty: 1 (pre-filled)
```

### Category Badge

```
Size: 28px height, auto width
Border-radius: 14px (pill)
Background: #F5F3FF (lavender tint)
Icon: 16px emoji
Text: 12px/500 #78716C (optional)
Border: 1px solid #E9D5FF
```

### Balance Indicators

```
Positive (owed to you):
  - Text: #059669
  - Prefix: "+" 
  - Background (if needed): #D1FAE5
  - Icon: ▲ or "✓"

Negative (you owe):
  - Text: #F87171
  - Prefix: "-"
  - Background (if needed): #FEE2E2
  - Icon: ▼

Settled:
  - Text: #78716C
  - Icon: ✓ checkmark
  - Label: "Settled"
```

### QR Code Card

```
Card size: Full width, auto height
Background: #FFFBF5
Border: 2px solid #A78BFA40
Border-radius: 16px
Padding: 24px

Layout:
  - Header: Group name with emoji
  - QR Code: Centered, lavender corners, 180px
  - "Scan to join" caption
  - Divider: "OR"
  - Invite link: Copyable with lavender copy button
  - Invite code: 6-char, copyable
  - Share button: Full width gradient
```

---

## ✨ Micro-interactions & Animations

### Transitions

- Screen transitions: 300ms ease-out slide
- Modal appearance: 250ms spring (slight bounce)
- Card press: scale(0.98) over 100ms
- Bottom sheet: Slide up 300ms with deceleration

### Feedback

- Button press: Haptic light
- Item selection: Quick pulse/ripple + haptic
- Settlement confirm: Haptic success + confetti animation
- Error: Haptic error + shake animation

### Real-time Updates

- Avatar appears: Fade-in + scale from 0.8 to 1.0, 200ms
- Color bar segment: Width animation 200ms ease
- Amount update: Counter animation (odometer style)

### Loading States

- Skeleton screens (not spinners) with lavender shimmer
- Shimmer effect: Gradient moving left-to-right
- Progress bars for multi-step flows

---

## 🔍 Accessibility Requirements

| Requirement | Standard |
|-------------|----------|
| Touch target | Minimum 44x44px |
| Text contrast | 4.5:1 for body, 3:1 for large |
| Color | Never rely on color alone, use icons/labels |
| Screen reader | All elements labeled with meaningful descriptions |
| Motion | Reduced motion option (respects system preference) |
| Font size | Support dynamic system sizes (iOS Dynamic Type) |
| Focus | Visible focus states with lavender outline |

### High Contrast Fallbacks

For users with high contrast mode enabled:

```
Primary:         #8B5CF6 (darker lavender)
Success:         #047857 (darker emerald)
Error:           #DC2626 (darker coral)
Text:            #000000 (pure black)
Background:      #FFFFFF (pure white)
Border:          #000000 (visible borders)
```

---

## 🎨 Design Checklist

Before finalizing any screen:

- [ ] Uses correct color tokens from palette
- [ ] All touch targets minimum 44x44px
- [ ] Text meets WCAG AA contrast ratios
- [ ] Proper spacing scale applied
- [ ] Consistent border radius
- [ ] Appropriate elevation/shadows
- [ ] Hover and pressed states defined
- [ ] Loading and error states designed
- [ ] Works in both light and dark modes
- [ ] Accessible to screen readers
- [ ] Follows person avatar color assignments
- [ ] Uses proper gradients for primary actions
