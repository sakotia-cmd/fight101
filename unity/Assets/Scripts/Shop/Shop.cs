// Shop.cs — 18 shop items + the purchase logic.
//
// Direct port of shopItems + buySelectedItem from shop.js. Each item
// describes itself enough to render in the UI (name, price, description)
// and what to do on purchase (an action enum).
//
// State (selected index, transient message) lives here too. ShopUI just
// reads it and renders.

using UnityEngine;

public enum ShopAction
{
    Hamburger, WoodSword, HealthUp,
    BuyBow, BuyGun, BuyTaser,
    ElemWater, ElemFire, ElemBlueFire, ElemThunder, ElemMega,
    FurniChair, FurniPlant, FurniRug, FurniCouch, FurniTV, FurniNeon, FurniArcade,
}

public class Shop : MonoBehaviour
{
    public static Shop Instance { get; private set; }

    public struct Item
    {
        public string name;
        public int    price;
        public string desc;
        public ShopAction action;
    }

    public static readonly Item[] Items = new[]
    {
        new Item { name = "Hamburger",       price = 5,    desc = "Heals 25 HP",           action = ShopAction.Hamburger },
        new Item { name = "Wood Sword",      price = 20,   desc = "+1 sword damage",       action = ShopAction.WoodSword },
        new Item { name = "Health Upgrade",  price = 50,   desc = "+25 max HP",            action = ShopAction.HealthUp },
        new Item { name = "Wood Bow",        price = 30,   desc = "Ranged arrows",         action = ShopAction.BuyBow },
        new Item { name = "Basic Gun",       price = 60,   desc = "Fast projectiles",      action = ShopAction.BuyGun },
        new Item { name = "Basic Taser",     price = 80,   desc = "Stuns enemies",         action = ShopAction.BuyTaser },
        new Item { name = "Water Element",   price = 100,  desc = "Slows enemies",         action = ShopAction.ElemWater },
        new Item { name = "Fire Element",    price = 100,  desc = "Burns over time",       action = ShopAction.ElemFire },
        new Item { name = "Blue Fire",       price = 200,  desc = "Stronger burn",         action = ShopAction.ElemBlueFire },
        new Item { name = "Thunder",         price = 300,  desc = "Strikes nearby foes",   action = ShopAction.ElemThunder },
        new Item { name = "Mega Element",    price = 1000, desc = "Lightning! 2x damage",  action = ShopAction.ElemMega },
        new Item { name = "Chair",           price = 10,   desc = "Furniture for hideout", action = ShopAction.FurniChair },
        new Item { name = "Plant",           price = 15,   desc = "A nice plant",          action = ShopAction.FurniPlant },
        new Item { name = "Rug",             price = 25,   desc = "A cozy rug",            action = ShopAction.FurniRug },
        new Item { name = "Couch",           price = 30,   desc = "Comfy seating",         action = ShopAction.FurniCouch },
        new Item { name = "TV",              price = 50,   desc = "Big screen TV",         action = ShopAction.FurniTV },
        new Item { name = "Neon Sign",       price = 75,   desc = "Glowing neon light",    action = ShopAction.FurniNeon },
        new Item { name = "Arcade Cabinet",  price = 200,  desc = "Classic arcade game",   action = ShopAction.FurniArcade },
    };

    public bool   isOpen;
    public int    selectedIndex;
    public string message;
    public int    messageFrames;

    void Awake() { Instance = this; }

    public void Open()
    {
        isOpen = true;
        selectedIndex = 0;
        message = "";
        messageFrames = 0;
    }

    public void Close() { isOpen = false; }

    public void Move(int dy)
    {
        selectedIndex = (selectedIndex + dy + Items.Length) % Items.Length;
    }

