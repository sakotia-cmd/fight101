// EnemyProjectile.cs — generic projectile spawned by enemies. Used by
// Lizard's fire spit for now; future bosses (banana, fireball, hammer)
// will reuse the same template.
//
// Hits the player → deals damage + applies an element status if set.
// Hits a building → despawns.
// Lifetime in frames (60 fps).

using UnityEngine;

[RequireComponent(typeof(Rigidbody2D))]
[RequireComponent(typeof(SpriteRenderer))]
[RequireComponent(typeof(CircleCollider2D))]
public class EnemyProjectile : MonoBehaviour
{
    int   damage;
    int   framesRemaining;
    bool  applyBurn;
    int   burnFramesOnHit;

    Rigidbody2D rb;

    public void Init(Vector2 origin, Vector2 velocity, int damage,
                     float size, int lifeFrames, Color color,
                     bool applyBurn = false, int burnFramesOnHit = 0)
    {
        rb = GetComponent<Rigidbody2D>();
        var col = GetComponent<CircleCollider2D>();
        var sr  = GetComponent<SpriteRenderer>();

        transform.position = origin;
        transform.localScale = new Vector3(size, size, 1f);
        rb.bodyType = RigidbodyType2D.Kinematic;
        rb.gravityScale = 0f;
        rb.useFullKinematicContacts = true;
        rb.linearVelocity = velocity;

        col.isTrigger = true;
        col.radius = 0.5f;

        sr.color = color;
        sr.sortingOrder = 170;

        float angle = Mathf.Atan2(velocity.y, velocity.x) * Mathf.Rad2Deg;
        transform.rotation = Quaternion.AngleAxis(angle, Vector3.forward);

        this.damage = damage;
        this.framesRemaining = lifeFrames;
        this.applyBurn = applyBurn;
        this.burnFramesOnHit = burnFramesOnHit;
    }

    void Update()
    {
        framesRemaining--;
        if (framesRemaining <= 0) Destroy(gameObject);
    }

    void OnTriggerEnter2D(Collider2D other)
    {
        if (other.GetComponent<Building>() != null) { Destroy(gameObject); return; }

        if (other.GetComponent<Player>() != null)
        {
            GameEvents.RaisePlayerHurt(damage);
            // Optional burn-on-hit (defer player burn DoT to a polish pass;
            // for now we just damage and despawn).
            Destroy(gameObject);
        }
    }
}
