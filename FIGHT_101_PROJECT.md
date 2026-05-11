# Fight 101 — Game Project

A top-down 2D browser game built by Jay (age 8) and Dad using Claude Code.

---

## How to Use This Document

This file contains everything for the project: the game design, the build roadmap, and **ready-to-paste prompts for every Claude Code session**. Save this file in your project folder. When you start a new session with Claude Code, copy the prompt for that session and paste it in.

**Working with Claude Code:**
1. Open Terminal on your Mac
2. Make a project folder: `mkdir fight101 && cd fight101`
3. Save this file inside that folder
4. Run `claude` (or `claude-code`) in the terminal from that folder
5. Copy the Session 1 prompt below and paste it in
6. After each successful session, make a backup copy of the folder (e.g., `fight101-session1-backup`)

**Tips for working with an 8-year-old:**
- Keep sessions to 30-45 minutes max
- Let Jay test every change — hand him the keyboard
- Let Jay make design decisions ("how fast should Jay run?" → ask him)
- It's okay to throw away a bad session and go back to your last backup
- Celebrate small wins. Every session should end with something playable.

---

## Game Design Document

### Story
It's Jay's 8th birthday. He goes to Bave and Dusters to play the new arcade game *Fight 101*. After a brief cutscene, he gets pulled into the game world (Tron-style) — a high-tech city overrun by monkeys, lizards, and Smashers. He has to fight his way to the Smasher of Doom to escape.

### Main Character
**Jay** — 8-year-old Indian boy, fohawk hairstyle, big smile and big eyes.

### Setting
A high-tech city. No beaches, no nature. Buildings, neon, streets, rooftops, underground areas.

### Core Loop
Explore city → fight enemies → collect weapons, money, hamburgers → return to hideout → train capybara, buy upgrades, customize → take on bosses → repeat.

### Weapon Types
Four types: Sword, Bow, Gun, Taser

### Element Tiers (weakest → strongest)
1. Stick / Wood — basic damage
2. Arrow — medium damage, fast
3. Water — slows enemies
4. Fire — burns over time
5. Blue Fire — stronger burn (combines blue flame + blue fire from original brainstorm)
6. Sound Wave — hits multiple enemies in a radius
7. **Mega** — lightning effect, strongest, endgame tier

Any weapon type can have any element. Example endgame weapon: "Mega Sword" (lightning sword).

### Vehicles (with mounted blasters — stronger tier = stronger blasters)
- **Tier 1**: High-speed train, Underwater jet
- **Tier 2**: Car, Motorcycle
- **Tier 3**: Jet (strongest)

You can fight from inside vehicles using their blasters.

### Enemies
- **Monkey** (most common)
- **Lizard** (second most common)

### Bosses (in order)
1. Monkey 2.0 — fast, throws bananas
2. Lizard 2.0 — spits fire, tough scales
3. Smasher 1.0 — giant hammer
4. Smasher 2.0 — bigger, tougher
5. Smasher 3.0 — biggest, toughest
6. **Smasher of Doom** — final boss, uses moves from all others

### Capybara Spy
- Found early in the game at the hideout
- Trained by feeding hamburgers
- Levels up — gains better abilities over time:
  - Level 1: Basic flight, follows Jay
  - Level 5: Has its own blasters
  - Level 10: Mega weapon
- Flies in a mini jet alongside Jay during fights

### Hideout
Discovered early in the game. Becomes home base. Features:
- Capybara training area (feed it hamburgers)
- **Shopkeeper** (sells weapons, upgrades, hamburgers)
- Customization options:
  - Trophies from defeated bosses
  - Awards for achievements
  - Special discoveries on display
  - Furniture

### Economy
- Money drops from defeated enemies
- Money also found in the world (chests, hidden spots)
- Spent at hideout shop

### Saves
- Auto-save (every minute or after major events)
- Manual save button
- Stored in browser localStorage

### Audio
- Sound effects: sword swings, blaster shots, eating hamburgers, taking damage
- Background music: city theme, hideout theme, boss theme

---

## Tech Stack

- **Plain HTML, CSS, JavaScript** — no frameworks
- **Canvas API** for rendering
- **No build tools** — just open `index.html` in a browser
- **localStorage** for saving
- **Mac development** — any browser works (Chrome recommended)

