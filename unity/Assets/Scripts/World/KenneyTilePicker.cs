// KenneyTilePicker.cs — debug component. When enabled, dumps every tile
// from the Kenney tilesheet into the world at (col*16, -row*16) so we can
// view the whole sheet in-game and pick tile indices by visual inspection.
//
// Toggle the `enabled` flag in U_KenneyPicker.cs setup. Once tile indices
// are picked, this can stay disabled / removed.

using UnityEngine;

public class KenneyTilePicker : MonoBehaviour
{
    public int  cols = 37;
    public int  rows = 28;
    public int  tilePx = 16;
    public int  spacing = 1;   // gap so adjacent tiles are visible

    void Awake()
    {
        var sprites = Resources.LoadAll<Sprite>("");  // empty path
        // Actually we can't Resources.LoadAll without the Resources folder.
        // Load by name from the imported tilesheet (loaded already in editor).
        // We'll receive the sprite array from KenneyTiles helper instead.
        var all = KenneyTiles.All();
        if (all == null || all.Length == 0)
        {
            Debug.LogError("TilePicker: no Kenney tiles found");
            return;
        }

        var parent = new GameObject("TilePickerTiles").transform;
        parent.SetParent(transform, false);

        int n = Mathf.Min(all.Length, cols * rows);
        for (int i = 0; i < n; i++)
        {
            int r = i / cols;
            int c = i % cols;

            var go = new GameObject($"tile_{i:D4}");
            go.transform.SetParent(parent, false);
            go.transform.position = new Vector3(c * (tilePx + spacing),
                                                -r * (tilePx + spacing), 0f);

            var sr = go.AddComponent<SpriteRenderer>();
            sr.sprite = all[i];
            sr.sortingOrder = 0;
        }

        // Label every 10th column / row so we can read indices off-screen.
        for (int c = 0; c < cols; c += 5)
        {
            var label = new GameObject($"label_col_{c}");
            label.transform.SetParent(parent, false);
            label.transform.position = new Vector3(c * (tilePx + spacing) + 2f, tilePx + 4f, 0f);
        }

        Debug.Log($"TilePicker: laid out {n} tiles");
    }
}
