// HideoutDoor.cs — proximity-triggered E handler. Attached to two doors:
//   1. The yellow rect at the south edge of the hideout exterior (city).
//      `isExit = false` — pressing E teleports Jay INTO the hideout.
//   2. The yellow rect at the south edge of the hideout interior.
//      `isExit = true` — pressing E teleports Jay BACK to the city.
//
// Distance-based, mirrors the JS toggleHideout() trigger in hideout.js.

using UnityEngine;

public class HideoutDoor : MonoBehaviour
{
    public bool isExit = false;
    public float interactRange = 60f;

    void Update()
    {
        var player = Player.Instance;
        if (player == null) return;
        if (GameState.gameOver) return;
        // Don't double-fire while the shop overlay (or any future modal) is up.
        if (GameState.InputGated) return;

        // Only act when player is on the matching "side" of the door — an
        // exit door only reacts when the player is inside the hideout, and
        // vice versa. Avoids the entry trigger firing when the player happens
        // to be at the hideout-coord region during teleport.
        if (isExit != GameState.insideHideout) return;

        float dist = Vector2.Distance(player.transform.position, transform.position);
        if (dist > interactRange) return;

        if (!PlayerInput.InteractPressed()) return;

        if (isExit)
        {
            // Leaving the hideout — back to the city, just north of the
            // hideout building's exterior door.
            GameState.insideHideout = false;
            player.transform.position = (Vector3)(
                GameState.HideoutExteriorDoor + new Vector2(0f, 30f));
        }
        else
        {
            // Entering the hideout — drop the player at the interior start.
            GameState.insideHideout = true;
            player.transform.position = (Vector3)GameState.HideoutInteriorStart;
        }
    }
}
