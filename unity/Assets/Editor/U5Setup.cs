// U5Setup.cs — one-shot Editor utility for U5 (lizard + shop).
//
// Builds:
//   - Lizard.prefab + FireSpit.prefab
//   - Shopkeeper GameObject in Boot.unity (city placement near the player
//     spawn — moves to the hideout in U6)
//   - Shop GameObject (holds Shop component for purchases)
//   - Shop UI overlay panel inside HUDCanvas
// Also:
//   - Removes the U4 dev cheat — only the sword is owned at boot
//   - Wires EnemySpawner.lizardPrefab + Lizard.fireSpitPrefab
//
// Run: Unity -batchmode -quit -projectPath unity -executeMethod U5Setup.Run

#if UNITY_EDITOR
using System.IO;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.UI;

public static class U5Setup
{
    public static void Run()
    {
        try
        {
            BuildLizardPrefab();
            BuildFireSpitPrefab();
            UpdateBootScene();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("U5Setup: done.");
            EditorApplication.Exit(0);
        }
        catch (System.Exception e)
        {
            Debug.LogError($"U5Setup failed: {e}");
            EditorApplication.Exit(1);
        }
    }

    static Sprite LoadWhite()
    {
        var s = AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Sprites/White.png");
        if (s == null) throw new System.Exception("White sprite missing.");
        return s;
    }

    static void BuildLizardPrefab()
    {
        Directory.CreateDirectory("Assets/Prefabs");
        var go = new GameObject("Lizard");
        go.transform.localScale = new Vector3(32f, 32f, 1f);

        Color bodyGreen     = new Color(0.30f, 0.55f, 0.28f);
        Color belly         = new Color(0.50f, 0.70f, 0.40f);
        Color spikeDark     = new Color(0.18f, 0.36f, 0.18f);
        Color eyeYellow     = new Color(1f, 0.85f, 0.10f);

        var body = go.AddComponent<SpriteRenderer>();
        body.sprite = LoadWhite();
        body.color = bodyGreen;
        body.sortingOrder = 50;

        // Tail (long thin extension north of the body — behind so the body
        // visually overlaps its base).
        AddPart(go.transform, "Tail", new Vector3(0f, 0.55f, 0f),
                new Vector3(0.14f, 0.40f, 1f), bodyGreen, 49);
        AddPart(go.transform, "TailTip", new Vector3(0f, 0.78f, 0f),
                new Vector3(0.08f, 0.18f, 1f), bodyGreen, 49);

        // Back spikes — 3 small darker triangles along the east side of the
        // body. (Body is "facing south" since snout is at Y=-0.20.)
        AddPart(go.transform, "SpikeN", new Vector3(0.40f, 0.22f, 0f),
                new Vector3(0.12f, 0.10f, 1f), spikeDark, 51);
        AddPart(go.transform, "SpikeM", new Vector3(0.45f, 0.00f, 0f),
                new Vector3(0.12f, 0.10f, 1f), spikeDark, 51);
        AddPart(go.transform, "SpikeS", new Vector3(0.40f, -0.20f, 0f),
                new Vector3(0.12f, 0.10f, 1f), spikeDark, 51);

        // Snout — wider base + narrower tip to fake a tapered point.
        AddPart(go.transform, "Snout", new Vector3(0f, -0.22f, 0f),
                new Vector3(0.55f, 0.30f, 1f), belly, 52);
        AddPart(go.transform, "SnoutTip", new Vector3(0f, -0.42f, 0f),
                new Vector3(0.30f, 0.20f, 1f), belly, 52);

        // Eye whites (yellow), with small black pupils on top.
        AddPart(go.transform, "EyeWhiteL", new Vector3(-0.18f, 0.12f, 0f),
                new Vector3(0.18f, 0.18f, 1f), eyeYellow, 53);
        AddPart(go.transform, "EyeWhiteR", new Vector3( 0.18f, 0.12f, 0f),
                new Vector3(0.18f, 0.18f, 1f), eyeYellow, 53);
        AddPart(go.transform, "PupilL", new Vector3(-0.16f, 0.10f, 0f),
                new Vector3(0.07f, 0.07f, 1f), Color.black, 54);
        AddPart(go.transform, "PupilR", new Vector3( 0.16f, 0.10f, 0f),
                new Vector3(0.07f, 0.07f, 1f), Color.black, 54);

        var rb = go.AddComponent<Rigidbody2D>();
        rb.bodyType = RigidbodyType2D.Kinematic;
        rb.gravityScale = 0f;
        rb.useFullKinematicContacts = true;

        var col = go.AddComponent<BoxCollider2D>();
        col.isTrigger = true;
        col.size = Vector2.one;

        go.AddComponent<Lizard>();

        const string path = "Assets/Prefabs/Lizard.prefab";
        PrefabUtility.SaveAsPrefabAsset(go, path);
        Object.DestroyImmediate(go);
        Debug.Log($"U5Setup: wrote {path}");
    }

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

