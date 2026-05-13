// Building.cs — one storefront in the city.
//
// All the visual interest lives in the SpriteRenderer's color (the wall
// color of its palette). For top-down depth: things lower on the screen
// should draw on top, so sortingOrder is set from -y. The original JS code
// did `buildings.sort(function (a, b) { return a.y - b.y; })` and drew in
// order; we do the same effect via per-frame-free static sorting.

using UnityEngine;

// Marker component. Building visuals live on child GameObjects (Roof,
// Facade, EastWall, Sign, Door). WorldBuilder sets their sortingOrders
// directly at spawn time so this component doesn't need to do anything
// at runtime.
public class Building : MonoBehaviour
{
}
