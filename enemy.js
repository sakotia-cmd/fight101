// enemy.js — Monkey and Lizard enemies that roam the city!

// All enemies currently alive
const enemies = [];

// Enemy projectiles (lizard fire spit)
const enemyProjectiles = [];

// How many of each to spawn
const MONKEY_COUNT = 10;
const LIZARD_COUNT = 8;

// Monkey settings
const MONKEY_SIZE = 28;
const MONKEY_SPEED = 1.0;
const MONKEY_HP = 8;
const MONKEY_CHASE_RANGE = 150;
const MONKEY_DAMAGE = 5;
const MONKEY_DAMAGE_COOLDOWN = 90;

// Lizard settings — tougher but slower, with a ranged fire spit
const LIZARD_SIZE = 32;
const LIZARD_SPEED = 0.7;
const LIZARD_HP = 15;
const LIZARD_CHASE_RANGE = 200;
const LIZARD_DAMAGE = 7;
const LIZARD_DAMAGE_COOLDOWN = 90;
const LIZARD_SPIT_COOLDOWN = 150;
const LIZARD_SPIT_RANGE = 180;

// Spawn all enemies in random spots around the city
function spawnMonkeys() {
    enemies.length = 0;
    enemyProjectiles.length = 0;

    // Spawn monkeys — mostly in the top half of the city
    for (let i = 0; i < MONKEY_COUNT; i++) {
        let x, y;
        do {
            x = Math.random() * (WORLD_WIDTH - 200) + 100;
            y = Math.random() * (WORLD_HEIGHT - 200) + 100;
        } while (collidesWithAnything(x, y, MONKEY_SIZE, MONKEY_SIZE));

        enemies.push({
            x: x, y: y,
            width: MONKEY_SIZE, height: MONKEY_SIZE,
            hp: MONKEY_HP, maxHp: MONKEY_HP,
            speed: MONKEY_SPEED, damageCooldown: 0,
            wanderAngle: Math.random() * Math.PI * 2,
            wanderTimer: Math.floor(Math.random() * 120) + 60,
            type: "monkey",
            slowTimer: 0, burnTimer: 0, burnDamage: 0, stunTimer: 0
        });
    }

    // Spawn lizards — mostly in the bottom half of the city
    for (let i = 0; i < LIZARD_COUNT; i++) {
        let x, y;
        do {
            x = Math.random() * (WORLD_WIDTH - 200) + 100;
            y = WORLD_HEIGHT * 0.4 + Math.random() * (WORLD_HEIGHT * 0.55);
        } while (collidesWithAnything(x, y, LIZARD_SIZE, LIZARD_SIZE));

        enemies.push({
            x: x, y: y,
            width: LIZARD_SIZE, height: LIZARD_SIZE,
            hp: LIZARD_HP, maxHp: LIZARD_HP,
            speed: LIZARD_SPEED, damageCooldown: 0,
            wanderAngle: Math.random() * Math.PI * 2,
            wanderTimer: Math.floor(Math.random() * 120) + 60,
            type: "lizard",
            slowTimer: 0, burnTimer: 0, burnDamage: 0, stunTimer: 0,
            spitCooldown: Math.floor(Math.random() * LIZARD_SPIT_COOLDOWN)
        });
    }
}

