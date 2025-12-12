# PrismSplit Wireframes (Complete Design)

Comprehensive screen inventory with design status and key features.

---

## 🎨 Design Philosophy

- **Modern Fintech**: Inspired by Cash App, Venmo, Tabbie
- **Pastel Palette**: Warm, friendly, approachable with lavender and peach
- **Light Theme (Default)**: Clean cream/white with vibrant accents
- **Dark Theme (Alternative)**: Rich blacks for low-light environments
- **Glassmorphism**: Subtle glow effects on balance cards
- **Color-Coded Splits**: Avatar icons + thin color bar per item
- **Self-Select Model**: Participants tap to join items
- **Speed Parser**: Fast item entry for power users

---

## 📱 Complete Screen Inventory

### Core Screens (MVP v1.0)

| # | Screen | Priority | Key Features | Status |
|---|--------|----------|--------------|--------|
| 1 | **Onboarding** | P0 | 3-4 welcome cards, Create Account/Sign In | 📋 Spec'd |
| 2 | **Login / Sign Up** | P0 | Email, Google OAuth, clean form | 📋 Spec'd |
| 3 | **Home Dashboard** | P0 | Balance cards (with glow), groups list, activity | 🖼️ Mockup |
| 4 | **Groups List** | P0 | Group cards with balance, search, FAB | 📋 Spec'd |
| 5 | **Group Detail** | P0 | Bills tab, Balances tab, Members, QR invite | 🖼️ Mockup |
| 6 | **Create Bill - Info** | P0 | Bill type selector (Itemized vs Quick), group picker | 📋 Spec'd |
| 7 | **Speed Parser** | P0 | Fast item entry, running total, quantity input | 📋 Spec'd |
| 8 | **Participant Self-Select** | P0 | Tap to join, avatars, color bars, expand arrow | 📋 Spec'd |
| 9 | **Expanded Item Options** | P0 | Custom %, add others, leave split | 📋 Spec'd |
| 10 | **Final Bill Receipt** | P0 | Receipt-style, avatars per item, who owes what | 🖼️ Mockup |
| 11 | **Quick Bill** | P1 | Simple bill without items | 📋 Spec'd |
| 12 | **Friends List** | P1 | Overall balances, remind/settle | 📋 Spec'd |
| 13 | **Account Settings** | P1 | Profile, preferences, sign out | 📋 Spec'd |
| 14 | **Activity Feed** | P1 | Timeline of all actions, filters | 📋 Spec'd |
| 15 | **Notifications** | P1 | Push prompts, group invites | 📋 Spec'd |
| 16 | **Settle Up Flow** | P1 | Payment confirmation, success | 📋 Spec'd |
| 17 | **QR Code Invite** | P1 | Scannable QR, share link/code | 📋 Spec'd |
| 18 | **Category Selector** | P1 | 8 preset categories with icons | 📋 Spec'd |
| 19 | **Search & Filter** | P2 | Search bills, filter by date/person/status | 📋 Spec'd |
| 20 | **Offline Banner** | P2 | Visual indicator when offline | 📋 Spec'd |

### Future Screens (v1.1+)

| # | Screen | Version | Key Features |
|---|--------|---------|--------------| 
| 21 | **Recurring Bill Setup** | v1.1 | Frequency, due date, auto-create |
| 22 | **Analytics Dashboard** | v1.1 | Pie charts, spending summary |
| 23 | **OCR Scanner** | v2.0 | Camera capture, item extraction |

---

## 🖼️ Existing Mockups

