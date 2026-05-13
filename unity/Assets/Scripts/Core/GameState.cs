// GameState.cs — the "globals" file.
//
// In the original JS game every file just shared top-level let/const globals
// (player, playerHP, insideHideout, etc.). We keep that same mental model
// here: GameState is one static class anyone can read or write.
//
// Coordinate notes:
//   - 1 Unity unit = 1 JS pixel (we set sprite Pixels Per Unit = 1).
//   - JS Canvas Y goes DOWN (Y=0 at top). Unity world Y goes UP.
//     When porting positions from the JS files (boss arenas, vehicle spawns,
//     etc.) we negate Y so the same numbers describe the same place.
//   - JS speeds are "pixels per frame" assuming 60 fps. In Unity we use
//     Time.deltaTime, so a JS speed of N becomes N * 60 units/second.

using UnityEngine;

public static class GameState
{
    // ---- Player ----
    public const int PlayerSize = 36;           // matches PLAYER_SIZE in player.js
    public const float PlayerSpeed = 240f;      // 4 px/frame * 60 fps in player.js

    public static int playerHP = 100;
    public static int playerMaxHP = 100;
    // Dev cheat: 500 starting coins so the shop is testable without grinding.
    // Remove (set back to 0) before sharing the build.
    public static int playerCoins = 500;
    public static int totalKills = 0;

    // ---- World ----
    public const int WorldWidth = 4800;         // matches WORLD_WIDTH in world.js
    public const int WorldHeight = 4800;

    // ---- Hideout ----
    // The hideout is a 700×500 interior room placed at off-world coords so we
    // can keep one Unity scene and teleport the player between it and the
    // city. The constants below mirror hideout.js's 700×500 interior.
    public const int HideoutWidth  = 700;
    public const int HideoutHeight = 500;
    public static readonly Vector2 HideoutOrigin =
        new Vector2(10000f, -10000f);   // top-left corner in world space

    // City door — south edge of the reserved hideout zone at JS (3900, 3000,
    // 400, 450); Y-flipped to Unity that's centred at (4100, -3375).
    public static readonly Vector2 HideoutExteriorDoor =
        new Vector2(4100f, -3375f);

    // Interior teleport targets.
    public static readonly Vector2 HideoutInteriorStart =
        HideoutOrigin + new Vector2(350f, -100f);    // near the top, centred
    public static readonly Vector2 HideoutInteriorExit =
        HideoutOrigin + new Vector2(350f, -440f);    // just above the exit door

    // ---- Scene mode flags ----
    public static bool insideHideout = false;
    public static bool decorateMode = false;
    public static bool gameOver = false;

    // True while any modal overlay (shop, hideout decorate menu, etc.)
    // is capturing input. Player and Combat skip their Update when set.
    public static bool InputGated => (Shop.Instance != null && Shop.Instance.isOpen);

    // Resets the transient state on game-over restart.
    // Mirrors restartGame() in combat.js. Persisted state (inventory, awards,
    // coins, owned weapons/elements, capybara, shop one-time flags) is left
    // alone, matching the JS behavior. Sessions U2+ extend this.
    public static void ResetTransient()
    {
        playerHP = playerMaxHP;
        gameOver = false;
        // Dying inside the hideout returns the player to the city on
        // restart — otherwise R would respawn them in the hideout interior
        // (off-world coords) which is disorienting.
        insideHideout = false;
        decorateMode  = false;
    }
}
