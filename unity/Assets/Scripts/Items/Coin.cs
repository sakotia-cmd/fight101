// Coin.cs — pickup item that increments playerCoins by 1 on touch.
// Bobs slightly via a sine wave and "spins" by ping-ponging its X scale,
// faking a coin rotating about its vertical axis. A small sparkle child
// fades in and out so the coin reads as shiny.

using UnityEngine;

[RequireComponent(typeof(SpriteRenderer))]
[RequireComponent(typeof(CircleCollider2D))]
public class Coin : MonoBehaviour
{
    const float BaseSize = 12f;   // world units of the coin's full footprint

    Vector3 basePos;
    float t;

    SpriteRenderer sparkle;
    float sparkleOffset;

    void Awake()
    {
        transform.localScale = new Vector3(BaseSize, BaseSize, 1f);

        var col = GetComponent<CircleCollider2D>();
        col.isTrigger = true;
        col.radius = 0.5f;

        var sr = GetComponent<SpriteRenderer>();
        sr.color = new Color(1f, 0.84f, 0f);   // gold
        sr.sortingOrder = 55;

        // The Sparkle child (if present, added by U4Setup) twinkles via
        // alpha ping-pong. Cache it to avoid per-frame Find().
        var sparkleT = transform.Find("Sparkle");
        if (sparkleT != null) sparkle = sparkleT.GetComponent<SpriteRenderer>();
        sparkleOffset = Random.value;

        basePos = transform.position;
        t = Random.value * Mathf.PI * 2f;
    }

    void Start() { basePos = transform.position; }

    void LateUpdate()
    {
        t += Time.deltaTime;

        // Vertical bob.
        var p = basePos;
        p.y += Mathf.Sin(t * 5f) * 1.5f;
        transform.position = p;

        // Spin: X-scale ping-pongs between 0.2 and 1.0 over ~0.8s so the
        // coin reads as rotating about its vertical axis.
        float spin = Mathf.Lerp(0.2f, 1f, Mathf.PingPong(t * 1.5f, 1f));
        transform.localScale = new Vector3(spin * BaseSize, BaseSize, 1f);

        // Sparkle twinkle — alpha goes 0 → 1 → 0 roughly once per second.
        if (sparkle != null)
        {
            float a = Mathf.PingPong((t + sparkleOffset) * 2f, 1f);
            var c = sparkle.color;
            c.a = a;
            sparkle.color = c;
        }
    }

    void OnTriggerEnter2D(Collider2D other)
    {
        if (other.GetComponent<Player>() == null) return;
        GameState.playerCoins++;
        Destroy(gameObject);
    }
}
