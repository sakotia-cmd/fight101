# Session 4 — Money & Shop

**Goal:** Enemies drop coins. Shopkeeper at hideout sells things.

## What shipped

- Defeated monkeys drop 1–3 coins (alongside 30% hamburger chance)
- Coins are small yellow circles on the ground; walked over to pick up
- Coin total shown in HUD
- Shopkeeper inside hideout; E near him opens the shop overlay
- Shop menu: list of items with prices and stock. Arrow keys navigate, Enter buys, ESC closes
- Initial shop catalog (later expanded):
  - Hamburger — 5 coins
  - Wood Sword (+1 dmg) — 20 coins
  - +25 max HP — 50 coins
- "Not enough coins" feedback if Jay is short

## Files created / modified

| File | Change |
|------|--------|
| `currency.js` | NEW — coin spawn, pickup, total |
| `shop.js` | NEW — shop overlay, item list, buy handler |
| `enemy.js` | spawn coins on kill |

## Key constants

- `shopItems` array in `shop.js` is the source of truth for prices and availability
- Hideout shop trigger uses `tryOpenShop()` from `main.js`'s E handler

## Quirks

- `boughtWoodSword` flag in `inventory.js` adds +1 damage to sword (see `getWeaponDamage` in `weapons.js`)
- Health upgrade applies once — gated by a flag, not by quantity
