// U3Setup.cs — one-shot Editor utility for U3.
//
// Builds Monkey.prefab, adds a Sword child + Combat + PlayerHealth to the
// Player prefab, attaches an EnemySpawner to the World, and creates the
// HUD canvas (health bar + game-over panel) in Boot.unity.
//
// Run from CLI:
//   Unity -batchmode -quit -projectPath unity -executeMethod U3Setup.Run

#if UNITY_EDITOR
using System.IO;
using TMPro;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.UI;

public static class U3Setup
{
    public static void Run()
    {
        try
        {
            BuildMonkeyPrefab();
            UpgradePlayerPrefab();
            UpdateBootScene();
            AssetDatabase.SaveAssets();
            AssetDatabase.Refresh();
            Debug.Log("U3Setup: done.");
            EditorApplication.Exit(0);
        }
        catch (System.Exception e)
        {
            Debug.LogError($"U3Setup failed: {e}");
            EditorApplication.Exit(1);
        }
    }

    static Sprite LoadWhite()
    {
        var s = AssetDatabase.LoadAssetAtPath<Sprite>("Assets/Sprites/White.png");
        if (s == null) throw new System.Exception("Assets/Sprites/White.png is missing or not a Sprite (run U2Setup first).");
        return s;
    }

    static void BuildMonkeyPrefab()
    {
        Directory.CreateDirectory("Assets/Prefabs");

        var go = new GameObject("Monkey");
        go.transform.localScale = new Vector3(28f, 28f, 1f);

        // Main body — brown square. SpriteRenderer is on the root so
        // Enemy.cs's flash-on-hit/depth-sort logic finds it.
        var body = go.AddComponent<SpriteRenderer>();
        body.sprite = LoadWhite();
        body.color = new Color(0.55f, 0.36f, 0.20f);   // monkey brown
        body.sortingOrder = 50;

        Color earColor  = new Color(0.42f, 0.27f, 0.14f);   // dark brown
        Color tailColor = new Color(0.38f, 0.24f, 0.12f);   // darker brown
        Color seedWhite = Color.white;
        Color mouthCol  = new Color(0.20f, 0.10f, 0.05f);

        // Tail — long thin dark-brown rect south of the body, behind the
        // root (sortingOrder 49 < body 50) so the body appears to overlap
        // its base. Local positions/scales are in parent's local space;
        // parent scale 28 means local 0.10 = 2.8 world units.
        AddMonkeyPart(go.transform, "Tail", new Vector3(0.10f, -0.55f, 0f),
                      new Vector3(0.10f, 0.45f, 1f), tailColor, 49);

        // Two ears.
        AddMonkeyPart(go.transform, "EarL", new Vector3(-0.42f, 0.42f, 0f),
                      new Vector3(0.30f, 0.30f, 1f), earColor, 51);
        AddMonkeyPart(go.transform, "EarR", new Vector3( 0.42f, 0.42f, 0f),
                      new Vector3(0.30f, 0.30f, 1f), earColor, 51);

        // Muzzle — lighter patch around the lower face.
        AddMonkeyPart(go.transform, "Muzzle", new Vector3(0f, -0.18f, 0f),
                      new Vector3(0.55f, 0.32f, 1f),
                      new Color(0.78f, 0.62f, 0.46f), 52);

        // Eye whites — bigger white circles behind the black pupils so
        // the face reads as a proper face, not just dots on brown.
        AddMonkeyPart(go.transform, "EyeWhiteL", new Vector3(-0.18f, 0.10f, 0f),
                      new Vector3(0.22f, 0.22f, 1f), seedWhite, 52);
        AddMonkeyPart(go.transform, "EyeWhiteR", new Vector3( 0.18f, 0.10f, 0f),
                      new Vector3(0.22f, 0.22f, 1f), seedWhite, 52);

        // Eyes — small black pupils on top of the whites.
        AddMonkeyPart(go.transform, "EyeL", new Vector3(-0.18f, 0.10f, 0f),
                      new Vector3(0.10f, 0.10f, 1f), Color.black, 53);
        AddMonkeyPart(go.transform, "EyeR", new Vector3( 0.18f, 0.10f, 0f),
                      new Vector3(0.10f, 0.10f, 1f), Color.black, 53);

        // Mouth — short dark grin below the muzzle.
        AddMonkeyPart(go.transform, "Mouth", new Vector3(0f, -0.30f, 0f),
                      new Vector3(0.20f, 0.05f, 1f), mouthCol, 53);

        var rb = go.AddComponent<Rigidbody2D>();
        rb.bodyType = RigidbodyType2D.Kinematic;
        rb.gravityScale = 0f;
        rb.useFullKinematicContacts = true;

        var col = go.AddComponent<BoxCollider2D>();
        col.isTrigger = true;
        col.size = new Vector2(1f, 1f);

        go.AddComponent<Monkey>();

        const string path = "Assets/Prefabs/Monkey.prefab";
        PrefabUtility.SaveAsPrefabAsset(go, path);
        Object.DestroyImmediate(go);
        Debug.Log($"U3Setup: wrote {path}");
    }

