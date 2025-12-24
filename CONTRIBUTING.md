# Contributing to PrismSplit

Thank you for your interest in contributing to PrismSplit! This document provides guidelines for contributing to the project.

## Code of Conduct

Be respectful, inclusive, and collaborative. We're building this together!

## 🚀 Quick Start for Contributors

### Prerequisites

- Node.js >= 18
- Java JDK 17 (for Android builds)
- Android Studio with SDK & NDK (for Android development)
- Supabase Account (Free Tier)

### Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/prismsplit.git
   cd prismsplit/Frontend/src
   npm install
   ```

2. **Supabase Setup**
   - Create a project at [supabase.com](https://supabase.com)
   - Run `Backend/supabase/migrations/20241223_initial_schema.sql` in SQL Editor
   - Copy your Project URL and Anon Key

3. **Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Run**
   ```bash
   npx expo start
   # or for Android
   npx expo run:android
   ```

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in Issues
2. If not, create a new issue with:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Device/platform information

### Suggesting Features

1. Check existing issues and discussions
2. Create a new issue with:
   - Clear description of the feature
   - Use cases and why it would be valuable
   - Optional: mockups or examples

### Contributing Code

#### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring

#### 2. Make Changes

- Follow existing code style (TypeScript, functional components)
- Use Tamagui components for UI
- Use Zustand stores for state management
- Write meaningful commit messages
- Test on Android and/or iOS

#### 3. Commit

```bash
git add .
git commit -m "feat: add bill splitting by percentage"
```

Commit message format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting changes
- `refactor:` - Code restructuring
- `chore:` - Maintenance tasks

#### 4. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request with:
- Clear description of changes
- Reference to related issues
- Screenshots/videos of UI changes
- Testing notes

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new files
- Define types for all props and state
- Avoid `any` type - use proper typing
- Use interfaces for object shapes

### React Native / Expo

- Use functional components with hooks
- Use Tamagui components (`Stack`, `Text`, `XStack`, `YStack`)
- Keep components small and focused
- Extract reusable logic into custom hooks (`/hooks`)

### State Management

- Use Zustand stores for global state (`/lib/store`)
- Use `useState` for local component state
- Keep stores focused (auth, bills, groups, etc.)

### Supabase Integration

- All database calls go through stores
- Use `ensureSession()` before database operations
- Handle errors gracefully with user-friendly messages
- Use RPC functions for complex multi-table operations

### File Organization

```
src/
├── app/              # Expo Router screens
├── components/
│   ├── ui/           # Reusable UI components
│   └── [feature]/    # Feature-specific components
├── lib/
│   ├── store/        # Zustand stores
│   └── supabase.ts   # Supabase client
├── hooks/            # Custom React hooks
├── theme/            # Tamagui tokens & themes
└── types/            # TypeScript models
```

### Naming Conventions

- Components: `PascalCase` (e.g., `BillListItem.tsx`)
- Hooks: `useCamelCase` (e.g., `useThemeColors.ts`)
- Stores: `camelCaseStore` (e.g., `billsStore.ts`)
- Utils: `camelCase` (e.g., `formatCurrency.ts`)
- Constants: `UPPER_SNAKE_CASE`

## Pull Request Guidelines

✅ **Do:**
- Keep PRs focused on a single feature/fix
- Write clear PR descriptions
- Reference related issues
- Update documentation if needed
- Test thoroughly before submitting
- Respond to review comments promptly

❌ **Don't:**
- Submit PRs with unrelated changes
- Break existing functionality
- Commit `.env` files or secrets
- Force push after review starts
- Submit work-in-progress without marking as draft

## Testing Checklist

Before submitting a PR:

- [ ] App builds without errors
- [ ] TypeScript compiles without errors
- [ ] Tested on Android device/emulator
- [ ] No console errors/warnings
- [ ] Authentication flow works
- [ ] Database operations work (if applicable)

## Getting Help

- **Questions**: Open a GitHub Discussion
- **Bugs**: Create an issue
- **Feature Ideas**: Open a discussion first

## License

By contributing, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).

---

Thank you for contributing to PrismSplit! 🎉