Why this stack: An 8-year-old can read the code, every change is instantly visible, and there's nothing to install or configure.

---

## Build Roadmap

Each session ends with something playable. Don't skip ahead — every session builds on the last.

| Session | What gets built | What's playable at end |
|---------|----------------|------------------------|
| 1 | Foundation | Jay walks around an empty city |
| 2 | Combat basics | Jay fights monkeys with stick sword, eats hamburgers |
| 3 | Hideout & capybara | Find hideout, find & train capybara |
| 4 | Money & shop | Buy weapons and hamburgers from shopkeeper |
| 5 | Weapon variety | All 4 weapon types, multiple elements |
| 6 | Vehicles | Drive cars/motorcycles, use blasters |
| 7 | First boss | Fight Monkey 2.0 |
| 8 | More enemies & bosses | Lizards, Lizard 2.0, Smasher 1.0 |
| 9 | Hideout customization | Trophies, furniture, decorating |
| 10 | Save system | Auto-save + manual save |
| 11 | Audio | Sound effects + music |
| 12 | Intro cutscene | Bave and Dusters opening |
| 13+ | Smashers 2.0, 3.0, of Doom + polish | Full game |

---

## SESSION 1 — Foundation

**Goal:** Jay walks around an empty high-tech city. Camera follows him. He can't walk through buildings.

**Copy and paste this prompt into Claude Code:**

```
I'm building a top-down 2D web browser game called "Fight 101" with my 8-year-old son Jay. We have limited coding experience. We're on a Mac.

Please use plain HTML, CSS, and JavaScript with the Canvas API. NO build tools, NO npm, NO frameworks like React. Just files we can open directly in a browser by double-clicking index.html.

There's a file in this folder called FIGHT_101_PROJECT.md with the full game design. Please read it before starting so you understand where we're heading.

THIS SESSION'S GOAL (Session 1 — Foundation):
By the end of this session I want:
1. An index.html file I can open in my browser
2. A canvas showing a small section of high-tech city (simple colored rectangles for buildings and streets — placeholder art is fine, we'll upgrade later)
3. Jay represented as a simple character (colored shape with a face — placeholder is fine)
4. Arrow keys AND WASD both move Jay around
5. Camera follows Jay as he moves
6. Jay can't walk through buildings (collision detection)
7. The world is bigger than the screen so there's somewhere to explore (at least 3x screen size)

FILE STRUCTURE:
Organize the code into separate files: index.html, style.css, main.js, player.js, world.js. Add comments explaining what each part does — Jay wants to understand the code, not just run it.

CODE STYLE:
- Clear variable names like `playerSpeed` not `ps`
- Comments above each function explaining what it does in plain language
- Use `const` and `let`, no `var`
- Code should be readable by an 8-year-old with help

After you write the code, give me:
1. Exactly what to run (probably "just double-click index.html")
2. A short list of things to try in the game
3. A reminder of what Session 2 will add

Ask me any clarifying questions before starting.
```

**After this session, Jay should be able to:** walk around, see the city, bump into buildings.

**Backup before next session:** `cp -r fight101 fight101-session1-backup`

---

## SESSION 2 — Combat Basics

**Goal:** Jay can fight monkeys with a stick sword. Hamburgers heal him.

**Copy and paste this prompt into Claude Code:**

```
Continuing the Fight 101 project. Read FIGHT_101_PROJECT.md if you haven't already this session.

Session 1 built the foundation — Jay walks around the city. Now we add combat.

THIS SESSION'S GOAL (Session 2 — Combat Basics):
1. Jay starts with a stick sword (his weapon shows visually next to him)
2. Pressing SPACE swings the sword (visual swing animation, even if simple)
3. Monkey enemies spawn around the city — they wander randomly, but if Jay gets close, they chase him
4. When Jay's sword hits a monkey, monkey takes damage. After enough hits, monkey is defeated and disappears
5. When a monkey touches Jay, Jay takes damage
6. Jay has a health bar shown on screen (start at 100 HP)
7. Defeated monkeys sometimes drop hamburgers (about 30% chance)
8. Jay walks over a hamburger to pick it up — it heals him by 25 HP (max 100)
9. If Jay's HP hits 0, show a "Game Over" message and let him restart by pressing R

KEEP IT SIMPLE:
- Monkeys can be brown circles or rectangles with a face
- Sword swing can be a simple arc or rectangle that appears for a moment
- Hamburgers can be brown circles with yellow on top — placeholder is fine
- Spawn maybe 5-10 monkeys around the city to start

CODE ORGANIZATION:
Add new files where it makes sense: enemy.js, combat.js, items.js. Keep player.js, world.js, main.js updated.

Continue using clear variable names and helpful comments.

After you write the code, tell me:
1. How to test it (what keys, what to look for)
2. What Session 3 will add (hideout & capybara)

Ask any clarifying questions first.
```

