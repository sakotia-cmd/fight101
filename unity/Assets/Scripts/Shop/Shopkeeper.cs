// Shopkeeper.cs — NPC standing somewhere in the world. When the player is
// within InteractRange and presses E, opens the shop.
//
// The JS game's shopkeeper lives inside the hideout (U6). For U5 we place
// the keeper in the city near the player's spawn so the shop is reachable
// without the hideout. U6 will move the keeper into the hideout scene and
// gate access on `insideHideout`.

using UnityEngine;

public class Shopkeeper : MonoBehaviour
{
    public float interactRange = 80f;

    void Update()
    {
        var player = Player.Instance;
        var shop   = Shop.Instance;
        if (player == null || shop == null) return;
        if (shop.isOpen) return;
        if (GameState.gameOver) return;

        float dist = Vector2.Distance(player.transform.position, transform.position);
        if (dist < interactRange && PlayerInput.InteractPressed())
        {
            shop.Open();
        }
    }
}
