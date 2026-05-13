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
using TMPro;
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

        // Root SpriteRenderer satisfies Projectile's [RequireComponent], but
        // we keep it disabled. The visible art lives in the child composite
        // below so the projectile looks like an arrow regardless of weapon.
        var sr = go.AddComponent<SpriteRenderer>();
        sr.sprite = LoadWhite();
        sr.color = Color.white;
        sr.sortingOrder = 180;
        sr.enabled = false;

        // Arrow composite parented to the root so it rotates with the
        // projectile (Projectile.cs rotates the root to face velocity).
        // Local positions/scales are in root local space (root scale 1×1)
        // and then scaled at runtime by `transform.localScale = (size, size, 1)`
        // in Projectile.Init.
        //   Shaft: long thin rect centred on the projectile origin
        //   Head:  small forward-pointing rect (the arrow tip)
        //   Fletch L/R: short slanted rects at the tail
        AddPart(go.transform, "Shaft", new Vector3(0f, 0f, 0f),
                new Vector3(2.6f, 0.40f, 1f), Color.white, 180);
        AddPart(go.transform, "Head", new Vector3(1.5f, 0f, 0f),
                new Vector3(0.80f, 0.70f, 1f), Color.white, 181);
        AddPart(go.transform, "FletchU", new Vector3(-1.30f, 0.25f, 0f),
                new Vector3(0.50f, 0.20f, 1f), Color.white, 181);
        AddPart(go.transform, "FletchD", new Vector3(-1.30f, -0.25f, 0f),
                new Vector3(0.50f, 0.20f, 1f), Color.white, 181);

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
        // Root SR = the golden top-bun mass. Children stack the rest of the
        // layers in normalized local coords (parent scale 18 — set at
        // runtime by Hamburger.cs Awake — multiplies child sizes).
        var sr = go.AddComponent<SpriteRenderer>();
        sr.sprite = LoadWhite();
        sr.color = new Color(0.93f, 0.72f, 0.30f);   // golden top bun
        sr.sortingOrder = 60;

        // Bottom-bun rim — darker stripe at the south edge.
        AddPart(go.transform, "BunBottom", new Vector3(0f, -0.45f, 0f),
                new Vector3(1.0f, 0.12f, 1f),
                new Color(0.78f, 0.55f, 0.18f), 61);

        // Patty — dark-brown stripe.
        AddPart(go.transform, "Patty", new Vector3(0f, -0.18f, 0f),
                new Vector3(0.95f, 0.20f, 1f),
                new Color(0.40f, 0.22f, 0.10f), 62);

        // Lettuce — bright-green thin stripe above patty.
        AddPart(go.transform, "Lettuce", new Vector3(0f, -0.02f, 0f),
                new Vector3(1.0f, 0.10f, 1f),
                new Color(0.40f, 0.75f, 0.30f), 63);

        // Sesame seeds — two small cream squares on top bun, asymmetric.
        Color seed = new Color(0.95f, 0.92f, 0.75f);
        AddPart(go.transform, "Seed1", new Vector3(-0.20f, 0.26f, 0f),
                new Vector3(0.10f, 0.06f, 1f), seed, 64);
        AddPart(go.transform, "Seed2", new Vector3( 0.10f, 0.34f, 0f),
                new Vector3(0.10f, 0.06f, 1f), seed, 64);

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

        // Small sparkle child — Coin.cs fades its alpha in LateUpdate.
        // Sat at top-right of the coin so it twinkles like a highlight.
        AddPart(go.transform, "Sparkle", new Vector3(0.22f, 0.22f, 0f),
                new Vector3(0.22f, 0.22f, 1f),
                new Color(1f, 1f, 1f, 0.9f), 56);

        go.AddComponent<CircleCollider2D>();
        go.AddComponent<Coin>();
        const string path = "Assets/Prefabs/Coin.prefab";
        PrefabUtility.SaveAsPrefabAsset(go, path);
        Object.DestroyImmediate(go);
        Debug.Log($"U4Setup: wrote {path}");
    }

    // Tinted child SpriteRenderer helper, mirrors U3Setup.AddMonkeyPart /
    // U5Setup.AddPart. Local position + scale are in PARENT local space.
    static void AddPart(Transform parent, string name, Vector3 localPos,
                        Vector3 localScale, Color color, int sortingOrder)
    {
        var go = new GameObject(name);
        go.transform.SetParent(parent, false);
        go.transform.localPosition = localPos;
        go.transform.localScale = localScale;
        var sr = go.AddComponent<SpriteRenderer>();
        sr.sprite = LoadWhite();
        sr.color = color;
        sr.sortingOrder = sortingOrder;
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
        var font = LoadTMPFont();

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
        var letter = NewTMPText(iconBg.transform, "Letter", "S",
                                font, 14, TextAlignmentOptions.Center, Color.white);
        FillParent(letter.gameObject);
        hud.weaponIconLetter = letter;

        // Weapon label.
        var label = NewTMPText(panel.transform, "Label", "Wood Sword",
                               font, 14, TextAlignmentOptions.Left, Color.white);
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
            var num = NewTMPText(chip.transform, "n", (i+1).ToString(),
                                 font, 11, TextAlignmentOptions.Center, Color.white);
            FillParent(num.gameObject);
            hud.slotChips[i] = chip.GetComponent<Image>();
        }

        // Top-right counters. Each is an inline icon Image + a TMP number
        // (no leading "$ " or "Burgers " word — the icon carries that).
        var oldInv = canvasGo.transform.Find("InventoryCounters");
        if (oldInv != null) Object.DestroyImmediate(oldInv.gameObject);
        var inv = new GameObject("InventoryCounters", typeof(RectTransform));
        inv.transform.SetParent(canvasGo.transform, false);
        var invRT = inv.GetComponent<RectTransform>();
        invRT.anchorMin = new Vector2(1f, 1f);
        invRT.anchorMax = new Vector2(1f, 1f);
        invRT.pivot     = new Vector2(1f, 1f);
        invRT.anchoredPosition = new Vector2(-15f, -15f);
        invRT.sizeDelta = new Vector2(180f, 50f);

        var whiteUI = LoadWhiteUI();

        // Coin row (top).
        var coinIcon = NewImage(inv.transform, "CoinIcon",
                                new Vector2(-32f, -8f), new Vector2(18f, 18f),
                                new Color(1f, 0.84f, 0f),
                                anchor: new Vector2(1f, 1f),
                                pivot: new Vector2(1f, 1f));
        coinIcon.GetComponent<Image>().sprite = whiteUI;
        var coinT = NewTMPText(inv.transform, "CoinText", "0",
                               font, 16, TextAlignmentOptions.MidlineRight,
                               new Color(1f, 0.84f, 0f));
        var coinRT = coinT.GetComponent<RectTransform>();
        coinRT.anchorMin = new Vector2(1f, 1f);
        coinRT.anchorMax = new Vector2(1f, 1f);
        coinRT.pivot     = new Vector2(1f, 1f);
        coinRT.anchoredPosition = new Vector2(0f, -2f);
        coinRT.sizeDelta = new Vector2(80f, 22f);
        hud.coinText = coinT;

        // Burger row (bottom).
        var burgerIcon = NewImage(inv.transform, "BurgerIcon",
                                  new Vector2(-32f, -30f), new Vector2(18f, 18f),
                                  new Color(0.93f, 0.72f, 0.30f),
                                  anchor: new Vector2(1f, 1f),
                                  pivot: new Vector2(1f, 1f));
        burgerIcon.GetComponent<Image>().sprite = whiteUI;
        var burgerT = NewTMPText(inv.transform, "BurgerText", "0",
                                 font, 14, TextAlignmentOptions.MidlineRight, Color.white);
        var burgerRT = burgerT.GetComponent<RectTransform>();
        burgerRT.anchorMin = new Vector2(1f, 1f);
        burgerRT.anchorMax = new Vector2(1f, 1f);
        burgerRT.pivot     = new Vector2(1f, 1f);
        burgerRT.anchoredPosition = new Vector2(0f, -24f);
        burgerRT.sizeDelta = new Vector2(80f, 20f);
        hud.hamburgerText = burgerT;
    }

    // --- Tiny UGUI helpers ---

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

    static TextMeshProUGUI NewTMPText(Transform parent, string name, string content,
                                      TMP_FontAsset font, int fontSize,
                                      TextAlignmentOptions align, Color color)
    {
        var go = new GameObject(name, typeof(RectTransform), typeof(TextMeshProUGUI));
        go.transform.SetParent(parent, false);
        var t = go.GetComponent<TextMeshProUGUI>();
        t.font = font;
        t.fontSize = fontSize;
        t.alignment = align;
        t.color = color;
        t.text = content;
        t.fontStyle = FontStyles.Bold;
        t.enableWordWrapping = false;
        t.overflowMode = TextOverflowModes.Overflow;
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

    static TMP_FontAsset LoadTMPFont()
    {
        const string path = "Assets/TextMesh Pro/Resources/Fonts & Materials/LiberationSans SDF.asset";
        var f = AssetDatabase.LoadAssetAtPath<TMP_FontAsset>(path);
        if (f == null) throw new System.Exception(
            $"TMP font missing at {path} — run ImportTMP.Run first.");
        return f;
    }

    static Sprite LoadWhiteUI()
    {
        var s = AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Sprites/White.png");
        if (s == null) throw new System.Exception(
            "White.png missing — run U2Setup first.");
        return s;
    }
}
#endif
