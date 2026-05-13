// PlayerHealth.cs — listens for PlayerHurt events, decrements HP, handles
// invincibility frames and game-over transition.
//
// Mirrors damagePlayer() in combat.js: 45 i-frames after each hit, gameOver
// flag flips to true when HP reaches 0.

using UnityEngine;

public class PlayerHealth : MonoBehaviour
{
    public const int InvincibilityFrames = 45;

    int invincibility;

    void Awake()
    {
        GameEvents.PlayerHurt     += OnHurt;
        GameEvents.GameRestarted  += OnRestart;
        OnRestart();   // initialize HP at boot
    }

    void OnDestroy()
    {
        GameEvents.PlayerHurt    -= OnHurt;
        GameEvents.GameRestarted -= OnRestart;
    }

    void Update()
    {
        if (invincibility > 0) invincibility--;
    }

    void OnHurt(int amount)
    {
        if (GameState.gameOver || invincibility > 0) return;
        GameState.playerHP -= amount;
        invincibility = InvincibilityFrames;

        if (GameState.playerHP <= 0)
        {
            GameState.playerHP = 0;
            GameState.gameOver = true;
            GameEvents.RaisePlayerDied();
        }
    }

    void OnRestart()
    {
        GameState.playerHP = GameState.playerMaxHP;
        GameState.gameOver = false;
        invincibility = 0;
    }
}
