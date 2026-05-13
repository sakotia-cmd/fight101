// WorldBuilder.cs — generates the city at scene start.
//
// Runs the same seeded RNG and placement algorithm as world.js so building
// positions are identical (modulo Math.round vs Mathf.RoundToInt edge
// cases). Each district gets:
//   - a flat-colored ground quad
//   - its share of buildings
//
// Each building renders as a small hierarchy of flat colored sprites to
// match the JS game's top-down 3/4 perspective look:
//   Building (collider, marker)
//   ├── Roof       — full footprint, palette.roof color (the rooftop)
//   ├── EastWall   — 12px thin strip east of the roof, palette.wallDark
//   ├── Facade     — 50px tall strip south of the roof, palette.wall
//   ├── Sign       — colored bar above the facade, palette.sign
//   └── Door       — small dark rectangle in the center of the facade
// Sign text and windows are deferred (TMP font + per-building seeding).
//
// Roads render as gray quads over the grounds, no colliders (player walks
// freely on them).
//
// Coordinate flip: world.js places things in pixel space with Y down. Unity
// uses Y up. We negate Y when instantiating so a JS (1000, 2000) maps to
// Unity (1000, -2000).

using System.Collections.Generic;
using TMPro;
using UnityEngine;

public class WorldBuilder : MonoBehaviour
{
    // Drag-assigned (via U2Setup) — a 1×1 white sprite we tint per object.
    // Still used for sign rectangles and the East depth wall.
    public Sprite whiteSprite;

    // Buildings as JS-coord rects (Y down, top-left origin). Used for the
    // placement overlap check and (later) for spawning enemies/items only
    // in walkable spots.
    static readonly List<RectInt> jsBuildings = new();

    void Awake()
    {
        if (whiteSprite == null)
        {
            Debug.LogError("WorldBuilder: whiteSprite not assigned");
            return;
        }

        BuildGrounds();
        BuildRoads();
        BuildBuildings();
    }

    // --- Layers ---
    const int SortOrderGround = -2000;
    const int SortOrderRoad   = -1500;
    // Buildings get -y as their sortingOrder, set in Building.Awake().

    void BuildGrounds()
    {
        var parent = new GameObject("Grounds").transform;
        parent.SetParent(transform, false);

        var grass = KenneyTiles.Tile(KenneyTileIds.GrassPlain);
        var sidewalk = KenneyTiles.Tile(KenneyTileIds.Sidewalk);

        foreach (var d in WorldData.DISTRICTS)
        {
            // Pick tile by district feel: residential / park / outskirts /
            // suburbs / hideout get grass; everything else gets sidewalk
            // pavement.
            Sprite tile = d.name switch
            {
                "Residential"  or "Park" or "Outskirts" or "Suburbs"
                                or "Hideout Zone" => grass,
                _                                 => sidewalk,
            };
            SpawnTiled(parent, "Ground_" + d.name,
                       d.x, d.y, d.w, d.h,
                       tile, fallbackColor: d.ground,
                       sortingOrder: SortOrderGround, addCollider: false);
        }
    }

    void BuildRoads()
    {
        var parent = new GameObject("Roads").transform;
        parent.SetParent(transform, false);

        var asphalt = KenneyTiles.Tile(KenneyTileIds.Asphalt);
        Color fallback = new Color(0.18f, 0.18f, 0.20f, 1f);

        for (int i = 0; i < WorldData.ROADS.Length; i++)
        {
            var r = WorldData.ROADS[i];
            SpawnTiled(parent, "Road_" + i,
                       r.x, r.y, r.w, r.h,
                       asphalt, fallback,
                       SortOrderRoad, addCollider: false);
        }
    }

