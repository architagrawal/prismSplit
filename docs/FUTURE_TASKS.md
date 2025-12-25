# PrismSplit Future Tasks / Roadmap

## Performance & Technical Debt

### Replace AsyncStorage with MMKV
- **Priority**: Medium
- **Status**: Pending
- **Description**: Migrate from AsyncStorage to MMKV for ~10x faster storage operations
- **Files to update**:
  - `src/lib/store/authStore.ts`
  - `src/lib/store/uiStore.ts`
- **Notes**: 
  - MMKV package is already installed (`react-native-mmkv@4.1.0`)
  - Previous attempt failed due to native module initialization issues
  - Requires a full `npx expo prebuild --clean` and native rebuild
  - Consider also using `react-native-encrypted-storage` for sensitive auth tokens

---

## Features

_Add future feature tasks here_

---

## Bug Fixes

_Add known bugs to fix here_
