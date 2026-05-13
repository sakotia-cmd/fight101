// Lizard.cs — second enemy type. Tougher and slower than the monkey, with
// a ranged "fire spit" attack.
//
// Stats ported from enemy.js (LIZARD_SIZE, LIZARD_SPEED, LIZARD_HP, etc.).
//
// Fire spit: every LIZARD_SPIT_COOLDOWN frames the lizard is allowed to
// spit, and if the player is within LIZARD_SPIT_RANGE (but not too close),
// it fires an EnemyProjectile. The projectile travels at 3 px/frame (= 180
// units/sec) and lasts 60 frames.

using UnityEngine;

public class Lizard : Enemy
{
    public const float SpitRange    = 180f;
    public const int   SpitCooldown = 150;
    public const int   SpitDamage   = 4;
    public const float SpitSpeed    = 180f;   // 3 px/frame * 60 fps
    public const int   SpitLife     = 60;

    public GameObject fireSpitPrefab;     // assigned by U5Setup

    int spitCooldown;

    protected override void Awake()
    {
        maxHP           = 15;
        speed           = 0.7f;
        chaseRange      = 200f;
        contactDamage   = 7;
        damageCooldownF = 90;
        size            = 32;
        base.Awake();
        spitCooldown = Random.Range(0, SpitCooldown);
    }

    void Update()
    {
        if (GameState.gameOver) return;
        if (spitCooldown > 0) spitCooldown--;

        var player = Player.Instance;
        if (player == null || fireSpitPrefab == null) return;

        Vector2 to = (Vector2)player.transform.position - (Vector2)transform.position;
        float dist = to.magnitude;

        if (spitCooldown <= 0 && dist < SpitRange && dist > 40f)
        {
            Vector2 dir = to / dist;
            var go = Instantiate(fireSpitPrefab);
            var proj = go.GetComponent<EnemyProjectile>();
            proj.Init(
                origin:     (Vector2)transform.position + dir * 18f,
                velocity:   dir * SpitSpeed,
                damage:     SpitDamage,
                size:       8f,
                lifeFrames: SpitLife,
                color:      new Color(1f, 0.4f, 0.15f));
            spitCooldown = SpitCooldown;
        }
    }
}
