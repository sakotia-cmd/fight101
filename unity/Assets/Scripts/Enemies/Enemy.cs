// Enemy.cs — base behavior shared by Monkey and Lizard.
//
// Same vibe as enemy.js: wander randomly, chase the player when within
// range, deal contact damage on touch. Building collision is checked
// manually via Physics2D.OverlapBox each FixedUpdate (the JS code did the
// same with collidesWithAnything()).
//
// The collider is a TRIGGER so enemies don't physically push the player
// or each other — matches the JS feel. Damage detection runs in
// OnTriggerStay2D with a cooldown.
//
// Die() raises GameEvents.EnemyKilled before Destroy(gameObject), so any
// listener (drops, awards) sees the kill while the GameObject is still
// alive. No splice-ordering trap.

using System.Collections;
using UnityEngine;

[RequireComponent(typeof(Rigidbody2D))]
[RequireComponent(typeof(BoxCollider2D))]
[RequireComponent(typeof(SpriteRenderer))]
public class Enemy : MonoBehaviour
{
    [Header("Stats (set by subclass)")]
    public int   maxHP            = 8;
    public float speed            = 1.0f;   // px/frame in JS, scaled to units/sec
    public float chaseRange       = 150f;
    public int   contactDamage    = 5;
    public int   damageCooldownF  = 90;
    public int   size             = 28;

    protected int   hp;
    int             damageCooldown;
    int             wanderTimer;
    float           wanderAngle;
    Rigidbody2D     rb;
    SpriteRenderer  sr;
    BoxCollider2D   buildingProbeCollider;

    // Element status effects (mirrors slowTimer / burnTimer / stunTimer
    // on the JS enemy objects). All counted in frames at 60 fps.
    int   slowFrames;
    int   burnFrames;
    float burnDot;       // per 30-frame tick
    int   stunFrames;

    // Cache the building layer mask. Default layer (0) is what we put
    // buildings on; the player is also on Default but is a trigger source,
    // so OverlapBox will hit buildings but not the player's solid collider.
    // (Actually the player is a solid Kinematic collider on Default too —
    // we filter by "is it a Building component" below.)
    static readonly ContactFilter2D BuildingFilter = new ContactFilter2D
    {
        useTriggers = false,
        useLayerMask = true,
        layerMask = 1, // Default layer only
    };

    protected virtual void Awake()
    {
        rb = GetComponent<Rigidbody2D>();
        sr = GetComponent<SpriteRenderer>();
        buildingProbeCollider = GetComponent<BoxCollider2D>();
        buildingProbeCollider.isTrigger = true;

        rb.bodyType = RigidbodyType2D.Kinematic;
        rb.gravityScale = 0f;
        rb.useFullKinematicContacts = true;  // so OnTrigger fires vs the player

        hp = maxHP;
        wanderAngle = Random.value * Mathf.PI * 2f;
        wanderTimer = Random.Range(60, 180);
    }

    void FixedUpdate()
    {
        if (GameState.gameOver) return;

        if (damageCooldown > 0) damageCooldown--;

        // Status effects tick down. Burn ticks damage every 30 frames.
        if (slowFrames > 0) slowFrames--;
        if (stunFrames > 0) stunFrames--;
        if (burnFrames > 0)
        {
            burnFrames--;
            if (burnFrames % 30 == 0)
            {
                hp -= Mathf.CeilToInt(burnDot);
                if (hp <= 0) { Die(); return; }
            }
        }

        // Stunned enemies don't move.
        if (stunFrames > 0) return;

        var player = Player.Instance;
        if (player == null) return;

        Vector2 toPlayer = (Vector2)player.transform.position - rb.position;
        float distance  = toPlayer.magnitude;

        // Slow effect: 40% speed for the duration.
        float speedMult = slowFrames > 0 ? 0.4f : 1f;

        // JS speeds are "px/frame at 60fps" → multiply by 60 to get units/sec.
        const float JS_FPS = 60f;
        Vector2 step;

        if (distance < chaseRange && distance > 0.001f)
        {
            Vector2 dir = toPlayer / distance;
            step = dir * speed * 1.2f * speedMult * JS_FPS * Time.fixedDeltaTime;
        }
        else
        {
            wanderTimer--;
            if (wanderTimer <= 0)
            {
                wanderAngle = Random.value * Mathf.PI * 2f;
                wanderTimer = Random.Range(60, 180);
            }
            step = new Vector2(Mathf.Cos(wanderAngle), Mathf.Sin(wanderAngle))
                 * speed * 0.5f * speedMult * JS_FPS * Time.fixedDeltaTime;
        }

        // Try moving X and Y separately so we slide along walls.
        Vector2 next = rb.position + new Vector2(step.x, 0f);
        if (OverlapsBuilding(next)) wanderAngle = Random.value * Mathf.PI * 2f;
        else rb.position = next;

        next = rb.position + new Vector2(0f, step.y);
        if (OverlapsBuilding(next)) wanderAngle = Random.value * Mathf.PI * 2f;
        else rb.position = next;

        // World-bound clamp.
        float half = size * 0.5f;
        rb.position = new Vector2(
            Mathf.Clamp(rb.position.x, half, GameState.WorldWidth - half),
            Mathf.Clamp(rb.position.y, -(GameState.WorldHeight - half), -half));
    }

