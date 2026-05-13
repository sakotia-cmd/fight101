// KenneyTileIds.cs — named indices for the Kenney "Roguelike Modern City"
// pack. The full sheet is 37 cols × 28 rows (1036 tiles); indices below were
// identified by baking a labeled 4× upscale of tilemap_packed.png and
// reading the labels visually. See Assets/Editor/BakeLabeledTilesheet.cs.
//
// Tile (col, row) → index = row * 37 + col.

public static class KenneyTileIds
{
    // --- Ground ---
    public const int GrassPlain      = 35;    // top-right of row 0, plain grass
    public const int GrassWithBush   = 34;    // grass with a tuft
    public const int Sidewalk        = 778;   // plain light-gray flagstone (row 21)
    public const int SidewalkManhole = 777;   // sidewalk with manhole

    // --- Roads ---
    // Plain dark asphalt (used in WorldBuilder.BuildRoads tiled mode).
    public const int Asphalt         = 842;
    // Asphalt with white dashed center line (for road interiors with markings).
    public const int AsphaltLaneDash = 825;

    // --- Roofs (tiled across the building footprint) ---
    // Each is the *centre* (M) of a 3×3 building cluster — Kenney's clusters
    // have TL/T/TR/L/M/R/BL/B/BR; only M is a clean fill without edge lines,
    // so it's the one to tile across the whole rooftop.
    public const int RoofRedBrick    = 38;    // M of cluster (0,0)-(2,2)
    public const int RoofGray        = 47;    // M of cluster (9,0)-(11,2)
    public const int RoofTan         = 62;    // M of cluster (24,0)-(26,2)

    // --- Walls (tiled across facade + east depth strip) ---
    public const int WallBrickRed    = 296;   // red brick wall
    public const int WallBrickGray   = 300;   // gray brick wall
    public const int WallBrickTan    = 304;   // tan / sandstone brick wall

    // --- Doors (single sprite, scaled 2× to read as a door at PPU=1) ---
    public const int DoorWoodSimple  = 580;   // wooden door with simple frame
    public const int DoorWoodFancy   = 584;   // wooden door with inset window
    public const int DoorGlassModern = 658;   // modern glass door

    // --- Awnings (sit above the door as the shop "sign band") ---
    public const int AwningGreenStripe  = 393;   // green-and-white stripes
    public const int AwningOrangeStripe = 397;   // orange-and-white stripes
    public const int AwningRedStripe    = 327;   // red awning (small)

    // --- Props (declared for Phase D — not used in Phase B) ---
    public const int TreeGreen          = 478;
    public const int TreeAutumn         = 481;
    public const int StreetLamp         = 500;
    public const int TrafficLight       = 518;
    public const int TrashCanBlack      = 495;
    public const int DumpsterGreen      = 985;
    public const int DumpsterOrange     = 988;
    public const int FenceChain         = 522;

    // --- Vehicles (declared for Phase D — each car spans 2 tiles) ---
    public const int CarGreenLeft       = 661;
    public const int CarOrangeLeft      = 919;
    public const int VanGrayLeft        = 809;
}
