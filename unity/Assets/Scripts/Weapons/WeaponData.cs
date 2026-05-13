// WeaponData.cs — static weapon + element tables.
//
// Direct port of WEAPON_TYPES and ELEMENTS from weapons.js. Both are
// plain static arrays so the data is readable at a glance, no
// ScriptableObject indirection.

using UnityEngine;

public enum WeaponKind { Sword, Bow, Gun, Taser }
public enum ElementKind { Wood, Water, Fire, BlueFire, Thunder, Mega }
public enum ElementEffectKind { None, Slow, Burn, Aoe, Lightning }

public static class WeaponData
{
    public struct WeaponType
    {
        public string  name;
        public int     cooldown;
        public int     baseDamage;
        public bool    melee;
        public float   range;       // melee only
        public float   arc;         // melee only
        public float   projSpeed;   // ranged: units/sec  (JS px/frame × 60)
        public float   projSize;    // ranged
        public int     projLife;    // ranged: frames
        public int     stun;        // taser
    }

    public struct Element
    {
        public string             name;
        public Color              color;       // HUD tint
        public Color              projColor;   // projectile tint
        public float              mult;        // damage multiplier
        public ElementEffectKind  effect;
        public int                duration;    // slow/burn frames
        public float              dot;         // burn damage per tick (every 30 frames)
        public float              aoeRadius;   // thunder
    }

    // Indexed by WeaponKind.
    public static readonly WeaponType[] Weapons = new[]
    {
        new WeaponType { name = "Sword", cooldown = 18, baseDamage = 5, melee = true,
                         range = 42f, arc = Mathf.PI * 0.9f },
        new WeaponType { name = "Bow",   cooldown = 30, baseDamage = 4, melee = false,
                         projSpeed = 360f, projSize = 6f,  projLife = 60 },   // 6 px/frame × 60
        new WeaponType { name = "Gun",   cooldown = 12, baseDamage = 3, melee = false,
                         projSpeed = 540f, projSize = 4f,  projLife = 40 },   // 9 px/frame × 60
        new WeaponType { name = "Taser", cooldown = 40, baseDamage = 6, melee = true,
                         range = 50f, arc = Mathf.PI * 0.6f, stun = 120 },
    };

    // Indexed by ElementKind.
    public static readonly Element[] Elements = new[]
    {
        new Element { name = "Wood",       color = Hex("#8B6914"), projColor = Hex("#8B6914"),
                      mult = 1.0f, effect = ElementEffectKind.None },
        new Element { name = "Water",      color = Hex("#4488ff"), projColor = Hex("#44aaff"),
                      mult = 1.2f, effect = ElementEffectKind.Slow,      duration = 120 },
        new Element { name = "Fire",       color = Hex("#ff4422"), projColor = Hex("#ff6633"),
                      mult = 1.3f, effect = ElementEffectKind.Burn,      duration = 180, dot = 0.3f },
        new Element { name = "Blue Fire",  color = Hex("#4466ff"), projColor = Hex("#6688ff"),
                      mult = 1.5f, effect = ElementEffectKind.Burn,      duration = 180, dot = 0.7f },
        new Element { name = "Thunder",    color = Hex("#ffd400"), projColor = Hex("#fff066"),
                      mult = 1.4f, effect = ElementEffectKind.Aoe,       aoeRadius = 80f },
        new Element { name = "Mega",       color = Hex("#ffff00"), projColor = Hex("#ffff44"),
                      mult = 2.0f, effect = ElementEffectKind.Lightning },
    };

    public static int Damage(WeaponKind w, ElementKind e)
    {
        return Mathf.RoundToInt(Weapons[(int)w].baseDamage * Elements[(int)e].mult);
    }

    static Color Hex(string h)
    {
        ColorUtility.TryParseHtmlString(h, out var c);
        return c;
    }
}
