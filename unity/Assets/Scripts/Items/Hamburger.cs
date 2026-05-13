// Hamburger.cs — pickup item. Touching it adds 1 to inventory.hamburgers
// (capped at MaxHamburgers). Eating one (H key) heals 25 HP.

using UnityEngine;

[RequireComponent(typeof(SpriteRenderer))]
[RequireComponent(typeof(CircleCollider2D))]
public class Hamburger : MonoBehaviour
{
    void Awake()
    {
        transform.localScale = new Vector3(18f, 18f, 1f);

        var col = GetComponent<CircleCollider2D>();
        col.isTrigger = true;
        col.radius = 0.5f;

        var sr = GetComponent<SpriteRenderer>();
        sr.sortingOrder = 60;
    }

    void OnTriggerEnter2D(Collider2D other)
    {
        if (other.GetComponent<Player>() == null) return;
        if (Inventory.Instance != null && Inventory.Instance.hamburgers < Inventory.MaxHamburgers)
        {
            Inventory.Instance.PickupHamburger();
            Destroy(gameObject);
        }
    }
}
