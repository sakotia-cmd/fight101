// GameEvents.cs — static event bus for cross-system signaling.
//
// Replaces the JS pattern of "everything reads global state directly." Now a
// system raises a named event when something happens, and other systems
// subscribe in OnEnable / unsubscribe in OnDisable.
//
// Why this matters for the recordKill() gotcha from the JS game: in JS you
// had to call recordKill() BEFORE splice() everywhere, or the awards system
// desynced. Here, Enemy.Die() raises GameEvents.EnemyKilled SYNCHRONOUSLY,
// and Destroy(gameObject) runs after. Any listener (Inventory, awards,
// drops) sees the kill before the GameObject is gone. The ordering bug is
// impossible to recreate.

using System;
using UnityEngine;

public static class GameEvents
{
    public static event Action<Vector2> EnemyKilled;
    public static event Action<int>     PlayerHurt;
    public static event Action          PlayerDied;
    public static event Action          GameRestarted;

    public static void RaiseEnemyKilled(Vector2 worldPos) => EnemyKilled?.Invoke(worldPos);
    public static void RaisePlayerHurt(int amount)        => PlayerHurt?.Invoke(amount);
    public static void RaisePlayerDied()                  => PlayerDied?.Invoke();
    public static void RaiseGameRestarted()               => GameRestarted?.Invoke();
}
