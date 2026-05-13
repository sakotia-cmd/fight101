// U_KenneySetup.cs — wires Kenney sprites into the scene and (optionally)
// switches the world to debug "tile picker" mode for index identification.
//
// Run modes:
//   Unity ... -executeMethod U_KenneySetup.RunTilePicker
//   Unity ... -executeMethod U_KenneySetup.RunDisablePicker

#if UNITY_EDITOR
using System.Collections.Generic;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

public static class U_KenneySetup
{
    const string TilesheetPath = "Assets/Sprites/Kenney/Tilemap/tilemap_packed.png";

    public static void RunTilePicker() => Run(pickerMode: true);
    public static void RunDisablePicker() => Run(pickerMode: false);

    static void Run(bool pickerMode)
    {
        try
        {
            var sprites = LoadAllSprites();
            UpdateBootScene(sprites, pickerMode);
            AssetDatabase.SaveAssets();
            Debug.Log($"U_KenneySetup: done (pickerMode={pickerMode}, sprites={sprites.Length}).");
            EditorApplication.Exit(0);
        }
        catch (System.Exception e)
        {
            Debug.LogError($"U_KenneySetup failed: {e}");
            EditorApplication.Exit(1);
        }
    }

    static Sprite[] LoadAllSprites()
    {
        var subAssets = AssetDatabase.LoadAllAssetsAtPath(TilesheetPath);
        var list = new List<Sprite>(1100);
        foreach (var a in subAssets) if (a is Sprite s) list.Add(s);

        // Sub-asset order isn't guaranteed; sort by the trailing index in
        // the name (tile_0000, tile_0001, ...).
        list.Sort((a, b) =>
        {
            int.TryParse(a.name.Substring("tile_".Length), out int ia);
            int.TryParse(b.name.Substring("tile_".Length), out int ib);
            return ia.CompareTo(ib);
        });

        return list.ToArray();
    }

    static void UpdateBootScene(Sprite[] sprites, bool pickerMode)
    {
        var scene = EditorSceneManager.OpenScene("Assets/Scenes/Boot.unity", OpenSceneMode.Single);

        // Find or create the KenneyTiles holder.
        var holder = GameObject.Find("KenneyTiles");
        if (holder == null) holder = new GameObject("KenneyTiles");
        var kt = holder.GetComponent<KenneyTiles>();
        if (kt == null) kt = holder.AddComponent<KenneyTiles>();
        kt.sprites = sprites;

        // Tile picker is a debug component on a separate GO. In normal mode
        // we make sure it doesn't exist; the World GameObject builds the
        // real city. In picker mode we disable the World and spawn a
        // KenneyTilePicker that lays out every tile in world space.
        var world = GameObject.Find("World");
        var picker = GameObject.Find("KenneyTilePicker");

        if (pickerMode)
        {
            if (world != null) world.SetActive(false);
            if (picker == null) picker = new GameObject("KenneyTilePicker");
            if (picker.GetComponent<KenneyTilePicker>() == null)
                picker.AddComponent<KenneyTilePicker>();

            // Move camera near origin so tiles are visible.
            var cam = Camera.main;
            if (cam != null)
            {
                cam.transform.position = new Vector3(300f, -250f, -10f);
                cam.orthographicSize = 280f;
            }
            // Also disable CameraFollow so it doesn't snap back to the player.
            if (cam != null)
            {
                var follow = cam.GetComponent<CameraFollow>();
                if (follow != null) follow.enabled = false;
            }
        }
        else
        {
            if (world != null)
            {
                world.SetActive(true);
                EditorUtility.SetDirty(world);
            }
            if (picker != null) Object.DestroyImmediate(picker);
            var cam = Camera.main;
            if (cam != null)
            {
                var follow = cam.GetComponent<CameraFollow>();
                if (follow != null) follow.enabled = true;
            }
        }

        EditorSceneManager.MarkSceneDirty(scene);
        EditorSceneManager.SaveScene(scene);
    }
}
#endif
