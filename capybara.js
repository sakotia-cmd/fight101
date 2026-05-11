// capybara.js — Jay's capybara sidekick!

// Capybara state
const capybara = {
    x: 0,
    y: 0,
    width: 24,
    height: 24,
    level: 1,
    xp: 0,
    xpToNextLevel: 3,
    found: false,
    speed: 3.5,
    // Blaster settings (unlocked at level 5)
    blasterCooldown: 0,
    blasterCooldownMax: 45,
    megaCooldown: 0,
    megaCooldownMax: 120
};

// Projectiles the capybara shoots
const capybaraProjectiles = [];

// How much XP each hamburger gives
const XP_PER_HAMBURGER = 1;

// Feed the capybara a hamburger
function feedCapybara() {
    if (!capybara.found) return;
    if (inventory.hamburgers <= 0) return;

    // Inside hideout, always allow feeding (capybara is right there)
    if (!insideHideout) {
        const dist = Math.sqrt(
            Math.pow(player.x - capybara.x, 2) +
            Math.pow(player.y - capybara.y, 2)
        );
        if (dist > 60) return;
    }

    // Use a hamburger
    inventory.hamburgers--;

    // Give the capybara XP
    capybara.xp += XP_PER_HAMBURGER;

    // Check for level up
    if (capybara.xp >= capybara.xpToNextLevel) {
        capybara.xp = 0;
        capybara.level++;
        capybara.xpToNextLevel = capybara.level * 2 + 1;
    }
}

// Update the capybara — follow Jay and shoot at enemies
function updateCapybara() {
    if (!capybara.found) return;

    // Don't update capybara position while inside hideout (it stays in the training area)
    if (insideHideout) return;

    // Follow Jay — float near him in a mini jet
    const targetX = player.x + 25;
    const targetY = player.y - 20;
    const distX = targetX - capybara.x;
    const distY = targetY - capybara.y;
    const distance = Math.sqrt(distX * distX + distY * distY);

    if (distance > 5) {
        capybara.x += (distX / distance) * capybara.speed;
        capybara.y += (distY / distance) * capybara.speed;
    }

    // Level 5+: shoot blasters at nearby enemies
    if (capybara.level >= 5 && capybara.blasterCooldown <= 0) {
        const closestEnemy = findClosestEnemy(capybara.x, capybara.y, 250);
        if (closestEnemy) {
            const angle = Math.atan2(
                closestEnemy.y - capybara.y,
                closestEnemy.x - capybara.x
            );
            capybaraProjectiles.push({
                x: capybara.x + capybara.width / 2,
                y: capybara.y + capybara.height / 2,
                vx: Math.cos(angle) * 5,
                vy: Math.sin(angle) * 5,
                damage: 1,
                type: "blaster",
                life: 60
            });
            capybara.blasterCooldown = capybara.blasterCooldownMax;
        }
    }

    // Level 10: mega attack
    if (capybara.level >= 10 && capybara.megaCooldown <= 0) {
        const closestEnemy = findClosestEnemy(capybara.x, capybara.y, 300);
        if (closestEnemy) {
            const angle = Math.atan2(
                closestEnemy.y - capybara.y,
                closestEnemy.x - capybara.x
            );
            capybaraProjectiles.push({
                x: capybara.x + capybara.width / 2,
                y: capybara.y + capybara.height / 2,
                vx: Math.cos(angle) * 6,
                vy: Math.sin(angle) * 6,
                damage: 3,
                type: "mega",
                life: 80
            });
            capybara.megaCooldown = capybara.megaCooldownMax;
        }
    }

    if (capybara.blasterCooldown > 0) capybara.blasterCooldown--;
    if (capybara.megaCooldown > 0) capybara.megaCooldown--;

    // Update projectiles
    for (let i = capybaraProjectiles.length - 1; i >= 0; i--) {
        const proj = capybaraProjectiles[i];
        proj.x += proj.vx;
        proj.y += proj.vy;
        proj.life--;

        if (proj.life <= 0) {
            capybaraProjectiles.splice(i, 1);
            continue;
        }

        // Check if projectile hits an enemy
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (rectsOverlap(proj.x - 4, proj.y - 4, 8, 8,
                enemy.x, enemy.y, enemy.width, enemy.height)) {
                enemy.hp -= proj.damage;
                capybaraProjectiles.splice(i, 1);

                if (enemy.hp <= 0) {
                    spawnCoins(enemy.x, enemy.y, 1 + Math.floor(Math.random() * 3));
                    if (Math.random() < 0.3) {
                        spawnHamburger(enemy.x, enemy.y);
                    }
                    enemies.splice(j, 1);
                }
                break;
            }
        }
    }
}

// Find the closest enemy within a range
function findClosestEnemy(fromX, fromY, range) {
    let closest = null;
    let closestDist = range;

    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        const dist = Math.sqrt(
            Math.pow(enemy.x - fromX, 2) +
            Math.pow(enemy.y - fromY, 2)
        );
        if (dist < closestDist) {
            closestDist = dist;
            closest = enemy;
        }
    }
    return closest;
}

