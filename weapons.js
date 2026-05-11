// weapons.js — All weapon types and elements!

// Weapon type stats
const WEAPON_TYPES = {
    sword: { name: "Sword", cooldown: 18, baseDamage: 5, melee: true, range: 42, arc: Math.PI * 0.9 },
    bow:   { name: "Bow",   cooldown: 30, baseDamage: 4, melee: false, speed: 6, projSize: 6, projLife: 60 },
    gun:   { name: "Gun",   cooldown: 12, baseDamage: 3, melee: false, speed: 9, projSize: 4, projLife: 40 },
    taser: { name: "Taser", cooldown: 40, baseDamage: 6, melee: true, range: 50, arc: Math.PI * 0.6, stun: 120 },
};

// Element tiers (weakest to strongest)
const ELEMENTS = {
    wood:      { name: "Wood",       color: "#8B6914", projColor: "#8B6914", mult: 1.0 },
    water:     { name: "Water",      color: "#4488ff", projColor: "#44aaff", mult: 1.2, effect: "slow",  duration: 120 },
    fire:      { name: "Fire",       color: "#ff4422", projColor: "#ff6633", mult: 1.3, effect: "burn",  duration: 180, dot: 0.3 },
    blueFire:  { name: "Blue Fire",  color: "#4466ff", projColor: "#6688ff", mult: 1.5, effect: "burn",  duration: 180, dot: 0.7 },
    soundWave: { name: "Sound Wave", color: "#aa44ff", projColor: "#cc66ff", mult: 1.4, effect: "aoe",   aoeRadius: 80 },
    mega:      { name: "Mega",       color: "#ffff00", projColor: "#ffff44", mult: 2.0, effect: "lightning" },
};

// Jay's weapon inventory — which weapons he owns and their element
const playerWeapons = {
    sword: { owned: true,  element: "wood" },
    bow:   { owned: false, element: "wood" },
    gun:   { owned: false, element: "wood" },
    taser: { owned: false, element: "wood" },
};

// Currently equipped weapon
let equippedWeapon = "sword";

// Switch to a weapon by slot number (1-4)
function switchWeapon(slot) {
    const types = ["sword", "bow", "gun", "taser"];
    const type = types[slot - 1];
    if (type && playerWeapons[type].owned) {
        equippedWeapon = type;
    }
}

// Get total damage for current weapon
function getWeaponDamage() {
    const wType = WEAPON_TYPES[equippedWeapon];
    const elem = ELEMENTS[playerWeapons[equippedWeapon].element];
    let dmg = wType.baseDamage * elem.mult;
    if (equippedWeapon === "sword" && boughtWoodSword) dmg += 1;
    return Math.round(dmg);
}

// Get the element for the current weapon
function getWeaponElement() {
    return ELEMENTS[playerWeapons[equippedWeapon].element];
}

// Main attack function — dispatches based on weapon type
function tryAttack() {
    if (gameOver) return;

    const wType = WEAPON_TYPES[equippedWeapon];

    if (wType.melee) {
        tryMeleeAttack();
    } else {
        tryRangedAttack();
    }
}

// Melee attack (sword or taser)
function tryMeleeAttack() {
    if (swordCooldownTimer > 0 || swordSwinging) return;

    const wType = WEAPON_TYPES[equippedWeapon];
    swordSwinging = true;
    swordTimer = SWORD_SWING_DURATION;
    swordCooldownTimer = wType.cooldown;

    if (player.direction === "right") swordAngle = 0;
    else if (player.direction === "down") swordAngle = Math.PI * 0.5;
    else if (player.direction === "left") swordAngle = Math.PI;
    else swordAngle = -Math.PI * 0.5;

    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;
    const damage = getWeaponDamage();
    const elem = getWeaponElement();

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const enemyCX = enemy.x + enemy.width / 2;
        const enemyCY = enemy.y + enemy.height / 2;
        const distX = enemyCX - centerX;
        const distY = enemyCY - centerY;
        const distance = Math.sqrt(distX * distX + distY * distY);

        if (distance > wType.range + enemy.width / 2) continue;

        const angleToEnemy = Math.atan2(distY, distX);
        let angleDiff = angleToEnemy - swordAngle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        if (Math.abs(angleDiff) < wType.arc / 2) {
            enemy.hp -= damage;
            applyElementEffect(enemy, elem);

            if (equippedWeapon === "taser" && wType.stun) {
                enemy.stunTimer = wType.stun;
            }

            // Knockback
            const knockAngle = Math.atan2(distY, distX);
            const newX = enemy.x + Math.cos(knockAngle) * 15;
            const newY = enemy.y + Math.sin(knockAngle) * 15;
            if (!collidesWithAnything(newX, enemy.y, enemy.width, enemy.height)) enemy.x = newX;
            if (!collidesWithAnything(enemy.x, newY, enemy.width, enemy.height)) enemy.y = newY;

            if (enemy.hp <= 0) {
                spawnCoins(enemy.x, enemy.y, 1 + Math.floor(Math.random() * 3));
                if (Math.random() < 0.3) spawnHamburger(enemy.x, enemy.y);
                recordKill();
                enemies.splice(i, 1);
            }
        }
    }

    // Hit boss if in range
    if (activeBoss && !bossVictoryTimer) {
        const bCX = activeBoss.x + activeBoss.width / 2;
        const bCY = activeBoss.y + activeBoss.height / 2;
        const bDistX = bCX - centerX;
        const bDistY = bCY - centerY;
        const bDist = Math.sqrt(bDistX * bDistX + bDistY * bDistY);
        if (bDist <= wType.range + activeBoss.width / 2) {
            const bAngle = Math.atan2(bDistY, bDistX);
            let bDiff = bAngle - swordAngle;
            while (bDiff > Math.PI) bDiff -= Math.PI * 2;
            while (bDiff < -Math.PI) bDiff += Math.PI * 2;
            if (Math.abs(bDiff) < wType.arc / 2) {
                damageBoss(damage);
            }
        }
    }

    // Sound Wave AoE — hit all enemies in radius
    if (elem.effect === "aoe") {
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            const dist = Math.sqrt(Math.pow(enemy.x - centerX, 2) + Math.pow(enemy.y - centerY, 2));
            if (dist < elem.aoeRadius && dist > wType.range + enemy.width / 2) {
                enemy.hp -= Math.round(damage * 0.5);
                if (enemy.hp <= 0) {
                    spawnCoins(enemy.x, enemy.y, 1 + Math.floor(Math.random() * 3));
                    if (Math.random() < 0.3) spawnHamburger(enemy.x, enemy.y);
                    recordKill();
                    enemies.splice(i, 1);
                }
            }
        }
    }
}

