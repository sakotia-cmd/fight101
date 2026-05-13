// CameraFollow.cs — keeps the camera centered on the player.
//
// Mirrors the camera math at the top of main.js's draw loop: camera is
// centered on player but clamped so we don't show outside the world.
//
// Lives in LateUpdate so the player has finished moving for the frame
// before we reposition the camera (prevents the player's sprite from
// shimmering ahead of/behind the camera by one frame).

using UnityEngine;

[RequireComponent(typeof(Camera))]
public class CameraFollow : MonoBehaviour
{
    public Transform target;          // assigned by U2Setup to the Player
    Camera cam;

    void Awake()
    {
        cam = GetComponent<Camera>();
    }

    void LateUpdate()
    {
        if (target == null) return;

        float halfH = cam.orthographicSize;
        float halfW = halfH * cam.aspect;

        float x = target.position.x;
        float y = target.position.y;

        // Clamp so the camera's visible rect stays inside the world.
        // Unity Y is up; the world occupies Y in [-WorldHeight, 0].
        x = Mathf.Clamp(x, halfW, GameState.WorldWidth - halfW);
        y = Mathf.Clamp(y, -(GameState.WorldHeight - halfH), -halfH);

        transform.position = new Vector3(x, y, transform.position.z);
    }
}
