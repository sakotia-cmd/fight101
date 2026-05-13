# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

Fight 101 is a top-down 2D browser game built by an 8-year-old (Jay) and his dad, session-by-session with Claude Code. The full game design, story, roadmap, and original session prompts live in `FIGHT_101_PROJECT.md`. Detailed notes on what actually shipped each session live in `docs/` — read `docs/README.md` first for the index.

**A Unity 2D port is in progress in `unity/` (started session U1).** It's a parallel rewrite — the JS game at the repo root is still the source of truth for behavior and the place where new features ship until the port catches up. Port plan: `~/.claude/plans/can-you-swap-game-serialized-lightning.md`. Per-session work follows the `U1`, `U2`, … numbering from that plan. When working in `unity/`, read `unity/README.md` first — it documents the one-time Unity Hub setup and the current state of the scaffold.

## Running the game

No build, no install. Two options:
- Double-click `index.html` (simplest)
- Run a local server (recommended when iterating; some browsers throttle file:// canvas): `npx serve -l 8000` or `python3 -m http.server 8000`, then open `http://localhost:8000`

A preview server config is already set up in `.claude/launch.json` under the name `fight101` (uses `npx serve` on port 8000).

There are no tests, no linter, no package.json. Verification is manual: open the page, play, and use `preview_eval` to inspect/manipulate state directly (e.g. `restartGame()`, `player.x = 800`, `bossIntroTimer = 90`).

## Architecture

Plain HTML/CSS/JS, Canvas API, no frameworks. `index.html` loads every `.js` file as a `<script>` tag in dependency order — **all globals are shared across files**. There is no module system. When adding a new file, add a matching `<script>` tag in `index.html` before any file that depends on it.

The game runs a single `requestAnimationFrame` loop in `main.js` that branches on `insideHideout`:
- **City scene:** update player/vehicle → enemies → items → combat → projectiles → capybara → boss → camera → draw world, arenas, hideout exterior, vehicles, items, enemies, current vehicle, player, capybara, sword, projectiles, vehicle projectiles, boss, HUD, game over.
- **Hideout scene:** update hideout player (or decorate cursor) → draw interior + HUD.

### Key globals (the wiring)

These are top-level `let`/`const` that any file reads/writes. Knowing the owner file is the fastest way to navigate:

- `player` (player.js), `playerHP`/`playerMaxHP`/`gameOver`/`swordSwinging`/`swordCooldownTimer` (combat.js)
- `WORLD_WIDTH`/`WORLD_HEIGHT`/`buildings`/`RESERVED` (world.js)
- `insideHideout`/`decorateMode`/`placedDecorations` (hideout.js)
- `inventory`/`ownedDecorations`/`earnedAwards`/`totalKills` (inventory.js)
- `playerCoins` (currency.js)
- `enemies[]`/`enemyProjectiles[]` (enemy.js)
- `equippedWeapon`/`playerWeapons`/`playerProjectiles[]`/`WEAPON_TYPES`/`ELEMENTS` (weapons.js)
- `inVehicle`/`currentVehicle`/`vehicles[]`/`vehicleProjectiles[]` (vehicles.js)
- `activeBoss`/`bossActive`/`bossArenaLocked`/`bossArenas`/`bossIntroTimer`/`bossIntroType`/`bossProjectiles[]`/`firePatches[]` (bosses.js)
- `shopOpen`/`shopItems`/`shopSelectedIndex` (shop.js)

See `docs/architecture.md` for the full file responsibility table.

### Recurring gotchas

- **`recordKill()` must be called BEFORE `enemies.splice(i, 1)`** everywhere a kill happens (enemy.js, weapons.js, projectiles.js). Missing one desyncs the awards system.
- **1/2 keys do double duty:** weapon switch in city, decoration cycle in decorate mode. The `decorateMode` flag gates this in `main.js` — easy to break when adding new bindings.
- **Boss arena entry shrinks by 50px on each side** so Jay can stand at the boundary without triggering. After the intro cutscene was added, entry sets `bossIntroTimer = 180` first; the boss spawns when the timer hits 0.
- **Lizard 2.0's tough scales** apply 50% damage reduction unless the current element is fire/blueFire/mega — see `damageBoss` in `bosses.js`. Adding new elements means revisiting this resistance check.
- **`combat.js`'s `restartGame()` is the single reset point** — when adding new mutable state (timers, arrays, flags), reset it there or game-over restart will leak stale state.
- **There is no save system yet** — refreshing the page loses all progress. Session 10 in `docs/roadmap.md` plans this.

## Working on a new session

The project follows a session-based plan (currently through Session 9 + boss intros). Before starting work:
1. Read `docs/README.md` for the session index
2. Read `docs/session-0N-*.md` for the most recent completed session to recall what's there
3. Read `docs/roadmap.md` for the next planned session's scope and watch-outs
4. Original session prompts (more verbose) live in `FIGHT_101_PROJECT.md`
5. After finishing a session, update the matching `docs/session-XX-*.md` with what **actually** shipped (real values often diverge from the planned prompt)

## Code style for this repo

- Code should be readable by an 8-year-old with help — clear variable names (`playerSpeed`, not `ps`), comments explaining the "what" in plain language
- `const`/`let` only, never `var`
- Placeholder art is fine; shapes and emoji are used throughout
- No build step, no dependencies — keep it that way

## Cheats / debug

- `M` key sets `playerCoins = 9999` (intentional cheat for testing weapons; documented in `docs/balance.md` with a note to gate or remove before sharing)
- `preview_eval` is the fastest way to set up scenarios — teleport with `player.x = ...; player.y = ...`, force a boss intro with `checkBossArenaEntry()`, etc.