    void BuildBuildings()
    {
        var parent = new GameObject("Buildings").transform;
        parent.SetParent(transform, false);

        jsBuildings.Clear();
        var rng = new CityRng(42);  // same seed as world.js createCity()

        foreach (var dist in WorldData.DISTRICTS)
        {
            int placed = 0;
            int attempts = 0;
            int maxAttempts = dist.count * 10;

            while (placed < dist.count && attempts < maxAttempts)
            {
                attempts++;
                int w = Round(dist.minSz + rng.Next() * (dist.maxSz - dist.minSz));
                int h = Round(dist.minSz + rng.Next() * (dist.maxSz - dist.minSz));
                int margin = 50;
                int x = Round(dist.x + margin + rng.Next() * (dist.w - w - margin * 2));
                int y = Round(dist.y + margin + rng.Next() * (dist.h - h - margin * 2));

                if (OverlapsBuildings(x, y, w, h, 60)) continue;
                if (OverlapsRoads(x, y, w, h + WorldData.FacadeHeight + 20)) continue;
                if (OverlapsReserved(x, y, w, h + WorldData.FacadeHeight)) continue;

                int pi = (int)(rng.Next() * dist.pals.Length);
                if (pi >= dist.pals.Length) pi = dist.pals.Length - 1;
                int paletteIndex = dist.pals[pi];
                var pal = WorldData.PALETTES[paletteIndex];

                // world.js calls rng() four more times to populate per-
                // building fields (seed, stories, hasAwning, roofItems) that
                // we don't use yet. Burn them so subsequent RNG draws stay
                // in sync with the JS layout.
                rng.Next(); rng.Next(); rng.Next(); rng.Next();

                SpawnBuilding(parent, x, y, w, h, pal, paletteIndex);
                jsBuildings.Add(new RectInt(x, y, w, h));
                placed++;
            }
        }
    }

    // --- Per-building hierarchy ---
    //
    // Each building is anchored at the roof center. Children, in render order:
    //   Roof    — Kenney roof tile tiled across the full footprint
    //   EastWall — wall tile tiled across the east depth strip (3/4 look)
    //   Facade   — wall tile tiled across the south face
    //   Awning   — striped awning tile above the door
    //   SignText — palette.signText (PIZZA / CYBER / …) on top of the awning
    //   Door     — Kenney door sprite at the lower-center of the facade
    //
    // The Style (which tiles to use) is picked by BuildingTileSet.PickByIndex
    // from the palette index, so warm/cool/green palettes get distinct
    // visuals without us hand-coding per-palette logic.

