// EnemySpawner.cs — places enemies at random walkable spots.
//
// Mirrors spawnMonkeys() in enemy.js: 10 monkeys at random (x, y), rejecting
// positions that overlap a building. Re-runs on GameRestarted so dying and
// restarting respawns them.

using UnityEngine;

public class EnemySpawner : MonoBehaviour
{
    public GameObject monkeyPrefab;   // assigned by U3Setup
    public GameObject lizardPrefab;   // assigned by U5Setup
    public int monkeyCount = 10;
    public int lizardCount = 8;

    Transform parent;

    void Awake()
    {
        GameEvents.GameRestarted += OnRestart;
    }

    void OnDestroy()
    {
        GameEvents.GameRestarted -= OnRestart;
    }

    void Start()
    {
        // Make sure WorldBuilder finished writing buildings into the physics
        // scene before we OverlapBox-query during spawning.
        Physics2D.SyncTransforms();
        parent = new GameObject("Enemies").transform;
        parent.SetParent(transform, false);
        SpawnAll();
    }

    void OnRestart()
    {
        // Wipe whatever's left and respawn.
        if (parent != null)
        {
            for (int i = parent.childCount - 1; i >= 0; i--)
                Destroy(parent.GetChild(i).gameObject);
        }
        Physics2D.SyncTransforms();
        SpawnAll();
    }

    void SpawnAll()
    {
        if (monkeyPrefab != null)
            for (int i = 0; i < monkeyCount; i++) SpawnMonkey();
        if (lizardPrefab != null)
            for (int i = 0; i < lizardCount; i++) SpawnLizard();
    }

    void SpawnMonkey()
    {
        for (int tries = 0; tries < 40; tries++)
        {
            // JS: x ∈ [100, WORLD_WIDTH-100], y ∈ [100, WORLD_HEIGHT-100]
            float jsX = Random.Range(100f, GameState.WorldWidth  - 100f);
            float jsY = Random.Range(100f, GameState.WorldHeight - 100f);
            Vector2 pos = new Vector2(jsX, -jsY);

            if (!OverlapsBuilding(pos, 28))
            {
                var go = Instantiate(monkeyPrefab, pos, Quaternion.identity, parent);
                go.name = "Monkey";
                return;
            }
        }
    }

    void SpawnLizard()
    {
        for (int tries = 0; tries < 40; tries++)
        {
            // Lizards prefer the bottom half (y from 40% to 95% of world).
            float jsX = Random.Range(100f, GameState.WorldWidth - 100f);
            float jsY = GameState.WorldHeight * 0.4f
                      + Random.Range(0f, GameState.WorldHeight * 0.55f);
            Vector2 pos = new Vector2(jsX, -jsY);

            if (!OverlapsBuilding(pos, 32))
            {
                var go = Instantiate(lizardPrefab, pos, Quaternion.identity, parent);
                go.name = "Lizard";
                return;
            }
        }
    }

    static bool OverlapsBuilding(Vector2 pos, int size)
    {
        var hits = Physics2D.OverlapBoxAll(pos, new Vector2(size, size), 0f);
        foreach (var h in hits)
        {
            if (h != null && h.GetComponent<Building>() != null) return true;
        }
        return false;
    }
}