**After this session, Jay should be able to:** walk around, fight monkeys with SPACE, lose health, eat hamburgers to heal, die and restart.

---

## SESSION 3 — Hideout & Capybara

**Goal:** Jay finds the hideout. Inside, he finds the capybara and can feed it hamburgers to train it.

**Copy and paste this prompt into Claude Code:**

```
Continuing the Fight 101 project. Read FIGHT_101_PROJECT.md if needed.

Sessions 1 and 2 gave us a city and combat. Now we add the hideout and capybara — Jay's home base and sidekick.

THIS SESSION'S GOAL (Session 3 — Hideout & Capybara):
1. Add a special building somewhere in the city — the hideout. Mark it with something obvious (different color, sign, etc.)
2. When Jay walks up to the hideout door and presses E, he enters the hideout (switch to a different scene/area)
3. Inside the hideout: a simple room with a "training area" marker
4. The first time Jay enters the hideout, the capybara is there — show some kind of "You found a capybara!" message
5. After that, the capybara is always at the hideout AND follows Jay outside (flies in a mini jet near him)
6. Pressing F near the capybara feeds it a hamburger (only if Jay has hamburgers in inventory — track hamburger count)
7. The capybara has a level (start at 1) and XP. Each hamburger gives XP. Show the capybara's level somewhere on screen
8. Capybara's behavior:
   - Level 1-4: Just follows Jay, no combat help
   - Level 5+: Shoots small blasters at nearby monkeys
   - Level 10: Has a "mega" attack (bigger blast, lightning effect)
9. Pressing E at the hideout door (when inside) exits back to the city

INVENTORY:
Jay needs to track hamburgers now. When he picks one up, instead of healing immediately, give him a choice: pressing H eats a hamburger to heal, or he saves them for the capybara. Actually — keep it simple: hamburgers go into inventory (max 10), pressing H heals (uses 1), pressing F at capybara feeds (uses 1). Show hamburger count on screen.

Add new files as needed: hideout.js, capybara.js, inventory.js.

After you write the code, tell me:
1. How to find the hideout
2. How to feed and level up the capybara
3. What Session 4 will add (shop and money)

Ask any clarifying questions first.
```

**After this session, Jay should be able to:** find the hideout, meet the capybara, feed it hamburgers, see it level up, have it follow him into the city.

---

## SESSION 4 — Money & Shop

**Goal:** Enemies drop coins. Shopkeeper at hideout sells things.

**Copy and paste this prompt into Claude Code:**

```
Continuing the Fight 101 project. Read FIGHT_101_PROJECT.md if needed.

THIS SESSION'S GOAL (Session 4 — Money & Shop):
1. Defeated monkeys drop coins (always 1-3 coins, plus the existing 30% hamburger chance)
2. Coins display on the ground as small yellow circles. Jay walks over them to pick up
3. Show Jay's coin count on screen
4. Add a shopkeeper character inside the hideout (a simple character behind a counter or table)
5. Pressing E near the shopkeeper opens a shop menu (overlay UI on top of the game)
6. Shop menu lets Jay buy:
   - Hamburger: 5 coins
   - Wood Sword (slightly stronger than stick sword): 20 coins
   - Health upgrade (+25 max HP, applies once): 50 coins
7. Shop menu has clear "Buy" buttons. ESC closes the shop. Use arrow keys or mouse to navigate
8. When Jay buys something, coins are deducted, item is added to inventory or applied
9. If Jay doesn't have enough coins, show a "Not enough coins!" message

KEEP THE UI SIMPLE:
- Shop menu can be a centered box with item names, prices, and buy buttons
- Use simple HTML/CSS overlay or draw on canvas — whichever is easier

Add new files as needed: shop.js, currency.js.

After you write the code, tell me:
1. How to use the shop
2. What Session 5 will add (more weapons and elements)

Ask any clarifying questions first.
```

