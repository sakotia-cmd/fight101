// KenneyImport.cs — one-shot Editor utility that configures Kenney's
// "Roguelike Modern City" tilesheet for use in the game.
//
// Sets up Assets/Sprites/Kenney/Tilemap/tilemap_packed.png as:
//   - TextureType = Sprite (Multiple)
//   - Pixels Per Unit = 1   (so each 16x16 tile occupies 16 world units —
//                            matches our JS-coords-as-unity-units convention)
//   - Filter = Point        (crisp pixel art)
//   - 37 cols × 28 rows of 16×16 tiles, no padding
//
// Named slices: tile_0000 … tile_1035 (row-major top-down).
//
// Run from CLI:
//   Unity -batchmode -quit -projectPath unity -executeMethod KenneyImport.Run

#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;

public static class KenneyImport
{
    const string TilesheetPath = "Assets/Sprites/Kenney/Tilemap/tilemap_packed.png";
    const int    TileSize      = 16;
    const int    Cols          = 37;
    const int    Rows          = 28;

    public static void Run()
    {
        try
        {
            ConfigureTilesheet();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("KenneyImport: done.");
            EditorApplication.Exit(0);
        }
        catch (System.Exception e)
        {
            Debug.LogError($"KenneyImport failed: {e}");
            EditorApplication.Exit(1);
        }
    }

    static void ConfigureTilesheet()
    {
        var importer = (TextureImporter)AssetImporter.GetAtPath(TilesheetPath);
        if (importer == null) throw new System.Exception($"missing {TilesheetPath}");

        importer.textureType = TextureImporterType.Sprite;
        importer.spriteImportMode = SpriteImportMode.Multiple;
        importer.spritePixelsPerUnit = 1f;       // 1 px = 1 world unit
        importer.filterMode = FilterMode.Point;
        importer.textureCompression = TextureImporterCompression.Uncompressed;
        importer.mipmapEnabled = false;

        var settings = new TextureImporterSettings();
        importer.ReadTextureSettings(settings);
        settings.spriteMeshType = SpriteMeshType.FullRect;
        settings.spriteAlignment = (int)SpriteAlignment.BottomLeft;
        importer.SetTextureSettings(settings);

        // Build the spritesheet (one entry per 16x16 tile). Unity wants
        // bottom-left origin coords, so we flip Y when computing rect.
        var sheet = new SpriteMetaData[Cols * Rows];
        int sheetH = Rows * TileSize;
        for (int r = 0; r < Rows; r++)
        {
            for (int c = 0; c < Cols; c++)
            {
                int idx = r * Cols + c;
                sheet[idx] = new SpriteMetaData
                {
                    name = $"tile_{idx:D4}",
                    rect = new Rect(
                        c * TileSize,
                        sheetH - (r + 1) * TileSize,
                        TileSize, TileSize),
                    alignment = (int)SpriteAlignment.BottomLeft,
                    pivot = new Vector2(0f, 0f),
                };
            }
        }

#pragma warning disable CS0618
        importer.spritesheet = sheet;
#pragma warning restore CS0618
        importer.SaveAndReimport();
        Debug.Log($"KenneyImport: sliced {sheet.Length} sprites in {TilesheetPath}");
    }
}
#endif
