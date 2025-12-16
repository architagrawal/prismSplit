# Decision: High-Density Group Expenses List

**Date:** December 15, 2024
**Status:** Implemented

## Context
The initial design for the Group Expenses screen used a "Card" layout, showing detailed information for each bill in a separated box. Users reported (and analytics suggested) that this layout had low information density, allowing only 2-3 items to be visible on screen at once.

## Problem
-   **Low Density:** Users had to scroll endlessly to find their own debts in active groups.
-   **Visual Noise:** "Not involved" items took up 60-70% of screen space.
-   **Repetitive Data:** Dates ("Dec 10") were repeated on every card.

## Solution
Refactored the Group Expenses screen to a **High-Density Compact List**.

### Key Changes
1.  **Compact Rows**: Reduced item height to ~52px, fitting 7-8 items per screen.
2.  **Date Grouping**: Sticky headers for "Month Year" and sub-headers for "Day" (e.g., "Dec 10").
3.  **Sticky Month Headers**: Using React Native SectionList, month headers stick with monthly totals.
4.  **Horizontal Hero Header**: Group info (emoji + name) on left, overlapping avatars on right.
5.  **Credit Card Payer Badge**: Payer shown as mini credit card icon (22x16px) with initials, overlapping category icon corner.
6.  **Itemized Bill Indicator**: ClipboardList icon after title for bills with item_count > 1.
7.  **Emphasized Balance**: Balance text (you lent/borrowed) is larger (14px/600) than amount (12px muted).
8.  **Smart Coloring**:
    -   **Green**: "You lent" (Positive impact)
    -   **Red**: "You borrowed" (Negative impact)
    -   **Gray**: "You paid" (Solo expense, no balance impact)
    -   **Dimmed**: "Not involved" items have reduced opacity.
9.  **Category Icons**: Retained at 36px with payer badge overlay.

## Outcome
The new design significantly improves scanability and usability for groups with high transaction volume.

