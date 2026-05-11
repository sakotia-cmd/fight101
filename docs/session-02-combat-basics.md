# Session 2 — Combat Basics

**Goal:** Jay can fight monkeys with a stick sword. Hamburgers heal him.

## What shipped

- Stick sword equipped by default; SPACE triggers a swing animation (sweeping arc)
- Monkeys spawn around the city; wander randomly, chase Jay when in detection range
- Hits register inside the sword's arc; monkeys take damage, get knocked back
- Touching a monkey damages Jay (with invincibility frames after each hit)
- HP bar at top of screen (100/100 start)
- ~30% of defeated monkeys drop a hamburger
- Walking over a hamburger picks it up; H eats it for +25 HP
- HP at 0 → "GAME OVER" overlay. R restarts.

## Files created / modified

| File | Change |
|------|--------|
| `enemy.js` | NEW — monkey wander/chase AI, HP, damage |
| `combat.js` | NEW — sword swing state, player HP, damage, game over |
| `items.js` | NEW — hamburger drops and pickup |
| `main.js` | SPACE binding, HUD updates |

## Key constants

- `SWORD_RANGE = 42`, `SWORD_ARC = Math.PI * 0.9`
- `SWORD_SWING_DURATION = 15` frames
- `playerInvincible = 45` frames after a hit (~0.75s)
- `HAMBURGER_HEAL = 25` (in items.js)

## Quirks

- Sword angle is set based on `player.direction` — make sure direction updates on every movement frame
- Knockback is computed per-enemy in `tryMeleeAttack` (`weapons.js`) using `Math.atan2`
