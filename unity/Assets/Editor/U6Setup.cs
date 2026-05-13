// U6Setup.cs — one-shot Editor utility for U6 Session 1 (hideout
// transitions + interior + shopkeeper relocation).
//
// What it does:
//   1. Opens Boot.unity.
//   2. Removes any prior "Hideout" GameObject and creates a fresh one with
//      a HideoutBuilder component whose `whiteSprite` is wired up.
//      HideoutBuilder.Awake() at runtime builds the interior (floor, walls,
//      training area, exit door) AND the exterior in the city.
//   3. Moves the existing Shopkeeper into the hideout interior. (U5Setup
//      already does this since the U5Setup patch in this same commit, but
//      we run U6Setup AFTER U5Setup so we explicitly re-place it here in
//      case U5Setup is ever bypassed.)
//   4. Saves Boot.unity.
//
// Run from CLI:
//   Unity -batchmode -quit -projectPath unity -executeMethod U6Setup.Run

#if UNITY_EDITOR
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

public static class U6Setup
{
    public static void Run()
    {
        try
        {
            UpdateBootScene();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("U6Setup: done.");
            EditorApplication.Exit(0);
        }
        catch (System.Exception e)
        {
            Debug.LogError($"U6Setup failed: {e}");
            EditorApplication.Exit(1);
        }
    }

    static void UpdateBootScene()
    {
        var scene = EditorSceneManager.OpenScene("Assets/Scenes/Boot.unity",
                                                  OpenSceneMode.Single);

        // Tear down a previous Hideout root, if any. Idempotent re-runs.
        var existing = GameObject.Find("Hideout");
        if (existing != null) Object.DestroyImmediate(existing);

        // Hideout root with HideoutBuilder + the white sprite wired up.
        var hideout = new GameObject("Hideout");
        var builder = hideout.AddComponent<HideoutBuilder>();
        var whiteSprite = AssetDatabase.LoadAssetAtPath<Sprite>(
            "Assets/Sprites/White.png");
        if (whiteSprite == null)
            throw new System.Exception("White.png missing — run U2Setup first.");
        builder.whiteSprite = whiteSprite;

        // Re-place the shopkeeper inside the hideout in case U5Setup wasn't
        // re-run after the U6 coordinate change. Idempotent.
        var keeper = GameObject.Find("Shopkeeper");
        if (keeper != null)
        {
            Vector2 keeperPos =
                GameState.HideoutOrigin + new Vector2(550f, -90f);
            keeper.transform.position =
                new Vector3(keeperPos.x, keeperPos.y, 0f);
        }
        else
        {
            Debug.LogWarning(
                "U6Setup: Shopkeeper missing — run U5Setup first to spawn it.");
        }

        EditorSceneManager.MarkSceneDirty(scene);
        EditorSceneManager.SaveScene(scene);
        Debug.Log("U6Setup: wired Hideout + relocated Shopkeeper");
    }
}
#endif
