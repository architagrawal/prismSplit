# PrismSplit App Structure

## Overview
This document describes the folder structure and organization of the PrismSplit frontend application.

## Directory Structure

### `/app/app/` - Expo Router Routes
File-based routing structure following Expo Router conventions.

- **(auth)/** - Authentication flow (route groups don't appear in URL)
  - `login.tsx` - Login screen
  - `signup.tsx` - Signup screen
  
- **(tabs)/** - Main app tabs
  - `index.tsx` - Home/Dashboard
  - `groups.tsx` - Groups list
  - `profile.tsx` - User profile
  
- **group/[id].tsx** - Dynamic group detail page
- **bill/[id].tsx** - Dynamic bill detail page
- **_layout.tsx** - Root layout with providers
- **index.tsx** - Landing/splash screen

### `/app/src/` - Source Code

#### `/components/` - Reusable Components
- **ui/** - Base Tamagui components (Button, Card, Input)
- **forms/** - Form components (AddItemForm, SplitPercentageForm)
- **shared/** - Shared app components (Header, Avatar, LoadingSpinner)

#### `/features/` - Feature Modules
Organized by domain, each containing related components and logic:
- **bills/** - Bill management
- **groups/** - Group management
- **splits/** - Split calculation and display
- **profile/** - User profile and settings

#### `/store/` - Zustand State Management
- `useGroupStore.ts` - Current group state
- `useUserStore.ts` - User authentication state
- `useBillStore.ts` - Bills and items state

#### `/hooks/` - Custom React Hooks
- `useSupabase.ts` - Supabase client hooks
- `useRealtime.ts` - Realtime subscription hooks
- `useAuth.ts` - Authentication helpers

#### `/lib/` - Utilities & API
- `supabase.ts` - Supabase client initialization
- `utils.ts` - Helper functions
- **api/** - API wrapper functions for Supabase queries

#### `/types/` - TypeScript Definitions
- `index.ts` - Shared types (User, Group, Bill)
- `database.types.ts` - Supabase-generated types
- `models.ts` - Domain models

#### `/constants/` - App Constants
- `theme.ts` - Tamagui theme tokens
- `colors.ts` - Color palette
- `config.ts` - App configuration

#### `/schemas/` - Zod Validation Schemas
- `bill.schema.ts` - Bill form validation
- `group.schema.ts` - Group form validation
- `split.schema.ts` - Split form validation

### `/app/assets/` - Static Assets
- **images/** - App images and illustrations
- **fonts/** - Custom fonts
- **icons/** - App icon and splash screens

### `/app/config/` - Configuration Files
- `tamagui.config.ts` - Tamagui theme configuration
- `sentry.config.ts` - Error monitoring setup

### `/app/tests/` - Tests
- **unit/** - Unit tests for utilities and hooks
- **integration/** - Integration tests for features

## Naming Conventions

### Files
- Components: PascalCase (e.g., `GroupCard.tsx`)
- Hooks: camelCase with 'use' prefix (e.g., `useGroupStore.ts`)
- Utils: camelCase (e.g., `formatCurrency.ts`)
- Types: camelCase with '.types' suffix (e.g., `database.types.ts`)

### Components
- React components: PascalCase
- Props interfaces: ComponentName + 'Props' (e.g., `GroupCardProps`)
- State interfaces: ComponentName + 'State'

### Exports
- Use named exports for components and utilities
- Use default export only for page components (Expo Router requirement)

## Best Practices

1. **Co-location**: Keep related files close to where they're used
2. **Feature modules**: Group by feature, not by file type
3. **Barrel exports**: Use `index.ts` files to simplify imports
4. **Type safety**: Always define types for props, state, and API responses
5. **Validation**: Use Zod schemas for all form inputs
6. **State management**: Use Zustand for global state, local state for component-specific data
