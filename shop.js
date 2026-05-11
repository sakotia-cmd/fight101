// shop.js — The shopkeeper and shop menu!

// Is the shop menu open?
let shopOpen = false;

// Which item is selected in the shop menu
let shopSelectedIndex = 0;

// Message shown after buying (or failing to buy)
let shopMessage = "";
let shopMessageTimer = 0;

// Shopkeeper position inside the hideout (top-right area)
const shopkeeper = {
    x: 420,
    y: 60,
    width: 40,
    height: 40
};

// What the shop sells
const shopItems = [
    { name: "Hamburger",      price: 5,    desc: "Heals 25 HP",            action: "hamburger" },
    { name: "Wood Sword",     price: 20,   desc: "+1 sword damage",        action: "woodSword" },
    { name: "Health Upgrade",  price: 50,  desc: "+25 max HP",             action: "healthUp" },
    { name: "Wood Bow",       price: 30,   desc: "Ranged arrows",          action: "buyBow" },
    { name: "Basic Gun",      price: 60,   desc: "Fast projectiles",       action: "buyGun" },
    { name: "Basic Taser",    price: 80,   desc: "Stuns enemies",          action: "buyTaser" },
    { name: "Water Element",  price: 100,  desc: "Slows enemies",          action: "elemWater" },
    { name: "Fire Element",   price: 100,  desc: "Burns over time",        action: "elemFire" },
    { name: "Blue Fire",      price: 200,  desc: "Stronger burn",          action: "elemBlueFire" },
    { name: "Sound Wave",     price: 300,  desc: "AoE damage",             action: "elemSoundWave" },
    { name: "Mega Element",   price: 1000, desc: "Lightning! 2x damage",   action: "elemMega" },
    { name: "Chair",          price: 10,   desc: "Furniture for hideout",  action: "furni_chair" },
    { name: "Plant",          price: 15,   desc: "A nice plant",           action: "furni_plant" },
    { name: "Rug",            price: 25,   desc: "A cozy rug",             action: "furni_rug" },
    { name: "Couch",          price: 30,   desc: "Comfy seating",          action: "furni_couch" },
    { name: "TV",             price: 50,   desc: "Big screen TV",          action: "furni_tv" },
    { name: "Neon Sign",      price: 75,   desc: "Glowing neon light",     action: "furni_neon" },
    { name: "Arcade Cabinet", price: 200,  desc: "Classic arcade game",    action: "furni_arcade" },
];

// Has the player already bought these one-time items?
let boughtWoodSword = false;
let boughtHealthUp = false;

// Try to open the shop (press E near shopkeeper inside hideout)
function tryOpenShop() {
    if (!insideHideout || shopOpen) return false;

    const jayX = hideoutPlayerX;
    const jayY = hideoutPlayerY;
    const dist = Math.sqrt(
        Math.pow(jayX - shopkeeper.x, 2) +
        Math.pow(jayY - shopkeeper.y, 2)
    );

    if (dist < 80) {
        shopOpen = true;
        shopSelectedIndex = 0;
        shopMessage = "";
        shopMessageTimer = 0;
        return true;
    }
    return false;
}

// Close the shop
function closeShop() {
    shopOpen = false;
}

