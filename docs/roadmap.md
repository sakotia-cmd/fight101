# Future Roadmap

Sessions 1–9 are done. Below are the planned sessions with prompts ready to paste into Claude Code. The full original prompts live in `../FIGHT_101_PROJECT.md` — these are shortened summaries with implementation notes for context.

## Session 10 — Save System (highest priority)

**Why next:** Right now, every refresh wipes Jay's progress. Hours of weapon upgrades, defeated bosses, and decorations vanish. Saving is the single biggest quality-of-life improvement remaining.

**Scope:**
- `localStorage`-based save/load of: player position, HP, max HP, coins, inventory, capybara level/XP, weapons + elements, defeated bosses, awards, ownedDecorations, placedDecorations
- Auto-save: every 60 seconds, on boss defeat, on shop purchase, on entering/exiting hideout
- Manual save: glowing save point in the hideout; pause menu "Save" option
- ESC opens a pause menu (with Save / Resume / Reset Game options)
- Reset Game with confirmation

**Files to add/modify:**
- NEW `save.js` — serialize state to JSON, write/read localStorage
- `main.js` — pause menu, ESC handling, call `loadGame()` at startup
- `hideout.js` — save point object + draw + interact

**Watch out for:**
- Decoration positions are objects with refs — serialize cleanly (no functions)
- Boss arena `defeated` flags live in `bossArenas[key].defeated` — include those
- Version the save schema (e.g. `{ version: 1, data: {...} }`) so future changes don't break old saves

## Session 11 — Audio

**Scope:** SFX (sword, bow, gun, taser, hit, hurt, coin, heal, boss roar, victory, capy levelup, shop) and music (city / hideout / boss). Volume controls + mute in pause menu, save preferences.

**Recommended path:** generate everything procedurally with Web Audio API. Avoids managing audio files. If real files are wanted later, point at freesound.org.

**Files:** NEW `audio.js` (or `sound.js`). Hook into existing event sites (e.g. `tryMeleeAttack`, `damagePlayer`, `defeatBoss`).

## Session 12 — Intro Cutscene

**Scope:** Bave and Dusters opening. 6 scenes, auto-advance with skip key. Pause menu option to replay.

**Files:** NEW `cutscene.js`. Modify `main.js` startup to check a `seenIntro` flag in localStorage.

## Session 13+ — Final Bosses

- **Smasher 2.0** — 1800 HP, faster, shockwave ground pound, armor at 50% HP. Drops 150 + trophy. Gated behind Smasher 1.0.
- **Smasher 3.0** — 2500 HP, throws boulders, summons 2 Smasher minions at 25%. Drops 250 + trophy. Gated behind 2.0.
- **Smasher of Doom** — 5000 HP, 3 phases (uses all moves / summons monkeys+lizards / berserk + mini smashers). Center-of-city tower arena. Gated behind 3.0 + owning any Mega weapon. Drops 1000 + endgame cutscene. Unlocks New Game+.

## Polish backlog (do as needed, in any order)

- Replace placeholder shapes with sprite art
- Particle effects (hits, level-ups, explosions)
- Quest log / objectives panel
- Settings menu — key rebinding, fullscreen
- Achievements page in hideout
- Difficulty options
- Mobile / touch support
- Save slots
- Speedrun timer
- Photo mode

## Tuning suggestions before the next big content drop

- The 50% damage reduction on Lizard 2.0 makes wood sword feel bad — consider letting +1 wood sword bypass some of it, or surfacing the resistance in the UI
- Smasher 1.0 may be too quick to find compared to Monkey 2.0 — consider gating Smasher 1.0 behind defeating either Monkey 2.0 or Lizard 2.0 (this matches the difficulty curve)
- The M cheat code should probably be removed (or gated behind a `?cheats=1` URL flag) before sharing the game with friends

## Working notes for future sessions

- Always `cp -r fight101 fight101-sessionN-backup` before starting
- Keep sessions to 30–45 min with Jay
- Let Jay test every change — he's the player
- If a session goes badly, restore from backup, don't pile fixes
- Update the matching `docs/session-XX-*.md` with **what actually shipped** after each session (real values may diverge from the planned prompt)
