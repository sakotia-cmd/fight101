# Session 6 — Vehicles

**Goal:** Jay can drive cars/motorcycles/jets and fight from inside with vehicle blasters.

## What shipped

- Vehicles parked around the city — tier 1 (train, underwater jet), tier 2 (car, motorcycle), tier 3 (jet)
- E near a vehicle gets in; E again exits
- While driving: faster movement (scales with tier), SPACE fires the vehicle blaster (not the weapon)
- Blaster damage and projectile look scale with tier
- Capybara still follows
- Vehicles take damage; destroyed → Jay ejected, vehicle respawns later
- Vehicle HP bar shown while driving

## Files created / modified

| File | Change |
|------|--------|
| `vehicles.js` | NEW — vehicle list, drive logic, blaster fire, respawn |
| `main.js` | E handling for enter/exit, vehicle update/draw calls |

## Key globals

- `inVehicle` (bool), `currentVehicle` (object reference)
- `vehicles[]` (parked vehicles), `vehicleProjectiles[]`
- `vehicleRespawnQueue` (timer-based respawning)

## Quirks

- The underwater jet drives on land for now (water zones not implemented)
- The train doesn't follow tracks — drives like a car
- `inVehicle` gates many handlers in `main.js` — easy to miss when adding new keybinds