// Buy the currently selected item
function buySelectedItem() {
    const item = shopItems[shopSelectedIndex];
    if (!item) return;

    if (playerCoins < item.price) {
        shopMessage = "Not enough coins!";
        shopMessageTimer = 120;
        return;
    }

    if (item.action === "hamburger") {
        if (inventory.hamburgers >= inventory.maxHamburgers) {
            shopMessage = "Inventory full!";
            shopMessageTimer = 120;
            return;
        }
        playerCoins -= item.price;
        inventory.hamburgers++;
        shopMessage = "Bought a hamburger!";
    } else if (item.action === "woodSword") {
        if (boughtWoodSword) { shopMessage = "Already owned!"; shopMessageTimer = 120; return; }
        playerCoins -= item.price;
        boughtWoodSword = true;
        shopMessage = "Wood Sword! +1 damage!";
    } else if (item.action === "healthUp") {
        if (boughtHealthUp) { shopMessage = "Already owned!"; shopMessageTimer = 120; return; }
        playerCoins -= item.price;
        boughtHealthUp = true;
        playerMaxHP += 25;
        playerHP += 25;
        shopMessage = "Max HP is now " + playerMaxHP + "!";
    } else if (item.action === "buyBow") {
        if (playerWeapons.bow.owned) { shopMessage = "Already owned!"; shopMessageTimer = 120; return; }
        playerCoins -= item.price;
        playerWeapons.bow.owned = true;
        shopMessage = "Got the Bow! Press 2";
    } else if (item.action === "buyGun") {
        if (playerWeapons.gun.owned) { shopMessage = "Already owned!"; shopMessageTimer = 120; return; }
        playerCoins -= item.price;
        playerWeapons.gun.owned = true;
        shopMessage = "Got the Gun! Press 3";
    } else if (item.action === "buyTaser") {
        if (playerWeapons.taser.owned) { shopMessage = "Already owned!"; shopMessageTimer = 120; return; }
        playerCoins -= item.price;
        playerWeapons.taser.owned = true;
        shopMessage = "Got the Taser! Press 4";
    } else if (item.action.startsWith("furni_")) {
        const furniKey = item.action.replace("furni_", "");
        const furniInfo = FURNITURE_CATALOG[furniKey];
        if (furniInfo) {
            playerCoins -= item.price;
            ownedDecorations.push({ type: "furniture", name: furniInfo.name, icon: furniInfo.icon, width: furniInfo.width, height: furniInfo.height });
            shopMessage = "Got " + furniInfo.name + "! Place it in your hideout (T)";
        }
    } else if (item.action.startsWith("elem")) {
        var elemKey = { elemWater: "water", elemFire: "fire", elemBlueFire: "blueFire", elemSoundWave: "soundWave", elemMega: "mega" }[item.action];
        if (playerWeapons[equippedWeapon].element === elemKey) { shopMessage = "Already applied!"; shopMessageTimer = 120; return; }
        playerCoins -= item.price;
        playerWeapons[equippedWeapon].element = elemKey;
        shopMessage = ELEMENTS[elemKey].name + " applied to " + WEAPON_TYPES[equippedWeapon].name + "!";
    }
    shopMessageTimer = 120;
}

// Get current sword damage (base + wood sword bonus)
function getSwordDamage() {
    return SWORD_DAMAGE + (boughtWoodSword ? 1 : 0);
}