// Ranged attack (bow or gun)
function tryRangedAttack() {
    if (swordCooldownTimer > 0) return;

    const wType = WEAPON_TYPES[equippedWeapon];
    swordCooldownTimer = wType.cooldown;

    let angle;
    if (player.direction === "right") angle = 0;
    else if (player.direction === "down") angle = Math.PI * 0.5;
    else if (player.direction === "left") angle = Math.PI;
    else angle = -Math.PI * 0.5;

    const elem = getWeaponElement();

    playerProjectiles.push({
        x: player.x + player.width / 2,
        y: player.y + player.height / 2,
        vx: Math.cos(angle) * wType.speed,
        vy: Math.sin(angle) * wType.speed,
        damage: getWeaponDamage(),
        size: wType.projSize,
        life: wType.projLife,
        type: equippedWeapon,
        element: playerWeapons[equippedWeapon].element,
        color: elem.projColor,
        angle: angle
    });
}

// Apply element effects to an enemy
function applyElementEffect(enemy, elem) {
    if (!elem.effect) return;

    if (elem.effect === "slow") {
        enemy.slowTimer = elem.duration;
    } else if (elem.effect === "burn") {
        enemy.burnTimer = elem.duration;
        enemy.burnDamage = elem.dot;
    } else if (elem.effect === "lightning") {
        // Lightning chains to nearby enemies
        for (let i = 0; i < enemies.length; i++) {
            const other = enemies[i];
            if (other === enemy) continue;
            const dist = Math.sqrt(Math.pow(other.x - enemy.x, 2) + Math.pow(other.y - enemy.y, 2));
            if (dist < 100) {
                other.hp -= 1;
                other.stunTimer = 30;
            }
        }
    }
}

// Draw the weapon HUD (current weapon + element)
function drawWeaponHUD(ctx) {
    const panelX = 15;
    const panelY = canvas.height - 55;
    const wType = WEAPON_TYPES[equippedWeapon];
    const elem = ELEMENTS[playerWeapons[equippedWeapon].element];

    // Background
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(panelX - 5, panelY - 5, 200, 30);
    ctx.strokeStyle = elem.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX - 5, panelY - 5, 200, 30);

    // Weapon icon (colored square)
    ctx.fillStyle = elem.color;
    ctx.fillRect(panelX, panelY, 18, 18);
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 1;
    ctx.strokeRect(panelX, panelY, 18, 18);

    // Weapon symbol
    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px monospace";
    if (equippedWeapon === "sword") ctx.fillText("S", panelX + 4, panelY + 14);
    else if (equippedWeapon === "bow") ctx.fillText("B", panelX + 4, panelY + 14);
    else if (equippedWeapon === "gun") ctx.fillText("G", panelX + 3, panelY + 14);
    else if (equippedWeapon === "taser") ctx.fillText("T", panelX + 4, panelY + 14);

    // Weapon name + element
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 12px monospace";
    ctx.fillText(elem.name + " " + wType.name, panelX + 24, panelY + 14);

    // Slot indicators (1-4)
    const types = ["sword", "bow", "gun", "taser"];
    const slotX = panelX + 150;
    for (let i = 0; i < 4; i++) {
        const owned = playerWeapons[types[i]].owned;
        const active = types[i] === equippedWeapon;

        ctx.fillStyle = active ? "#ffcc00" : (owned ? "#666" : "#333");
        ctx.fillRect(slotX + i * 14, panelY + 2, 11, 14);
        ctx.strokeStyle = active ? "#ffcc00" : "#444";
        ctx.lineWidth = 1;
        ctx.strokeRect(slotX + i * 14, panelY + 2, 11, 14);

        ctx.fillStyle = active ? "#000" : (owned ? "#aaa" : "#555");
        ctx.font = "bold 9px monospace";
        ctx.fillText(String(i + 1), slotX + i * 14 + 2, panelY + 13);
    }
}
