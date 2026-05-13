// HideoutBuilder.cs — spawns the hideout interior + the hideout exterior
// building in the city. Mirrors drawHideoutInterior() / drawHideoutExterior()
// from hideout.js.
//
// The interior lives at GameState.HideoutOrigin (off-world, far from the
// 4800×4800 city) so we can keep one Unity scene and teleport the player
// between city and hideout via HideoutDoor.cs.

using TMPro;
using UnityEngine;

public class HideoutBuilder : MonoBehaviour
{
    public Sprite whiteSprite;   // wired by U6Setup

    // --- Visual constants (mirror hideout.js) ---
    static readonly Color FloorColor    = new Color(0.10f, 0.10f, 0.18f);  // #1a1a2e
    static readonly Color WallColor     = new Color(1f, 0.67f, 0f);        // #ffaa00
    static readonly Color TrainingGreen = new Color(0f, 0.80f, 0.40f);     // #00cc66
    static readonly Color ExitYellow    = new Color(0.95f, 0.78f, 0.20f);
    static readonly Color ExteriorRoof  = new Color(0.16f, 0.12f, 0.24f);  // #2a1f3d
    static readonly Color ExteriorGlow  = new Color(1f, 0.67f, 0f, 0.85f); // orange outline

    void Awake()
    {
        if (whiteSprite == null)
        {
            Debug.LogError("HideoutBuilder: whiteSprite not assigned");
            return;
        }
        BuildInterior();
        BuildExteriorInCity();
    }

    // --- Interior ---

    void BuildInterior()
    {
        var parent = new GameObject("HideoutInterior").transform;
        parent.SetParent(transform, false);

        Vector2 o = GameState.HideoutOrigin;
        int w = GameState.HideoutWidth;
        int h = GameState.HideoutHeight;

        // Floor — single dark-blue rect filling the room.
        SpawnRect(parent, "Floor",
                  o + new Vector2(w * 0.5f, -h * 0.5f),
                  new Vector2(w, h),
                  FloorColor, sortingOrder: -2000);

        // 4 walls — orange strips around the inside edge.
        const float WallThick = 8f;
        SpawnRect(parent, "WallN",
                  o + new Vector2(w * 0.5f, -WallThick * 0.5f),
                  new Vector2(w, WallThick),
                  WallColor, sortingOrder: -1500);
        SpawnRect(parent, "WallS",
                  o + new Vector2(w * 0.5f, -h + WallThick * 0.5f),
                  new Vector2(w, WallThick),
                  WallColor, sortingOrder: -1500);
        SpawnRect(parent, "WallW",
                  o + new Vector2(WallThick * 0.5f, -h * 0.5f),
                  new Vector2(WallThick, h),
                  WallColor, sortingOrder: -1500);
        SpawnRect(parent, "WallE",
                  o + new Vector2(w - WallThick * 0.5f, -h * 0.5f),
                  new Vector2(WallThick, h),
                  WallColor, sortingOrder: -1500);

        // Training-area outline — dashed-green rect of 4 thin strips at the
        // top-left of the interior (mirrors hideout.js coords (30, 30)
        // size 180×120).
        const int TrainX = 30, TrainY = 30, TrainW = 180, TrainH = 120;
        const float Stroke = 3f;
        Vector2 trainTL = o + new Vector2(TrainX, -TrainY);
        SpawnRect(parent, "TrainN",
                  trainTL + new Vector2(TrainW * 0.5f, -Stroke * 0.5f),
                  new Vector2(TrainW, Stroke),
                  TrainingGreen, sortingOrder: -1400);
        SpawnRect(parent, "TrainS",
                  trainTL + new Vector2(TrainW * 0.5f, -TrainH + Stroke * 0.5f),
                  new Vector2(TrainW, Stroke),
                  TrainingGreen, sortingOrder: -1400);
        SpawnRect(parent, "TrainW",
                  trainTL + new Vector2(Stroke * 0.5f, -TrainH * 0.5f),
                  new Vector2(Stroke, TrainH),
                  TrainingGreen, sortingOrder: -1400);
        SpawnRect(parent, "TrainE",
                  trainTL + new Vector2(TrainW - Stroke * 0.5f, -TrainH * 0.5f),
                  new Vector2(Stroke, TrainH),
                  TrainingGreen, sortingOrder: -1400);

        // Exit door — yellow rect on the south wall, centred.
        const float DoorW = 60f, DoorH = 25f;
        Vector2 exitPos = o + new Vector2(w * 0.5f, -h + DoorH * 0.5f + WallThick * 0.5f);
        var exit = SpawnRect(parent, "ExitDoor", exitPos,
                             new Vector2(DoorW, DoorH),
                             ExitYellow, sortingOrder: -1400);
        // HideoutDoor trigger + collider — pressing E here teleports back
        // to the city. Trigger only, no physical collision.
        var exitCol = exit.AddComponent<BoxCollider2D>();
        exitCol.isTrigger = true;
        exitCol.size = new Vector2(DoorW, DoorH);
        var exitDoor = exit.AddComponent<HideoutDoor>();
        exitDoor.isExit = true;

        // "EXIT (E)" label.
        AddWorldLabel(parent, "ExitLabel",
                      exitPos + new Vector2(0f, 0.5f),
                      "EXIT (E)", 10f, Color.black, sortingOrder: -1399);

        // "DECORATE MODE — coming soon" placeholder bottom-left, dim text
        // so we know Session 2 is still on the roadmap.
        AddWorldLabel(parent,
                      "DecoPlaceholder",
                      o + new Vector2(120f, -h + 16f),
                      "DECORATE MODE — coming soon",
                      8f, new Color(0.5f, 0.5f, 0.6f),
                      sortingOrder: -1399);
    }

