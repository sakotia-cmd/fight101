# Session 7 — First Boss: Monkey 2.0

**Goal:** A real boss fight.

## What shipped

- Boss arena at `(2600, 400)` — a `400x350` zone with a big monkey symbol and colored ground
- Walking into the inner trigger zone (arena shrunk by 50px each side) starts the encounter
- Arena locks while `bossActive` — Jay can't leave until win or die
- Monkey 2.0:
  - 500 HP
  - Big sprite, fast movement
  - Throws bananas every ~2 seconds (curved projectiles)
  - Every 10 seconds: jumps and slams (AoE damage if Jay is nearby)
  - Calls 2-3 reinforcement monkeys at 50% HP
  - Damage flash, hit feedback
- Boss HP bar at top of screen during fight
- On defeat: drops 50 coins, "Monkey 2.0 Trophy" added (decorate-able after Session 9), arena unlocks
- On Jay death: respawn at hideout, boss not auto-reset (he can return)

## Files created / modified

| File | Change |
|------|--------|
| `bosses.js` | NEW — arena registry, Monkey 2.0 stats and behavior |
| `main.js` | `checkBossArenaEntry`, `updateBoss`, `drawBoss` hooks |
| `world.js` | RESERVED zone for the arena (no buildings spawn there) |

## Key globals

- `bossArenas.monkey2` — config (position, color, symbol)
- `activeBoss` (current boss object), `bossActive`, `bossArenaLocked`
- `bossProjectiles[]` (bananas, fireballs, hammers)
- `bossVictoryTimer` (handles post-defeat cleanup)

## Quirks

- The trigger zone is shrunk so Jay can stand at the boundary without triggering — gives him a chance to back out
- After Session 8's intro cutscene addition, entry triggers `bossIntroTimer = 180` first, then spawns the boss