// Draw the capybara (outside the hideout — in its mini jet)
function drawCapybara(ctx, cameraX, cameraY) {
    if (!capybara.found || insideHideout) return;

    const screenX = capybara.x - cameraX;
    const screenY = capybara.y - cameraY;

    // Mini jet body — silver/gray
    ctx.fillStyle = "#aabbcc";
    ctx.beginPath();
    ctx.ellipse(screenX + capybara.width / 2, screenY + capybara.height / 2 + 4,
        capybara.width / 2 + 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Jet wings
    ctx.fillStyle = "#8899aa";
    ctx.beginPath();
    ctx.moveTo(screenX - 4, screenY + capybara.height / 2 + 4);
    ctx.lineTo(screenX - 10, screenY + capybara.height / 2 + 8);
    ctx.lineTo(screenX + 2, screenY + capybara.height / 2 + 6);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(screenX + capybara.width + 4, screenY + capybara.height / 2 + 4);
    ctx.lineTo(screenX + capybara.width + 10, screenY + capybara.height / 2 + 8);
    ctx.lineTo(screenX + capybara.width - 2, screenY + capybara.height / 2 + 6);
    ctx.fill();

    // Jet thruster glow
    ctx.fillStyle = "#44aaff";
    ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 100) * 0.3;
    ctx.beginPath();
    ctx.ellipse(screenX + capybara.width / 2, screenY + capybara.height / 2 + 10,
        4, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Capybara body — brown oval
    ctx.fillStyle = "#a0724a";
    ctx.beginPath();
    ctx.ellipse(screenX + capybara.width / 2, screenY + capybara.height / 2,
        capybara.width / 2, capybara.height / 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Capybara head
    ctx.fillStyle = "#b0825a";
    ctx.beginPath();
    ctx.ellipse(screenX + capybara.width / 2 + 6, screenY + capybara.height / 2 - 3,
        7, 6, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Little ears
    ctx.fillStyle = "#8a6240";
    ctx.beginPath();
    ctx.arc(screenX + capybara.width / 2 + 8, screenY + capybara.height / 2 - 9, 3, 0, Math.PI * 2);
    ctx.arc(screenX + capybara.width / 2 + 12, screenY + capybara.height / 2 - 8, 3, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath();
    ctx.arc(screenX + capybara.width / 2 + 9, screenY + capybara.height / 2 - 4, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = "#5a3a20";
    ctx.beginPath();
    ctx.arc(screenX + capybara.width / 2 + 13, screenY + capybara.height / 2 - 2, 2, 0, Math.PI * 2);
    ctx.fill();

    // Level badge
    ctx.fillStyle = "#ffcc00";
    ctx.font = "bold 10px monospace";
    ctx.fillText("Lv" + capybara.level, screenX - 2, screenY - 6);

    // Draw projectiles
    for (let i = 0; i < capybaraProjectiles.length; i++) {
        const proj = capybaraProjectiles[i];
        const px = proj.x - cameraX;
        const py = proj.y - cameraY;

        if (proj.type === "mega") {
            // Lightning bolt look
            ctx.strokeStyle = "#ffff00";
            ctx.shadowColor = "#ffff00";
            ctx.shadowBlur = 10;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(px - 4, py - 4);
            ctx.lineTo(px + 2, py);
            ctx.lineTo(px - 2, py + 2);
            ctx.lineTo(px + 4, py + 4);
            ctx.stroke();
            ctx.shadowBlur = 0;
        } else {
            // Small blue energy ball
            ctx.fillStyle = "#44aaff";
            ctx.shadowColor = "#44aaff";
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
}

// Draw capybara info panel on the HUD
function drawCapybaraHUD(ctx) {
    if (!capybara.found) return;

    const panelX = 15;
    const panelY = 80;

    // Background
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(panelX - 5, panelY - 5, 160, 40);
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 1;
    ctx.strokeRect(panelX - 5, panelY - 5, 160, 40);

    // Label
    ctx.fillStyle = "#ffcc00";
    ctx.font = "bold 12px monospace";
    ctx.fillText("CAPYBARA Lv" + capybara.level, panelX, panelY + 10);

    // XP bar
    const barWidth = 140;
    const barHeight = 8;
    const barY = panelY + 18;

    ctx.fillStyle = "#333";
    ctx.fillRect(panelX, barY, barWidth, barHeight);

    const xpPercent = capybara.xp / capybara.xpToNextLevel;
    ctx.fillStyle = "#ffcc00";
    ctx.fillRect(panelX, barY, barWidth * xpPercent, barHeight);

    ctx.strokeStyle = "#666";
    ctx.lineWidth = 1;
    ctx.strokeRect(panelX, barY, barWidth, barHeight);

    // XP text
    ctx.fillStyle = "#aaa";
    ctx.font = "9px monospace";
    ctx.fillText(capybara.xp + "/" + capybara.xpToNextLevel + " XP", panelX + barWidth + 5, barY + 7);
}