    public void BuySelected()
    {
        var inv = Inventory.Instance;
        if (inv == null) return;
        if (selectedIndex < 0 || selectedIndex >= Items.Length) return;
        var item = Items[selectedIndex];

        if (GameState.playerCoins < item.price)
        {
            Show("Not enough coins!");
            return;
        }

        switch (item.action)
        {
            case ShopAction.Hamburger:
                if (inv.hamburgers >= Inventory.MaxHamburgers) { Show("Inventory full!"); return; }
                GameState.playerCoins -= item.price;
                inv.PickupHamburger();
                Show("Bought a hamburger!");
                break;

            case ShopAction.WoodSword:
                if (inv.boughtWoodSword) { Show("Already owned!"); return; }
                GameState.playerCoins -= item.price;
                inv.boughtWoodSword = true;
                Show("Wood Sword! +1 damage!");
                break;

            case ShopAction.HealthUp:
                if (inv.boughtHealthUp) { Show("Already owned!"); return; }
                GameState.playerCoins -= item.price;
                inv.boughtHealthUp = true;
                GameState.playerMaxHP += 25;
                GameState.playerHP    += 25;
                Show($"Max HP is now {GameState.playerMaxHP}!");
                break;

            case ShopAction.BuyBow:    BuyWeapon(item.price, WeaponKind.Bow,   "Bow",   "2"); break;
            case ShopAction.BuyGun:    BuyWeapon(item.price, WeaponKind.Gun,   "Gun",   "3"); break;
            case ShopAction.BuyTaser:  BuyWeapon(item.price, WeaponKind.Taser, "Taser", "4"); break;

            case ShopAction.ElemWater:     ApplyElement(item.price, ElementKind.Water);     break;
            case ShopAction.ElemFire:      ApplyElement(item.price, ElementKind.Fire);      break;
            case ShopAction.ElemBlueFire:  ApplyElement(item.price, ElementKind.BlueFire);  break;
            case ShopAction.ElemThunder:   ApplyElement(item.price, ElementKind.Thunder);   break;
            case ShopAction.ElemMega:      ApplyElement(item.price, ElementKind.Mega);      break;

            case ShopAction.FurniChair:   BuyFurni(item.price, "Chair");          break;
            case ShopAction.FurniPlant:   BuyFurni(item.price, "Plant");          break;
            case ShopAction.FurniRug:     BuyFurni(item.price, "Rug");            break;
            case ShopAction.FurniCouch:   BuyFurni(item.price, "Couch");          break;
            case ShopAction.FurniTV:      BuyFurni(item.price, "TV");             break;
            case ShopAction.FurniNeon:    BuyFurni(item.price, "Neon Sign");      break;
            case ShopAction.FurniArcade:  BuyFurni(item.price, "Arcade Cabinet"); break;
        }
    }

    void BuyWeapon(int price, WeaponKind w, string label, string slot)
    {
        var inv = Inventory.Instance;
        if (inv.ownedWeapons[(int)w]) { Show("Already owned!"); return; }
        GameState.playerCoins -= price;
        inv.ownedWeapons[(int)w] = true;
        Show($"Got the {label}! Press {slot}");
    }

    void ApplyElement(int price, ElementKind e)
    {
        var inv = Inventory.Instance;
        if (inv.equippedElement[(int)inv.equipped] == e) { Show("Already applied!"); return; }
        GameState.playerCoins -= price;
        inv.equippedElement[(int)inv.equipped] = e;
        inv.ownedElements[(int)e] = true;
        Show($"{WeaponData.Elements[(int)e].name} applied!");
    }

    void BuyFurni(int price, string name)
    {
        var inv = Inventory.Instance;
        GameState.playerCoins -= price;
        inv.ownedDecorations.Add(name);
        Show($"Got {name}! Place it in your hideout (T)");
    }

    void Show(string m)
    {
        message = m;
        messageFrames = 120;
    }

    void Update()
    {
        if (messageFrames > 0) messageFrames--;
    }

    public static bool IsOwned(int index)
    {
        var inv = Inventory.Instance;
        if (inv == null) return false;
        switch (Items[index].action)
        {
            case ShopAction.WoodSword: return inv.boughtWoodSword;
            case ShopAction.HealthUp:  return inv.boughtHealthUp;
            case ShopAction.BuyBow:    return inv.ownedWeapons[(int)WeaponKind.Bow];
            case ShopAction.BuyGun:    return inv.ownedWeapons[(int)WeaponKind.Gun];
            case ShopAction.BuyTaser:  return inv.ownedWeapons[(int)WeaponKind.Taser];
            default: return false;
        }
    }
}
