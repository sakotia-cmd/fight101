// GameManager.cs — the conductor.
//
// Plays the role of the top of main.js: owns the single Update branch that
// picks "city scene" vs "hideout scene" each frame and dispatches updates.
//
// In U1 there's almost nothing to dispatch yet — just a Singleton skeleton
// so later sessions have a stable place to plug things in. The branch on
// GameState.insideHideout shows the structure but both arms are empty.

using UnityEngine;

public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }

    void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }
        Instance = this;
        DontDestroyOnLoad(gameObject);
    }

    void Update()
    {
        if (GameState.insideHideout)
        {
            // Hideout-scene per-frame logic lands here in U6.
        }
        else
        {
            // City-scene per-frame logic lands here. Most behavior lives on
            // its own MonoBehaviour (Player, Enemy, Boss...) and runs itself,
            // so this branch will mostly orchestrate spawners and timers.
        }
    }
}
