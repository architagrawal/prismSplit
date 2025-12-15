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
1.  **Compact Rows**: Reduced item height to ~56px, fitting 6-7 items per screen.
2.  **Date Grouping**: Implemented sticky headers for "Month Year" and sub-headers for "Day" (e.g., "Dec 10") to eliminate Repetitive Data.
3.  **Smart Coloring**:
    -   **Green**: "You lent" (Positive impact)
    -   **Red**: "You borrowed" (Negative impact)
    -   **Dimmed**: "Not involved" items have reduced opacity to focus attention on active debts.
4.  **Category Icons**: Retained but resized to fit the compact row.

## Outcome
The new design significantly improves scanability and usability for groups with high transaction volume.