    bool OverlapsBuilding(Vector2 pos)
    {
        var hits = new Collider2D[8];
        int n = Physics2D.OverlapBox(pos, new Vector2(size, size), 0f, BuildingFilter, hits);
        for (int i = 0; i < n; i++)
        {
            if (hits[i] != null && hits[i].GetComponent<Building>() != null) return true;
        }
        return false;
    }

    void LateUpdate()
    {
        sr.sortingOrder = -Mathf.RoundToInt(sr.bounds.min.y);
    }

    void OnTriggerStay2D(Collider2D other)
    {
        if (damageCooldown > 0 || GameState.gameOver) return;
        if (other.GetComponent<Player>() == null) return;
        GameEvents.RaisePlayerHurt(contactDamage);
        damageCooldown = damageCooldownF;
    }

    public void ApplyElement(ElementKind kind)
    {
        var e = WeaponData.Elements[(int)kind];
        switch (e.effect)
        {
            case ElementEffectKind.Slow:
                slowFrames = e.duration;
                break;
            case ElementEffectKind.Burn:
                burnFrames = e.duration;
                burnDot = e.dot;
                break;
            case ElementEffectKind.Lightning:
                // Chain to enemies within 100 units: 1 damage + 30-frame stun.
                foreach (var other in Object.FindObjectsByType<Enemy>(FindObjectsSortMode.None))
                {
                    if (other == this) continue;
                    if (((Vector2)other.transform.position
                         - (Vector2)transform.position).sqrMagnitude < 100f * 100f)
                    {
                        other.hp -= 1;
                        other.stunFrames = 30;
                        if (other.hp <= 0) other.Die();
                    }
                }
                break;
            // Aoe is handled by the melee swing in Combat.cs, not on the
            // individual enemy.
        }
    }

    public void ApplyStun(int frames)
    {
        if (frames > stunFrames) stunFrames = frames;
    }

    public void TakeDamage(int amount, Vector2 hitFrom)
    {
        hp -= amount;
        StartCoroutine(HitFlash());

        // Knockback — push away from the hit source by 15 units (matches JS).
        Vector2 away = ((Vector2)transform.position - hitFrom);
        if (away.sqrMagnitude > 0.001f)
        {
            Vector2 push = away.normalized * 15f;
            Vector2 attempt = rb.position + push;
            if (!OverlapsBuilding(attempt)) rb.position = attempt;
        }

        if (hp <= 0) Die();
    }

    IEnumerator HitFlash()
    {
        Color prev = sr.color;
        sr.color = Color.white;
        yield return new WaitForSeconds(0.08f);
        if (sr != null) sr.color = prev;
    }

    public void Die()
    {
        GameEvents.RaiseEnemyKilled(transform.position);
        // Spawn a quick burst of shards using our own sprite + color so the
        // shards look like bits of the enemy. DeathPoof handles cleanup.
        DeathPoof.Spawn(transform.position, sr.sprite, sr.color);
        Destroy(gameObject);
    }
}