// Draw the shopkeeper inside the hideout
function drawShopkeeper(ctx, offsetX, offsetY) {
    const sx = offsetX + shopkeeper.x;
    const sy = offsetY + shopkeeper.y;

    // Counter/table
    ctx.fillStyle = "#6a5a3a";
    ctx.fillRect(sx - 30, sy + 20, 100, 16);
    ctx.strokeStyle = "#4a3a2a";
    ctx.lineWidth = 2;
    ctx.strokeRect(sx - 30, sy + 20, 100, 16);

    // Items on counter
    ctx.fillStyle = "#e8a830";
    ctx.beginPath();
    ctx.arc(sx - 10, sy + 18, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffd700";
    ctx.beginPath();
    ctx.arc(sx + 50, sy + 18, 4, 0, Math.PI * 2);
    ctx.fill();

    // Shopkeeper body — purple robe
    ctx.fillStyle = "#7744aa";
    ctx.beginPath();
    ctx.moveTo(sx + 10, sy + 8);
    ctx.lineTo(sx + 30, sy + 8);
    ctx.lineTo(sx + 32, sy + 22);
    ctx.lineTo(sx + 8, sy + 22);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#553388";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Head
    ctx.fillStyle = "#d4944e";
    ctx.beginPath();
    ctx.arc(sx + 20, sy + 4, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#b07830";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(sx + 20, sy + 4, 10, 0, Math.PI * 2);
    ctx.stroke();

    // Hat — purple merchant hat
    ctx.fillStyle = "#5533aa";
    ctx.beginPath();
    ctx.moveTo(sx + 10, sy + 0);
    ctx.lineTo(sx + 20, sy - 14);
    ctx.lineTo(sx + 30, sy + 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#4422aa";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Hat brim
    ctx.fillStyle = "#6644bb";
    ctx.fillRect(sx + 7, sy - 2, 26, 5);

    // Eyes
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.ellipse(sx + 16, sy + 2, 3, 3.5, 0, 0, Math.PI * 2);
    ctx.ellipse(sx + 24, sy + 2, 3, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath();
    ctx.arc(sx + 16, sy + 3, 1.5, 0, Math.PI * 2);
    ctx.arc(sx + 24, sy + 3, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Friendly smile
    ctx.strokeStyle = "#8a5a30";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(sx + 20, sy + 7, 4, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    // "SHOP" sign above
    ctx.fillStyle = "#ffcc00";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "center";
    ctx.fillText("SHOP", sx + 20, sy - 18);
    ctx.textAlign = "left";

    // "Press E" hint when Jay is close
    const dist = Math.sqrt(
        Math.pow(hideoutPlayerX - shopkeeper.x, 2) +
        Math.pow(hideoutPlayerY - shopkeeper.y, 2)
    );
    if (dist < 80 && !shopOpen) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "center";
        ctx.fillText("Press E to shop", sx + 20, sy + 46);
        ctx.textAlign = "left";
    }
}

// Draw the shop menu overlay
function drawShopMenu(ctx) {
    if (!shopOpen) return;

    const menuW = 360;
    const menuH = 520;
    const menuX = (canvas.width - menuW) / 2;
    const menuY = Math.max(10, (canvas.height - menuH) / 2);

    // Dark overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Menu background
    ctx.fillStyle = "#2a2040";
    ctx.fillRect(menuX, menuY, menuW, menuH);
    ctx.strokeStyle = "#ffcc00";
    ctx.lineWidth = 3;
    ctx.strokeRect(menuX, menuY, menuW, menuH);

    // Title
    ctx.fillStyle = "#ffcc00";
    ctx.font = "bold 20px monospace";
    ctx.textAlign = "center";
    ctx.fillText("SHOP", menuX + menuW / 2, menuY + 30);

    // Coin count
    ctx.fillStyle = "#ffd700";
    ctx.font = "bold 14px monospace";
    ctx.fillText("Your coins: " + playerCoins, menuX + menuW / 2, menuY + 52);
    ctx.textAlign = "left";

    // Item list
    const itemStartY = menuY + 75;
    const itemH = 42;

    for (let i = 0; i < shopItems.length; i++) {
        const item = shopItems[i];
        const iy = itemStartY + i * itemH;
        const selected = (i === shopSelectedIndex);

        // Highlight selected item
        if (selected) {
            ctx.fillStyle = "rgba(255, 204, 0, 0.15)";
            ctx.fillRect(menuX + 10, iy - 2, menuW - 20, itemH - 4);
            ctx.strokeStyle = "#ffcc00";
            ctx.lineWidth = 2;
            ctx.strokeRect(menuX + 10, iy - 2, menuW - 20, itemH - 4);
        }

        // Item name
        ctx.fillStyle = selected ? "#ffcc00" : "#cccccc";
        ctx.font = "bold 14px monospace";
        ctx.fillText(item.name, menuX + 20, iy + 14);

        // Price
        ctx.fillStyle = playerCoins >= item.price ? "#ffd700" : "#ff4444";
        ctx.font = "12px monospace";
        ctx.fillText(item.price + " coins", menuX + 20, iy + 30);

        // Description
        ctx.fillStyle = "#8888aa";
        ctx.font = "11px monospace";
        ctx.fillText(item.desc, menuX + 140, iy + 22);

        // Sold out indicator
        var isOwned = false;
        if (item.action === "woodSword" && boughtWoodSword) isOwned = true;
        if (item.action === "healthUp" && boughtHealthUp) isOwned = true;
        if (item.action === "buyBow" && playerWeapons.bow.owned) isOwned = true;
        if (item.action === "buyGun" && playerWeapons.gun.owned) isOwned = true;
        if (item.action === "buyTaser" && playerWeapons.taser.owned) isOwned = true;
        if (isOwned) {
            ctx.fillStyle = "#44aa44";
            ctx.font = "bold 11px monospace";
            ctx.fillText("OWNED", menuX + menuW - 70, iy + 22);
        }

        // Selection arrow
        if (selected) {
            ctx.fillStyle = "#ffcc00";
            ctx.font = "bold 16px monospace";
            ctx.fillText(">", menuX + 8, iy + 16);
        }
    }

    // Message (bought / error)
    if (shopMessageTimer > 0) {
        ctx.fillStyle = shopMessage.includes("Not") || shopMessage.includes("full") || shopMessage.includes("Already")
            ? "#ff4444" : "#44ff44";
        ctx.font = "bold 14px monospace";
        ctx.textAlign = "center";
        ctx.fillText(shopMessage, menuX + menuW / 2, menuY + menuH - 30);
        ctx.textAlign = "left";
        shopMessageTimer--;
    }

    // Controls hint
    ctx.fillStyle = "#666688";
    ctx.font = "11px monospace";
    ctx.textAlign = "center";
    ctx.fillText("UP/DOWN: select | ENTER: buy | ESC: close", menuX + menuW / 2, menuY + menuH - 10);
    ctx.textAlign = "left";
}
