# Session 9 — Hideout Customization

**Goal:** Jay can decorate his hideout with trophies, awards, and furniture.

## What shipped

### Decorate mode (T key, inside hideout)
- Cursor (crosshair) appears, controlled by arrow keys
- Bottom panel shows available items in inventory, cycled with 1/2
- SPACE places the selected item at the cursor (or picks up a placed item under the cursor)
- E picks up the placed item under the cursor
- T or ESC exits decorate mode
- Decorations persist for the session (no save system yet — that's Session 10)

### Decoration categories
- **Trophies** — earned by defeating bosses (Monkey 2.0, Lizard 2.0, Smasher 1.0). Drawn on a pedestal
- **Awards** — earned via milestones (see below). Drawn in a frame
- **Furniture** — bought at shop. Drawn as emoji

### Awards / milestones (inventory.js)
Tracked in `earnedAwards`, unlocked via `checkAwards()`:
- **First Kill** — defeat any enemy
- **10 Kills** — defeat 10 enemies
- **First Boss** — defeat any boss
- **Boss Hunter** — defeat all bosses
- **Capy Trainer** — capybara reaches level 5
- **Capy Master** — capybara reaches level 10
- **First Hamburger** — eat your first burger
- **Rich Jay** — accumulate enough coins

When earned, popup "Award unlocked!" displays.

### Furniture catalog (FURNITURE_CATALOG in inventory.js)
chair 10 / plant 15 / rug 25 / couch 30 / TV 50 / neon 75 / arcade 200

### Expanded hideout
- Interior expanded to 700x500 to leave room for decorating

## Files created / modified

| File | Change |
|------|--------|
| `inventory.js` | rewritten — decoration arrays, awards, kill tracking, furniture catalog |
| `hideout.js` | rewritten — decorate mode, cursor, place/pickup logic, item drawing |
| `shop.js` | furniture items added to `shopItems`, `furni_` action handler |
| `main.js` | T key, decorate mode dispatch on SPACE/E/ESC, 1/2 cycle inside decorate |
| `bosses.js` | `defeatBoss` calls `addBossTrophy(boss.type)` |
| `enemy.js`, `weapons.js`, `projectiles.js` | `recordKill()` calls before every `enemies.splice` |

## Key globals

- `decorateMode`, `decorateCursorX/Y`, `decorateSelectedItem`, `decoratePickedUp`
- `placedDecorations[]` (in hideout, persists session)
- `ownedDecorations[]` (inventory of decoratable items)
- `earnedAwards[]`
- `totalKills`

## Quirks

- 1/2 keys do double duty: weapon switch (city) vs. decoration cycle (decorate mode). The `decorateMode` flag gates this in `main.js`
- F key (feed capybara) is disabled in decorate mode — easy to forget if adding new keys
- `recordKill()` must be called **before** `enemies.splice(i, 1)` everywhere or kill count desyncs
