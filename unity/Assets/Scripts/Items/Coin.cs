// Coin.cs — pickup item that increments playerCoins by 1 on touch.
// Bobs slightly via a sine wave in LateUpdate for a coin-feel.

using UnityEngine;

[RequireComponent(typeof(SpriteRenderer))]
[RequireComponent(typeof(CircleCollider2D))]
public class Coin : MonoBehaviour
{
    Vector3 basePos;
    float t;

    void Awake()
    {
        transform.localScale = new Vector3(12f, 12f, 1f);

        var col = GetComponent<CircleCollider2D>();
        col.isTrigger = true;
        col.radius = 0.5f;

        var sr = GetComponent<SpriteRenderer>();
        sr.color = new Color(1f, 0.84f, 0f);   // gold
        sr.sortingOrder = 55;

        basePos = transform.position;
        t = Random.value * Mathf.PI * 2f;
    }

    void Start() { basePos = transform.position; }

    void LateUpdate()
    {
        t += Time.deltaTime;
        var p = basePos;
        p.y += Mathf.Sin(t * 5f) * 1.5f;
        transform.position = p;
    }

    void OnTriggerEnter2D(Collider2D other)
    {
        if (other.GetComponent<Player>() == null) return;
        GameState.playerCoins++;
        Destroy(gameObject);
    }
}