**After this session, Jay should be able to:** collect coins, visit the shopkeeper, buy hamburgers and a slightly better sword, upgrade his health.

---

## SESSION 5 — Weapon Variety

**Goal:** All 4 weapon types (sword, bow, gun, taser) and multiple element tiers work.

**Copy and paste this prompt into Claude Code:**

```
Continuing the Fight 101 project. Read FIGHT_101_PROJECT.md if needed — especially the Weapon Types and Element Tiers sections.

THIS SESSION'S GOAL (Session 5 — Weapon Variety):
1. Implement all 4 weapon types:
   - SWORD: melee, swing in front of Jay (already exists)
   - BOW: ranged, shoots arrow in the direction Jay is facing
   - GUN: ranged, shoots faster but smaller projectile
   - TASER: short range, stuns enemy for 2 seconds in addition to damage
2. Implement element tiers as upgrades that can apply to any weapon type:
   - Stick/Wood: base damage
   - Arrow: +medium damage, faster projectile (only applies to bow/gun)
   - Water: slows hit enemies for 2 seconds
   - Fire: burns hit enemies (extra damage over 3 seconds)
   - Blue Fire: stronger burn (more damage over 3 seconds)
   - Sound Wave: hits all enemies in a radius around the projectile/swing
   - Mega: lightning effect, biggest damage, looks awesome
3. Jay can hold multiple weapons. Press 1, 2, 3, 4 to switch between sword, bow, gun, taser
4. Show currently equipped weapon on screen with its element
5. Add new weapons to the shop:
   - Wood Bow: 30 coins
   - Basic Gun: 60 coins
   - Basic Taser: 80 coins
   - Fire element upgrade (applies to current weapon): 100 coins
   - Water element upgrade: 100 coins
   - Other elements: priced higher (Blue Fire 200, Sound Wave 300, Mega 1000)

KEEP THE VISUALS SIMPLE:
- Each weapon type can be a different colored rectangle/shape
- Elements can change the projectile color (red for fire, blue for water, etc.)
- Mega = yellow zigzag/lightning bolt look

Add files as needed: weapons.js, projectiles.js, elements.js.

After you write the code, tell me:
1. How to use each weapon
2. How to switch weapons
3. How elements work
4. What Session 6 will add (vehicles)

Ask any clarifying questions first.
```

**After this session, Jay should be able to:** use 4 different weapon types, apply elements, switch weapons mid-fight, see real strategic differences.

---

## SESSION 6 — Vehicles

**Goal:** Jay can get in cars/motorcycles/jets and drive around with blasters.

**Copy and paste this prompt into Claude Code:**

```
Continuing the Fight 101 project. Read FIGHT_101_PROJECT.md — especially the Vehicles section.

THIS SESSION'S GOAL (Session 6 — Vehicles):
1. Place vehicles around the city (parked) — start with a few of each:
   - Tier 1 (basic blaster): high-speed train, underwater jet
   - Tier 2 (medium blaster): car, motorcycle
   - Tier 3 (strongest blaster): jet
2. Press E near a vehicle to get in. Press E again to get out
3. While in a vehicle:
   - Movement is faster than walking (faster for higher tiers)
   - Press SPACE fires the vehicle's blaster (instead of weapon)
   - Blaster damage scales with tier
   - The capybara still follows
4. Vehicles look distinct (different colors/shapes for car vs motorcycle vs jet etc.)
5. Vehicles can take damage from enemies. If destroyed, Jay is ejected and the vehicle is gone (respawns somewhere later)
6. Vehicle health bar shows when Jay is driving

NOTES:
- Don't worry about the underwater jet needing water yet — it can drive on land for now, we'll add water zones later
- Train can just drive on streets like a car for now (later we can add tracks)

Add files as needed: vehicles.js.

After you write the code, tell me:
1. Where to find vehicles
2. How to get in/out
3. How vehicles compare to walking combat
4. What Session 7 will add (first boss!)

Ask any clarifying questions first.
```

---

## SESSION 7 — First Boss: Monkey 2.0

