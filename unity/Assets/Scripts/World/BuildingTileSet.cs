// BuildingTileSet.cs — groups Kenney tile indices into a coherent visual
// style for one family of buildings (roof + wall + door + awning).
//
// WorldBuilder.SpawnBuilding picks one Style per building by palette index
// — warm-red palettes get WarmBrick, cool-blue/purple get CoolConcrete,
// green palettes get GreenModern. Explicit per-palette dispatch (vs.
// guessing from sign-colour hue) keeps the mapping readable when adding
// new palettes.

public static class BuildingTileSet
{
    public struct Style
    {
        public int roof;     // tiled across the rooftop footprint
        public int wall;     // tiled across the facade + east depth wall
        public int door;     // single sprite at the center of the facade
        public int awning;   // tiled "shop sign" band above the door
    }

    public static readonly Style WarmBrick = new Style
    {
        roof   = KenneyTileIds.RoofRedBrick,
        wall   = KenneyTileIds.WallBrickRed,
        door   = KenneyTileIds.DoorWoodSimple,
        awning = KenneyTileIds.AwningOrangeStripe,
    };

    public static readonly Style CoolConcrete = new Style
    {
        roof   = KenneyTileIds.RoofGray,
        wall   = KenneyTileIds.WallBrickGray,
        door   = KenneyTileIds.DoorGlassModern,
        awning = KenneyTileIds.AwningRedStripe,
    };

    public static readonly Style GreenModern = new Style
    {
        roof   = KenneyTileIds.RoofTan,
        wall   = KenneyTileIds.WallBrickTan,
        door   = KenneyTileIds.DoorWoodFancy,
        awning = KenneyTileIds.AwningGreenStripe,
    };

    // Pick a tileset by palette index. Explicit per-palette dispatch is
    // clearer than guessing from sign-colour hue (the prior R-vs-B
    // dominance heuristic mis-routed MEGA's magenta sign to WarmBrick,
    // making half of Tech-Quarter look like a brick neighbourhood).
    //
    // Palette indices follow WorldData.PALETTES:
    //   0 PIZZA   warm red    → WarmBrick
    //   1 CYBER   cool blue   → CoolConcrete
    //   2 BAKERY  warm orange → WarmBrick
    //   3 NEON    purple      → CoolConcrete
    //   4 FRESH   green       → GreenModern
    //   5 TURBO   warm orange → WarmBrick
    //   6 TECH    bright blue → CoolConcrete
    //   7 CAFE    pink-red    → WarmBrick
    //   8 GAME    green       → GreenModern
    //   9 MEGA    magenta     → CoolConcrete (cyber feel, not brick-and-mortar)
    public static Style PickByIndex(int paletteIndex)
    {
        switch (paletteIndex)
        {
            case 0: case 2: case 5: case 7: return WarmBrick;
            case 4: case 8:                 return GreenModern;
            default:                        return CoolConcrete;
        }
    }
}