    // --- Exterior in the city ---

    void BuildExteriorInCity()
    {
        var parent = new GameObject("HideoutExterior").transform;
        parent.SetParent(transform, false);

        // Reserved zone (JS): (3900, 3000, 400, 450) → Unity Y-flipped:
        //   top-left (3900, -3000), bottom-right (4300, -3450)
        const int X = 3900, W = 400, H = 450;
        const int YTop = -3000;   // Unity Y; "north" edge of the building
        Vector2 centre = new Vector2(X + W * 0.5f, YTop - H * 0.5f);

        // Body — dark purple rectangle. Use a Building-y sortingOrder
        // (negative bottom Y) so the hideout layers correctly with city
        // buildings: south edge sort = -(YTop - H).
        int sortRoof = -Mathf.RoundToInt(YTop - H);
        SpawnRect(parent, "HideoutBody", centre, new Vector2(W, H),
                  ExteriorRoof, sortingOrder: sortRoof);

        // 4 thick orange outline strips around the edge for the "glow".
        const float OutlineThick = 10f;
        SpawnRect(parent, "OutlineN",
                  new Vector2(centre.x, YTop - OutlineThick * 0.5f),
                  new Vector2(W, OutlineThick),
                  ExteriorGlow, sortingOrder: sortRoof + 1);
        SpawnRect(parent, "OutlineS",
                  new Vector2(centre.x, YTop - H + OutlineThick * 0.5f),
                  new Vector2(W, OutlineThick),
                  ExteriorGlow, sortingOrder: sortRoof + 1);
        SpawnRect(parent, "OutlineW",
                  new Vector2(X + OutlineThick * 0.5f, centre.y),
                  new Vector2(OutlineThick, H),
                  ExteriorGlow, sortingOrder: sortRoof + 1);
        SpawnRect(parent, "OutlineE",
                  new Vector2(X + W - OutlineThick * 0.5f, centre.y),
                  new Vector2(OutlineThick, H),
                  ExteriorGlow, sortingOrder: sortRoof + 1);

        // Yellow door at the south-edge centre. This is the HideoutDoor
        // trigger that takes the player INTO the hideout.
        const float DoorW = 60f, DoorH = 25f;
        Vector2 doorPos = new Vector2(centre.x,
                                       YTop - H + DoorH * 0.5f + OutlineThick * 0.5f);
        var door = SpawnRect(parent, "EnterDoor", doorPos,
                             new Vector2(DoorW, DoorH),
                             ExitYellow, sortingOrder: sortRoof + 2);
        var col = door.AddComponent<BoxCollider2D>();
        col.isTrigger = true;
        col.size = new Vector2(DoorW, DoorH);
        var hd = door.AddComponent<HideoutDoor>();
        hd.isExit = false;

        // "HIDEOUT — Press E to enter" world-space label above the building.
        AddWorldLabel(parent, "HideoutSign",
                      new Vector2(centre.x, YTop + 18f),
                      "HIDEOUT", 22f, ExitYellow,
                      sortingOrder: sortRoof + 3);
        AddWorldLabel(parent, "EnterHint",
                      doorPos + new Vector2(0f, -DoorH * 0.5f - 10f),
                      "Press E to enter", 10f, ExitYellow,
                      sortingOrder: sortRoof + 3);
    }

    // --- Helpers ---

    GameObject SpawnRect(Transform parent, string name, Vector2 worldPos,
                        Vector2 size, Color color, int sortingOrder)
    {
        var go = new GameObject(name);
        go.transform.SetParent(parent, false);
        go.transform.position = new Vector3(worldPos.x, worldPos.y, 0f);
        go.transform.localScale = new Vector3(size.x, size.y, 1f);
        var sr = go.AddComponent<SpriteRenderer>();
        sr.sprite = whiteSprite;
        sr.color = color;
        sr.sortingOrder = sortingOrder;
        return go;
    }

    void AddWorldLabel(Transform parent, string name, Vector2 worldPos,
                       string text, float fontSize, Color color,
                       int sortingOrder)
    {
        var go = new GameObject(name);
        go.transform.SetParent(parent, false);
        go.transform.position = new Vector3(worldPos.x, worldPos.y, 0f);

        var tmp = go.AddComponent<TextMeshPro>();
        tmp.text = text;
        tmp.fontSize = fontSize;
        tmp.color = color;
        tmp.alignment = TextAlignmentOptions.Center;
        tmp.enableWordWrapping = false;
        tmp.fontStyle = FontStyles.Bold;
        tmp.rectTransform.sizeDelta = new Vector2(Mathf.Max(fontSize * 8f, 200f),
                                                  fontSize + 4f);
        tmp.sortingOrder = sortingOrder;
    }
}
