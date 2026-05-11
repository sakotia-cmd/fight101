# Session 3 — Hideout & Capybara

**Goal:** Jay finds the hideout. Inside, he finds the capybara and can feed it hamburgers to train it.

## What shipped

- Hideout building at `(3900, 3000)` in the city — marked clearly (yellow sign on minimap)
- Press E at the door to enter — switches scene to an interior view
- Press E at the inside door to exit back to the city
- Capybara discovered on first hideout visit ("You found a capybara!" message)
- Capybara follows Jay outside (flies in a mini jet behind him)
- Hamburger inventory (max 10 in pouch); H eats one, F (inside hideout) feeds the capybara
- Capybara has level + XP; XP gained by feeding
  - Level 1–4: just follows
  - Level 5+: shoots small blasters at nearby monkeys
  - Level 10: mega attack (bigger blast, lightning)
- HUD shows capybara level

## Files created / modified

| File | Change |
|------|--------|
| `hideout.js` | NEW — interior scene, door logic |
| `capybara.js` | NEW — follow AI, leveling, blaster |
| `inventory.js` | NEW — hamburger count, draw inventory HUD |
| `main.js` | E key handling, scene switching |

## Key constants (hideout.js)

- `HIDEOUT_INTERIOR_WIDTH = 700`, `HIDEOUT_INTERIOR_HEIGHT = 500` (expanded in Session 9)
- Door positions for enter/exit

## Quirks

- `insideHideout` global gates a lot of behavior in `main.js`
- Capybara position is interpolated toward Jay each frame to feel "flighty"
