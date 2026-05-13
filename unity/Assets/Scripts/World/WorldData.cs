// WorldData.cs — static city layout tables.
//
// Direct port of PALETTES, DISTRICTS, ROADS, and RESERVED from world.js.
// Same values, same indices, so WorldBuilder.cs reproduces the same city
// layout the JS game generates from seed 42.
//
// JS uses pixel coordinates with Y down (Y=0 at top of canvas). Unity world
// space is Y up. WorldBuilder.cs flips Y when instantiating GameObjects so
// these numbers stay readable as "same as world.js."

using UnityEngine;

public static class WorldData
{
    public struct Palette
    {
        public Color wall;        // facade body (south wall)
        public Color wallDark;    // east depth wall
        public Color roof;        // rooftop (the top-down view)
        public Color window;      // window pane
        public Color sign;        // shop sign
        public string signText;   // PIZZA / CYBER / etc. — not rendered yet

        public Palette(string wall, string wallDark, string roof, string window,
                       string sign, string signText)
        {
            this.wall = Hex(wall);
            this.wallDark = Hex(wallDark);
            this.roof = Hex(roof);
            this.window = Hex(window);
            this.sign = Hex(sign);
            this.signText = signText;
        }
    }

    public struct District
    {
        public string name;
        public int x, y, w, h;
        public Color ground;
        public int count;
        public int minSz, maxSz;
        public int[] pals;
    }

    public struct Rect
    {
        public int x, y, w, h;
        public Rect(int x, int y, int w, int h) { this.x = x; this.y = y; this.w = w; this.h = h; }
    }

    // Storefront palettes — index matches world.js PALETTES[].
    // Args: wall, wallDark, roof, window, sign, signText
    public static readonly Palette[] PALETTES = new[]
    {
        new Palette("#c06030", "#a04820", "#5a5068", "#88ccee", "#e84040", "PIZZA"),
        new Palette("#6898a8", "#507888", "#506858", "#aaddee", "#40a0e0", "CYBER"),
        new Palette("#d0b888", "#b09868", "#685850", "#ddeebb", "#e8a030", "BAKERY"),
        new Palette("#9888a8", "#786888", "#585868", "#bbaadd", "#aa44cc", "NEON"),
        new Palette("#88a878", "#688858", "#506050", "#cceecc", "#44bb44", "FRESH"),
        new Palette("#b87858", "#985838", "#685048", "#eeccaa", "#dd6622", "TURBO"),
        new Palette("#7888b0", "#586898", "#505868", "#aabbee", "#3388ff", "TECH"),
        new Palette("#c8a8a8", "#a88888", "#605858", "#eecccc", "#ee5577", "CAFE"),
        new Palette("#a0b898", "#809878", "#586050", "#ccddcc", "#55aa55", "GAME"),
        new Palette("#b898b8", "#987898", "#605060", "#ddbbdd", "#cc44aa", "MEGA"),
    };

    public static readonly District[] DISTRICTS = new[]
    {
        Dist("Residential",  0,    0,    1500, 1300, "#6a8a5a", 8,  100, 170, new[]{2,4,7}),
        Dist("Tech Quarter", 1500, 0,    1600, 1300, "#5a5a72", 9,  160, 260, new[]{1,3,6,9}),
        Dist("Industrial",   3100, 0,    1700, 1300, "#68685a", 5,  220, 340, new[]{5,6}),
        Dist("Old Town",     0,    1300, 1200, 1400, "#786e62", 7,  110, 190, new[]{0,2,5,7}),
        Dist("Downtown",     1200, 1300, 1900, 1400, "#82828a", 14, 180, 300, new[]{0,1,3,6,9}),
        Dist("Market",       3100, 1300, 1700, 1400, "#8a7a68", 10, 80,  170, new[]{0,2,5,7,8}),
        Dist("Harbor",       0,    2700, 1200, 1300, "#5a6878", 5,  150, 230, new[]{1,6}),
        Dist("South Side",   1200, 2700, 1600, 1300, "#6a6a6a", 7,  130, 220, new[]{0,3,5,8}),
        Dist("Park",         2800, 2700, 1000, 1300, "#3a8a2a", 1,  80,  120, new[]{4}),
        Dist("Hideout Zone", 3800, 2700, 1000, 1300, "#5a6a52", 4,  110, 180, new[]{3,4,9}),
        Dist("Outskirts",    0,    4000, 2400, 800,  "#607a50", 4,  100, 160, new[]{2,4}),
        Dist("Suburbs",      2400, 4000, 2400, 800,  "#607060", 5,  90,  150, new[]{2,7,8}),
    };

    // Main roads — h = horizontal strip, v = vertical strip. world.js stores
    // a `dir` field but we don't actually need it; the w/h tell us the shape.
    public static readonly Rect[] ROADS = new[]
    {
        new Rect(0,    1260, 4800, 80),
        new Rect(1460, 0,    80,   4000),
        new Rect(0,    2660, 2800, 70),
        new Rect(3060, 1260, 70,   1470),
        new Rect(0,    3960, 4800, 70),
        new Rect(3760, 2660, 70,   1370),
    };

    // No-build zones (player spawn, hideout, boss arenas).
    public static readonly Rect[] RESERVED = new[]
    {
        new Rect(300,  300,  200, 200),
        new Rect(3900, 3000, 400, 450),
        new Rect(2550, 350,  500, 450),
        new Rect(550,  3550, 550, 500),
        new Rect(1650, 1650, 600, 550),
    };

    // The facade-shadow extra height the JS code adds when checking overlap;
    // see overlapsBuildings() in world.js. We don't draw the facade in U2 but
    // we keep the padding so building positions match the JS layout.
    public const int FacadeHeight = 50;

    static District Dist(string name, int x, int y, int w, int h,
                         string ground, int count, int minSz, int maxSz, int[] pals)
    {
        return new District
        {
            name = name, x = x, y = y, w = w, h = h,
            ground = Hex(ground),
            count = count, minSz = minSz, maxSz = maxSz, pals = pals,
        };
    }

    static Color Hex(string h)
    {
        ColorUtility.TryParseHtmlString(h, out var c);
        return c;
    }
}