**Goal:** A real boss fight against Monkey 2.0.

**Copy and paste this prompt into Claude Code:**

```
Continuing the Fight 101 project. Read FIGHT_101_PROJECT.md — especially the Bosses section.

THIS SESSION'S GOAL (Session 7 — Monkey 2.0):
1. Add a special location in the city — the Monkey 2.0 boss arena. Mark it clearly (a building with a big monkey symbol, special colored ground, etc.)
2. Walking into the arena triggers the boss fight (lock the area so Jay can't leave until he wins or dies)
3. Monkey 2.0 stats and behaviors:
   - Much bigger than regular monkeys
   - 500 HP (way more than regular monkeys)
   - Moves fast — faster than Jay on foot
   - Throws bananas as projectiles every 2 seconds (curve through the air, deal damage on hit)
   - Every 10 seconds, does a big jump and slams down (area-of-effect damage if Jay is nearby)
   - Calls in 2-3 regular monkeys as backup at 50% HP
4. Boss has a health bar at the top of the screen during the fight
5. When defeated:
   - Drop a big pile of coins (50)
   - Drop a "Monkey 2.0 Trophy" item (just an inventory item for now — Session 9 will let Jay display it)
   - Show a victory message
   - Unlock the way out of the arena
6. If Jay dies, he respawns at the hideout (don't auto-restart the boss — he can come back when ready)

KEEP IT FAIR:
- This is the first boss — challenging but beatable. Jay should probably need a few tries.
- If you find it's too hard or too easy in playtesting, we'll tune it next session.

Add files as needed: bosses.js.

After you write the code, tell me:
1. Where to find Monkey 2.0
2. Strategy tips for the fight
3. What Session 8 will add (lizards and more bosses)

Ask any clarifying questions first.
```

---

## SESSION 8 — Lizards & More Bosses

**Goal:** Add lizard enemies, Lizard 2.0 boss, Smasher 1.0 boss.

**Copy and paste this prompt into Claude Code:**

```
Continuing the Fight 101 project. Read FIGHT_101_PROJECT.md if needed.

THIS SESSION'S GOAL (Session 8 — Lizards & More Bosses):
1. Add lizard enemies to the city — second most common enemy after monkeys
   - Lizards have more HP than monkeys but move slower
   - Lizards spit a small fire projectile (ranged)
   - Drop more coins than monkeys (3-5)
2. Add Lizard 2.0 boss in its own arena:
   - 800 HP
   - Spits big fireballs that leave fire patches on the ground (damage if Jay stands in them)
   - Has tough scales — takes reduced damage from non-fire/blue-fire/mega weapons
   - At 50% HP, becomes enraged and moves faster
   - Drops 75 coins and Lizard 2.0 Trophy
3. Add Smasher 1.0 boss in its own arena:
   - 1200 HP
   - Slow but heavy hitting
   - Swings a giant hammer in front of him (huge damage, but slow windup — Jay can dodge)
   - Occasionally throws the hammer like a boomerang
   - Drops 100 coins and Smasher 1.0 Trophy
4. Show all three boss arenas on a small minimap so Jay knows where to find them

ENEMY VARIETY:
Now monkeys spawn alongside lizards in different parts of the city. Maybe certain zones have more of one or the other.

After you write the code, tell me:
1. Where to find each boss
2. Strategy tips for each
3. What Session 9 will add (hideout customization)

Ask any clarifying questions first.
```

---

## SESSION 9 — Hideout Customization

**Goal:** Jay can decorate his hideout with trophies, awards, and furniture.

**Copy and paste this prompt into Claude Code:**

```
Continuing the Fight 101 project. Read FIGHT_101_PROJECT.md — especially the Hideout section.

THIS SESSION'S GOAL (Session 9 — Hideout Customization):
1. Add a "Decorate Mode" toggle inside the hideout (press T to toggle)
2. In Decorate Mode, Jay can place items he's collected onto the floor or walls of the hideout:
   - Boss trophies (Monkey 2.0, Lizard 2.0, Smasher 1.0 — earned from defeating bosses)
   - Awards (give Jay an award for milestones: "First Hamburger", "10 Monkeys Defeated", "Capybara Level 5", etc.)
   - Furniture (sold at the shop): chair (10 coins), couch (30 coins), TV (50 coins), neon sign (75 coins), arcade cabinet (200 coins)
3. In Decorate Mode, drag/click to place items. Click an placed item to pick it up again
4. Items stay in place across sessions (we'll add real saving in Session 10, but for now keep them in memory)
5. Add an awards system:
   - Track milestones (first kill, first boss, etc.)
   - When earned, pop up a "Award unlocked!" message
   - Awards become decoratable items
6. Expand the hideout slightly so there's room to decorate

After you write the code, tell me:
1. How to enter Decorate Mode
2. What awards exist and how to earn them
3. What Session 10 will add (save system)

Ask any clarifying questions first.
```

