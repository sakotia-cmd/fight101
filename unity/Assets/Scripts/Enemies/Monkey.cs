// Monkey.cs — the basic enemy. Wanders, chases when close, melee contact.
//
// Stats ported from enemy.js (MONKEY_SIZE, MONKEY_SPEED, MONKEY_HP, etc.).

using UnityEngine;

public class Monkey : Enemy
{
    protected override void Awake()
    {
        maxHP           = 8;
        speed           = 1.0f;
        chaseRange      = 150f;
        contactDamage   = 5;
        damageCooldownF = 90;
        size            = 28;
        base.Awake();
    }
}
