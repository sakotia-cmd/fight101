// Inventory.cs — owned weapons / elements, equipped slot, hamburgers,
// kill counter + drop-on-kill.
//
// Holds runtime mutable state corresponding to playerWeapons + inventory
// + totalKills from the JS files. Subscribes to GameEvents.EnemyKilled to
// drop coins + hamburgers, matching weapons.js's behavior on melee kill.

using UnityEngine;

public class Inventory : MonoBehaviour
{
    public const int MaxHamburgers = 10;
    public const int HamburgerHeal = 25;

    public static Inventory Instance { get; private set; }

    public GameObject coinPrefab;       // assigned by U4Setup
    public GameObject hamburgerPrefab;

    // Per-weapon ownership + currently-equipped element.
    public bool[] ownedWeapons = new bool[4]   { true, false, false, false };
    public ElementKind[] equippedElement = new ElementKind[4]
        { ElementKind.Wood, ElementKind.Wood, ElementKind.Wood, ElementKind.Wood };
    // Which elements has the player ever purchased? Used by the shop to
    // gate per-weapon element application.
    public bool[] ownedElements = new bool[6]
        { true, false, false, false, false, false };  // Wood is free
    public WeaponKind equipped = WeaponKind.Sword;

    public int hamburgers = 0;

    // Shop one-time-purchase flags (mirrors boughtWoodSword + boughtHealthUp
    // from shop.js).
    public bool boughtWoodSword = false;
    public bool boughtHealthUp  = false;

    // Furniture / awards / trophies the player owns. For U5 this just tracks
    // by name; U6 (hideout decorate mode) consumes the list to render
    // placed decorations.
    [System.NonSerialized]
    public System.Collections.Generic.List<string> ownedDecorations
        = new System.Collections.Generic.List<string>();

    void Awake()
    {
        Instance = this;
        GameEvents.EnemyKilled   += OnEnemyKilled;
        GameEvents.GameRestarted += OnRestart;
    }

    void OnDestroy()
    {
        GameEvents.EnemyKilled   -= OnEnemyKilled;
        GameEvents.GameRestarted -= OnRestart;
    }

    void Update()
    {
        // 1-4 cycle weapons. Empty slots are skipped.
        if (PlayerInput.Slot1Pressed()) TryEquip(WeaponKind.Sword);
        if (PlayerInput.Slot2Pressed()) TryEquip(WeaponKind.Bow);
        if (Input.GetKeyDown(KeyCode.Alpha3)) TryEquip(WeaponKind.Gun);
        if (Input.GetKeyDown(KeyCode.Alpha4)) TryEquip(WeaponKind.Taser);

        // H eats a hamburger. Mirrors the JS H-key behavior.
        if (PlayerInput.EatPressed()) EatHamburger();

        // M = money cheat. Mirrors the JS M-key cheat.
        if (PlayerInput.MoneyCheatPressed()) GameState.playerCoins = 999999;
    }

    void TryEquip(WeaponKind w)
    {
        if (ownedWeapons[(int)w]) equipped = w;
    }

    public int CurrentDamage()
    {
        int dmg = WeaponData.Damage(equipped, equippedElement[(int)equipped]);
        // The "Wood Sword" shop upgrade adds +1 to sword damage only.
        if (equipped == WeaponKind.Sword && boughtWoodSword) dmg += 1;
        return dmg;
    }
    public ref WeaponData.WeaponType CurrentWeapon =>
        ref WeaponData.Weapons[(int)equipped];
    public ref WeaponData.Element CurrentElement =>
        ref WeaponData.Elements[(int)equippedElement[(int)equipped]];

    void OnEnemyKilled(Vector2 pos)
    {
        GameState.totalKills++;

        // 1-3 coins scattered in a 30-unit radius.
        int coinCount = 1 + Random.Range(0, 3);
        for (int i = 0; i < coinCount; i++)
        {
            Vector2 offset = new Vector2(Random.Range(-15f, 15f), Random.Range(-15f, 15f));
            if (coinPrefab != null) Instantiate(coinPrefab, pos + offset, Quaternion.identity);
        }

        // 30% chance for a hamburger.
        if (Random.value < 0.3f && hamburgerPrefab != null)
            Instantiate(hamburgerPrefab, pos, Quaternion.identity);
    }

    void EatHamburger()
    {
        if (GameState.gameOver || hamburgers <= 0) return;
        if (GameState.playerHP >= GameState.playerMaxHP) return;
        hamburgers--;
        GameState.playerHP = Mathf.Min(GameState.playerHP + HamburgerHeal,
                                       GameState.playerMaxHP);
    }

    public void PickupHamburger()
    {
        if (hamburgers < MaxHamburgers) hamburgers++;
    }

    void OnRestart()
    {
        hamburgers = 0;
        // ownedWeapons, equippedElement, equipped persist across restart
        // (matches restartGame() behavior — only transient state resets).
    }
}
