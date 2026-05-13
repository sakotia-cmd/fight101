// BuildingTileSet.cs — groups Kenney tile indices into a coherent visual
// style for one family of buildings (roof + wall + door + awning).
//
// WorldBuilder.SpawnBuilding picks one Style per building by the palette's
// sign color hue — warm-red → WarmBrick, cool-blue → CoolConcrete,
// green → GreenModern. This is what gives the city its colour variety
// without us having to hand-author per-palette tile maps.

using UnityEngine;

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

    // Pick a tileset by the sign colour the JS game already assigns per
    // palette. Sign colour is the most visually-loaded "what kind of shop is
    // this" hue, so we use it to bucket buildings into 3 tilesets.
    public static Style Pick(Color signColor)
    {
        // Green-dominant signs (FRESH, GAME) → green-modern.
        if (signColor.g > signColor.r && signColor.g > signColor.b)
            return GreenModern;
        // Red-dominant signs (PIZZA, BAKERY, TURBO, CAFE) → warm brick.
        if (signColor.r > signColor.b)
            return WarmBrick;
        // Everything else (CYBER, NEON, TECH, MEGA — cool/purple) → concrete.
        return CoolConcrete;
    }
}
