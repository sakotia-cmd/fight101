# Architecture Overview

Fight 101 is plain HTML/CSS/JS — no build tools, no frameworks. `index.html` loads every `.js` file as a `<script>` tag in order. All globals are shared across files.

## File responsibilities

| File | Owns |
|------|------|
| `index.html` | Loads scripts in correct order, defines `<canvas id="gameCanvas">` |
| `style.css` | Fullscreen canvas, no scrollbars |
| `main.js` | Game loop, input handling, camera, HUD, minimap |
| `player.js` | Jay's position, movement, drawing, hideout movement |
| `world.js` | City grid, buildings, streets, RESERVED zones, collision |
| `combat.js` | Sword swing animation, HP, damage, game over, restart |
| `enemy.js` | Monkey + Lizard enemies, enemy projectiles |
| `weapons.js` | WEAPON_TYPES, ELEMENTS, switching, attack dispatch |
| `projectiles.js` | Player projectiles (bow, gun) update + draw |
| `items.js` | Hamburger spawning and pickup |
| `inventory.js` | Inventory, decorations, awards, kill tracking |
| `currency.js` | Coin spawning, pickup, totals |
| `shop.js` | Shop UI, item list, purchasing logic |
| `hideout.js` | Interior scene, decorate mode, decoration rendering |
| `capybara.js` | Capybara following, leveling, combat help |
| `vehicles.js` | Cars/motorcycles/jets, vehicle blasters |
| `bosses.js` | Boss arenas, intro cutscenes, all three bosses |

## Global state (the "tags" you'll see everywhere)

These are top-level `let`/`const` declarations that any file can read/write:

- **Player state** (`player.js`): `player` (object with x/y/width/height/direction)
- **Combat state** (`combat.js`): `playerHP`, `playerMaxHP`, `gameOver`, `swordSwinging`, `swordCooldownTimer`
- **World state** (`world.js`): `WORLD_WIDTH`, `WORLD_HEIGHT`, `buildings`, `streets`, `RESERVED`
- **Hideout state** (`hideout.js`): `insideHideout`, `decorateMode`, `placedDecorations`
- **Inventory** (`inventory.js`): `inventory` object, `ownedDecorations`, `earnedAwards`, `totalKills`
- **Currency** (`currency.js`): `playerCoins`
- **Enemies** (`enemy.js`): `enemies[]`, `enemyProjectiles[]`
- **Weapons** (`weapons.js`): `equippedWeapon`, `playerWeapons`, `playerProjectiles[]`
- **Vehicles** (`vehicles.js`): `inVehicle`, `currentVehicle`, `vehicles[]`, `vehicleProjectiles[]`
- **Bosses** (`bosses.js`): `activeBoss`, `bossActive`, `bossArenaLocked`, `bossArenas`, `bossIntroTimer`, `bossIntroType`, `bossProjectiles[]`, `firePatches[]`
- **Shop** (`shop.js`): `shopOpen`, `shopItems`, `shopSelectedIndex`

## Game loop (main.js)

```
gameLoop()
├── if insideHideout:
│   ├── updateHideoutPlayer (or decorate cursor)
│   └── drawHideoutInterior
└── else:
    ├── update: player/vehicle, enemies, items, combat, projectiles, capybara, boss
    ├── checkBossArenaEntry, checkAwards
    └── draw: world, arenas, hideout exterior, vehicles, items, enemies,
              current vehicle, player, capybara, sword, projectiles,
              vehicle projectiles, boss, HUD, gameOver
```

## Adding a new file

1. Create `<filename>.js`
2. Add `<script src="<filename>.js"></script>` in `index.html` **before** any file that depends on it
3. Hook into the game loop in `main.js` (`update*` call and `draw*` call)
