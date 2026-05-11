// combat.js — Sword swinging and fighting!

// Sword attack settings
const SWORD_RANGE = 42;
const SWORD_ARC = Math.PI * 0.9;
const SWORD_DAMAGE = 1;
const SWORD_SWING_DURATION = 15; // frames the swing lasts
const SWORD_COOLDOWN = 18; // frames before Jay can swing again

// Sword state
let swordSwinging = false;
let swordTimer = 0;
let swordCooldownTimer = 0;
let swordAngle = 0;

// Player health
let playerHP = 100;
let playerMaxHP = 100;
let playerDamageFlash = 0; // flash red when hit
let playerInvincible = 0; // invincibility frames after getting hit

// Game over state
let gameOver = false;

// Start a sword swing when SPACE is pressed (legacy wrapper — now uses weapon system)
function trySwingSword() {
    tryAttack();
}

// Update sword animation
function updateCombat(keysPressed) {
    if (swordSwinging) {
        swordTimer--;
        if (swordTimer <= 0) {
            swordSwinging = false;
        }
    }

    if (swordCooldownTimer > 0) {
        swordCooldownTimer--;
    }

    if (playerDamageFlash > 0) {
        playerDamageFlash--;
    }

    if (playerInvincible > 0) {
        playerInvincible--;
    }
}

// Hurt Jay
function damagePlayer(amount) {
    if (gameOver || playerInvincible > 0) return;
    playerHP -= amount;
    playerDamageFlash = 20;
    playerInvincible = 45; // ~0.75 seconds of invincibility after being hit

    if (playerHP <= 0) {
        playerHP = 0;
        gameOver = true;
    }
}

// Restart the game after game over
function restartGame() {
    playerHP = playerMaxHP;
    gameOver = false;
    playerDamageFlash = 0;
    player.x = 400;
    player.y = 400;
    items.length = 0;
    insideHideout = false;
    shopOpen = false;
    inVehicle = false;
    currentVehicle = null;
    vehicleProjectiles.length = 0;
    bossActive = false;
    bossArenaLocked = false;
    activeBoss = null;
    bossProjectiles.length = 0;
    firePatches.length = 0;
    enemyProjectiles.length = 0;
    bossVictoryTimer = 0;
    bossIntroTimer = 0;
    bossIntroType = "";
    bossArenas.monkey2.defeated = false;
    bossArenas.lizard2.defeated = false;
    bossArenas.smasher1.defeated = false;
    spawnVehicles();
    spawnMonkeys();
}

// Draw the sword swing animation
function drawSword(ctx, cameraX, cameraY) {
    if (!swordSwinging) return;

    const centerX = player.x + player.width / 2 - cameraX;
    const centerY = player.y + player.height / 2 - cameraY;

    // How far through the swing we are (0 to 1)
    const swingProgress = 1 - (swordTimer / SWORD_SWING_DURATION);

    // Sweep the sword across the arc
    const startAngle = swordAngle - SWORD_ARC / 2;
    const currentAngle = startAngle + SWORD_ARC * swingProgress;

    // Draw the sword as a line/rectangle
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(currentAngle);

    // Weapon visuals based on type and element
    const elem = getWeaponElement();
    const isTaser = equippedWeapon === "taser";

    if (isTaser) {
        // Taser — electric arc
        ctx.strokeStyle = "#44ddff";
        ctx.shadowColor = "#44ddff";
        ctx.shadowBlur = 8;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(8, 0);
        for (let tx = 12; tx < SWORD_RANGE; tx += 8) {
            ctx.lineTo(tx, (Math.random() - 0.5) * 10);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
    } else {
        // Sword blade — colored by element
        ctx.fillStyle = elem.color;
        ctx.fillRect(8, -3, SWORD_RANGE - 8, 6);

        // Sword tip
        ctx.fillStyle = darkenColor(elem.color, -30);
        ctx.fillRect(SWORD_RANGE - 4, -4, 8, 8);
    }

    // Handle
    ctx.fillStyle = "#4a3000";
    ctx.fillRect(4, -4, 8, 8);

    ctx.restore();

    // Draw a swing trail (arc effect)
    ctx.strokeStyle = "rgba(255, 255, 200, 0.4)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, SWORD_RANGE, startAngle, currentAngle);
    ctx.stroke();
}

// Draw the health bar at the top of the screen
function drawHealthBar(ctx) {
    const barWidth = 200;
    const barHeight = 20;
    const barX = 15;
    const barY = 45;

    // Label
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px monospace";
    ctx.fillText("HP", barX, barY - 5);

    // Background
    ctx.fillStyle = "#333";
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Health fill
    const healthPercent = playerHP / playerMaxHP;
    if (healthPercent > 0.5) {
        ctx.fillStyle = "#00cc44";
    } else if (healthPercent > 0.25) {
        ctx.fillStyle = "#ffaa00";
    } else {
        ctx.fillStyle = "#ff2222";
    }
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

    // Border
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    // HP text
    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px monospace";
    ctx.fillText(playerHP + " / " + playerMaxHP, barX + 65, barY + 15);
}

// Draw the game over screen
function drawGameOver(ctx) {
    if (!gameOver) return;

    // Dark overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Game Over text
    ctx.fillStyle = "#ff2222";
    ctx.font = "bold 64px monospace";
    ctx.shadowColor = "#ff0000";
    ctx.shadowBlur = 20;
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);
    ctx.shadowBlur = 0;

    // Restart hint
    ctx.fillStyle = "#ffffff";
    ctx.font = "24px monospace";
    ctx.fillText("Press R to try again", canvas.width / 2, canvas.height / 2 + 30);

    ctx.textAlign = "left";
}
