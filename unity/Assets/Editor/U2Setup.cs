// U2Setup.cs — one-shot Editor utility for U2 (world + camera follow).
//
// What it does:
//   1. Configures Assets/Sprites/White.png as a Sprite (PPU=1, Point filter)
//      so WorldBuilder can use it to tint flat-colored quads at runtime.
//   2. Opens Boot.unity.
//   3. Removes any prior "World" GameObject and creates a fresh one with
//      a WorldBuilder component whose `whiteSprite` is wired up.
//   4. Adds a CameraFollow component to Main Camera and assigns the Player
//      from the scene as its target.
//   5. Saves the scene.
//
// Run from CLI:
//   Unity -batchmode -quit -projectPath unity -executeMethod U2Setup.Run

#if UNITY_EDITOR
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

public static class U2Setup
{
    public static void Run()
    {
        try
        {
            ConfigureWhiteSprite();
            UpdateBootScene();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("U2Setup: done.");
            EditorApplication.Exit(0);
        }
        catch (System.Exception e)
        {
            Debug.LogError($"U2Setup failed: {e}");
            EditorApplication.Exit(1);
        }
    }

    static void ConfigureWhiteSprite()
    {
        const string path = "Assets/Sprites/White.png";
        var importer = (TextureImporter)AssetImporter.GetAtPath(path);
        if (importer == null) throw new System.Exception($"missing {path}");

        importer.textureType = TextureImporterType.Sprite;
        importer.spritePixelsPerUnit = 1f;
        importer.filterMode = FilterMode.Point;
        importer.textureCompression = TextureImporterCompression.Uncompressed;
        importer.mipmapEnabled = false;

        var settings = new TextureImporterSettings();
        importer.ReadTextureSettings(settings);
        settings.spriteMeshType = SpriteMeshType.FullRect;
        settings.spritePivot = new Vector2(0.5f, 0.5f);
        settings.spriteAlignment = (int)SpriteAlignment.Center;
        importer.SetTextureSettings(settings);

        importer.SaveAndReimport();
        Debug.Log($"U2Setup: configured {path}");
    }

    static void UpdateBootScene()
    {
        var scene = EditorSceneManager.OpenScene("Assets/Scenes/Boot.unity",
                                                  OpenSceneMode.Single);

        // Tear down a previous World, if any. Idempotent re-runs.
        var existing = GameObject.Find("World");
        if (existing != null) Object.DestroyImmediate(existing);

        // World root with WorldBuilder + the white sprite wired up.
        var world = new GameObject("World");
        var builder = world.AddComponent<WorldBuilder>();
        var whiteSprite = AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Sprites/White.png");
        if (whiteSprite == null) throw new System.Exception("White sprite not found after import");
        builder.whiteSprite = whiteSprite;

        // Wire CameraFollow on Main Camera, targeting the Player instance.
        var cam = Camera.main;
        if (cam == null) throw new System.Exception("Main Camera not found in Boot.unity");
        var follow = cam.GetComponent<CameraFollow>();
        if (follow == null) follow = cam.gameObject.AddComponent<CameraFollow>();

        var player = GameObject.Find("Player");
        if (player == null) throw new System.Exception("Player not found in Boot.unity");
        follow.target = player.transform;

        EditorSceneManager.MarkSceneDirty(scene);
        EditorSceneManager.SaveScene(scene);
        Debug.Log("U2Setup: rebuilt Boot.unity with World + CameraFollow");
    }
}
#endif