---

## SESSION 10 — Save System

**Goal:** Game saves automatically and can be saved manually. Progress survives closing the browser.

**Copy and paste this prompt into Claude Code:**

```
Continuing the Fight 101 project. Read FIGHT_101_PROJECT.md if needed.

THIS SESSION'S GOAL (Session 10 — Save System):
1. Use browser localStorage to save:
   - Jay's position, HP, max HP, coins, inventory
   - Capybara level and XP
   - All weapons owned and currently equipped
   - All bosses defeated
   - All trophies, awards, and furniture owned
   - Hideout decoration positions
2. Auto-save:
   - Every 60 seconds
   - When defeating a boss
   - When buying something at the shop
   - When entering/exiting the hideout
3. Manual save:
   - Add a save point (a glowing object) in the hideout
   - Pressing E at the save point manually saves and shows "Game Saved!" message
   - Add a "Save" option to a pause menu (press ESC for pause menu)
4. Auto-load:
   - When the game starts, if there's a save, load it
   - If no save exists, start a new game
5. Add a "Reset Game" option in the pause menu (with confirmation) to start over

After you write the code, tell me:
1. How saving works
2. How to test it (close browser, reopen, verify progress is there)
3. What Session 11 will add (sound and music)

Ask any clarifying questions first.
```

---

## SESSION 11 — Audio

**Goal:** Sound effects and background music.

**Copy and paste this prompt into Claude Code:**

```
Continuing the Fight 101 project. Read FIGHT_101_PROJECT.md if needed.

THIS SESSION'S GOAL (Session 11 — Audio):
1. Add sound effects (use simple free sounds, or generate placeholder beeps/tones with the Web Audio API):
   - Sword swing
   - Bow/gun/taser fire
   - Hit landed on enemy
   - Jay takes damage
   - Hamburger eaten (heal sound)
   - Coin pickup
   - Boss roar (when boss fight starts)
   - Boss defeated (victory fanfare)
   - Capybara level up
   - Shop purchase
2. Add background music tracks (or generate simple loops with Web Audio API):
   - City exploration theme
   - Hideout theme (calm)
   - Boss fight theme (intense)
3. Music switches automatically based on context (city, hideout, boss arena)
4. Add a volume control to the pause menu (separate sliders for music and SFX, plus a mute toggle)
5. Save volume preferences in localStorage

NOTE FOR SOUND FILES:
If you generate audio with the Web Audio API, that's perfect — keeps everything self-contained. If we need actual audio files, suggest free sources like freesound.org or zapsplat.com so I can download them. Tell me exactly which files to download and where to put them.

After you write the code, tell me:
1. How the audio works
2. Where to put any downloaded sound files (if applicable)
3. What Session 12 will add (intro cutscene)

Ask any clarifying questions first.
```

---

## SESSION 12 — Intro Cutscene

**Goal:** The Bave and Dusters opening — Jay enters the arcade, plays Fight 101, gets pulled in.

**Copy and paste this prompt into Claude Code:**