    void SpawnBuilding(Transform parent, int jsX, int jsY, int w, int h,
                       WorldData.Palette pal, int paletteIndex)
    {
        var go = new GameObject("Building");
        go.transform.SetParent(parent, false);

        float cx = jsX + w * 0.5f;
        float cyRoof = -(jsY + h * 0.5f);
        go.transform.position = new Vector3(cx, cyRoof, 0f);

        // Footprint collider — only the roof's bounding box blocks movement,
        // unchanged from the previous renderer so collision behaviour is
        // identical.
        var col = go.AddComponent<BoxCollider2D>();
        col.size = new Vector2(w, h);

        go.AddComponent<Building>();

        float roofBottom   = cyRoof - h * 0.5f;
        float facadeBottom = roofBottom - WorldData.FacadeHeight;
        int sortRoof   = -Mathf.RoundToInt(roofBottom);
        int sortFacade = -Mathf.RoundToInt(facadeBottom);

        var style = BuildingTileSet.PickByIndex(paletteIndex);

        // 1. ROOF — Kenney tile tiled across the full footprint, no tint.
        AddTiledSprite(go.transform, "Roof",
                       new Vector2(w, h), Vector3.zero,
                       KenneyTiles.Tile(style.roof),
                       fallbackColor: pal.roof,
                       sortingOrder: sortRoof);

        // 2. EAST DEPTH WALL — wall tile tiled vertically along the east edge.
        const float SideW = 12f;
        AddTiledSprite(go.transform, "EastWall",
                       new Vector2(SideW, h + WorldData.FacadeHeight),
                       new Vector3(w * 0.5f + SideW * 0.5f,
                                   -WorldData.FacadeHeight * 0.5f, 0f),
                       KenneyTiles.Tile(style.wall),
                       fallbackColor: pal.wallDark,
                       sortingOrder: sortFacade);

        // 3. FACADE — wall tile tiled horizontally across the south face.
        AddTiledSprite(go.transform, "Facade",
                       new Vector2(w, WorldData.FacadeHeight),
                       new Vector3(0f, -h * 0.5f - WorldData.FacadeHeight * 0.5f, 0f),
                       KenneyTiles.Tile(style.wall),
                       fallbackColor: pal.wall,
                       sortingOrder: sortFacade);

        // 4. AWNING — striped tile above the door, at the very top of the
        //    facade strip. Doubles as the "shop sign" backing.
        int signW = Mathf.Min(w - 20, 96);
        if (signW > 32)
        {
            AddTiledSprite(go.transform, "Awning",
                           new Vector2(signW, 16f),
                           new Vector3(0f, -h * 0.5f - 8f, 0f),
                           KenneyTiles.Tile(style.awning),
                           fallbackColor: pal.sign,
                           sortingOrder: sortFacade + 1);

            // Sign text rendered on top of the awning.
            AddSignTextDirect(go.transform, pal.signText,
                              new Vector3(0f, -h * 0.5f - 8f, 0f),
                              signW, sortFacade + 2);
        }

        // 5. DOOR — single Kenney door sprite, ~28×28, centered horizontally,
        //    placed near the bottom of the facade. Scaled up from 16×16 so
        //    it reads as a door at this PPU.
        const float DoorW = 28f;
        const float DoorH = 28f;
        float doorCenterY = -h * 0.5f - (16f + (WorldData.FacadeHeight - 16f) * 0.5f);
        AddScaledTileSprite(go.transform, "Door",
                            new Vector2(DoorW, DoorH),
                            new Vector3(0f, doorCenterY, 0f),
                            KenneyTiles.Tile(style.door),
                            fallbackColor: new Color(0.29f, 0.21f, 0.13f),
                            sortingOrder: sortFacade + 3);
    }

    // Tiled-mode variant: the sprite repeats across (size.x, size.y) in world
    // units. The GameObject's localScale stays at 1 (unlike AddSprite, where
    // we scale a 1×1 sprite to fill the size).
    GameObject AddTiledSprite(Transform parent, string name, Vector2 size, Vector3 localPos,
                              Sprite sprite, Color fallbackColor, int sortingOrder)
    {
        var go = new GameObject(name);
        go.transform.SetParent(parent, false);
        go.transform.localPosition = localPos;

        var sr = go.AddComponent<SpriteRenderer>();
        if (sprite != null)
        {
            sr.sprite = sprite;
            sr.drawMode = SpriteDrawMode.Tiled;
            sr.tileMode = SpriteTileMode.Continuous;
            sr.size = size;
            sr.color = Color.white;
        }
        else
        {
            // Fall back to the white-sprite + scale approach if the Kenney
            // tile wasn't available (e.g. KenneyTiles not assigned in scene).
            sr.sprite = whiteSprite;
            sr.color = fallbackColor;
            go.transform.localScale = new Vector3(size.x, size.y, 1f);
        }
        sr.sortingOrder = sortingOrder;
        return go;
    }

    // Spawn a tiled sprite using JS top-left coords + size (instead of
    // local position relative to a parent center). Used for the ground +
    // road tilemap-style layers that aren't part of a building hierarchy.
    GameObject SpawnTiled(Transform parent, string name,
                          int jsX, int jsY, int w, int h,
                          Sprite sprite, Color fallbackColor,
                          int sortingOrder, bool addCollider)
    {
        var go = new GameObject(name);
        go.transform.SetParent(parent, false);

        float cx = jsX + w * 0.5f;
        float cy = -(jsY + h * 0.5f);
        go.transform.position = new Vector3(cx, cy, 0f);

        var sr = go.AddComponent<SpriteRenderer>();
        if (sprite != null)
        {
            sr.sprite = sprite;
            sr.drawMode = SpriteDrawMode.Tiled;
            sr.tileMode = SpriteTileMode.Continuous;
            sr.size = new Vector2(w, h);
            sr.color = Color.white;
        }
        else
        {
            sr.sprite = whiteSprite;
            sr.color = fallbackColor;
            go.transform.localScale = new Vector3(w, h, 1f);
        }
        sr.sortingOrder = sortingOrder;

        if (addCollider)
        {
            var col = go.AddComponent<BoxCollider2D>();
            col.size = new Vector2(w, h);
        }

        return go;
    }