    static void BuildFireSpitPrefab()
    {
        var go = new GameObject("FireSpit");
        go.transform.localScale = Vector3.one;

        var sr = go.AddComponent<SpriteRenderer>();
        sr.sprite = LoadWhite();
        sr.color = new Color(1f, 0.4f, 0.15f);
        sr.sortingOrder = 170;

        var rb = go.AddComponent<Rigidbody2D>();
        rb.bodyType = RigidbodyType2D.Kinematic;
        rb.gravityScale = 0f;
        rb.useFullKinematicContacts = true;

        var col = go.AddComponent<CircleCollider2D>();
        col.isTrigger = true;
        col.radius = 0.5f;

        go.AddComponent<EnemyProjectile>();

        const string path = "Assets/Prefabs/FireSpit.prefab";
        PrefabUtility.SaveAsPrefabAsset(go, path);
        Object.DestroyImmediate(go);
        Debug.Log($"U5Setup: wrote {path}");
    }

    static void UpdateBootScene()
    {
        var scene = EditorSceneManager.OpenScene("Assets/Scenes/Boot.unity", OpenSceneMode.Single);

        // Wire EnemySpawner.lizardPrefab + Lizard.fireSpitPrefab.
        var world = GameObject.Find("World");
        if (world == null) throw new System.Exception("World GameObject missing.");
        var spawner = world.GetComponent<EnemySpawner>();
        if (spawner == null) spawner = world.AddComponent<EnemySpawner>();
        spawner.lizardPrefab = AssetDatabase.LoadAssetAtPath<GameObject>("Assets/Prefabs/Lizard.prefab");

        // The Lizard prefab's fireSpitPrefab field has to be set on the prefab
        // itself (it's a per-instance reference shared across all spawns).
        var lizardPath = "Assets/Prefabs/Lizard.prefab";
        var contents = PrefabUtility.LoadPrefabContents(lizardPath);
        try
        {
            var liz = contents.GetComponent<Lizard>();
            liz.fireSpitPrefab = AssetDatabase.LoadAssetAtPath<GameObject>("Assets/Prefabs/FireSpit.prefab");
            PrefabUtility.SaveAsPrefabAsset(contents, lizardPath);
        }
        finally { PrefabUtility.UnloadPrefabContents(contents); }

        // Remove the U4 dev cheat: only the sword is unlocked at boot.
        var inv = GameObject.Find("Inventory");
        if (inv != null)
        {
            var ic = inv.GetComponent<Inventory>();
            ic.ownedWeapons     = new[] { true, false, false, false };
            ic.equippedElement  = new[] { ElementKind.Wood, ElementKind.Wood,
                                          ElementKind.Wood, ElementKind.Wood };
            ic.ownedElements    = new[] { true, false, false, false, false, false };
            ic.equipped         = WeaponKind.Sword;
        }

        // Shop GameObject (holds Shop component).
        var shop = GameObject.Find("Shop");
        if (shop != null) Object.DestroyImmediate(shop);
        shop = new GameObject("Shop");
        shop.AddComponent<Shop>();

        // Shopkeeper GameObject placed in the city near the player spawn.
        // The JS shopkeeper sits inside the hideout (U6); for U5 we put it
        // in the city so the shop is testable now.
        var keeper = GameObject.Find("Shopkeeper");
        if (keeper != null) Object.DestroyImmediate(keeper);
        keeper = new GameObject("Shopkeeper");
        // (200, -250) — just up-and-right of the player spawn at (400, -400).
        keeper.transform.position = new Vector3(200f, -250f, 0f);

        var sr = keeper.AddComponent<SpriteRenderer>();
        sr.sprite = AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Sprites/White.png");
        sr.color = new Color(0.47f, 0.27f, 0.67f);   // purple robe
        sr.sortingOrder = 60;
        keeper.transform.localScale = new Vector3(30f, 30f, 1f);

        keeper.AddComponent<Shopkeeper>();

        // Build the shop overlay inside HUDCanvas.
        BuildShopUI();

        EditorSceneManager.MarkSceneDirty(scene);
        EditorSceneManager.SaveScene(scene);
        Debug.Log("U5Setup: wired shop + shopkeeper + spawner.");
    }

