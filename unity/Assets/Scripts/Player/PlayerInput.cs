// PlayerInput.cs — wraps Unity's Input checks so the game code reads almost
// the same way as the JS version's keysPressed[...] checks.
//
// Uses the legacy Input class (not the new Input System package) on purpose:
// the new system needs an InputActions asset wired in the Editor, which Jay
// can't read. Input.GetKey(KeyCode.W) reads almost exactly like
// keysPressed["w"].

using UnityEngine;

public static class PlayerInput
{
    // Returns a normalized direction from WASD / arrow keys.
    // Diagonals are normalized so going up-right isn't faster than going right.
    public static Vector2 MoveDirection()
    {
        float x = 0f;
        float y = 0f;

        if (Input.GetKey(KeyCode.W) || Input.GetKey(KeyCode.UpArrow))    y += 1f;
        if (Input.GetKey(KeyCode.S) || Input.GetKey(KeyCode.DownArrow))  y -= 1f;
        if (Input.GetKey(KeyCode.A) || Input.GetKey(KeyCode.LeftArrow))  x -= 1f;
        if (Input.GetKey(KeyCode.D) || Input.GetKey(KeyCode.RightArrow)) x += 1f;

        Vector2 dir = new Vector2(x, y);
        return dir.sqrMagnitude > 1f ? dir.normalized : dir;
    }

    // One-shot key checks used by combat, hideout, shop, restart, etc.
    // Wired in later sessions — listed here so all the input is in one file.
    public static bool AttackPressed()   => Input.GetKeyDown(KeyCode.Space);
    public static bool InteractPressed() => Input.GetKeyDown(KeyCode.E);
    public static bool EatPressed()      => Input.GetKeyDown(KeyCode.H);
    public static bool RestartPressed()  => Input.GetKeyDown(KeyCode.R);
    public static bool Slot1Pressed()    => Input.GetKeyDown(KeyCode.Alpha1);
    public static bool Slot2Pressed()    => Input.GetKeyDown(KeyCode.Alpha2);

    // M = "money cheat" — sets coins to 999999 for testing the shop.
    // Same key as the JS game (see CLAUDE.md cheats section).
    public static bool MoneyCheatPressed() => Input.GetKeyDown(KeyCode.M);
}