    // Sign label. Parented directly to the Building GameObject (unit scale)
    // so we don't need to cancel out any non-uniform scaling — TMP renders
    // at world units. Sits on top of the awning tile.
    void AddSignTextDirect(Transform parent, string text, Vector3 localPos,
                           float signW, int sortingOrder)
    {
        var go = new GameObject("SignText");
        go.transform.SetParent(parent, false);
        go.transform.localPosition = localPos;

        var tmp = go.AddComponent<TextMeshPro>();
        tmp.text = text;
        tmp.fontSize = 14f;
        tmp.color = Color.white;
        tmp.alignment = TextAlignmentOptions.Center;
        tmp.enableWordWrapping = false;
        tmp.fontStyle = FontStyles.Bold;
        tmp.rectTransform.sizeDelta = new Vector2(signW, 16f);
        tmp.sortingOrder = sortingOrder;
    }

    // Single Kenney tile sprite scaled to (size.x, size.y). Unlike
    // AddTiledSprite (which repeats the tile via SpriteDrawMode.Tiled), this
    // stretches one tile to fill the requested area. Used for doors where we
    // want the door art to appear once, scaled up, not as a 2×2 grid.
    GameObject AddScaledTileSprite(Transform parent, string name,
                                   Vector2 size, Vector3 localPos,
                                   Sprite sprite, Color fallbackColor,
                                   int sortingOrder)
    {
        var go = new GameObject(name);
        go.transform.SetParent(parent, false);
        go.transform.localPosition = localPos;

        var sr = go.AddComponent<SpriteRenderer>();
        if (sprite != null)
        {
            sr.sprite = sprite;
            // sprite.bounds.size is in world units; for a 16×16 tile at
            // PPU=1 that's (16, 16). Scale so the sprite covers `size`.
            var b = sprite.bounds.size;
            float sx = b.x > 0 ? size.x / b.x : 1f;
            float sy = b.y > 0 ? size.y / b.y : 1f;
            go.transform.localScale = new Vector3(sx, sy, 1f);
            sr.color = Color.white;
        }
        else
        {
            sr.sprite = whiteSprite;
            sr.color = fallbackColor;
            go.transform.localScale = new Vector3(size.x, size.y, 1f);
        }
        sr.sortingOrder = sortingOrder;
        return go;
    }

    // --- Placement helpers (mirror overlapsBuildings/Roads/Reserved in world.js) ---

    bool OverlapsBuildings(int x, int y, int w, int h, int pad)
    {
        foreach (var b in jsBuildings)
        {
            if (x < b.x + b.width + pad && x + w + pad > b.x &&
                y < b.y + b.height + WorldData.FacadeHeight + pad && y + h + pad > b.y) return true;
        }
        return false;
    }

    bool OverlapsRoads(int x, int y, int w, int h)
    {
        foreach (var r in WorldData.ROADS)
        {
            if (x < r.x + r.w + 15 && x + w + 15 > r.x &&
                y < r.y + r.h + 15 && y + h + 15 > r.y) return true;
        }
        return false;
    }

    bool OverlapsReserved(int x, int y, int w, int h)
    {
        foreach (var r in WorldData.RESERVED)
        {
            if (x < r.x + r.w && x + w > r.x && y < r.y + r.h && y + h > r.y) return true;
        }
        return false;
    }

    static int Round(double v) => (int)System.Math.Round(v, System.MidpointRounding.AwayFromZero);
}