// Update all enemies — wander, chase, or attack
function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];

        if (enemy.damageCooldown > 0) enemy.damageCooldown--;
        if (enemy.slowTimer > 0) enemy.slowTimer--;
        if (enemy.stunTimer > 0) enemy.stunTimer--;
        if (enemy.burnTimer > 0) {
            enemy.burnTimer--;
            if (enemy.burnTimer % 30 === 0) {
                enemy.hp -= enemy.burnDamage;
                if (enemy.hp <= 0) {
                    const coinCount = enemy.type === "lizard" ? 3 + Math.floor(Math.random() * 3) : 1 + Math.floor(Math.random() * 3);
                    spawnCoins(enemy.x, enemy.y, coinCount);
                    if (Math.random() < 0.3) spawnHamburger(enemy.x, enemy.y);
                    recordKill();
                    enemies.splice(i, 1);
                    continue;
                }
            }
        }

        if (enemy.stunTimer > 0) continue;

        const speedMult = enemy.slowTimer > 0 ? 0.4 : 1.0;

        const distX = player.x - enemy.x;
        const distY = player.y - enemy.y;
        const distance = Math.sqrt(distX * distX + distY * distY);

        const chaseRange = enemy.type === "lizard" ? LIZARD_CHASE_RANGE : MONKEY_CHASE_RANGE;
        const contactDamage = enemy.type === "lizard" ? LIZARD_DAMAGE : MONKEY_DAMAGE;

        let newX = enemy.x;
        let newY = enemy.y;

        if (distance < chaseRange) {
            const angle = Math.atan2(distY, distX);
            newX += Math.cos(angle) * enemy.speed * 1.2 * speedMult;
            newY += Math.sin(angle) * enemy.speed * 1.2 * speedMult;
        } else {
            enemy.wanderTimer--;
            if (enemy.wanderTimer <= 0) {
                enemy.wanderAngle = Math.random() * Math.PI * 2;
                enemy.wanderTimer = Math.floor(Math.random() * 120) + 60;
            }
            newX += Math.cos(enemy.wanderAngle) * enemy.speed * 0.5 * speedMult;
            newY += Math.sin(enemy.wanderAngle) * enemy.speed * 0.5 * speedMult;
        }

        newX = Math.max(0, Math.min(newX, WORLD_WIDTH - enemy.width));
        newY = Math.max(0, Math.min(newY, WORLD_HEIGHT - enemy.height));

        if (!collidesWithAnything(newX, enemy.y, enemy.width, enemy.height)) {
            enemy.x = newX;
        } else {
            enemy.wanderAngle = Math.random() * Math.PI * 2;
        }
        if (!collidesWithAnything(enemy.x, newY, enemy.width, enemy.height)) {
            enemy.y = newY;
        } else {
            enemy.wanderAngle = Math.random() * Math.PI * 2;
        }

        // Lizard fire spit — ranged attack
        if (enemy.type === "lizard") {
            if (enemy.spitCooldown > 0) enemy.spitCooldown--;
            if (enemy.spitCooldown <= 0 && distance < LIZARD_SPIT_RANGE && distance > 40) {
                const spitAngle = Math.atan2(distY, distX);
                enemyProjectiles.push({
                    x: enemy.x + enemy.width / 2,
                    y: enemy.y + enemy.height / 2,
                    vx: Math.cos(spitAngle) * 3,
                    vy: Math.sin(spitAngle) * 3,
                    damage: 4,
                    life: 60,
                    type: "fire_spit"
                });
                enemy.spitCooldown = LIZARD_SPIT_COOLDOWN;
            }
        }

        // Contact damage
        if (enemy.damageCooldown <= 0 && rectsOverlap(
            player.x, player.y, player.width, player.height,
            enemy.x, enemy.y, enemy.width, enemy.height
        )) {
            damagePlayer(contactDamage);
            enemy.damageCooldown = MONKEY_DAMAGE_COOLDOWN;
        }
    }

    // Update enemy projectiles (lizard fire spit)
    for (let i = enemyProjectiles.length - 1; i >= 0; i--) {
        const p = enemyProjectiles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        if (p.life <= 0) {
            enemyProjectiles.splice(i, 1);
            continue;
        }

        if (collidesWithAnything(p.x - 3, p.y - 3, 6, 6)) {
            enemyProjectiles.splice(i, 1);
            continue;
        }

        if (rectsOverlap(player.x, player.y, player.width, player.height,
                         p.x - 6, p.y - 6, 12, 12)) {
            damagePlayer(p.damage);
            enemyProjectiles.splice(i, 1);
        }
    }
}

