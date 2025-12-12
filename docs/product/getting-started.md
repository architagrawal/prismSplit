# Getting Started with PrismSplit Development

Welcome to the PrismSplit team! This guide will help you set up your development environment and start contributing.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v18 or later) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)
- **VS Code** (recommended) - [Download](https://code.visualstudio.com/)
- **Expo Go app** on your phone (for testing) - [iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)

## Initial Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-org/prismsplit.git
cd prismsplit
```

### 2. Navigate to the app directory

```bash
cd app
```

### 3. Install dependencies

```bash
npm install
# or
yarn install
```

### 4. Set up environment variables

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your Supabase credentials
# Get these from the project maintainer or Supabase dashboard
```

Your `.env` file should look like:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Start the development server

```bash
npx expo start
```

This will start Metro bundler and show a QR code.

### 6. Run on your device

- **iOS**: Scan the QR code with your Camera app
- **Android**: Scan the QR code with the Expo Go app
- **Web**: Press `w` in the terminal
- **iOS Simulator**: Press `i` in the terminal (requires Xcode on Mac)
- **Android Emulator**: Press `a` in the terminal (requires Android Studio)

## Project Structure Overview

```
app/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Auth screens
│   ├── (tabs)/            # Main app tabs
│   └── _layout.tsx        # Root layout
├── src/
│   ├── components/        # Reusable UI components
│   ├── features/          # Feature modules
│   ├── store/             # Zustand stores
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilities and API
│   ├── types/             # TypeScript types
│   ├── constants/         # Theme and config
│   └── schemas/           # Zod validation
├── assets/                # Images, fonts, icons
└── config/                # App configuration
```

## Development Workflow

### Creating a new feature

1. Create a new branch: `git checkout -b feature/your-feature-name`
2. Create feature folder in `src/features/your-feature/`
3. Add components, hooks, and logic inside the feature folder
4. Create/update routes in `app/` directory if needed
5. Add TypeScript types in `src/types/`
6. Add Zod schemas in `src/schemas/` for forms
7. Test on all platforms (iOS, Android, Web)
8. Commit and push your changes
9. Create a pull request

### Code style guidelines

- Use TypeScript for all new files
- Follow existing naming conventions (see `docs/architecture/folder-structure.md`)
- Use Tamagui components for UI (not plain React Native components)
- Validate forms with Zod schemas
- Keep components small and focused
- Write meaningful commit messages

### Common commands

```bash
# Start dev server
npx expo start

# Start with cache cleared
npx expo start -c

# Run TypeScript type checking
npx tsc --noEmit

# Run on specific platform
npx expo start --ios
npx expo start --android
npx expo start --web

# Install a new package
npm install package-name

# Build for production (requires EAS account)
eas build --platform ios
eas build --platform android
```

## VS Code Extensions (Recommended)

Install these extensions for the best development experience:

1. **ES7+ React/Redux/React-Native snippets**
2. **Prettier - Code formatter**
3. **ESLint**
4. **TypeScript Vue Plugin (Volar)**
5. **Expo Tools**
6. **GitLens**

## Troubleshooting

### Common issues

**Metro bundler won't start**

```bash
npx expo start -c
# or
rm -rf node_modules
npm install
```

**TypeScript errors**

```bash
npx tsc --noEmit
```

**Can't connect to dev server on phone**

- Make sure phone and computer are on the same WiFi network
- Try tunnel mode: `npx expo start --tunnel`

**Supabase connection errors**

- Check your `.env` file has correct credentials
- Verify the credentials in Supabase dashboard
- Restart the dev server after changing `.env`

## Getting Help

- **Documentation**: Check `docs/` folder for detailed guides
- **Issues**: Open a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Team Chat**: [Add your team communication channel]

## Next Steps

1. Read `docs/architecture/tech-stack.md` to understand our tech choices
2. Review `docs/architecture/folder-structure.md` for code organization
3. Look at existing features in `src/features/` for examples
4. Pick an issue from GitHub Issues to work on
5. Join the team standup/meetings

Happy coding! 🎉