```
Continuing the Fight 101 project. Read FIGHT_101_PROJECT.md — especially the Story section.

THIS SESSION'S GOAL (Session 12 — Intro Cutscene):
1. Add an intro cutscene that plays before the game starts (only on a brand new game — skipped on subsequent loads):
   - Scene 1: Title card "Fight 101" with the game's logo (simple text styling is fine)
   - Scene 2: "It's Jay's 8th birthday..." text. Show Jay walking into a building labeled "Bave and Dusters"
   - Scene 3: Inside the arcade — show various arcade cabinets, Jay walks up to one labeled "FIGHT 101"
   - Scene 4: Jay presses START on the cabinet. The screen flashes white
   - Scene 5: Jay gets pulled into the screen (Tron-style — show a simple animation, lines/grid effect)
   - Scene 6: Jay lands in the high-tech city. "Welcome to Fight 101!" text appears
   - Then game begins
2. Each scene should auto-advance after a few seconds OR when player presses any key
3. Add a "Skip Cutscene" button (ESC or click)
4. Add the cutscene as a replayable item — pause menu option "Watch Intro Again"

KEEP IT SIMPLE:
- Static scenes with text and simple drawn art are totally fine
- The "pulled in" effect can just be expanding rectangles or lines — doesn't need to be fancy
- This is meant to be charming, not cinematic

After you write the code, tell me:
1. How to test the intro
2. How to skip it
3. What Session 13+ will add (Smasher 2.0, 3.0, of Doom, polish)

Ask any clarifying questions first.
```

---

## SESSION 13+ — Final Bosses & Polish

By now you have a real game. The remaining sessions add the final bosses and polish. Here's the prompt template — adapt for each boss:

**Smasher 2.0:**
```
Continuing Fight 101. Add Smasher 2.0 boss.
- 1800 HP
- All Smasher 1.0 moves but faster
- New move: ground pound that creates shockwaves traveling outward
- Enraged at 50% HP — gains armor, takes reduced damage
- Drops 150 coins and Smasher 2.0 Trophy
- Only accessible after defeating Smasher 1.0
```

**Smasher 3.0:**
```
Continuing Fight 101. Add Smasher 3.0 boss.
- 2500 HP
- All Smasher 2.0 moves
- New move: throws giant boulders
- New move: summons 2 regular Smashers as minions at 25% HP
- Drops 250 coins and Smasher 3.0 Trophy
- Only accessible after defeating Smasher 2.0
```

**Smasher of Doom (Final Boss):**
```
Continuing Fight 101. Add the Smasher of Doom — the FINAL BOSS.
- 5000 HP
- Multi-phase fight:
  - Phase 1 (100-66% HP): Uses moves from all previous bosses
  - Phase 2 (66-33% HP): Faster, summons monkeys and lizards
  - Phase 3 (33-0%): Goes berserk — enraged + summons mini Smashers
- Boss arena is the biggest yet — the center of the city, on top of a tower
- Only accessible after defeating Smasher 3.0 AND owning at least one Mega weapon
- Drops 1000 coins, Smasher of Doom Trophy, and triggers the END GAME cutscene
- After defeat: cutscene shows Jay being released from the game, back at Bave and Dusters. "You won Fight 101!" His parents come pick him up. The end.
- After ending: New Game+ mode unlocks (everything stays, but enemies are tougher)
```

**Polish session ideas (use as needed):**
- Better art (replace placeholder shapes with simple sprites)
- Particle effects for hits/explosions/level-ups
- Mini-map showing the whole city
- Quest log / objectives display
- Settings menu (key rebinding, fullscreen toggle)
- Achievements page in hideout
- Difficulty options
- Mobile/touch support

---

## Troubleshooting Tips

**Game won't open:** Make sure you're double-clicking `index.html`, not a `.js` file. If your browser blocks local files, try Chrome (it's usually most permissive) or run a simple local server with `python3 -m http.server 8000` in the project folder, then open `http://localhost:8000`.

**A session broke things:** Restore from your latest backup folder. Don't try to fix bad code by piling more on — just go back.

**Claude Code is making things too complex:** Tell it directly: "This is too complex for an 8-year-old to understand. Please simplify, even if it means less features." It will adjust.

**Jay wants something not in the roadmap:** Add it! Tell Claude Code: "Jay also wants [thing]. Please add it as part of this session." The roadmap is a guide, not a rule.

**A bug is hard to fix:** Describe exactly what happens vs. what should happen. Have Jay describe it — he's the player. Sometimes the simplest description from a kid is the most useful bug report.

---

## Final Notes

This game is **Jay's**. The roadmap, the design, the prompts — they're scaffolding. If Jay wants to skip ahead to bosses, do it. If he wants to spend three sessions just on the capybara, do it. The goal isn't to ship a game; it's to make something together that he's proud of and that he understands.

Have fun building. 🎮
