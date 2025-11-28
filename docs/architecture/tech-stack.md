# Tech Stack

## Core Technologies

### Framework & Language
- **Expo (Managed Workflow)** - Cross-platform development (Android, iOS, Web)
- **TypeScript** - Type-safe JavaScript
- **React Native** - Native mobile components

### UI & Design
- **Tamagui** - Universal design system for React Native + Web
  - Fast performance with optimizing compiler
  - Write once, renders perfectly on all platforms
  - Built-in theming and responsive design

### Navigation
- **Expo Router** - File-based routing system
  - Clean URLs on web
  - Deep linking on mobile
  - Type-safe navigation
  - Shared layouts and nested routes

### State Management
- **Zustand** - Lightweight state management
  - Simple API, minimal boilerplate
  - TypeScript-first
  - No providers needed
  - Perfect for small to medium apps

### Icons
- **Lucide React Native** - Beautiful, consistent icon library
  - Tree-shakeable
  - Optimized SVGs
  - Customizable size and color

### Forms & Validation
- **React Hook Form** - Performant form library
  - Minimal re-renders
  - Easy integration with UI libraries
- **Zod** - TypeScript-first schema validation
  - Type inference
  - Composable schemas
  - Clear error messages

## Backend Services (Consumed, not implemented)

### Database & Backend
- **Supabase (PostgreSQL)** - Open-source Firebase alternative
  - Row Level Security (RLS) for data access control
  - RESTful API auto-generated from schema
  - Real-time subscriptions via WebSockets

### Authentication
- **Supabase Auth** - Built-in authentication
  - Google OAuth
  - Email/password
  - Magic links
  - Session management across devices

### Real-time Sync
- **Supabase Realtime** - Live data updates
  - WebSocket-based subscriptions
  - Instant sync across all clients
  - Presence tracking

### File Storage
- **Supabase Storage** - S3-compatible object storage
  - Receipt photo uploads
  - Image transformations
  - CDN delivery

### Custom Logic
- **Supabase Edge Functions** (Optional) - Serverless functions
  - Deno-based runtime
  - Can be used for complex settle-up calculations
  - Most logic will be in the frontend

## Development & Deployment

### AI Coding Assistant
- **Cursor / Claude 3.5 Sonnet** - AI pair programming
  - Code generation from natural language
  - Refactoring assistance
  - Bug detection

### Web Hosting
- **Vercel** or **Netlify** - Static site hosting
  - Automatic deployments from Git
  - Preview deployments for PRs
  - CDN distribution
  - Custom domains

### Mobile Builds
- **Expo EAS Build** - Cloud build service
  - Build APKs and IPAs without Mac
  - Over-the-air (OTA) updates
  - Integration with app stores

### Error Monitoring
- **Sentry** - Error tracking and performance monitoring
  - Real-time error alerts
  - Stack traces and context
  - Performance metrics
  - User feedback

## Why This Stack?

✅ **100% Free** (within generous free tiers)  
✅ **Type-safe** end-to-end with TypeScript  
✅ **Fast development** with hot reload and AI assistance  
✅ **Production-ready** with professional tooling  
✅ **Recruiter-friendly** - uses modern, in-demand technologies  
✅ **Open-source first** - all core technologies are open source  
✅ **Single codebase** - write once, run on Android, iOS, and Web  
✅ **Real-time by default** - instant sync across all devices  
✅ **Scalable** - can handle growth without architectural changes  

## Dependencies Overview

### Production Dependencies
```json
{
  "expo": "~50.x",
  "expo-router": "~3.x",
  "react": "18.x",
  "react-native": "0.73.x",
  "tamagui": "^1.x",
  "@tamagui/config": "^1.x",
  "zustand": "^4.x",
  "react-hook-form": "^7.x",
  "zod": "^3.x",
  "@hookform/resolvers": "^3.x",
  "lucide-react-native": "^0.x",
  "@supabase/supabase-js": "^2.x",
  "@sentry/react-native": "^5.x"
}
```

### Development Dependencies
```json
{
  "typescript": "^5.x",
  "@types/react": "~18.x",
  "@types/react-native": "~0.73.x",
  "jest": "^29.x",
  "@testing-library/react-native": "^12.x"
}
```

## Notes

- This is a **frontend-only repository**. Supabase services are consumed via API calls.
- Keep Supabase credentials in `.env` files (never commit them).
- Backend logic (database schema, RLS policies, Edge Functions) should be documented in `docs/` but not implemented here.
- Consider creating a separate repository for Supabase migrations and Edge Functions if needed.
