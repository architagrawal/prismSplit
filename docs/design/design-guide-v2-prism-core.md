# PrismSplit Design System v2.0: "The Prism Core"

> **Vision:** "Refracting finance into clarity."
> **Status:** Active Definition for v1.0 Launch
> **Previous Version:** [design-guide.md](./design-guide.md) (Pastel Flat)

---

## 💎 Core Aesthetic Principles

This design system moves beyond "flat pastel" to a **semi-realistic, material-based** aesthetic. We emulate the properties of **Crystal, Light, and Glass**.

### 1. The Material: "Living Glass"
UI elements are not "cards" on a background; they are **panes of frosted glass** floating in 3D space.
- **Blur:** Heavy usage of `expo-blur` (intensity 20-40).
- **Transparency:** Backgrounds are never solid white. They are `rgba(255, 255, 255, 0.6)` to let the "Aura" shine through.
- **Borders:** Thin, semi-transparent white borders (`rgba(255,255,255, 0.5)`) to represent the "cut edge" of glass.

### 2. The Light: "Refraction"
Lighting is not static. It reacts to the user.
- **Gyroscope Backgrounds:** The underlying gradients (Auras) shift position slightly based on phone tilt.
- **Glows:** Active elements don't just change color; they **emit light** (outer glow shadows).

### 3. The Physics: "Fluid Weight"
- **Damping:** Animations use spring physics (mass: 1, damping: 20) instead of linear easing.
- **Morphing:** Elements expand from their source.

---

## 🎨 Color Palette v2.0

### Base "Light" (The Source)
Instead of solid backgrounds, we use **Aura Gradients**.

| Aura Name | Gradient/Color | Usage |
|-----------|----------------|-------|
| **Prism (Default)** | `linear-gradient(135deg, #A78BFA, #FDBA74)` | Brand identity, default user |
| **Neon** | `linear-gradient(135deg, #F472B6, #60A5FA)` | Cyberpunk/Night vibe |
| **Forest** | `linear-gradient(135deg, #34D399, #FBBF24)` | Calm, grounded users |
| **Ocean** | `linear-gradient(135deg, #22D3EE, #818CF8)` | Serene, flow state |

### Glass Surface Tokens
| Token | Value | Usage |
|-------|-------|-------|
| `glass-panel` | `rgba(255, 255, 255, 0.65)` | Standard cards (Bill rows) |
| `glass-hero` | `rgba(255, 255, 255, 0.45)` | The main Balance Prism |
| `glass-modal` | `rgba(255, 255, 255, 0.85)` | Popups/Bottom sheets |
| `glass-border` | `rgba(255, 255, 255, 0.5)` | 1px border for definition |
| `glass-shine` | `linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.4) 25%, transparent 30%)` | Loading shimmer |

### Functional Colors (Refined)
Kept from v1 but adjusted for vibrance against glass.
- **Success (Owed):** `#10B981` (Emerald 500)
- **Error (Owe):** `#EF4444` (Red 500)
- **Text Primary:** `#1F2937` (Gray 900) - avoiding pure black on glass
- **Text Secondary:** `#4B5563` (Gray 600)

---

## 📐 Component Specs (Prism Core)

### 1. The Balance Prism (Hero Card)
The centerpiece of the Home Screen.
- **Container:** `BlurView` (tint: "light", intensity: 40)
- **Shape:** Rounded Rectangle (radius: 24)
- **Border:** `1px rgba(255,255,255,0.6)`
- **Shadow:**
    ```css
    shadow-color: #A78BFA;
    shadow-offset: {0, 8};
    shadow-opacity: 0.25;
    shadow-radius: 24;
    ```
- **Interaction:**
    - **Tilt:** Background gradient shifts ±15px based on gyroscope.
    - **Drag:** User drags horizontally to "split" the prism (reveal detailed breakdown).

### 2. The Clarity Ring (Avatar)
Replaces standard avatar circle.
- **Base:** User profile image masked to circle.
- **Ring Layer (SVG):**
    - **Path:** Irregular/Jagged (low completion) -> Perfect Circle (high completion).
    - **Stroke:** Gradient matching User's Aura.
    - **Glow:** `shadow-radius: 10` when "Settled".
    - **Animation:** Rotates slowly (60s loop) when perfectly settled ("Clarity State").

### 3. Glass Cards (List Items)
Used for Bills and Groups.
- **Background:** `rgba(255, 255, 255, 0.6)`
- **Margin:** 12px horizontal (floating, not full width)
- **Radius:** 16px
- **Content:**
    - **Left:** Icon/Avatar
    - **Center:** Text (Primary + Secondary)
    - **Right:** Status Badge (Capsule shape, semi-transparent bg)

### 4. Floating Action Button (FAB)
- **Position:** Center bottom, floating 24px up.
- **Size:** 64px (larger than standard).
- **Material:** `BlurView` (tint: "systemMaterialLight") active blend.
- **Icon:** Holographic gradient tint.

---

## 🎬 Animation Guidelines

### "The Snap"
Used for payment confirmation and deleting items.
- **Physics:** `Tension: 180, Friction: 12`
- **Feel:** Heavy release. Like snapping a rubber band.

### "The Flow"
Used for page transitions and card expansion.
- **Concept:** Shared Element Transition.
- **Behavior:** The card *becomes* the screen. It doesn't slide in. The border radius morphs from 16px to 0px.

### "The Shimmer"
Used for "Nudge" notifications and active states.
- **Effect:** A band of light (white, opacity 0.3) moves diagonally across the glass surface every 5 seconds.

---

## 📱 Typography Updates
Moving to **rounded sans-serif** headers to match the organic glass feel.
- **Headings:** `Nunito` or `Rounded M+ 1c` (700 weight)
- **Body:** `Inter` (400/500 weight) for readability.
- **Numbers:** Monospace variant (tnums) for tabular alignment.
