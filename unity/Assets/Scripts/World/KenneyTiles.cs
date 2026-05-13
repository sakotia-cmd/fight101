// KenneyTiles.cs — helper that loads all 1036 sprites from the Kenney
// tilesheet so other code can index them as `KenneyTiles.Tile(index)`.
//
// The sprites live inside Assets/Sprites/Kenney/Tilemap/tilemap_packed.png
// (sliced by KenneyImport.cs). To make them loadable at runtime we use a
// Resources lookup — but the file isn't under Resources/, so we cache a
// public reference from an Inspector field at boot.

using UnityEngine;

public class KenneyTiles : MonoBehaviour
{
    // Assigned by U_KenneySetup.cs at editor time. Indexed 0..1035 in the
    // same order as KenneyImport's sheet (row-major, top-down).
    public Sprite[] sprites;

    static KenneyTiles instance;

    void Awake() { instance = this; }

    static KenneyTiles Get()
    {
        // Awake order between components in the same scene is not
        // deterministic, so WorldBuilder.Awake may run before our own
        // Awake. Lazy-find on first access. FindObjectOfType works as
        // long as the KenneyTiles GameObject exists in the scene (which
        // U_KenneySetup guarantees).
        if (instance == null)
        {
            instance = Object.FindFirstObjectByType<KenneyTiles>();
        }
        return instance;
    }

    public static Sprite Tile(int index)
    {
        var t = Get();
        if (t == null || t.sprites == null) return null;
        if (index < 0 || index >= t.sprites.Length) return null;
        return t.sprites[index];
    }

    public static Sprite[] All() => Get()?.sprites;

    public const int Cols = 37;
    public const int Rows = 28;

    public static int Index(int col, int row) => row * Cols + col;
}
