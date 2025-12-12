# PrismSplit Frontend Tech Stack

> Cross-platform bill-splitting app built with React Native + Expo  
> **This repository contains frontend code only**

---

## 🏗️ Core Framework

| Layer | Technology | Why |
|-------|------------|-----|
| **Framework** | [Expo](https://expo.dev) (managed workflow) | One codebase → iOS, Android, Web |
| **Language** | TypeScript | Type safety, better DX, recruiter-friendly |
| **UI Framework** | [Tamagui](https://tamagui.dev) | Beautiful, fast, unified mobile + web styling |
| **Routing** | [Expo Router](https://docs.expo.dev/router) | File-based routing, deep linking |

---

## 📦 State & Data Management

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Global State** | [Zustand](https://zustand-demo.pmnd.rs) | Simple store for user session, current group |
| **Server State** | [TanStack Query](https://tanstack.com/query) | API caching, optimistic updates, real-time sync |
| **Local Storage** | [MMKV](https://github.com/mrousavy/react-native-mmkv) | Fast key-value storage (replaces AsyncStorage) |
| **Forms** | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) | Validation for bill items, splits |

---

## 🎨 UI & Polish

| Package | Purpose |
|---------|---------|
| `tamagui` | Design system, components, theming |
| `@gorhom/bottom-sheet` | Native-feeling modals and sheets |
| `react-native-gesture-handler` | Smooth swipe/pan gestures |
| `react-native-reanimated` | 60fps spring animations |
| `@shopify/flash-list` | High-performance lists |
| `expo-haptics` | Tactile feedback on actions |
| `lucide-react-native` | Beautiful icon set |
| `react-native-svg` | Split color bars, charts |
| `expo-image` | Optimized image loading |

---

## 🔌 Backend Integration (Abstracted)

The app connects to a **private backend** via typed API client:

```typescript
// lib/api/client.ts - Interface only (implementation private)
export interface ApiClient {
  auth: AuthApi;
  groups: GroupsApi;
  bills: BillsApi;
  realtime: RealtimeApi;
}
```

Frontend expects these endpoints:
- `POST /auth/login` - Authentication
- `GET /groups` - User's groups
- `POST /bills` - Create bill
- `WS /realtime/bills/:id` - Real-time split updates

---

## 📁 Project Structure

```
src/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Login, signup screens
│   ├── (tabs)/            # Main tab navigation
│   │   ├── _layout.tsx
│   │   ├── index.tsx      # Home dashboard
│   │   ├── groups.tsx
│   │   ├── activity.tsx
│   │   └── profile.tsx
│   ├── groups/
│   │   ├── [id]/
│   │   │   ├── index.tsx  # Group detail
│   │   │   └── settings.tsx
│   │   └── create.tsx
│   └── bill/
│       ├── create.tsx     # Speed Parser
│       ├── [id]/
│       │   ├── index.tsx  # Bill receipt
│       │   └── select.tsx # Self-select view
│       └── quick.tsx      # Quick bill
│
├── components/            # Reusable UI components
│   ├── ui/               # Base components (Button, Card, Input)
│   ├── bills/            # Bill-specific components
│   ├── groups/           # Group-specific components
│   └── shared/           # Avatar, SplitBar, BalanceBadge
│
├── features/             # Feature modules
│   ├── auth/
│   │   ├── hooks/
│   │   └── components/
│   ├── groups/
│   ├── bills/
│   └── activity/
│
├── lib/                  # Core utilities
│   ├── api/             # API client (typed)
│   ├── store/           # Zustand stores
│   ├── hooks/           # Shared hooks
│   └── utils/           # Helpers
│
├── theme/               # Tamagui theme config
│   ├── tokens.ts        # Colors, spacing, fonts
│   ├── tamagui.config.ts
│   └── animations.ts
│
└── types/               # TypeScript types
    ├── api.ts          # API response types
    ├── models.ts       # Domain models
    └── navigation.ts   # Route params
```

---

## 🎨 Theme Configuration (Pastel Palette)

```typescript
// theme/tokens.ts
export const colors = {
  // Light Mode (Default)
  background: '#FEFDFB',      // Warm cream
  surface: '#FFFBF5',         // Cards
  surfaceElevated: '#F5F3FF', // Modals (lavender tint)
  
  primary: '#A78BFA',         // Lavender
  secondary: '#FDBA74',       // Peach
  
  success: '#059669',         // Sage (text)
  successLight: '#86EFAC',    // Sage (icons)
  successBg: '#D1FAE5',       // Mint bg
  
  error: '#F87171',           // Coral
  errorLight: '#FDA4AF',      // Rose
  errorBg: '#FEE2E2',         // Pink bg
  
  textPrimary: '#1C1917',     // Charcoal
  textSecondary: '#78716C',   // Warm gray
  textMuted: '#A8A29E',       // Light gray
  
  border: '#E5E5E5',
  
  // Person avatars
  avatar: {
    lavender: '#A78BFA',
    sky: '#7DD3FC',
    sage: '#86EFAC',
    peach: '#FDBA74',
    rose: '#FDA4AF',
    mint: '#6EE7B7',
  },
};
```

---

## 🛠️ Development Scripts

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web",
    "lint": "eslint . --ext .ts,.tsx",
    "typecheck": "tsc --noEmit",
    "test": "jest",
    "build:android": "eas build --platform android",
    "build:ios": "eas build --platform ios"
  }
}
```

---

## 📱 Key Features (Frontend)

### Speed Parser
- Spreadsheet-style item entry
- Auto-advancing keyboard flow
- Real-time total calculation
- Quantity support with row splitting

### Self-Select Split View
- Tap-to-join item selection
- Color-coded avatar circles
- 4px split proportion bars
- Real-time sync with other users
- Expandable custom split options

### Receipt View (Tabbie-inspired)
- Paper-style receipt card
- Avatar dots per item
- "Who Owes What" summary grid

---

## ✅ Quality Standards

- [ ] TypeScript strict mode
- [ ] ESLint + Prettier configured
- [ ] Minimum 44x44px touch targets
- [ ] Skeleton loading states
- [ ] Optimistic UI updates
- [ ] Accessibility (VoiceOver/TalkBack tested)
- [ ] Spring animations (not linear)
- [ ] Haptic feedback on key actions
- [ ] Error boundaries with Sentry

---

## 📄 License

MIT - Feel free to learn from this codebase!

---

*Backend implementation is in a separate private repository.*
