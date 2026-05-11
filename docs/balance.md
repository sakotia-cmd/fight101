# Balance & Tuning Notes

Values as of post-Session 9 + boss intros. Tune in the files listed.

## Player (combat.js)

| Stat | Value |
|------|-------|
| Starting HP / Max HP | 100 / 100 |
| Invincibility frames after hit | 45 (~0.75s) |
| Damage flash duration | 20 frames |
| Hamburger heal | 25 HP |

## Weapons (weapons.js)

| Weapon | Base damage | Cooldown (frames) | Range / Speed |
|--------|-------------|--------------------|---------------|
| Sword | 5 | 18 | 42 range, 0.9π arc |
| Bow | 4 | 30 | speed 6, life 60 |
| Gun | 3 | 12 | speed 9, life 40 |
| Taser | 6 | 40 | 50 range, 0.6π arc, 120-frame stun |

**Element multipliers:** wood 1.0 / water 1.2 (slow 120f) / fire 1.3 (burn 180f, 0.3 dot) / blueFire 1.5 (burn 180f, 0.7 dot) / soundWave 1.4 (80px AoE) / mega 2.0 (chain lightning).

**Tuning history:** Base damages were bumped from 1–2 to 3–6 after Jay found bosses took 1 damage per hit even with max upgrades. Enemy HP was bumped to compensate (see below).

## Enemies (enemy.js)

| Enemy | HP | Speed | Notes |
|-------|----|----|-------|
| Monkey | 8 | varies | Most common, melee only |
| Lizard | 15 | slower than monkey | Spits fire (range 180, cooldown 150) |

Counts: `MONKEY_COUNT = 10`, `LIZARD_COUNT = 8`.

**Tuning history:** Monkey HP was 3, bumped to 8 after weapon damage buff. Lizard HP was 6, bumped to 15.

## Bosses (bosses.js)

| Boss | HP | Notes |
|------|----|-------|
| Monkey 2.0 | 500 | Bananas, slam attack, calls reinforcements at 50% |
| Lizard 2.0 | 800 | Fireballs leave fire patches. **50% damage reduction from non-fire/blueFire/mega.** Enraged at 50% HP (faster, 3-spread fireballs, summons 2 lizards) |
| Smasher 1.0 | 1200 | Hammer swing (30-frame windup, 25 dmg), boomerang hammer (18 dmg, returns) |

Drops: 50 / 75 / 100 coins respectively. Each drops a trophy decoration.

## Economy (shop.js)

Typical prices (full list lives in `shopItems` array):
- Hamburger: 5 coins
- Wood Sword (+1 dmg): 20
- Basic Bow / Gun / Taser: 30 / 60 / 80
- +25 max HP: 50
- Fire / Water element upgrade: 100
- Blue Fire: 200, Sound Wave: 300, Mega: 1000
- Furniture: chair 10 / plant 15 / rug 25 / couch 30 / TV 50 / neon 75 / arcade 200

**Cheat:** Press M to set coins to 9999 (added so Jay can test weapons).
