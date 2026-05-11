# Feature — Boss Buildings & Intro Cutscenes

Added after Session 9 in response to Jay: "Can you make a building for the bosses but when you go in it's a course before you fight him and it says his name bold."

## What shipped

### Boss buildings
Each arena now renders as a building exterior in `drawBossArenas()` rather than a flat colored rectangle:
- Shadow behind the building
- Walls colored by boss theme (red / green / purple-blue)
- Roof in `borderColor`
- Corner towers
- Entrance door with arch
- Sign with boss name
- Boss symbol emoji above the door
- Two fire torches flanking the door

### Intro cutscene
Entering an arena's inner zone (the existing trigger) sets:
- `bossIntroTimer = 180` (3 seconds at 60fps)
- `bossIntroType = "<bossKey>"`
- `bossArenaLocked = true`
- Player clamped inside the arena bounds for the duration

While `bossIntroTimer > 0`, `drawBossIntro()` renders:
- Dark overlay
- Cinematic black bars (top + bottom)
- Pulsing boss symbol (emoji)
- Boss name in bold 48px monospace, sliding in horizontally with colored glow
- "GET READY" subtitle
- Horizontal "drama lines" sweeping across the screen

When the timer hits 0, the appropriate `spawnMonkey2()` / `spawnLizard2()` / `spawnSmasher1()` is called and the fight begins.

## Files modified

| File | Change |
|------|--------|
| `bosses.js` | `bossIntroTimer` / `bossIntroType` globals, intro branch in `updateBoss`, rewritten `drawBossArenas`, new `drawBossIntro` |
| `combat.js` | `restartGame` resets intro state |
| `main.js` | `drawBossIntro(ctx)` added to render order (after HUD) |

## Quirks

- `checkBossArenaEntry()` bails if `bossIntroTimer > 0` so the intro can't re-trigger itself
- During the intro, player input is still processed (movement / attacks) but the clamp keeps Jay inside the arena — feels fine in practice
- Manual teleport during testing doesn't trigger `checkBossArenaEntry` until the next game-loop tick, which can look like a bug. Call the function directly to force entry.
