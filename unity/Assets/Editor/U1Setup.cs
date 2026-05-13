// U1Setup.cs — one-shot Editor utility that builds the U1 scene contents.
//
// Why an Editor script and not hand-authored YAML? Prefab/scene YAML has
// dozens of fields with internal fileIDs and class GUIDs that vary between
// Unity versions. Authoring it by hand is brittle. Letting Unity's own
// APIs build the objects is reliable.
//
// Run from CLI:
//   Unity -batchmode -quit -projectPath unity -executeMethod U1Setup.Run
//
// Safe to re-run — it overwrites the Player prefab and rebuilds Boot.unity
// from scratch each time.

#if UNITY_EDITOR
using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.SceneManagement;

public static class U1Setup
{
    public static void Run()
    {
        try
        {
            BuildPlayerPrefab();
            BuildBootScene();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("U1Setup: done.");
            EditorApplication.Exit(0);
        }
        catch (System.Exception e)
        {
            Debug.LogError($"U1Setup failed: {e}");
            EditorApplication.Exit(1);
        }
    }

    static void BuildPlayerPrefab()
    {
        Directory.CreateDirectory("Assets/Prefabs");

        var sprite = AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Sprites/Player.png");
        if (sprite == null) throw new System.Exception("Player sprite not found at Assets/Sprites/Player.png");

        // Build a fresh GameObject with the components we need.
        var go = new GameObject("Player");
        go.transform.position = new Vector3(400f, -400f, 0f);

        var sr = go.AddComponent<SpriteRenderer>();
        sr.sprite = sprite;
        sr.sortingOrder = 100;

        var rb = go.AddComponent<Rigidbody2D>();
        rb.bodyType = RigidbodyType2D.Kinematic;
        rb.gravityScale = 0f;
        rb.interpolation = RigidbodyInterpolation2D.Interpolate;
        rb.collisionDetectionMode = CollisionDetectionMode2D.Continuous;

        var col = go.AddComponent<BoxCollider2D>();
        col.size = new Vector2(GameState.PlayerSize, GameState.PlayerSize);

        go.AddComponent<Player>();

        const string prefabPath = "Assets/Prefabs/Player.prefab";
        PrefabUtility.SaveAsPrefabAsset(go, prefabPath);
        Object.DestroyImmediate(go);

        Debug.Log($"U1Setup: wrote {prefabPath}");
    }

    static void BuildBootScene()
    {
        // Start from a fresh, empty 2D scene so we control every object.
        var scene = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);

        // Main Camera — orthographic, framed on the player's start area,
        // green background so the world has a placeholder ground color.
        var camGo = new GameObject("Main Camera");
        camGo.tag = "MainCamera";
        camGo.transform.position = new Vector3(640f, -360f, -10f);

        var cam = camGo.AddComponent<Camera>();
        cam.orthographic = true;
        cam.orthographicSize = 360f;          // 720px tall canvas at 1 unit / pixel
        cam.clearFlags = CameraClearFlags.SolidColor;
        cam.backgroundColor = new Color(60f/255f, 160f/255f, 70f/255f, 1f);
        cam.nearClipPlane = 0.3f;
        cam.farClipPlane = 1000f;
        camGo.AddComponent<AudioListener>();

        // GameManager — empty GameObject with the singleton MonoBehaviour.
        var gmGo = new GameObject("GameManager");
        gmGo.AddComponent<GameManager>();

        // Player — instantiate from the prefab we just built.
        var prefab = AssetDatabase.LoadAssetAtPath<GameObject>("Assets/Prefabs/Player.prefab");
        if (prefab == null) throw new System.Exception("Player prefab missing");
        PrefabUtility.InstantiatePrefab(prefab, scene);

        EditorSceneManager.SaveScene(scene, "Assets/Scenes/Boot.unity");
        Debug.Log("U1Setup: wrote Assets/Scenes/Boot.unity");
    }
}
#endif