// Draw all enemies
function drawEnemies(ctx, cameraX, cameraY) {
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        const screenX = enemy.x - cameraX;
        const screenY = enemy.y - cameraY;

        if (screenX + enemy.width < -10 || screenX > canvas.width + 10 ||
            screenY + enemy.height < -10 || screenY > canvas.height + 10) {
            continue;
        }

        if (enemy.type === "monkey") {
            drawMonkeyEnemy(ctx, screenX, screenY, enemy);
        } else if (enemy.type === "lizard") {
            drawLizardEnemy(ctx, screenX, screenY, enemy);
        }

        // Health bar (only show if damaged)
        if (enemy.hp < enemy.maxHp) {
            const barWidth = enemy.width + 4;
            const barHeight = 5;
            const barX = screenX - 2;
            const barY = screenY - 12;

            ctx.fillStyle = "#222";
            ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
            ctx.fillStyle = "#444";
            ctx.fillRect(barX, barY, barWidth, barHeight);

            const healthPercent = enemy.hp / enemy.maxHp;
            ctx.fillStyle = healthPercent > 0.5 ? "#44dd44" : "#ff4444";
            ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        }

        // Status effect visuals
        if (enemy.slowTimer > 0) {
            const cx = screenX + enemy.width / 2;
            const cy = screenY + enemy.height / 2;
            ctx.strokeStyle = "#4488ff";
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(cx, cy, enemy.width / 2 + 4, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1.0;
        }
        if (enemy.burnTimer > 0) {
            const cx = screenX + enemy.width / 2;
            ctx.fillStyle = "#ff4422";
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(cx - 4, screenY - 2, 3, 0, Math.PI * 2);
            ctx.arc(cx + 3, screenY - 4, 2.5, 0, Math.PI * 2);
            ctx.arc(cx, screenY - 6, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }
        if (enemy.stunTimer > 0) {
            const cx = screenX + enemy.width / 2;
            ctx.fillStyle = "#ffff00";
            ctx.font = "bold 10px monospace";
            ctx.textAlign = "center";
            ctx.fillText("★", cx - 5, screenY - 14);
            ctx.fillText("★", cx + 5, screenY - 18);
            ctx.textAlign = "left";
        }
    }

    // Draw enemy projectiles (lizard fire spit)
    for (let i = 0; i < enemyProjectiles.length; i++) {
        const p = enemyProjectiles[i];
        const px = p.x - cameraX;
        const py = p.y - cameraY;

        if (px < -10 || px > canvas.width + 10 || py < -10 || py > canvas.height + 10) continue;

        // Fire spit — orange/red fireball
        ctx.fillStyle = "#ff6622";
        ctx.shadowColor = "#ff4400";
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Bright center
        ctx.fillStyle = "#ffcc44";
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Smoke trail
        ctx.fillStyle = "rgba(100, 60, 20, 0.3)";
        ctx.beginPath();
        ctx.arc(px - p.vx * 1.5, py - p.vy * 1.5, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Draw a monkey enemy
function drawMonkeyEnemy(ctx, screenX, screenY, enemy) {
    const cx = screenX + enemy.width / 2;
    const cy = screenY + enemy.height / 2;
    const r = enemy.width / 2;

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(cx, screenY + enemy.height + 2, r - 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tail
    ctx.strokeStyle = "#7a3a10";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx - r - 2, cy + 4, 6, -0.5, Math.PI * 1.5);
    ctx.stroke();

    // Body
    ctx.fillStyle = "#8B4513";
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#6a3010";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Belly
    ctx.fillStyle = "#D2A679";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 3, r * 0.55, r * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = "#8B4513";
    ctx.beginPath();
    ctx.arc(cx - r + 3, cy - r + 5, 6, 0, Math.PI * 2);
    ctx.arc(cx + r - 3, cy - r + 5, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#6a3010";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx - r + 3, cy - r + 5, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + r - 3, cy - r + 5, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#e8a088";
    ctx.beginPath();
    ctx.arc(cx - r + 3, cy - r + 5, 3.5, 0, Math.PI * 2);
    ctx.arc(cx + r - 3, cy - r + 5, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Face patch
    ctx.fillStyle = "#D2A679";
    ctx.beginPath();
    ctx.ellipse(cx, cy - 2, 8, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.ellipse(cx - 5, cy - 4, 4.5, 5, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 5, cy - 4, 4.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx - 5, cy - 4, 4.5, 5, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx + 5, cy - 4, 4.5, 5, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Pupils
    const lookX = (player.x - enemy.x) > 0 ? 1.5 : -1.5;
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath();
    ctx.arc(cx - 5 + lookX, cy - 3, 2.5, 0, Math.PI * 2);
    ctx.arc(cx + 5 + lookX, cy - 3, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(cx - 4 + lookX, cy - 5, 1, 0, Math.PI * 2);
    ctx.arc(cx + 6 + lookX, cy - 5, 1, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.fillStyle = "#5a2d0c";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 1, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Grin
    ctx.strokeStyle = "#5a2d0c";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy + 4, 5, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    // Arms
    ctx.strokeStyle = "#8B4513";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - r + 2, cy + 2);
    ctx.lineTo(cx - r - 5, cy + 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + r - 2, cy + 2);
    ctx.lineTo(cx + r + 5, cy + 8);
    ctx.stroke();
    ctx.lineCap = "butt";

    // Hands
    ctx.fillStyle = "#D2A679";
    ctx.beginPath();
    ctx.arc(cx - r - 5, cy + 8, 3, 0, Math.PI * 2);
    ctx.arc(cx + r + 5, cy + 8, 3, 0, Math.PI * 2);
    ctx.fill();
}

// Draw a lizard enemy — green scaly creature
function drawLizardEnemy(ctx, screenX, screenY, enemy) {
    const cx = screenX + enemy.width / 2;
    const cy = screenY + enemy.height / 2;
    const r = enemy.width / 2;

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(cx, screenY + enemy.height + 2, r - 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tail — long and curved
    ctx.strokeStyle = "#2a7a2a";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - r, cy + 4);
    ctx.quadraticCurveTo(cx - r - 16, cy - 2, cx - r - 12, cy + 12);
    ctx.stroke();
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx - r - 12, cy + 12);
    ctx.quadraticCurveTo(cx - r - 8, cy + 18, cx - r - 14, cy + 16);
    ctx.stroke();
    ctx.lineCap = "butt";

    // Body — oval, dark green with scales
    ctx.fillStyle = "#3a8a3a";
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#2a6a2a";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * 0.85, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Scale pattern
    ctx.strokeStyle = "#2a6a2a";
    ctx.lineWidth = 0.8;
    for (let si = -2; si <= 2; si++) {
        ctx.beginPath();
        ctx.arc(cx + si * 5, cy + 3, 4, 0, Math.PI);
        ctx.stroke();
    }

    // Belly — lighter
    ctx.fillStyle = "#88cc66";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 4, r * 0.5, r * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head crest / spikes
    ctx.fillStyle = "#2a7a2a";
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy - r + 2);
    ctx.lineTo(cx - 2, cy - r - 6);
    ctx.lineTo(cx + 1, cy - r + 2);
    ctx.lineTo(cx + 3, cy - r - 5);
    ctx.lineTo(cx + 6, cy - r + 2);
    ctx.closePath();
    ctx.fill();

    // Eyes — narrow and reptilian
    ctx.fillStyle = "#ccff44";
    ctx.beginPath();
    ctx.ellipse(cx - 6, cy - 5, 5, 4, -0.1, 0, Math.PI * 2);
    ctx.ellipse(cx + 6, cy - 5, 5, 4, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx - 6, cy - 5, 5, 4, -0.1, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx + 6, cy - 5, 5, 4, 0.1, 0, Math.PI * 2);
    ctx.stroke();

    // Slit pupils
    const lookX = (player.x - enemy.x) > 0 ? 1 : -1;
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath();
    ctx.ellipse(cx - 6 + lookX, cy - 5, 1.5, 3.5, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 6 + lookX, cy - 5, 1.5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Nostrils
    ctx.fillStyle = "#2a5a2a";
    ctx.beginPath();
    ctx.arc(cx - 2, cy + 1, 1.5, 0, Math.PI * 2);
    ctx.arc(cx + 2, cy + 1, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Mouth — slight frown with teeth showing
    ctx.strokeStyle = "#2a5a2a";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy + 5);
    ctx.lineTo(cx - 3, cy + 7);
    ctx.lineTo(cx + 3, cy + 7);
    ctx.lineTo(cx + 8, cy + 5);
    ctx.stroke();

    // Little teeth
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(cx - 5, cy + 5, 2, 3);
    ctx.fillRect(cx + 3, cy + 5, 2, 3);

    // Short arms/legs
    ctx.fillStyle = "#3a8a3a";
    ctx.beginPath();
    ctx.ellipse(cx - r - 2, cy + 4, 5, 3, -0.3, 0, Math.PI * 2);
    ctx.ellipse(cx + r + 2, cy + 4, 5, 3, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Claws
    ctx.strokeStyle = "#2a5a2a";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - r - 6, cy + 2);
    ctx.lineTo(cx - r - 9, cy);
    ctx.moveTo(cx - r - 6, cy + 4);
    ctx.lineTo(cx - r - 9, cy + 4);
    ctx.moveTo(cx - r - 6, cy + 6);
    ctx.lineTo(cx - r - 9, cy + 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + r + 6, cy + 2);
    ctx.lineTo(cx + r + 9, cy);
    ctx.moveTo(cx + r + 6, cy + 4);
    ctx.lineTo(cx + r + 9, cy + 4);
    ctx.moveTo(cx + r + 6, cy + 6);
    ctx.lineTo(cx + r + 9, cy + 8);
    ctx.stroke();
}

// Check if two rectangles are overlapping
function rectsOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}
