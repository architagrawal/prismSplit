# PrismSplit Folder Structure

## Overview

This document describes the folder structure for the PrismSplit frontend application (public repository).

---

## Root Directory

```
PrismSplit/
├── docs/                   # All documentation
│   ├── product/            # Product requirements
│   ├── design/             # Design system & UI specs
│   ├── technical/          # API, database, architecture
│   └── brainstorms/        # Ideas & experiments
│
├── src/                    # Source code (Expo + React Native)
│   ├── app/                # Expo Router (file-based routes)
│   ├── components/         # Reusable UI components
│   ├── features/           # Feature modules (v2-ready)
│   ├── lib/                # Utilities, API, stores
│   ├── theme/              # Tamagui config + tokens
│   └── types/              # TypeScript definitions
│
├── assets/                 # Images, fonts, icons
├── showcase/               # Project showcase images
│
├── .gitignore
├── README.md
├── CONTRIBUTING.md
├── LICENSE
├── app.json                # Expo config (after scaffold)
├── package.json            # Dependencies (after scaffold)
└── tsconfig.json           # TypeScript config (after scaffold)
```

---

## Documentation Structure (`docs/`)

### `docs/product/`
Product requirements and onboarding.
- `PRD.md` - Product Requirements Document
- `getting-started.md` - Onboarding guide

### `docs/design/`
Design system, UI specifications, and prompts.
- `design-guide.md` - Color palette, typography, components
- `screen-prompts.md` - AI prompts for each screen
- `figma-make-prompts.md` - Figma Make prompt
- `wireframes.md` - Screen inventory
- `self-select-flow.md` - Self-Select feature deep-dive
- `brand/` - Brand assets documentation
- `components/` - Component specifications
- `prototypes/` - Interactive prototype links

### `docs/technical/`
Technical architecture and API specifications.
- `tech-stack.md` - Technology choices
- `folder-structure.md` - This document
- `api-contract.md` - REST API specification
- `database-schema.md` - PostgreSQL schema

### `docs/brainstorms/`
Ideas, user stories, and experiments.
- `feature-ideas.md` - v1/v2/v3 feature roadmap
- `user-stories.md` - User stories by persona
- `experiments.md` - Technical experiments

---

## Source Code Structure (`src/`)

### `src/app/` - Expo Router
File-based routing for screens.
```
app/
├── _layout.tsx           # Root layout with providers
├── index.tsx             # Entry redirect
├── (auth)/               # Auth screens (login, signup, onboarding)
├── (tabs)/               # Main tab navigation
│   ├── _layout.tsx       # Tab bar layout
│   ├── index.tsx         # Home dashboard
│   ├── groups.tsx        # Groups list
│   ├── activity.tsx      # Activity feed
│   └── profile.tsx       # Account/settings
├── group/
│   ├── [id]/             # Group detail screens
│   └── create.tsx
└── bill/
    ├── create.tsx        # Speed Parser
    ├── quick.tsx         # Quick bill
    └── [id]/             # Bill detail, self-select
```

### `src/components/`
Reusable UI components.
```
components/
├── ui/                   # Primitives (Button, Card, Input, Avatar)
└── shared/               # App-wide (SplitBar, BalanceBadge, Header)
```

### `src/features/`
Feature modules organized for v2 extensibility.
```
features/
├── finance/              # v1: Finance World
│   ├── bills/            # Bill creation, Speed Parser
│   ├── groups/           # Group management
│   └── settlements/      # Settle up flow
├── pantry/               # v2: Pantry World (empty for now)
│   ├── shopping-lists/   # Future
│   └── inventory/        # Future
└── shared/               # Used by both worlds
    ├── auth/             # Authentication
    ├── activity/         # Activity feed
    └── profile/          # User profile
```

### `src/lib/`
Core utilities and services.
```
lib/
├── api/                  # API client + demo data
│   ├── client.ts         # Typed API interface
│   ├── demo.ts           # Mock implementation
│   └── types.ts          # API types
├── store/                # Zustand stores
│   ├── auth.ts           # User session
│   └── ui.ts             # Theme, modals
└── utils/                # Helpers
    ├── format.ts         # Currency, dates
    └── colors.ts         # Avatar color assignment
```

### `src/theme/`
Tamagui configuration.
```
theme/
├── tamagui.config.ts     # Main config
├── tokens.ts             # Colors, spacing, fonts
└── animations.ts         # Spring presets
```

### `src/types/`
TypeScript definitions.
```
types/
├── models.ts             # Domain models (User, Group, Bill)
├── api.ts                # API request/response types
└── navigation.ts         # Route params
```

---

## Naming Conventions

### Files
- Components: `PascalCase.tsx` (e.g., `GroupCard.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useAuth.ts`)
- Utilities: `camelCase.ts` (e.g., `formatCurrency.ts`)
- Types: `camelCase.ts` (e.g., `models.ts`)

### Exports
- Named exports for components and utilities
- Default export only for page components (Expo Router requirement)

---

## Best Practices

1. **Feature modules**: Group by feature, not file type
2. **Co-location**: Keep related files close together
3. **Barrel exports**: Use `index.ts` for clean imports
4. **Type safety**: Types for all props, state, API responses
5. **v2-ready**: `features/pantry/` placeholder for future
