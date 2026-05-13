// U4Setup.cs — one-shot Editor utility for U4 (bow/gun/taser + elements
// + hamburger/coin pickups + extended HUD).
//
// Builds:
//   - Projectile.prefab (one prefab, color set at runtime)
//   - Hamburger.prefab
//   - Coin.prefab
// Adds to Boot.unity:
//   - "Inventory" GameObject with Inventory MonoBehaviour wired with
//     prefab references
//   - Extra HUD elements: weapon panel (label + slot chips) + coin/burger
//     counters
//   - Inventory ref on the Combat component (for projectile prefab)
//
// For development convenience, this also grants Jay all 4 weapons + every
// element at boot — so we can test the full system. Remove for shipping.
//
// Run: Unity -batchmode -quit -projectPath unity -executeMethod U4Setup.Run

#if UNITY_EDITOR
using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.UI;

public static class U4Setup
{
    public static void Run()
    {
        try
        {
            BuildProjectilePrefab();
            BuildHamburgerPrefab();
            BuildCoinPrefab();
            UpdateBootScene();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("U4Setup: done.");
            EditorApplication.Exit(0);
        }
        catch (System.Exception e)
        {
            Debug.LogError($"U4Setup failed: {e}");
            EditorApplication.Exit(1);
        }
    }

    static Sprite LoadWhite()
    {
        var s = AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Sprites/White.png");
        if (s == null) throw new System.Exception("White sprite missing — run U2Setup first.");
        return s;
    }

    static void BuildProjectilePrefab()
    {
        Directory.CreateDirectory("Assets/Prefabs");
        var go = new GameObject("Projectile");
        go.transform.localScale = Vector3.one;
        var sr = go.AddComponent<SpriteRenderer>();
        sr.sprite = LoadWhite();
        sr.color = Color.white;
        sr.sortingOrder = 180;
        var rb = go.AddComponent<Rigidbody2D>();
        rb.bodyType = RigidbodyType2D.Kinematic;
        rb.gravityScale = 0f;
        rb.useFullKinematicContacts = true;
        var col = go.AddComponent<CircleCollider2D>();
        col.isTrigger = true;
        col.radius = 0.5f;
        go.AddComponent<Projectile>();
        const string path = "Assets/Prefabs/Projectile.prefab";
        PrefabUtility.SaveAsPrefabAsset(go, path);
        Object.DestroyImmediate(go);
        Debug.Log($"U4Setup: wrote {path}");
    }

    static void BuildHamburgerPrefab()
    {
        var go = new GameObject("Hamburger");
        var sr = go.AddComponent<SpriteRenderer>();
        sr.sprite = LoadWhite();
        sr.color = new Color(0.91f, 0.66f, 0.19f);
        sr.sortingOrder = 60;
        go.AddComponent<CircleCollider2D>();
        go.AddComponent<Hamburger>();
        const string path = "Assets/Prefabs/Hamburger.prefab";
        PrefabUtility.SaveAsPrefabAsset(go, path);
        Object.DestroyImmediate(go);
        Debug.Log($"U4Setup: wrote {path}");
    }

    static void BuildCoinPrefab()
    {
        var go = new GameObject("Coin");
        var sr = go.AddComponent<SpriteRenderer>();
        sr.sprite = LoadWhite();
        sr.color = new Color(1f, 0.84f, 0f);   // gold
        sr.sortingOrder = 55;
        go.AddComponent<CircleCollider2D>();
        go.AddComponent<Coin>();
        const string path = "Assets/Prefabs/Coin.prefab";
        PrefabUtility.SaveAsPrefabAsset(go, path);
        Object.DestroyImmediate(go);
        Debug.Log($"U4Setup: wrote {path}");
    }

