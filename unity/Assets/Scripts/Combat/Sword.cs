// Sword.cs — the visible sword swing.
//
// The visual is a 3-part composite (grip / crossguard / blade) parented to a
// pivot at the player center. The pivot rotates through the swing arc; each
// part has a +X offset so the whole sword orbits with it. A TrailRenderer
// at the blade tip traces a coloured arc, tinted by the current element.
//
// No collider — Combat.cs owns hit detection.

using UnityEngine;

public class Sword : MonoBehaviour
{
    public Combat combat;             // assigned by U3Setup
    public SpriteRenderer blade;      // outer silver bar
    public SpriteRenderer crossguard; // dark-gray crosspiece
    public SpriteRenderer grip;       // brown handle
    public TrailRenderer  trail;      // swing arc

    float startAngle;                 // radians, set when swing begins

    void Awake()
    {
        if (blade == null) blade = transform.Find("Blade")?.GetComponent<SpriteRenderer>();
        if (crossguard == null) crossguard = transform.Find("Crossguard")?.GetComponent<SpriteRenderer>();
        if (grip == null) grip = transform.Find("Grip")?.GetComponent<SpriteRenderer>();
        if (trail == null) trail = GetComponentInChildren<TrailRenderer>(true);
        Hide();
    }

    public void Show(float swordAngle)
    {
        float arc = combat != null ? combat.SwordArcCurrent : Mathf.PI * 0.9f;
        startAngle = swordAngle - arc * 0.5f;

        if (blade != null)      blade.enabled = true;
        if (crossguard != null) crossguard.enabled = true;
        if (grip != null)       grip.enabled = true;

        // Trail colour from the currently-equipped element.
        if (trail != null)
        {
            Color c = Color.white;
            if (Inventory.Instance != null)
            {
                int eIdx = (int)Inventory.Instance.equippedElement[(int)Inventory.Instance.equipped];
                c = WeaponData.Elements[eIdx].projColor;
            }
            trail.startColor = c;
            trail.endColor = new Color(c.r, c.g, c.b, 0f);
            trail.Clear();
            trail.enabled = true;
            trail.emitting = true;
        }
    }

    public void Hide()
    {
        if (blade != null)      blade.enabled = false;
        if (crossguard != null) crossguard.enabled = false;
        if (grip != null)       grip.enabled = false;
        // Stop emitting but leave the trail enabled so the existing points
        // fade out naturally over `trail.time`. The next Show() Clear()s
        // the trail before re-emitting.
        if (trail != null) trail.emitting = false;
    }

    void LateUpdate()
    {
        if (combat == null || !combat.IsSwinging)
        {
            // Don't double-hide each frame once already hidden.
            if (blade != null && blade.enabled) Hide();
            return;
        }

        // Rotate the Sword GO (positioned at the player center). The child
        // sprites are offset along +X so the whole sword orbits.
        float currentAngle = startAngle + combat.SwordArcCurrent * combat.SwingProgress;
        transform.localRotation = Quaternion.AngleAxis(currentAngle * Mathf.Rad2Deg, Vector3.forward);
    }
}
