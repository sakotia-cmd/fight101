// KenneyTileIds.cs — named indices for the Kenney "Tiny Town" CC0 pack.
// Grid is 12 cols × 11 rows of 16×16 tiles (132 total); tile (col, row) →
// index = row * 12 + col.
//
// Identified by inspecting a labeled 6× upscale of tilemap_packed.png. See
// /tmp/kenney-dl/tiny-town-labeled.png in the conversation history for the
// reference image.
//
// Tile categories below preserve the names from the previous "Roguelike
// Modern City" pack so BuildingTileSet.cs and WorldBuilder.cs work without
// rename. Some categories (vehicles, traffic lights, dumpsters, asphalt
// road markings) have no Tiny Town equivalent and fall back to neutral
// tiles (grass / dirt / fence post) so they render invisibly or read as
// village-appropriate props.

public static class KenneyTileIds
{
    // --- Ground ---
    public const int GrassPlain      = 0;     // (col 0, row 0) — plain grass
    public const int GrassWithBush   = 1;     // (col 1, row 0) — grass + tuft
    public const int Sidewalk        = 25;    // (col 1, row 2) — dirt centre
    public const int SidewalkManhole = 25;    // no manhole in Tiny Town

    // --- "Roads" — Tiny Town has no asphalt; dirt strip stands in. ---
    public const int Asphalt         = 41;    // (col 5, row 3) — dirt strip
    public const int AsphaltLaneDash = 41;    // no dashed-centre tile

    // --- Roofs — Tiny Town has 2 house roof types (blue slate / red). ---
    // The constants keep their original 3-style names so BuildingTileSet
    // can keep its WarmBrick / CoolConcrete / GreenModern naming.
    public const int RoofRedBrick    = 65;    // (col 5, row 5) — red roof interior
    public const int RoofGray        = 49;    // (col 1, row 4) — blue slate roof interior
    public const int RoofTan         = 65;    // no third roof — reuse red

    // --- Walls — Tiny Town houses use brown wood or gray stone. ---
    public const int WallBrickRed    = 73;    // (col 1, row 6) — brown wood wall
    public const int WallBrickGray   = 77;    // (col 5, row 6) — gray stone wall
    public const int WallBrickTan    = 73;    // reuse brown

    // --- Doors ---
    public const int DoorWoodSimple  = 74;    // (col 2, row 6) — brown door in wall
    public const int DoorWoodFancy   = 78;    // (col 6, row 6) — gray-stone door
    public const int DoorGlassModern = 78;    // reuse gray-stone

    // --- Awnings — no striped awnings in Tiny Town; fall back to dirt. ---
    public const int AwningGreenStripe  = 41; // dirt strip
    public const int AwningOrangeStripe = 41;
    public const int AwningRedStripe    = 41;

    // --- Trees (Phase D decorations) ---
    public const int TreeGreen          = 5;  // (col 5, row 0) — small green tree
    public const int TreeAutumn         = 3;  // (col 3, row 0) — small autumn tree

    // --- Props that have no Tiny Town equivalent ---
    public const int StreetLamp         = 59; // (col 11, row 4) — vertical fence post stands in
    public const int TrafficLight       = 59; // reuse
    public const int TrashCan           = 92; // (col 8, row 7) — wooden chest reads as a crate
    public const int DumpsterGreen      = 92;
    public const int DumpsterOrange     = 92;
    public const int FenceChain         = 80; // (col 8, row 6) — wooden fence rail

    // --- Vehicles (Phase D) — Tiny Town has no vehicles. Stub with grass
    //     so they render invisibly; remove from Decorations later. ---
    public const int CarGreenLeft       = 0;
    public const int CarOrangeLeft      = 0;
    public const int VanGrayLeft        = 0;
}
