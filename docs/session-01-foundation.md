# Session 1 — Foundation

**Goal:** Jay walks around an empty high-tech city. Camera follows him. He can't walk through buildings.

## What shipped

- `index.html` opens directly in a browser (also runs via `npx serve` on port 8000)
- Fullscreen canvas, dark high-tech city aesthetic (purple/blue buildings, gray streets, neon accents)
- World is much larger than the screen — many screens of explorable area
- Jay character: ~30x30 with face (eyes + smile), fohawk hair
- WASD + arrow keys both move Jay at ~3-4 px/frame
- Camera centers on Jay, clamped to world edges
- Collision detection against buildings — Jay slides along walls when blocked

## Files created

| File | Purpose |
|------|---------|
| `index.html` | Loads scripts, defines canvas |
| `style.css` | Fullscreen, no scrollbars |
| `main.js` | Game loop, input handling, camera |
| `player.js` | Jay's position, movement, drawing |
| `world.js` | City grid, buildings, streets, collision data |

## Key constants

- `WORLD_WIDTH`, `WORLD_HEIGHT` in `world.js` (city is several screens large)
- `playerSpeed` in `player.js`

## Verification

1. Double-click `index.html`
2. Move with WASD and arrow keys
3. Try to walk into buildings — blocked
4. Walk to edges — camera stops at boundary