    static void BuildShopUI()
    {
        var canvasGo = GameObject.Find("HUDCanvas");
        if (canvasGo == null) { Debug.LogWarning("HUDCanvas missing"); return; }

        var old = canvasGo.transform.Find("ShopPanel");
        if (old != null) Object.DestroyImmediate(old.gameObject);

        var font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf")
                ?? Resources.GetBuiltinResource<Font>("Arial.ttf");

        // Dark overlay covering the whole screen.
        var panel = new GameObject("ShopPanel",
            typeof(RectTransform), typeof(Image));
        panel.transform.SetParent(canvasGo.transform, false);
        var panelRT = panel.GetComponent<RectTransform>();
        panelRT.anchorMin = Vector2.zero;
        panelRT.anchorMax = Vector2.one;
        panelRT.offsetMin = Vector2.zero;
        panelRT.offsetMax = Vector2.zero;
        panel.GetComponent<Image>().color = new Color(0f, 0f, 0f, 0.6f);

        // Centered shop card.
        var card = new GameObject("Card", typeof(RectTransform), typeof(Image));
        card.transform.SetParent(panel.transform, false);
        var cardRT = card.GetComponent<RectTransform>();
        cardRT.anchorMin = new Vector2(0.5f, 0.5f);
        cardRT.anchorMax = new Vector2(0.5f, 0.5f);
        cardRT.pivot = new Vector2(0.5f, 0.5f);
        cardRT.sizeDelta = new Vector2(400f, 520f);
        card.GetComponent<Image>().color = new Color(0.16f, 0.13f, 0.25f, 1f);

        // Title.
        var title = NewText(card.transform, "Title", "SHOP", font, 22,
                            TextAnchor.UpperCenter, new Color(1f, 0.84f, 0f));
        var titleRT = title.GetComponent<RectTransform>();
        titleRT.anchorMin = new Vector2(0f, 1f);
        titleRT.anchorMax = new Vector2(1f, 1f);
        titleRT.pivot     = new Vector2(0.5f, 1f);
        titleRT.anchoredPosition = new Vector2(0f, -12f);
        titleRT.sizeDelta = new Vector2(0f, 30f);

        var coinLine = NewText(card.transform, "CoinLine", "Your coins: 0",
                               font, 14, TextAnchor.UpperCenter,
                               new Color(1f, 0.84f, 0f));
        var coinRT = coinLine.GetComponent<RectTransform>();
        coinRT.anchorMin = new Vector2(0f, 1f);
        coinRT.anchorMax = new Vector2(1f, 1f);
        coinRT.pivot     = new Vector2(0.5f, 1f);
        coinRT.anchoredPosition = new Vector2(0f, -42f);
        coinRT.sizeDelta = new Vector2(0f, 20f);

        // List container.
        var list = new GameObject("List", typeof(RectTransform));
        list.transform.SetParent(card.transform, false);
        var listRT = list.GetComponent<RectTransform>();
        listRT.anchorMin = new Vector2(0f, 1f);
        listRT.anchorMax = new Vector2(1f, 1f);
        listRT.pivot     = new Vector2(0.5f, 1f);
        listRT.anchoredPosition = new Vector2(0f, -70f);
        listRT.sizeDelta = new Vector2(-20f, 410f);

        // Message text near bottom.
        var msg = NewText(card.transform, "Message", "", font, 14,
                          TextAnchor.LowerCenter, Color.white);
        var msgRT = msg.GetComponent<RectTransform>();
        msgRT.anchorMin = new Vector2(0f, 0f);
        msgRT.anchorMax = new Vector2(1f, 0f);
        msgRT.pivot     = new Vector2(0.5f, 0f);
        msgRT.anchoredPosition = new Vector2(0f, 30f);
        msgRT.sizeDelta = new Vector2(0f, 20f);

        // Hint line.
        var hint = NewText(card.transform, "Hint",
                           "UP/DOWN: select | ENTER: buy | ESC: close",
                           font, 11, TextAnchor.LowerCenter,
                           new Color(0.4f, 0.4f, 0.55f));
        var hintRT = hint.GetComponent<RectTransform>();
        hintRT.anchorMin = new Vector2(0f, 0f);
        hintRT.anchorMax = new Vector2(1f, 0f);
        hintRT.pivot     = new Vector2(0.5f, 0f);
        hintRT.anchoredPosition = new Vector2(0f, 8f);
        hintRT.sizeDelta = new Vector2(0f, 16f);

        var shopUI = canvasGo.GetComponent<ShopUI>();
        if (shopUI == null) shopUI = canvasGo.AddComponent<ShopUI>();
        shopUI.panel       = panel;
        shopUI.title       = title;
        shopUI.coinLine    = coinLine;
        shopUI.listParent  = listRT;
        shopUI.messageText = msg;
        shopUI.font        = font;
        panel.SetActive(false);
    }

    static Text NewText(Transform parent, string name, string content,
                        Font font, int sz, TextAnchor align, Color color)
    {
        var go = new GameObject(name, typeof(RectTransform), typeof(Text));
        go.transform.SetParent(parent, false);
        var t = go.GetComponent<Text>();
        t.font = font;
        t.fontSize = sz;
        t.alignment = align;
        t.color = color;
        t.text = content;
        t.fontStyle = FontStyle.Bold;
        return t;
    }
}
#endif