### Home Dashboard
![Home Dashboard](file:///C:/Users/msi-laptop/.gemini/antigravity/brain/3881a5ed-2930-4864-bc08-1ababb694b0a/home_dashboard_v2_1765273127803.png)

**Key Elements:**
- Balance card with lavender glow
- Quick action buttons (circular icons)
- Recent activity list
- Groups horizontal scroll
- Lavender-peach gradient FAB

---

### Group Detail
![Group Detail](file:///C:/Users/msi-laptop/.gemini/antigravity/brain/3881a5ed-2930-4864-bc08-1ababb694b0a/group_detail_v2_1765273152805.png)

**Key Elements:**
- Group balance with sage/coral amounts
- Member avatar row
- Bills list with category badges
- Tabbed navigation

---

### Bill Item Selection
![Bill Item Selection](file:///C:/Users/msi-laptop/.gemini/antigravity/brain/3881a5ed-2930-4864-bc08-1ababb694b0a/bill_item_selection_v2_1765273167506.png)

**Key Elements:**
- Tappable item rows
- Color-coded avatar circles (lavender, sky, sage, peach)
- Thin split bar (3-4px)
- Lavender border on selected items
- Running total

---

### New Bill (Speed Parser)
![Speed Parser](file:///C:/Users/msi-laptop/.gemini/antigravity/brain/3881a5ed-2930-4864-bc08-1ababb694b0a/new_bill_v2_1765273192307.png)

**Key Elements:**
- Spreadsheet-style input rows
- Progress indicator (Step 2 of 3)
- Auto-focus keyboard flow
- Category selector (optional)

---

## 🎨 Color Reference

### ☀️ Light Mode (Default)

| Element | Hex | Usage |
|---------|-----|-------|
| Background | #FEFDFB | Main screen background (warm cream) |
| Surface | #FFFBF5 | Cards, containers (cream white) |
| Elevated | #F5F3FF | Modals, inputs (subtle lavender tint) |
| Primary Lavender | #A78BFA | Accents, buttons, FAB |
| Secondary Peach | #FDBA74 | Warm accent, gradients |
| Success Text | #059669 | Money owed TO you |
| Success Light | #86EFAC | Sage for icons |
| Success BG | #D1FAE5 | Soft mint backgrounds |
| Error Text | #F87171 | Money YOU owe (vibrant coral) |
| Error Light | #FDA4AF | Soft rose for warnings |
| Error BG | #FEE2E2 | Soft pink backgrounds |
| Warning | #D97706 | Unclaimed items |
| Text Primary | #1C1917 | Charcoal headings |
| Text Secondary | #78716C | Warm gray body |
| Border | #E5E5E5 | Subtle borders |

### 🌙 Dark Mode (Alternative)

| Element | Hex | Usage |
|---------|-----|-------|
| Background | #09090B | Near black |
| Surface | #18181B | Cards, containers |
| Elevated | #27272A | Modals, inputs |
| Primary Lavender | #A78BFA | Accents, buttons (same) |
| Success | #10B981 | Emerald |
| Error | #F87171 | Coral (same) |
| Text Primary | #FAFAFA | Near white |
| Text Secondary | #A1A1AA | Gray |
| Border | #3F3F46 | Borders |

---

##  Avatar Color Palette

| Person | Color | Hex |
|--------|-------|-----|
| Person 1 | Purple | #8B5CF6 |
| Person 2 | Blue | #3B82F6 |
| Person 3 | Green | #10B981 |
| Person 4 | Yellow | #F59E0B |
| Person 5 | Pink | #EC4899 |
| Person 6 | Cyan | #06B6D4 |

---

## 📐 Key Component Specs

### Item Row (Self-Select View)
```
┌────────────────────────────────────────────────────────────┐
│  Item Name                              $Price          ▼ │
│  (A) (S) (Y)                            ← Max 3 avatars   │
│  ▔▔▔🟣▔▔▔▔▔▔🔵▔▔▔▔▔▔🟡▔▔                  ← 3-4px color bar │
└────────────────────────────────────────────────────────────┘
```

### Category Badges
```
🍔 Food    🏠 Home    🚗 Transport    ✈️ Travel
🛒 Shopping    🎮 Entertainment    💊 Health    📦 Other
```

### QR Code Invite Card
```
┌─────────────────────────────────────────┐
│  Invite to "Roommates 🏠"               │
│         ┌───────────────┐               │
│         │   [QR CODE]   │               │
│         └───────────────┘               │
│   Scan to join instantly                │
│   Code: ABC123                          │
│   [Share Link] [Copy Code]              │
└─────────────────────────────────────────┘
```

---

## 📁 Design Files

| File | Purpose |
|------|---------|
| `design-guide.md` | Full design system (colors, typography, components) |
| `screen-prompts.md` | Detailed prompts for each screen (for AI tools) |
| `figma-make-prompts.md` | Single comprehensive Figma Make prompt |
| `self-select-flow.md` | Detailed UX for item selection flow |

---

## ✅ Design Checklist

- [x] Home Dashboard
- [x] Group Detail  
- [x] Bill Receipt Overview
- [x] Speed Parser Input
- [x] Split Selection Modal
- [ ] Onboarding screens
- [ ] Login / Sign Up
- [ ] Groups List
- [ ] Quick Bill
- [ ] Friends List
- [ ] Activity Feed
- [ ] Account Settings
- [ ] QR Code Invite
- [ ] Recurring Bills (v1.1)
- [ ] Analytics (v1.1)
