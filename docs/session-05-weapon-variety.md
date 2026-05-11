# Session 5 — Weapon Variety

**Goal:** All 4 weapon types + 6 elements that apply to any weapon.

## What shipped

- 4 weapon types in `WEAPON_TYPES`:
  - **Sword** — melee, arc swing
  - **Bow** — slow, big projectile
  - **Gun** — fast, small projectile
  - **Taser** — short melee, stuns target 120 frames
- 6 elements in `ELEMENTS`: wood, water (slow), fire (burn DoT), blueFire (stronger burn), soundWave (AoE), mega (chain lightning)
- Each weapon's element is independently tracked in `playerWeapons[type].element`
- 1/2/3/4 keys switch between owned weapons
- HUD panel shows the equipped weapon's element + name + slot indicators
- Shop sells weapon unlocks and element upgrades (per-weapon)
- Visual: sword colored by element, taser draws an electric arc, projectiles use `elem.projColor`

## Files created / modified

| File | Change |
|------|--------|
| `weapons.js` | NEW — types, elements, switching, attack dispatch, melee + ranged attack |
| `projectiles.js` | NEW — update + draw player projectiles, AoE/burn/etc. on hit |
| `shop.js` | added weapon + element items |
| `main.js` | 1-4 key bindings |

## Key constants

- See [balance.md](balance.md) for full damage / cooldown table
- `applyElementEffect()` in `weapons.js` handles slow/burn/lightning per element

## Quirks

- Sword/taser share `swordCooldownTimer` and `swordSwinging` state from `combat.js` (legacy from Session 2)
- `tryAttack()` is the dispatcher; `trySwingSword()` is a legacy alias still called by main.js's SPACE handler
- Damage formula: `Math.round(wType.baseDamage * elem.mult)` (+1 if `boughtWoodSword`)
