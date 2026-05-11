// projectiles.js — Arrows, bullets, and energy blasts!

// All player projectiles currently flying
const playerProjectiles = [];

// Update all player projectiles — move them and check for hits
function updateProjectiles() {
    for (let i = playerProjectiles.length - 1; i >= 0; i--) {
        const proj = playerProjectiles[i];
        proj.x += proj.vx;
        proj.y += proj.vy;
        proj.life--;

        if (proj.life <= 0) {
            playerProjectiles.splice(i, 1);
            continue;
        }

        // Stop if it hits a building
        if (collidesWithAnything(proj.x - 2, proj.y - 2, 4, 4)) {
            playerProjectiles.splice(i, 1);
            continue;
        }

        // Check if it hits the boss
        if (activeBoss && !bossVictoryTimer &&
            rectsOverlap(proj.x - proj.size, proj.y - proj.size, proj.size * 2, proj.size * 2,
                         activeBoss.x, activeBoss.y, activeBoss.width, activeBoss.height)) {
            damageBoss(proj.damage);
            playerProjectiles.splice(i, 1);
            continue;
        }

        // Check if it hits an enemy
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (rectsOverlap(proj.x - proj.size, proj.y - proj.size, proj.size * 2, proj.size * 2,
                enemy.x, enemy.y, enemy.width, enemy.height)) {

                enemy.hp -= proj.damage;

                // Apply element effect
                const elem = ELEMENTS[proj.element];
                applyElementEffect(enemy, elem);

                // Sound wave AoE — splash damage nearby
                if (elem.effect === "aoe") {
                    for (let k = enemies.length - 1; k >= 0; k--) {
                        if (k === j) continue;
                        const other = enemies[k];
                        const dist = Math.sqrt(Math.pow(other.x - proj.x, 2) + Math.pow(other.y - proj.y, 2));
                        if (dist < elem.aoeRadius) {
                            other.hp -= Math.round(proj.damage * 0.5);
                            if (other.hp <= 0) {
                                spawnCoins(other.x, other.y, 1 + Math.floor(Math.random() * 3));
                                if (Math.random() < 0.3) spawnHamburger(other.x, other.y);
                                recordKill();
                                enemies.splice(k, 1);
                                if (k < j) j--;
                            }
                        }
                    }
                }

                playerProjectiles.splice(i, 1);

                if (enemy.hp <= 0) {
                    spawnCoins(enemy.x, enemy.y, 1 + Math.floor(Math.random() * 3));
                    if (Math.random() < 0.3) spawnHamburger(enemy.x, enemy.y);
                    recordKill();
                    enemies.splice(j, 1);
                }
                break;
            }
        }
    }
}

// Draw all player projectiles
function drawProjectiles(ctx, cameraX, cameraY) {
    for (let i = 0; i < playerProjectiles.length; i++) {
        const proj = playerProjectiles[i];
        const px = proj.x - cameraX;
        const py = proj.y - cameraY;

        if (px < -20 || px > canvas.width + 20 || py < -20 || py > canvas.height + 20) continue;

        if (proj.type === "bow") {
            drawArrow(ctx, px, py, proj);
        } else if (proj.type === "gun") {
            drawBullet(ctx, px, py, proj);
        }
    }
}

function drawArrow(ctx, px, py, proj) {
    const elem = ELEMENTS[proj.element];

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(proj.angle);

    // Arrow shaft
    ctx.strokeStyle = elem.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(6, 0);
    ctx.stroke();

    // Arrowhead
    ctx.fillStyle = elem.color;
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(4, -4);
    ctx.lineTo(4, 4);
    ctx.closePath();
    ctx.fill();

    // Fletching
    ctx.strokeStyle = proj.color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(-13, -3);
    ctx.moveTo(-10, 0);
    ctx.lineTo(-13, 3);
    ctx.stroke();

    ctx.restore();

    // Element glow
    if (proj.element !== "wood") {
        ctx.fillStyle = proj.color;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
}

function drawBullet(ctx, px, py, proj) {
    // Bullet trail
    ctx.strokeStyle = proj.color;
    ctx.globalAlpha = 0.3;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px - proj.vx * 2, py - proj.vy * 2);
    ctx.lineTo(px, py);
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // Bullet
    ctx.fillStyle = proj.color;
    ctx.shadowColor = proj.color;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(px, py, proj.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Bright center
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(px, py, proj.size * 0.4, 0, Math.PI * 2);
    ctx.fill();
}
