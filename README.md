# PrismSplit

PrismSplit is a frontend-first, Expo-powered bill-splitting experience that stays open-source and mobile-first. This repo is purely UI/mechanics—backend services such as Supabase are consumed, not implemented here.

## Repository layout
- `app/` — The Expo-managed application lives here. All source code, routes, assets, and configs are organized inside this directory.
  - `app/` — Expo Router file-based routing directory
    - `(auth)/` — Authentication screens (login, signup)
    - `(tabs)/` — Tab-based navigation (home, groups, profile)
    - `group/[id].tsx` — Dynamic group detail route
    - `bill/[id].tsx` — Dynamic bill detail route
    - `_layout.tsx` — Root layout wrapper
    - `index.tsx` — App entry point
  - `src/` — Application source code
    - `components/` — Reusable UI components
      - `ui/` — Tamagui-based primitive components
      - `forms/` — Form components (AddItem, SplitForm)
      - `shared/` — Shared components (Header, Avatar, Button)
    - `features/` — Feature-specific modules (bills, groups, splits, profile)
    - `store/` — Zustand state management stores
    - `hooks/` — Custom React hooks (Supabase, realtime, forms)
    - `lib/` — Utilities, helpers, and Supabase client setup
    - `types/` — TypeScript type definitions and interfaces
    - `constants/` — Theme tokens, colors, spacing, config values
    - `schemas/` — Zod validation schemas for forms
  - `assets/` — Static assets (images, fonts, icons)
  - `config/` — Configuration files (Tamagui config, environment settings)
  - `tests/` — Jest/Expo Test Utils specs for critical flows
  - `.env.example` — Environment variable template
  - `app.json` — Expo configuration
  - `package.json` — Dependencies and scripts
  - `tsconfig.json` — TypeScript configuration

- `ideas/` — Brainstorms, user stories, experiments, and rough UX flows before they land in `app/`.
- `design/` — Visual assets, brand guide, Tamagui tokens, prototypes, and motion direction.
- `docs/` — Architecture decisions, onboarding for contributors, and how the frontend interacts with Supabase (auth, items, realtime). Use Markdown or MDX so it can live in the repo site.
- `showcase/` — Screenshots, release notes, web promo copy, and any embedded demo links for the app.

Feel free to add more folders such as `scripts/` or `ci/` later if tooling (build/test) is introduced.

## Tech stack guidance
- **Expo (managed)** for shared code across Android/iOS/Web plus Expo Router for clean navigation.
- **TypeScript + Tamagui** for type-safe, design-system-aligned UI that renders beautifully everywhere.
- **Zustand** handles lightweight global state (current group, balances, user context).
- **React Hook Form + Zod** keeps the add-item workflow predictable and validated.
- **Supabase services** (Auth, Realtime, Storage, Edge Functions) are consumed via the frontend; you can keep queries in `app/src/api` or `hooks`.
- **Lucide React Native** for consistent icons.
- **Sentry** or equivalent error monitoring from the Expo app if you enable JS tracking.

The stack is appropriate for the goals you listed. As the repo is frontend-only, just keep backend credentials in `.env` files (excluded from Git) and document any required Supabase schema/roles in `docs/`.

## Project initialization

### Setting up the Expo app
```bash
cd app
npx create-expo-app@latest . --template blank-typescript
```

### Install core dependencies
```bash
# UI & Navigation
npm install tamagui @tamagui/config expo-router lucide-react-native

# State & Forms
npm install zustand react-hook-form zod @hookform/resolvers

# Supabase (frontend client only)
npm install @supabase/supabase-js

# Development
npm install --save-dev @types/react @types/react-native
```

### Configure environment
1. Copy `.env.example` to `.env`
2. Add your Supabase URL and anon key
3. Update `app.json` with your app name and configuration

## Next steps
1. Complete Tamagui theme configuration in `app/config/tamagui.config.ts`
2. Set up Supabase client in `app/src/lib/supabase.ts` with your credentials
3. Create component library in `app/src/components/ui/` using Tamagui primitives
4. Build out feature modules in `app/src/features/` for bills, groups, and splits
5. Document contributor workflow in `docs/onboarding/` (setup, development, testing)
6. Add component designs and prototypes to `design/` folder
