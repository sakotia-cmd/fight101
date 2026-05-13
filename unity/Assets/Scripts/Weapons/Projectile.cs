// Projectile.cs — bow arrow / gun bullet. Travels in a straight line for
// projLife frames or until it hits an enemy or a building.
//
// Spawned by Combat.cs's ranged-attack path with all per-projectile values
// (velocity, damage, element, life) set via Init() at creation time.
//
// One sprite for all weapon+element combinations: the SpriteRenderer's
// color is set from the element's projColor.

using UnityEngine;

[RequireComponent(typeof(Rigidbody2D))]
[RequireComponent(typeof(SpriteRenderer))]
[RequireComponent(typeof(CircleCollider2D))]
public class Projectile : MonoBehaviour
{
    int damage;
    ElementKind element;
    int framesRemaining;

    Rigidbody2D rb;
    CircleCollider2D col;

    public void Init(Vector2 origin, Vector2 velocity, int damage,
                     ElementKind element, float size, int lifeFrames, Color color)
    {
        rb = GetComponent<Rigidbody2D>();
        col = GetComponent<CircleCollider2D>();

        transform.position = origin;
        transform.localScale = new Vector3(size, size, 1f);
        rb.bodyType = RigidbodyType2D.Kinematic;
        rb.gravityScale = 0f;
        rb.useFullKinematicContacts = true;
        rb.linearVelocity = velocity;

        col.isTrigger = true;
        col.radius = 0.5f;

        // Root SpriteRenderer is disabled (the visible art lives in
        // composite children — Shaft / Head / Fletch — built in U4Setup).
        // Tint every child sprite so the whole arrow takes the element
        // colour passed in.
        var children = GetComponentsInChildren<SpriteRenderer>(includeInactive: true);
        foreach (var childSr in children)
        {
            if (childSr.gameObject == gameObject) continue;   // skip root
            childSr.color = color;
            childSr.sortingOrder = 180;
        }

        // Aim the sprite forward.
        float angle = Mathf.Atan2(velocity.y, velocity.x) * Mathf.Rad2Deg;
        transform.rotation = Quaternion.AngleAxis(angle, Vector3.forward);

        this.damage = damage;
        this.element = element;
        this.framesRemaining = lifeFrames;
    }

    void Update()
    {
        framesRemaining--;
        if (framesRemaining <= 0) Destroy(gameObject);
    }

    void OnTriggerEnter2D(Collider2D other)
    {
        // Hit a building → stop.
        var bld = other.GetComponent<Building>();
        if (bld != null) { Destroy(gameObject); return; }

        // Hit an enemy → damage + element effect, then despawn.
        var enemy = other.GetComponent<Enemy>();
        if (enemy != null)
        {
            enemy.TakeDamage(damage, (Vector2)transform.position - rb.linearVelocity.normalized);
            enemy.ApplyElement(element);
            Destroy(gameObject);
            return;
        }
    }
}
