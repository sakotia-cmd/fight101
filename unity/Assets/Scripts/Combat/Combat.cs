// Combat.cs — Jay's attack dispatch.
//
// Ports tryAttack/tryMeleeAttack/tryRangedAttack from weapons.js. Reads
// Inventory.Instance.equipped to pick weapon + element each press.
//
// Melee (sword / taser):
//   - 15-frame swing animation
//   - Cone hit-check within the weapon's range + arc
//   - Apply damage + knockback + element effect
//   - Taser: stun for the weapon's stun frames
//   - Thunder element: extra AoE pass over enemies in radius
// Ranged (bow / gun):
//   - Spawn a Projectile traveling in the player's facing
//   - Cooldown timer (we re-use swingTimer = 0 since there's no animation)
//
// Cooldown comes from WEAPON_TYPES[equipped].cooldown.
//
// Visual: Sword.cs renders the blade rotating across the arc. For ranged
// shots there's no swing visual (the projectile itself is the feedback).

using UnityEngine;

public class Combat : MonoBehaviour
{
    public const int   SwingDuration  = 15;
    public Sword       sword;             // melee visual
    public GameObject  projectilePrefab; // assigned by U4Setup

    int   swingTimer;
    int   cooldownTimer;
    float swordAngle;
    float swordArcCurrent = Mathf.PI * 0.9f;

    public bool  IsSwinging     => swingTimer > 0;
    public float SwordAngle     => swordAngle;
    public float SwingProgress  => 1f - (float)swingTimer / SwingDuration;
    public float SwordArcCurrent => swordArcCurrent;

    void Awake()
    {
        GameEvents.GameRestarted += OnRestart;
    }

    void OnDestroy()
    {
        GameEvents.GameRestarted -= OnRestart;
    }

    void OnRestart()
    {
        swingTimer = 0;
        cooldownTimer = 0;
        sword?.Hide();
    }

    void Update()
    {
        if (GameState.gameOver) return;

        if (swingTimer > 0)
        {
            swingTimer--;
            if (swingTimer == 0) sword?.Hide();
        }
        if (cooldownTimer > 0) cooldownTimer--;

        if (GameState.InputGated) return;

        if (PlayerInput.AttackPressed() && cooldownTimer == 0)
        {
            TryAttack();
        }
    }

    void TryAttack()
    {
        if (Inventory.Instance == null) return;
        ref var w = ref Inventory.Instance.CurrentWeapon;
        ref var e = ref Inventory.Instance.CurrentElement;
        if (w.melee) DoMelee(ref w, ref e);
        else         DoRanged(ref w, ref e);
    }

    void DoMelee(ref WeaponData.WeaponType w, ref WeaponData.Element elem)
    {
        var player = Player.Instance;
        if (player == null) return;

        if (swingTimer > 0) return;
        swingTimer = SwingDuration;
        cooldownTimer = w.cooldown;
        swordAngle = AngleForFacing(player.facing);
        swordArcCurrent = w.arc;

        if (sword != null) sword.Show(swordAngle);

        Vector2 center = player.transform.position;
        int damage = Inventory.Instance.CurrentDamage();
        var equipped = Inventory.Instance.equipped;
        var elementKind = Inventory.Instance.equippedElement[(int)equipped];

        var enemies = Object.FindObjectsByType<Enemy>(FindObjectsSortMode.None);

        foreach (var e in enemies)
        {
            if (e == null) continue;
            Vector2 to = (Vector2)e.transform.position - center;
            float dist = to.magnitude;
            if (dist > w.range + e.size * 0.5f) continue;

            float angleTo = Mathf.Atan2(to.y, to.x);
            float diff = Mathf.DeltaAngle(swordAngle * Mathf.Rad2Deg, angleTo * Mathf.Rad2Deg)
                       * Mathf.Deg2Rad;
            if (Mathf.Abs(diff) < w.arc * 0.5f)
            {
                e.TakeDamage(damage, center);
                e.ApplyElement(elementKind);
                if (w.stun > 0) e.ApplyStun(w.stun);
            }
        }

        // Thunder: additional AoE pass — hits enemies in radius even
        // outside the swing arc, at 50% damage.
        if (elem.effect == ElementEffectKind.Aoe)
        {
            int aoeDamage = Mathf.RoundToInt(damage * 0.5f);
            foreach (var e in enemies)
            {
                if (e == null) continue;
                Vector2 to = (Vector2)e.transform.position - center;
                float dist = to.magnitude;
                if (dist >= w.range + e.size * 0.5f && dist < elem.aoeRadius)
                {
                    e.TakeDamage(aoeDamage, center);
                }
            }
        }
    }

    void DoRanged(ref WeaponData.WeaponType w, ref WeaponData.Element elem)
    {
        if (projectilePrefab == null)
        {
            Debug.LogWarning("Combat: projectilePrefab not assigned");
            return;
        }
        cooldownTimer = w.cooldown;

        var player = Player.Instance;
        if (player == null) return;
        float angle = AngleForFacing(player.facing);
        Vector2 dir = new Vector2(Mathf.Cos(angle), Mathf.Sin(angle));
        Vector2 velocity = dir * w.projSpeed;

        var go = Instantiate(projectilePrefab);
        var proj = go.GetComponent<Projectile>();
        var elementKind = Inventory.Instance.equippedElement[(int)Inventory.Instance.equipped];
        proj.Init(
            origin:      (Vector2)player.transform.position + dir * 24f,  // outside player
            velocity:    velocity,
            damage:      Inventory.Instance.CurrentDamage(),
            element:     elementKind,
            size:        w.projSize,
            lifeFrames:  w.projLife,
            color:       elem.projColor);
    }

    static float AngleForFacing(Facing f)
    {
        switch (f)
        {
            case Facing.Right: return 0f;
            case Facing.Left:  return Mathf.PI;
            case Facing.Up:    return Mathf.PI * 0.5f;
            case Facing.Down:  return -Mathf.PI * 0.5f;
        }
        return 0f;
    }
}