    static void UpdateBootScene()
    {
        var scene = EditorSceneManager.OpenScene("Assets/Scenes/Boot.unity",
                                                  OpenSceneMode.Single);

        // Inventory GameObject — singleton. Pre-populate ownedWeapons + a
        // few elements per weapon so we have something to test with.
        var existing = GameObject.Find("Inventory");
        if (existing != null) Object.DestroyImmediate(existing);
        var inv = new GameObject("Inventory");
        var invComp = inv.AddComponent<Inventory>();
        invComp.coinPrefab      = AssetDatabase.LoadAssetAtPath<GameObject>("Assets/Prefabs/Coin.prefab");
        invComp.hamburgerPrefab = AssetDatabase.LoadAssetAtPath<GameObject>("Assets/Prefabs/Hamburger.prefab");
        invComp.ownedWeapons = new[] { true, true, true, true };  // dev: all unlocked
        invComp.equippedElement = new[]
        {
            ElementKind.Wood,
            ElementKind.Fire,    // bow shoots fire arrows by default
            ElementKind.Water,   // gun shoots water for slow effect
            ElementKind.Mega,    // taser stuns + chain lightning
        };

        // Wire projectile prefab into Combat on the Player prefab.
        var playerPrefabPath = "Assets/Prefabs/Player.prefab";
        var contents = PrefabUtility.LoadPrefabContents(playerPrefabPath);
        try
        {
            var combat = contents.GetComponent<Combat>();
            if (combat == null) combat = contents.AddComponent<Combat>();
            combat.projectilePrefab = AssetDatabase.LoadAssetAtPath<GameObject>(
                "Assets/Prefabs/Projectile.prefab");
            PrefabUtility.SaveAsPrefabAsset(contents, playerPrefabPath);
        }
        finally
        {
            PrefabUtility.UnloadPrefabContents(contents);
        }

        // HUD additions: weapon panel + counters.
        UpdateHUD();

        EditorSceneManager.MarkSceneDirty(scene);
        EditorSceneManager.SaveScene(scene);
        Debug.Log("U4Setup: wired Inventory + Combat prefab refs + HUD additions.");
    }

