// Player.cs — Jay, the main character.
//
// Same role as player.js in the JS game: holds Jay's position, moves him
// based on WASD/arrow keys, keeps him inside the world.
//
// Movement uses a Rigidbody2D set to Body Type = Kinematic. Why kinematic
// and not Dynamic? In U2 we add buildings with Collider2Ds. A Dynamic body
// would bounce/spin on contact; Kinematic only moves where we tell it but
// still gets collision events. Unity's collision response gives us the
// wall-slide behavior for free — the JS code did it manually with two
// separate X/Y collision checks. That code can be deleted.

using UnityEngine;

public enum Facing { Up, Down, Left, Right }

[RequireComponent(typeof(Rigidbody2D))]
[RequireComponent(typeof(BoxCollider2D))]
[RequireComponent(typeof(SpriteRenderer))]
public class Player : MonoBehaviour
{
    public static Player Instance { get; private set; }

    // Last-pressed direction. Used by Combat.cs to aim the sword.
    public Facing facing { get; private set; } = Facing.Down;

    Rigidbody2D rb;
    SpriteRenderer sr;

    // Set in Awake so the player starts where the JS player starts: (400, 400).
    // Remember Y is flipped — JS canvas (400, 400) is Unity world (400, -400).
    static readonly Vector2 StartPosition = new Vector2(400f, -400f);

    void Awake()
    {
        Instance = this;
        rb = GetComponent<Rigidbody2D>();
        sr = GetComponent<SpriteRenderer>();
        rb.bodyType = RigidbodyType2D.Kinematic;
        rb.gravityScale = 0f;
        rb.interpolation = RigidbodyInterpolation2D.Interpolate;
        rb.collisionDetectionMode = CollisionDetectionMode2D.Continuous;
        transform.position = StartPosition;

        GameEvents.GameRestarted += OnGameRestarted;
    }

    void OnDestroy()
    {
        GameEvents.GameRestarted -= OnGameRestarted;
    }

    void OnGameRestarted()
    {
        transform.position = StartPosition;
        facing = Facing.Down;
    }

    void FixedUpdate()
    {
        if (GameState.gameOver || GameState.InputGated) return;

        Vector2 dir = PlayerInput.MoveDirection();

        // Track the last direction the player pressed in, used for the sword
        // swing angle. Prefer horizontal over vertical when both are pressed.
        if      (dir.x >  0.5f) facing = Facing.Right;
        else if (dir.x < -0.5f) facing = Facing.Left;
        else if (dir.y >  0.5f) facing = Facing.Up;
        else if (dir.y < -0.5f) facing = Facing.Down;

        Vector2 step = dir * GameState.PlayerSpeed * Time.fixedDeltaTime;

        // MovePosition respects colliders and lets the physics engine resolve
        // the wall-slide for us. (Internally Unity does roughly the same
        // axis-separated test as collidesWithAnything() in player.js, but
        // tuned for kinematic bodies.)
        Vector2 target = rb.position + step;

        float half = GameState.PlayerSize * 0.5f;
        target.x = Mathf.Clamp(target.x, half, GameState.WorldWidth - half);
        target.y = Mathf.Clamp(target.y, -(GameState.WorldHeight - half), -half);

        rb.MovePosition(target);
    }

    void LateUpdate()
    {
        // Dynamic depth sort: walk in front of buildings whose bottom edge
        // is above us, and behind buildings whose bottom is below ours.
        sr.sortingOrder = -Mathf.RoundToInt(sr.bounds.min.y);
    }
}
