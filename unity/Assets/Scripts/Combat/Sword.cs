// Sword.cs — the visible sword swing.
//
// The visual is a thin colored bar (the blade) that rotates from the start
// of the arc to the end over SwingDuration frames. No collider — Combat.cs
// owns hit detection.
//
// Lives as a child of the player so it inherits position. We just rotate
// the transform each Update based on the swing progress.

using UnityEngine;

public class Sword : MonoBehaviour
{
    public Combat combat;          // assigned by U3Setup
    public SpriteRenderer blade;   // child SpriteRenderer, also assigned by U3Setup

    float startAngle;              // radians, set when swing begins

    void Awake()
    {
        if (blade == null) blade = GetComponentInChildren<SpriteRenderer>();
        Hide();
    }

    public void Show(float swordAngle)
    {
        float arc = combat != null ? combat.SwordArcCurrent : Mathf.PI * 0.9f;
        startAngle = swordAngle - arc * 0.5f;
        if (blade != null) blade.enabled = true;
    }

    public void Hide()
    {
        if (blade != null) blade.enabled = false;
    }

    void LateUpdate()
    {
        if (blade == null || !blade.enabled) return;
        if (combat == null || !combat.IsSwinging) { Hide(); return; }

        // Rotate the Sword GO (positioned at the player center). The blade
        // child is offset along +X so it orbits the player as we rotate.
        float currentAngle = startAngle + combat.SwordArcCurrent * combat.SwingProgress;
        transform.localRotation = Quaternion.AngleAxis(currentAngle * Mathf.Rad2Deg, Vector3.forward);

        blade.sortingOrder = 200;   // always on top of buildings/enemies
    }
}