    static void AddMonkeyPart(Transform parent, string name, Vector3 localPos,
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

    static void UpgradePlayerPrefab()
    {
        const string path = "Assets/Prefabs/Player.prefab";
        var prefab = AssetDatabase.LoadAssetAtPath<GameObject>(path);
        if (prefab == null) throw new System.Exception("Player prefab missing — run U1Setup first.");

        // Open the prefab for editing.
        var contents = PrefabUtility.LoadPrefabContents(path);
        try
        {
            // Add (or find) PlayerHealth component on the root.
            if (contents.GetComponent<PlayerHealth>() == null)
                contents.AddComponent<PlayerHealth>();

            // Add Combat on the root.
            var combat = contents.GetComponent<Combat>();
            if (combat == null) combat = contents.AddComponent<Combat>();

            // Remove any prior Sword child so this is idempotent.
            var existing = contents.transform.Find("Sword");
            if (existing != null) Object.DestroyImmediate(existing.gameObject);

            // Build the Sword pivot (rotates around player center) and three
            // child SpriteRenderers that compose the sword silhouette:
            //   Grip → Crossguard → Blade  along the +X axis so the whole
            // sword "orbits" the player as the Sword pivot rotates.
            var sword = new GameObject("Sword");
            sword.transform.SetParent(contents.transform, false);
            sword.transform.localPosition = Vector3.zero;
            var swordComp = sword.AddComponent<Sword>();
            swordComp.combat = combat;

            // Grip (innermost) — brown short stub
            var grip = new GameObject("Grip");
            grip.transform.SetParent(sword.transform, false);
            grip.transform.localPosition = new Vector3(8f, 0f, 0f);
            grip.transform.localScale = new Vector3(8f, 4f, 1f);
            var gripSr = grip.AddComponent<SpriteRenderer>();
            gripSr.sprite = LoadWhite();
            gripSr.color = new Color(0.45f, 0.28f, 0.15f);   // wood-brown grip
            gripSr.sortingOrder = 200;
            gripSr.enabled = false;

            // Crossguard — short perpendicular dark-gray rect
            var cg = new GameObject("Crossguard");
            cg.transform.SetParent(sword.transform, false);
            cg.transform.localPosition = new Vector3(14f, 0f, 0f);
            cg.transform.localScale = new Vector3(4f, 12f, 1f);
            var cgSr = cg.AddComponent<SpriteRenderer>();
            cgSr.sprite = LoadWhite();
            cgSr.color = new Color(0.30f, 0.30f, 0.32f);     // dark-gray steel
            cgSr.sortingOrder = 201;
            cgSr.enabled = false;

            // Blade — long silver rect extending outward.
            var blade = new GameObject("Blade");
            blade.transform.SetParent(sword.transform, false);
            blade.transform.localPosition = new Vector3(30f, 0f, 0f);
            blade.transform.localScale = new Vector3(28f, 4f, 1f);
            var bladeSr = blade.AddComponent<SpriteRenderer>();
            bladeSr.sprite = LoadWhite();
            bladeSr.color = new Color(0.88f, 0.88f, 0.93f);  // silver
            bladeSr.sortingOrder = 202;
            bladeSr.enabled = false;

            // Trail emitter at the blade tip — traces the swing arc.
            // Disabled until Show() is called; colour set per-element by
            // Sword.cs each swing.
            var trailGo = new GameObject("Trail");
            trailGo.transform.SetParent(sword.transform, false);
            trailGo.transform.localPosition = new Vector3(44f, 0f, 0f);
            var trail = trailGo.AddComponent<TrailRenderer>();
            trail.time = 0.18f;
            trail.startWidth = 8f;
            trail.endWidth = 0f;
            trail.minVertexDistance = 0.3f;
            trail.numCornerVertices = 2;
            trail.numCapVertices = 2;
            trail.material = new Material(Shader.Find("Sprites/Default"));
            trail.startColor = Color.white;
            trail.endColor = new Color(1f, 1f, 1f, 0f);
            trail.sortingOrder = 199;
            trail.emitting = false;
            trail.enabled = false;

            swordComp.blade = bladeSr;
            swordComp.grip = gripSr;
            swordComp.crossguard = cgSr;
            swordComp.trail = trail;

            // Wire the Combat → Sword link.
            combat.sword = swordComp;

            PrefabUtility.SaveAsPrefabAsset(contents, path);
            Debug.Log($"U3Setup: upgraded {path}");
        }
        finally
        {
            PrefabUtility.UnloadPrefabContents(contents);
        }
    }

    static void UpdateBootScene()
    {
        var scene = EditorSceneManager.OpenScene("Assets/Scenes/Boot.unity",
                                                  OpenSceneMode.Single);

        // EnemySpawner — sits on the existing World GameObject.
        var world = GameObject.Find("World");
        if (world == null) throw new System.Exception("World GameObject missing — run U2Setup first.");
        var spawner = world.GetComponent<EnemySpawner>();
        if (spawner == null) spawner = world.AddComponent<EnemySpawner>();
        spawner.monkeyPrefab = AssetDatabase.LoadAssetAtPath<GameObject>("Assets/Prefabs/Monkey.prefab");

        // Tear down a prior HUD and build a fresh one.
        var oldHud = GameObject.Find("HUDCanvas");
        if (oldHud != null) Object.DestroyImmediate(oldHud);
        BuildHUD();

        EditorSceneManager.MarkSceneDirty(scene);
        EditorSceneManager.SaveScene(scene);
        Debug.Log("U3Setup: rebuilt HUD + spawner in Boot.unity");
    }

    static void BuildHUD()
    {
        // Canvas (screen-space overlay).
        var canvasGo = new GameObject("HUDCanvas",
            typeof(Canvas), typeof(CanvasScaler), typeof(GraphicRaycaster));
        var canvas = canvasGo.GetComponent<Canvas>();
        canvas.renderMode = RenderMode.ScreenSpaceOverlay;
        canvas.sortingOrder = 1000;
        var scaler = canvasGo.GetComponent<CanvasScaler>();
        scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
        scaler.referenceResolution = new Vector2(1280f, 720f);
        scaler.matchWidthOrHeight = 0.5f;

        var hud = canvasGo.AddComponent<HUD>();

        // Health bar background.
        var bg = NewImage(canvasGo.transform, "HealthBg", new Vector2(15f, -45f),
                          new Vector2(200f, 20f),
                          new Color(0.2f, 0.2f, 0.2f, 0.95f),
                          anchorTopLeft: true);

        // Health fill (left-aligned inside the bg, filled image).
        var fillGo = NewImage(bg.transform, "HealthFill", Vector2.zero,
                              new Vector2(200f, 20f),
                              new Color(0f, 0.8f, 0.27f),
                              anchorTopLeft: false);
        var fillImg = fillGo.GetComponent<Image>();
        fillImg.type = Image.Type.Filled;
        fillImg.fillMethod = Image.FillMethod.Horizontal;
        fillImg.fillOrigin = (int)Image.OriginHorizontal.Left;
        fillImg.fillAmount = 1f;
        var fillRT = fillGo.GetComponent<RectTransform>();
        fillRT.anchorMin = new Vector2(0f, 0f);
        fillRT.anchorMax = new Vector2(1f, 1f);
        fillRT.offsetMin = Vector2.zero;
        fillRT.offsetMax = Vector2.zero;

        hud.healthFill = fillImg;

        // HP text overlay — TMP for crisp signed-distance-field text.
        var font = LoadTMPFont();
        var hpText = NewTMPText(bg.transform, "HealthText", "100 / 100", font, 12,
                                TextAlignmentOptions.Center, Color.white);
        var hpRT = hpText.gameObject.GetComponent<RectTransform>();
        hpRT.anchorMin = new Vector2(0f, 0f);
        hpRT.anchorMax = new Vector2(1f, 1f);
        hpRT.offsetMin = Vector2.zero;
        hpRT.offsetMax = Vector2.zero;
        hud.healthText = hpText;

        // Game-over panel (initially hidden).
        var panel = NewImage(canvasGo.transform, "GameOverPanel", Vector2.zero,
                             new Vector2(1280f, 720f),
                             new Color(0f, 0f, 0f, 0.7f),
                             anchorTopLeft: false);
        var panelRT = panel.GetComponent<RectTransform>();
        panelRT.anchorMin = Vector2.zero;
        panelRT.anchorMax = Vector2.one;
        panelRT.offsetMin = Vector2.zero;
        panelRT.offsetMax = Vector2.zero;

        var goText = NewTMPText(panel.transform, "GameOverText", "GAME OVER",
                                font, 64, TextAlignmentOptions.Center,
                                new Color(1f, 0.13f, 0.13f));
        var goTextRT = goText.gameObject.GetComponent<RectTransform>();
        goTextRT.anchorMin = new Vector2(0.5f, 0.5f);
        goTextRT.anchorMax = new Vector2(0.5f, 0.5f);
        goTextRT.anchoredPosition = new Vector2(0f, 30f);
        goTextRT.sizeDelta = new Vector2(800f, 100f);

        var hintText = NewTMPText(panel.transform, "RestartHint", "Press R to try again",
                                  font, 24, TextAlignmentOptions.Center, Color.white);
        var hintRT = hintText.gameObject.GetComponent<RectTransform>();
        hintRT.anchorMin = new Vector2(0.5f, 0.5f);
        hintRT.anchorMax = new Vector2(0.5f, 0.5f);
        hintRT.anchoredPosition = new Vector2(0f, -50f);
        hintRT.sizeDelta = new Vector2(800f, 40f);

        panel.SetActive(false);
        hud.gameOverPanel = panel;

        // Make sure there's an EventSystem so the UI can receive events
        // (not strictly needed for a non-interactive HUD, but Unity warns
        // about it).
        if (Object.FindObjectOfType<UnityEngine.EventSystems.EventSystem>() == null)
        {
            new GameObject("EventSystem",
                typeof(UnityEngine.EventSystems.EventSystem),
                typeof(UnityEngine.EventSystems.StandaloneInputModule));
        }
    }

    static GameObject NewImage(Transform parent, string name, Vector2 anchoredPos,
                               Vector2 size, Color color, bool anchorTopLeft)
    {
        var go = new GameObject(name, typeof(RectTransform), typeof(Image));
        go.transform.SetParent(parent, false);
        var img = go.GetComponent<Image>();
        img.color = color;
        var rt = go.GetComponent<RectTransform>();
        if (anchorTopLeft)
        {
            rt.anchorMin = new Vector2(0f, 1f);
            rt.anchorMax = new Vector2(0f, 1f);
            rt.pivot     = new Vector2(0f, 1f);
        }
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

    static TMP_FontAsset LoadTMPFont()
    {
        const string path = "Assets/TextMesh Pro/Resources/Fonts & Materials/LiberationSans SDF.asset";
        var f = AssetDatabase.LoadAssetAtPath<TMP_FontAsset>(path);
        if (f == null) throw new System.Exception(
            $"TMP font missing at {path} — run ImportTMP.Run first.");
        return f;
    }
}
#endif
