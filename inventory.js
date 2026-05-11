// inventory.js — Track what Jay is carrying!

// Jay's inventory
const inventory = {
    hamburgers: 0,
    maxHamburgers: 10
};

// Decoration items Jay owns but hasn't placed yet
const ownedDecorations = [];

// Decorations placed inside the hideout
const placedDecorations = [];

// Awards Jay has earned
const earnedAwards = [];

// Award popup state
let awardPopupText = "";
let awardPopupTimer = 0;

// Milestone tracking
const milestones = {
    firstKill: false,
    tenKills: false,
    firstBoss: false,
    allBosses: false,
    capyLevel5: false,
    capyLevel10: false,
    firstHamburger: false,
    richJay: false
};
let totalKills = 0;

// Check and award milestones
function checkAwards() {
    if (!milestones.firstKill && totalKills >= 1) {
        milestones.firstKill = true;
        unlockAward("First Blood", "Defeated your first enemy!", "🗡️");
    }
    if (!milestones.tenKills && totalKills >= 10) {
        milestones.tenKills = true;
        unlockAward("Monster Slayer", "Defeated 10 enemies!", "⚔️");
    }
    if (!milestones.firstBoss && (bossArenas.monkey2.defeated || bossArenas.lizard2.defeated || bossArenas.smasher1.defeated)) {
        milestones.firstBoss = true;
        unlockAward("Boss Hunter", "Defeated your first boss!", "👑");
    }
    if (!milestones.allBosses && bossArenas.monkey2.defeated && bossArenas.lizard2.defeated && bossArenas.smasher1.defeated) {
        milestones.allBosses = true;
        unlockAward("Champion", "Defeated ALL bosses!", "🏆");
    }
    if (!milestones.capyLevel5 && capybara.level >= 5) {
        milestones.capyLevel5 = true;
        unlockAward("Capybara Trainer", "Capybara reached Level 5!", "🐾");
    }
    if (!milestones.capyLevel10 && capybara.level >= 10) {
        milestones.capyLevel10 = true;
        unlockAward("Mega Capybara", "Capybara reached Level 10!", "⚡");
    }
    if (!milestones.firstHamburger && inventory.hamburgers > 0) {
        milestones.firstHamburger = true;
        unlockAward("Burger Fan", "Picked up your first hamburger!", "🍔");
    }
    if (!milestones.richJay && playerCoins >= 500) {
        milestones.richJay = true;
        unlockAward("Rich Kid", "Saved up 500 coins!", "💰");
    }
}

function unlockAward(name, desc, icon) {
    earnedAwards.push({ name: name, desc: desc, icon: icon });
    ownedDecorations.push({ type: "award", name: name, icon: icon, width: 30, height: 30 });
    awardPopupText = "Award: " + name + "!";
    awardPopupTimer = 180;
}

// Track enemy kills for awards
function recordKill() {
    totalKills++;
    checkAwards();
}

// Add a trophy when a boss is defeated
function addBossTrophy(bossType) {
    const trophyNames = {
        monkey2: "Monkey 2.0 Trophy",
        lizard2: "Lizard 2.0 Trophy",
        smasher1: "Smasher 1.0 Trophy"
    };
    const trophyIcons = {
        monkey2: "🐵",
        lizard2: "🦎",
        smasher1: "🔨"
    };
    const name = trophyNames[bossType] || "Trophy";
    const icon = trophyIcons[bossType] || "🏆";

    ownedDecorations.push({ type: "trophy", name: name, icon: icon, width: 34, height: 34 });
    checkAwards();
}

// All furniture types available in the shop
const FURNITURE_CATALOG = {
    chair:   { name: "Chair",          icon: "🪑", price: 10,  width: 28, height: 28 },
    couch:   { name: "Couch",          icon: "🛋️", price: 30,  width: 44, height: 28 },
    tv:      { name: "TV",             icon: "📺", price: 50,  width: 36, height: 30 },
    neon:    { name: "Neon Sign",      icon: "💡", price: 75,  width: 40, height: 24 },
    arcade:  { name: "Arcade Cabinet", icon: "🕹️", price: 200, width: 32, height: 36 },
    plant:   { name: "Plant",          icon: "🌿", price: 15,  width: 24, height: 24 },
    rug:     { name: "Rug",            icon: "🟫", price: 25,  width: 50, height: 36 },
};

// Draw the inventory display on screen
function drawInventory(ctx) {
    const startX = canvas.width - 240;
    const startY = 15;

    // Background panel
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(startX - 10, startY - 5, 235, 35);
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 1;
    ctx.strokeRect(startX - 10, startY - 5, 235, 35);

    // Coin icon and count
    ctx.fillStyle = "#ffd700";
    ctx.beginPath();
    ctx.arc(startX + 8, startY + 12, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#b8960f";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(startX + 8, startY + 12, 7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#b8960f";
    ctx.font = "bold 7px monospace";
    ctx.textAlign = "center";
    ctx.fillText("$", startX + 8, startY + 15);
    ctx.textAlign = "left";

    ctx.fillStyle = "#ffd700";
    ctx.font = "bold 14px monospace";
    ctx.fillText(playerCoins, startX + 20, startY + 17);

    // Hamburger icon (tiny version)
    const iconX = startX + 65;
    const iconY = startY + 5;
    ctx.fillStyle = "#e8a830";
    ctx.beginPath();
    ctx.ellipse(iconX + 8, iconY + 4, 8, 5, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(iconX, iconY + 4, 16, 2);
    ctx.fillStyle = "#5c3317";
    ctx.fillRect(iconX + 1, iconY + 6, 14, 3);
    ctx.fillStyle = "#c8842a";
    ctx.beginPath();
    ctx.ellipse(iconX + 8, iconY + 10, 8, 4, 0, 0, Math.PI);
    ctx.fill();

    // Hamburger count
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px monospace";
    ctx.fillText("x" + inventory.hamburgers, iconX + 22, iconY + 12);

    // Key hint
    ctx.fillStyle = "#888899";
    ctx.font = "11px monospace";
    ctx.fillText("H:eat F:feed", iconX + 65, iconY + 12);

    // Award popup
    if (awardPopupTimer > 0) {
        awardPopupTimer--;
        const popY = 80;
        const alpha = Math.min(1, awardPopupTimer / 30);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(canvas.width / 2 - 140, popY, 280, 40);
        ctx.strokeStyle = "#ffcc00";
        ctx.lineWidth = 2;
        ctx.strokeRect(canvas.width / 2 - 140, popY, 280, 40);
        ctx.fillStyle = "#ffcc00";
        ctx.font = "bold 14px monospace";
        ctx.textAlign = "center";
        ctx.fillText(awardPopupText, canvas.width / 2, popY + 25);
        ctx.textAlign = "left";
        ctx.globalAlpha = 1.0;
    }
}
