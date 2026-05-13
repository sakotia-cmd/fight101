// CityRng.cs — seeded random number generator.
//
// Direct port of makeRng() in world.js. Same constants as a classic LCG
// (Numerical Recipes). JS's `Math.imul(s, 1664525) + 1013904223 | 0` does
// a 32-bit signed-integer multiply-then-add with wrap-around; in C# we
// get the same behavior with `unchecked`.
//
// Returns a double in [0, 1) to match JS's number type. We don't really
// need that precision for placing buildings, but keeping the math identical
// means we can compare layouts side-by-side with the JS game if needed.

public class CityRng
{
    int s;

    public CityRng(int seed) { s = seed; }

    public double Next()
    {
        s = unchecked(s * 1664525 + 1013904223);
        return (uint)s / 4294967296.0;
    }
}
