# Experiments & Technical Spikes

## Completed Experiments

*(None yet - project in design phase)*

---

## Planned Experiments

### EXP-01: Speed Parser Input Performance

**Goal:** Validate 20 items in 60 seconds target

**Hypothesis:** Using auto-focus flow with native keyboard "Next" button enables fast item entry.

**Test:**
1. Build minimal Speed Parser prototype
2. Test with 5 users entering 20 items
3. Measure time and error rate

**Success Criteria:**
- Average time < 60 seconds
- Error rate < 5%
- User satisfaction > 4/5

---

### EXP-02: Real-time Sync Architecture

**Goal:** Validate Supabase Realtime for self-select sync

**Hypothesis:** Supabase Realtime subscriptions can sync selections across 6 users with < 500ms latency.

**Test:**
1. Set up Supabase with item_assignments table
2. Implement real-time subscription
3. Simulate 6 concurrent users selecting items

**Success Criteria:**
- Update latency < 500ms
- No missed updates
- Graceful offline handling

---

### EXP-03: Color-Coded Split Bar Rendering

**Goal:** Validate proportional color bar renders smoothly

**Hypothesis:** A flexbox-based color bar with up to 6 segments performs at 60fps.

**Test:**
1. Create SplitBar component with dynamic segments
2. Test with 1-6 people with various percentages
3. Animate transitions on selection change

**Success Criteria:**
- 60fps on mid-range devices
- Smooth width transitions
- Correct proportions for any percentage split

---

### EXP-04: QR Code Generation & Scanning

**Goal:** Validate in-app QR code invite flow

**Hypothesis:** react-native-qrcode-svg and expo-camera can handle QR generation and scanning.

**Test:**
1. Generate QR containing invite URL
2. Scan with device camera
3. Parse and navigate to group join

**Success Criteria:**
- QR generates in < 100ms
- Camera scan works in < 1s
- Deep link correctly opens group join

---

### EXP-05: Offline-First Data Sync

**Goal:** Validate local storage + sync pattern

**Hypothesis:** Using WatermelonDB or Realm with Supabase can enable offline editing with sync.

**Test:**
1. Create bill while offline
2. Store in local database
3. Sync when coming online
4. Handle conflicts (last-write-wins)

**Success Criteria:**
- Local operations feel instant
- Sync completes within 5s of reconnection
- No data loss

---

### EXP-06: OCR Receipt Scanning (v2.0)

**Goal:** Validate accuracy of receipt text extraction

**Hypothesis:** ML Kit or Tesseract.js can extract item names and prices from receipt photos.

**Test:**
1. Collect 10 sample receipt images
2. Run OCR extraction
3. Compare to actual items

**Success Criteria:**
- Item name accuracy > 80%
- Price extraction accuracy > 90%
- Processing time < 3s

---

## Technical Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2024-12-09 | Supabase over Firebase | Better SQL, real-time built-in, PostgreSQL |
| 2024-12-09 | React Native + Expo | Cross-platform, fast iteration |
| 2024-12-09 | Dark theme default | Modern fintech aesthetic |
| 2024-12-09 | Max 3 avatars + "+N" | Cleaner than 4, fits mobile well |
| 2024-12-09 | Percentage splits over shares | More intuitive for users |
| 2024-12-09 | Self-select model | Gives participants agency, reduces disputes |
| 2024-12-09 | Soft delete (30 days) | Allows recovery, reduces anxiety |

---

## Open Technical Questions

1. **State Management:** Zustand vs Jotai vs React Context?
2. **Navigation:** React Navigation vs Expo Router?
3. **UI Framework:** Tamagui vs NativeWind vs StyleSheet?
4. **Offline Storage:** WatermelonDB vs Realm vs MMKV?
5. **Push Notifications:** Expo Notifications vs OneSignal?
6. **Image Generation:** react-native-view-shot for receipt sharing?