    static void UpdateHUD()
    {
        var canvasGo = GameObject.Find("HUDCanvas");
        if (canvasGo == null)
        {
            Debug.LogWarning("U4Setup: HUDCanvas missing — skipping HUD additions.");
            return;
        }
        var hud = canvasGo.GetComponent<HUD>();
        if (hud == null) hud = canvasGo.AddComponent<HUD>();
        var font = LoadFont();

        // Remove any prior weapon panel so this is idempotent.
        var oldPanel = canvasGo.transform.Find("WeaponPanel");
        if (oldPanel != null) Object.DestroyImmediate(oldPanel.gameObject);

        // Bottom-left weapon panel.
        var panel = NewImage(canvasGo.transform, "WeaponPanel",
                             new Vector2(15f, 15f), new Vector2(280f, 30f),
                             new Color(0f, 0f, 0f, 0.55f),
                             anchor: new Vector2(0f, 0f));   // anchor bottom-left

        // Element-colored icon box on the left of the panel.
        var iconBg = NewImage(panel.transform, "IconBg",
                              new Vector2(5f, 0f), new Vector2(20f, 20f),
                              Color.white, anchor: new Vector2(0f, 0.5f),
                              pivot: new Vector2(0f, 0.5f));
        hud.weaponIconBg = iconBg.GetComponent<Image>();
        var letter = NewText(iconBg.transform, "Letter", "S",
                             font, 14, TextAnchor.MiddleCenter, Color.white);
        FillParent(letter.gameObject);
        hud.weaponIconLetter = letter;

        // Weapon label.
        var label = NewText(panel.transform, "Label", "Wood Sword",
                            font, 14, TextAnchor.MiddleLeft, Color.white);
        var labelRT = label.GetComponent<RectTransform>();
        labelRT.anchorMin = new Vector2(0f, 0f);
        labelRT.anchorMax = new Vector2(1f, 1f);
        labelRT.offsetMin = new Vector2(35f, 0f);
        labelRT.offsetMax = new Vector2(-90f, 0f);
        hud.weaponLabel = label;

        // 4 slot chips.
        hud.slotChips = new Image[4];
        for (int i = 0; i < 4; i++)
        {
            var chip = NewImage(panel.transform, $"Slot{i+1}",
                                new Vector2(-80f + i * 16f, 0f),
                                new Vector2(13f, 18f),
                                new Color(0.4f, 0.4f, 0.4f),
                                anchor: new Vector2(1f, 0.5f),
                                pivot: new Vector2(1f, 0.5f));
            var num = NewText(chip.transform, "n", (i+1).ToString(),
                              font, 11, TextAnchor.MiddleCenter, Color.white);
            FillParent(num.gameObject);
            hud.slotChips[i] = chip.GetComponent<Image>();
        }

        // Top-right counters.
        var oldInv = canvasGo.transform.Find("InventoryCounters");
        if (oldInv != null) Object.DestroyImmediate(oldInv.gameObject);
        var inv = new GameObject("InventoryCounters", typeof(RectTransform));
        inv.transform.SetParent(canvasGo.transform, false);
        var invRT = inv.GetComponent<RectTransform>();
        invRT.anchorMin = new Vector2(1f, 1f);
        invRT.anchorMax = new Vector2(1f, 1f);
        invRT.pivot     = new Vector2(1f, 1f);
        invRT.anchoredPosition = new Vector2(-15f, -15f);
        invRT.sizeDelta = new Vector2(180f, 40f);

        var coinT = NewText(inv.transform, "CoinText", "$ 0",
                            font, 16, TextAnchor.UpperRight, new Color(1f, 0.84f, 0f));
        var coinRT = coinT.GetComponent<RectTransform>();
        coinRT.anchorMin = new Vector2(0f, 0.5f);
        coinRT.anchorMax = new Vector2(1f, 1f);
        coinRT.offsetMin = Vector2.zero;
        coinRT.offsetMax = Vector2.zero;
        hud.coinText = coinT;

        var burgerT = NewText(inv.transform, "BurgerText", "Burgers 0",
                              font, 14, TextAnchor.UpperRight, Color.white);
        var burgerRT = burgerT.GetComponent<RectTransform>();
        burgerRT.anchorMin = new Vector2(0f, 0f);
        burgerRT.anchorMax = new Vector2(1f, 0.5f);
        burgerRT.offsetMin = Vector2.zero;
        burgerRT.offsetMax = Vector2.zero;
        hud.hamburgerText = burgerT;
    }

    // --- Tiny UGUI helpers (copies of the ones in U3Setup) ---

    static GameObject NewImage(Transform parent, string name, Vector2 anchoredPos,
                               Vector2 size, Color color,
                               Vector2 anchor, Vector2? pivot = null)
    {
        var go = new GameObject(name, typeof(RectTransform), typeof(Image));
        go.transform.SetParent(parent, false);
        var img = go.GetComponent<Image>();
        img.color = color;
        var rt = go.GetComponent<RectTransform>();
        rt.anchorMin = anchor;
        rt.anchorMax = anchor;
        rt.pivot     = pivot ?? anchor;
        rt.anchoredPosition = anchoredPos;
        rt.sizeDelta = size;
        return go;
    }

    static Text NewText(Transform parent, string name, string content,
                        Font font, int fontSize, TextAnchor align, Color color)
    {
        var go = new GameObject(name, typeof(RectTransform), typeof(Text));
        go.transform.SetParent(parent, false);
        var t = go.GetComponent<Text>();
        t.font = font;
        t.fontSize = fontSize;
        t.alignment = align;
        t.color = color;
        t.text = content;
        t.fontStyle = FontStyle.Bold;
        return t;
    }

    static void FillParent(GameObject go)
    {
        var rt = go.GetComponent<RectTransform>();
        rt.anchorMin = Vector2.zero;
        rt.anchorMax = Vector2.one;
        rt.offsetMin = Vector2.zero;
        rt.offsetMax = Vector2.zero;
    }

    static Font LoadFont()
    {
        var f = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
        if (f != null) return f;
        return Resources.GetBuiltinResource<Font>("Arial.ttf");
    }
}
#endif
