# PrismSplit

**The bill-splitting app that keeps friendships intact.**  
PrismSplit is a mobile-first, offline-ready bill splitter built for speed and transparency. It’s strictly frontend—no backend logic to maintain, just pure React Native performance powered by Expo.

## 📱 Showcase

<p align="center">
  <img src="showcase/screenshots/V1 App/Landing/landing-06.jpg" width="30%" alt="Landing Screen" />
  <img src="showcase/screenshots/V1 App/HomePage/home-page-01.jpg" width="30%" alt="Home Screen" />
  <img src="showcase/screenshots/V1 App/GroupsPge/groups-list-01.jpg" width="30%" alt="Groups List" />
</p>

> **Experience the flow**: create groups, split bills, and track expenses offline.

<p align="center">
  <img src="showcase/screenshots/V1 App/GroupsPge/EditBill/edit-bill-01.jpg" width="30%" alt="Edit Bill" />
  <img src="showcase/screenshots/V1 App/createExpense/create-expense-01.jpg" width="30%" alt="Create Expense" />
  <img src="showcase/screenshots/V1 App/Activitypage/activity-page-01.jpg" width="30%" alt="Activity Page" />
</p>

## ✨ Features

- **🚀 Offline Logic**: Calculate splits, debts, and totals instantly without a server.
- **💸 Smart Splits**: "Equal", "Exact Amounts", "Percentages", or "Shares"—handle any scenario.
- **👥 Dynamic Groups**: Manage multiple friend groups with ease.
- **🎨 Native Feel**: Built with Tamagui for smooth animations and a premium dark-mode aesthetic.
- **🔒 Private by Design**: Your data lives on your device (with optional Supabase sync).

## 🛠 Tech Stack

- **Framework**: [Expo SDK 54](https://expo.dev) + [Expo Router](https://docs.expo.dev/router/introduction/)
- **UI System**: [Tamagui](https://tamagui.dev) + Lucide Icons
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Forms**: React Hook Form + Zod Validation
- **Engine**: React Native 0.81 (New Architecture enabled)

## 📂 Project Structure

Verified layout as of 2025:

- **`src/`** — **Project Root** (contains `package.json` and source)
  - `app/` — **Routing Root**. All screens live here (file-based routing).
    - `(tabs)/` — Main tab navigation (Bills, Groups, Profile).
    - `bill/[id].tsx` — Detailed bill editing and splitting.
  - `components/`
    - `ui/` — Base design system tokens (Buttons, Cards, Inputs).
  - `features/` — Domain logic for Bills, Groups, and Users.
  - `lib/` — Core utilities (Supabase client, calculations).
  - `store/` — Global state definitions.
- `showcase/` — Marketing assets and screenshots.
- `docs/` — Architecture decisions and guides.
- `design/` — Figma assets and tokens.

## 🚀 Getting Started

PrismSplit uses a `src` folder for the main application code.

### 1. Setup

```bash
# Clone the repo
git clone https://github.com/architagrawal/prismSplit.git
cd prismSplit

# Enter the source directory
cd src

# Install dependencies
npm install
```

### 2. Run the App

```bash
# Start the Expo development server
npm start

# Tips:
# - Press 'a' to open on Android Emulator
# - Press 'i' to open on iOS Simulator
# - Press 'w' to open in Web Browser
```

## 🤝 Contributing

We welcome contributions! Please check `CONTRIBUTING.md` for guidelines.  
To run tests (if available): `npm test` inside the `src` folder.

## 📄 License

**Source Available**: This project is open for contribution but is **NOT Open Source**.  
Copyright (c) 2025-Present Archit Agrawal. All Rights Reserved.

- **Allowed**: Viewing code, forking for PRs, learning.
- **Forbidden**: Commercial use, redistribution, deploying as your own service.

See [LICENSE](LICENSE) for full details.
