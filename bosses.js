// bosses.js — Boss fights! Monkey 2.0, Lizard 2.0, and Smasher 1.0

// Boss arena locations in the city
const bossArenas = {
    monkey2: {
        x: 2600, y: 400,
        width: 400, height: 350,
        name: "Monkey 2.0",
        groundColor: "#4a2020",
        borderColor: "#ff4444",
        symbol: "🐵",
        defeated: false
    },
    lizard2: {
        x: 600, y: 3600,
        width: 450, height: 400,
        name: "Lizard 2.0",
        groundColor: "#1a3a1a",
        borderColor: "#44ff44",
        symbol: "🦎",
        defeated: false
    },
    smasher1: {
        x: 1700, y: 1700,
        width: 500, height: 450,
        name: "Smasher 1.0",
        groundColor: "#2a2a3a",
        borderColor: "#8888ff",
        symbol: "🔨",
        defeated: false
    }
};

// Current boss fight state
let activeBoss = null;
let bossActive = false;
let bossVictoryTimer = 0;

// Boss intro cutscene state
let bossIntroTimer = 0;
let bossIntroType = "";

// Boss projectiles (bananas, fireballs, hammers, etc.)
const bossProjectiles = [];

// Fire patches left by Lizard 2.0's fireballs
const firePatches = [];

// Has the player entered the arena trigger zone?
let bossArenaLocked = false;

// Create Monkey 2.0 boss
function spawnMonkey2() {
    const arena = bossArenas.monkey2;
    activeBoss = {
        type: "monkey2",
        x: arena.x + arena.width / 2 - 30,
        y: arena.y + 60,
        width: 60, height: 60,
        hp: 500, maxHp: 500,
        speed: 2.5, phase: 1,
        attackTimer: 0, slamTimer: 0,
        slamming: false, slamLandTimer: 0,
        slamStartX: 0, slamStartY: 0,
        reinforcementsSent: false,
        damageFlash: 0
    };
    bossActive = true;
    bossArenaLocked = true;
    bossProjectiles.length = 0;
    firePatches.length = 0;
}

// Create Lizard 2.0 boss
function spawnLizard2() {
    const arena = bossArenas.lizard2;
    activeBoss = {
        type: "lizard2",
        x: arena.x + arena.width / 2 - 35,
        y: arena.y + 60,
        width: 70, height: 70,
        hp: 800, maxHp: 800,
        speed: 1.8, phase: 1,
        attackTimer: 60,
        enraged: false,
        reinforcementsSent: false,
        damageFlash: 0
    };
    bossActive = true;
    bossArenaLocked = true;
    bossProjectiles.length = 0;
    firePatches.length = 0;
}

// Create Smasher 1.0 boss
function spawnSmasher1() {
    const arena = bossArenas.smasher1;
    activeBoss = {
        type: "smasher1",
        x: arena.x + arena.width / 2 - 40,
        y: arena.y + 80,
        width: 80, height: 80,
        hp: 1200, maxHp: 1200,
        speed: 1.2, phase: 1,
        attackTimer: 90,
        hammerSwinging: false,
        hammerSwingTimer: 0,
        hammerAngle: 0,
        hammerWindup: 0,
        boomerangTimer: 400,
        damageFlash: 0
    };
    bossActive = true;
    bossArenaLocked = true;
    bossProjectiles.length = 0;
    firePatches.length = 0;
}

// Check if Jay walks into any boss arena
function checkBossArenaEntry() {
    if (bossActive || bossIntroTimer > 0 || insideHideout) return;

    for (const key in bossArenas) {
        const arena = bossArenas[key];
        if (arena.defeated) continue;

        if (rectsOverlap(player.x, player.y, player.width, player.height,
                         arena.x + 50, arena.y + 50, arena.width - 100, arena.height - 100)) {
            // Start intro cutscene instead of spawning immediately
            bossIntroTimer = 180;
            bossIntroType = key;
            bossArenaLocked = true;
            // Lock player inside arena during intro
            player.x = Math.max(arena.x + 10, Math.min(player.x, arena.x + arena.width - player.width - 10));
            player.y = Math.max(arena.y + 10, Math.min(player.y, arena.y + arena.height - player.height - 10));
            break;
        }
    }
}

// Update the active boss
function updateBoss() {
    // Handle intro cutscene countdown
    if (bossIntroTimer > 0) {
        bossIntroTimer--;
        // Keep player locked in arena during intro
        const arena = bossArenas[bossIntroType];
        if (arena) {
            player.x = Math.max(arena.x + 10, Math.min(player.x, arena.x + arena.width - player.width - 10));
            player.y = Math.max(arena.y + 10, Math.min(player.y, arena.y + arena.height - player.height - 10));
        }
        if (bossIntroTimer <= 0) {
            // Intro over — spawn the boss
            if (bossIntroType === "monkey2") spawnMonkey2();
            else if (bossIntroType === "lizard2") spawnLizard2();
            else if (bossIntroType === "smasher1") spawnSmasher1();
            bossIntroType = "";
        }
        return;
    }

    if (!bossActive || !activeBoss) return;

    if (bossVictoryTimer > 0) {
        bossVictoryTimer--;
        if (bossVictoryTimer <= 0) {
            bossActive = false;
            bossArenaLocked = false;
            activeBoss = null;
        }
        return;
    }

    const boss = activeBoss;
    const arena = bossArenas[boss.type];

    if (boss.damageFlash > 0) boss.damageFlash--;

    // Keep player locked inside arena
    if (bossArenaLocked) {
        player.x = Math.max(arena.x + 10, Math.min(player.x, arena.x + arena.width - player.width - 10));
        player.y = Math.max(arena.y + 10, Math.min(player.y, arena.y + arena.height - player.height - 10));
    }

    if (boss.type === "monkey2") updateMonkey2(boss, arena);
    else if (boss.type === "lizard2") updateLizard2(boss, arena);
    else if (boss.type === "smasher1") updateSmasher1(boss, arena);

    // Update boss projectiles
    for (let i = bossProjectiles.length - 1; i >= 0; i--) {
        const p = bossProjectiles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.angle !== undefined) p.angle += 0.15;
        p.life--;

        if (p.life <= 0) {
            // Lizard 2.0 fireballs leave fire patches when they expire or hit
            if (p.type === "fireball") {
                firePatches.push({ x: p.x, y: p.y, life: 300, damage: 3 });
            }
            bossProjectiles.splice(i, 1);
            continue;
        }

        // Boomerang hammer returns to boss
        if (p.type === "boomerang" && p.life < p.maxLife / 2) {
            const dx = boss.x + boss.width / 2 - p.x;
            const dy = boss.y + boss.height / 2 - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 5) {
                p.vx = (dx / dist) * 5;
                p.vy = (dy / dist) * 5;
            }
            if (dist < 30) {
                bossProjectiles.splice(i, 1);
                continue;
            }
        }

        if (rectsOverlap(player.x, player.y, player.width, player.height,
                         p.x - 8, p.y - 8, 16, 16)) {
            damagePlayer(p.damage);
            if (p.type === "fireball") {
                firePatches.push({ x: p.x, y: p.y, life: 300, damage: 3 });
            }
            bossProjectiles.splice(i, 1);
        }
    }

    // Update fire patches (Lizard 2.0)
    for (let i = firePatches.length - 1; i >= 0; i--) {
        const fp = firePatches[i];
        fp.life--;
        if (fp.life <= 0) {
            firePatches.splice(i, 1);
            continue;
        }
        // Damage Jay if he stands in fire
        if (fp.life % 30 === 0 && rectsOverlap(player.x, player.y, player.width, player.height,
                                                  fp.x - 18, fp.y - 18, 36, 36)) {
            damagePlayer(fp.damage);
        }
    }
}

// === MONKEY 2.0 UPDATE ===
function updateMonkey2(boss, arena) {
    // Phase 2 at 50% HP
    if (boss.hp <= boss.maxHp * 0.5 && !boss.reinforcementsSent) {
        boss.reinforcementsSent = true;
        boss.speed = 3.2;
        for (let i = 0; i < 3; i++) {
            enemies.push({
                x: arena.x + 40 + i * 120, y: arena.y + arena.height - 50,
                width: 28, height: 28, hp: 3, maxHp: 3,
                speed: 1.5, damageCooldown: 0,
                wanderAngle: Math.random() * Math.PI * 2,
                wanderTimer: 60,
                type: "monkey", slowTimer: 0, burnTimer: 0, burnDamage: 0, stunTimer: 0
            });
        }
    }

    // Slam attack
    if (boss.slamming) {
        boss.slamLandTimer--;
        if (boss.slamLandTimer <= 0) {
            boss.slamming = false;
            boss.x = player.x - boss.width / 2 + player.width / 2;
            boss.y = player.y - boss.height / 2 + player.height / 2;
            boss.x = Math.max(arena.x + 5, Math.min(boss.x, arena.x + arena.width - boss.width - 5));
            boss.y = Math.max(arena.y + 5, Math.min(boss.y, arena.y + arena.height - boss.height - 5));
            const dist = Math.sqrt(
                Math.pow((player.x + player.width/2) - (boss.x + boss.width/2), 2) +
                Math.pow((player.y + player.height/2) - (boss.y + boss.height/2), 2)
            );
            if (dist < 80) damagePlayer(15);
            boss.attackTimer = 60;
            boss.slamTimer = 600;
        }
        return;
    }

    // Chase Jay
    const distX = (player.x + player.width/2) - (boss.x + boss.width/2);
    const distY = (player.y + player.height/2) - (boss.y + boss.height/2);
    const angle = Math.atan2(distY, distX);
    boss.x += Math.cos(angle) * boss.speed;
    boss.y += Math.sin(angle) * boss.speed;
    boss.x = Math.max(arena.x + 5, Math.min(boss.x, arena.x + arena.width - boss.width - 5));
    boss.y = Math.max(arena.y + 5, Math.min(boss.y, arena.y + arena.height - boss.height - 5));

    // Contact damage
    if (rectsOverlap(player.x, player.y, player.width, player.height,
                     boss.x, boss.y, boss.width, boss.height)) {
        damagePlayer(8);
    }

    boss.attackTimer--;
    boss.slamTimer--;

    // Throw banana
    if (boss.attackTimer <= 0) {
        const bAngle = Math.atan2(
            (player.y + player.height/2) - (boss.y + boss.height/2),
            (player.x + player.width/2) - (boss.x + boss.width/2)
        );
        bossProjectiles.push({
            x: boss.x + boss.width / 2, y: boss.y + boss.height / 2,
            vx: Math.cos(bAngle) * 4, vy: Math.sin(bAngle) * 4,
            damage: 10, life: 90, type: "banana", angle: 0
        });
        boss.attackTimer = 120;
    }

    // Slam every 10 seconds
    if (boss.slamTimer <= 0) {
        boss.slamming = true;
        boss.slamLandTimer = 40;
        boss.slamStartX = boss.x;
        boss.slamStartY = boss.y;
    }
}

// === LIZARD 2.0 UPDATE ===
function updateLizard2(boss, arena) {
    // Enrage at 50% HP
    if (boss.hp <= boss.maxHp * 0.5 && !boss.enraged) {
        boss.enraged = true;
        boss.speed = 2.8;
        // Spawn 2 lizard reinforcements
        if (!boss.reinforcementsSent) {
            boss.reinforcementsSent = true;
            for (let i = 0; i < 2; i++) {
                enemies.push({
                    x: arena.x + 60 + i * 200, y: arena.y + arena.height - 60,
                    width: 32, height: 32, hp: 6, maxHp: 6,
                    speed: 0.7, damageCooldown: 0,
                    wanderAngle: Math.random() * Math.PI * 2,
                    wanderTimer: 60,
                    type: "lizard", slowTimer: 0, burnTimer: 0, burnDamage: 0, stunTimer: 0,
                    spitCooldown: 60
                });
            }
        }
    }

    // Chase Jay (slower than Monkey 2.0)
    const distX = (player.x + player.width/2) - (boss.x + boss.width/2);
    const distY = (player.y + player.height/2) - (boss.y + boss.height/2);
    const angle = Math.atan2(distY, distX);
    boss.x += Math.cos(angle) * boss.speed;
    boss.y += Math.sin(angle) * boss.speed;
    boss.x = Math.max(arena.x + 5, Math.min(boss.x, arena.x + arena.width - boss.width - 5));
    boss.y = Math.max(arena.y + 5, Math.min(boss.y, arena.y + arena.height - boss.height - 5));

    // Contact damage
    if (rectsOverlap(player.x, player.y, player.width, player.height,
                     boss.x, boss.y, boss.width, boss.height)) {
        damagePlayer(10);
    }

    boss.attackTimer--;

    // Spit fireballs — faster when enraged
    const fireRate = boss.enraged ? 70 : 110;
    if (boss.attackTimer <= 0) {
        const bAngle = Math.atan2(
            (player.y + player.height/2) - (boss.y + boss.height/2),
            (player.x + player.width/2) - (boss.x + boss.width/2)
        );
        // Shoot 1 fireball normally, 3-spread when enraged
        if (boss.enraged) {
            for (let s = -1; s <= 1; s++) {
                const a = bAngle + s * 0.25;
                bossProjectiles.push({
                    x: boss.x + boss.width / 2, y: boss.y + boss.height / 2,
                    vx: Math.cos(a) * 3.5, vy: Math.sin(a) * 3.5,
                    damage: 8, life: 80, type: "fireball", maxLife: 80
                });
            }
        } else {
            bossProjectiles.push({
                x: boss.x + boss.width / 2, y: boss.y + boss.height / 2,
                vx: Math.cos(bAngle) * 3.5, vy: Math.sin(bAngle) * 3.5,
                damage: 8, life: 80, type: "fireball", maxLife: 80
            });
        }
        boss.attackTimer = fireRate;
    }
}

// === SMASHER 1.0 UPDATE ===
function updateSmasher1(boss, arena) {
    // Chase Jay (slow)
    const distX = (player.x + player.width/2) - (boss.x + boss.width/2);
    const distY = (player.y + player.height/2) - (boss.y + boss.height/2);
    const distance = Math.sqrt(distX * distX + distY * distY);
    const angle = Math.atan2(distY, distX);

    if (!boss.hammerSwinging) {
        boss.x += Math.cos(angle) * boss.speed;
        boss.y += Math.sin(angle) * boss.speed;
        boss.x = Math.max(arena.x + 5, Math.min(boss.x, arena.x + arena.width - boss.width - 5));
        boss.y = Math.max(arena.y + 5, Math.min(boss.y, arena.y + arena.height - boss.height - 5));
    }

    // Contact damage
    if (rectsOverlap(player.x, player.y, player.width, player.height,
                     boss.x, boss.y, boss.width, boss.height)) {
        damagePlayer(12);
    }

    boss.attackTimer--;
    boss.boomerangTimer--;

    // Hammer swing — windup then slam
    if (boss.attackTimer <= 0 && !boss.hammerSwinging && distance < 120) {
        boss.hammerSwinging = true;
        boss.hammerWindup = 30;
        boss.hammerSwingTimer = 15;
        boss.hammerAngle = angle;
    }

    if (boss.hammerSwinging) {
        if (boss.hammerWindup > 0) {
            boss.hammerWindup--;
        } else {
            boss.hammerSwingTimer--;
            if (boss.hammerSwingTimer <= 0) {
                boss.hammerSwinging = false;
                boss.attackTimer = 90;

                // Check if Jay is in front of the hammer swing
                const hammerX = boss.x + boss.width/2 + Math.cos(boss.hammerAngle) * 50;
                const hammerY = boss.y + boss.height/2 + Math.sin(boss.hammerAngle) * 50;
                const hdx = (player.x + player.width/2) - hammerX;
                const hdy = (player.y + player.height/2) - hammerY;
                if (Math.sqrt(hdx * hdx + hdy * hdy) < 60) {
                    damagePlayer(25);
                }
            }
        }
    }

    // Boomerang hammer throw
    if (boss.boomerangTimer <= 0 && !boss.hammerSwinging) {
        const bAngle = Math.atan2(
            (player.y + player.height/2) - (boss.y + boss.height/2),
            (player.x + player.width/2) - (boss.x + boss.width/2)
        );
        bossProjectiles.push({
            x: boss.x + boss.width / 2, y: boss.y + boss.height / 2,
            vx: Math.cos(bAngle) * 5, vy: Math.sin(bAngle) * 5,
            damage: 18, life: 120, maxLife: 120, type: "boomerang", angle: 0
        });
        boss.boomerangTimer = 400;
    }
}

// Damage the boss (called from weapons.js and projectiles.js)
function damageBoss(amount) {
    if (!activeBoss || bossVictoryTimer > 0) return;

    // Lizard 2.0 has tough scales — reduced damage from non-fire weapons
    if (activeBoss.type === "lizard2") {
        const elem = playerWeapons[equippedWeapon].element;
        if (elem !== "fire" && elem !== "blueFire" && elem !== "mega") {
            amount = Math.max(1, Math.round(amount * 0.5));
        }
    }

    activeBoss.hp -= amount;
    activeBoss.damageFlash = 10;

    if (activeBoss.hp <= 0) {
        activeBoss.hp = 0;
        defeatBoss();
    }
}

// Boss defeated!
function defeatBoss() {
    if (!activeBoss) return;
    const boss = activeBoss;
    const arena = bossArenas[boss.type];

    arena.defeated = true;
    bossVictoryTimer = 180;

    // Award trophy
    addBossTrophy(boss.type);

    // Drop coins based on boss
    let coinCount = 50;
    if (boss.type === "lizard2") coinCount = 75;
    if (boss.type === "smasher1") coinCount = 100;
    spawnCoins(boss.x + boss.width/2, boss.y + boss.height/2, coinCount);

    // Clear boss projectiles and fire patches
    bossProjectiles.length = 0;
    firePatches.length = 0;

    // Remove enemies in the arena
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        if (rectsOverlap(e.x, e.y, e.width, e.height, arena.x, arena.y, arena.width, arena.height)) {
            enemies.splice(i, 1);
        }
    }
}

// Check if a point is inside a boss (for weapon hits)
function hitBoss(x, y, w, h, damage) {
    if (!activeBoss || bossVictoryTimer > 0) return false;
    if (rectsOverlap(x, y, w, h, activeBoss.x, activeBoss.y, activeBoss.width, activeBoss.height)) {
        damageBoss(damage);
        return true;
    }
    return false;
}

// Draw boss arena exteriors on the city map — look like buildings!
function drawBossArenas(ctx, cameraX, cameraY) {
    for (const key in bossArenas) {
        const arena = bossArenas[key];
        const sx = arena.x - cameraX;
        const sy = arena.y - cameraY;

        if (sx + arena.width < -20 || sx > canvas.width + 20 ||
            sy + arena.height < -20 || sy > canvas.height + 20) continue;

        const defeated = arena.defeated;
        const color = arena.borderColor;

        // Building shadow
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillRect(sx + 6, sy + 6, arena.width, arena.height);

        // Main building body
        ctx.fillStyle = defeated ? "#3a4a3a" : arena.groundColor;
        ctx.fillRect(sx, sy, arena.width, arena.height);

        // Brick/panel pattern on walls
        ctx.strokeStyle = defeated ? "rgba(100,150,100,0.15)" : "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1;
        const brickH = 30;
        for (let by = sy + brickH; by < sy + arena.height; by += brickH) {
            ctx.beginPath();
            ctx.moveTo(sx, by);
            ctx.lineTo(sx + arena.width, by);
            ctx.stroke();
        }

        // Roof / top edge — darker
        ctx.fillStyle = defeated ? "#2a3a2a" : darkenColor(arena.groundColor, 20);
        ctx.fillRect(sx - 4, sy - 12, arena.width + 8, 16);
        ctx.strokeStyle = defeated ? "#448844" : color;
        ctx.lineWidth = 2;
        ctx.strokeRect(sx - 4, sy - 12, arena.width + 8, 16);

        // Building border — thick colored frame
        ctx.strokeStyle = defeated ? "#448844" : color;
        ctx.lineWidth = 4;
        ctx.strokeRect(sx, sy, arena.width, arena.height);

        // Corner towers
        const towerSize = 22;
        const towerColor = defeated ? "#336633" : darkenColor(arena.groundColor, -20);
        for (let tx = 0; tx <= 1; tx++) {
            for (let ty = 0; ty <= 1; ty++) {
                const txx = sx + tx * (arena.width - towerSize) - (tx === 0 ? 4 : -4);
                const tyy = sy + ty * (arena.height - towerSize) - (ty === 0 ? 4 : -4);
                ctx.fillStyle = towerColor;
                ctx.fillRect(txx, tyy, towerSize, towerSize);
                ctx.strokeStyle = defeated ? "#448844" : color;
                ctx.lineWidth = 2;
                ctx.strokeRect(txx, tyy, towerSize, towerSize);
                // Tower top
                ctx.fillStyle = defeated ? "#448844" : color;
                ctx.beginPath();
                ctx.moveTo(txx, tyy);
                ctx.lineTo(txx + towerSize / 2, tyy - 8);
                ctx.lineTo(txx + towerSize, tyy);
                ctx.closePath();
                ctx.fill();
            }
        }

        // Entrance — big door at bottom center
        const doorW = 60;
        const doorH = 40;
        const doorX = sx + arena.width / 2 - doorW / 2;
        const doorY = sy + arena.height - doorH;
        ctx.fillStyle = defeated ? "#2a3a2a" : "#1a1a1a";
        ctx.fillRect(doorX, doorY, doorW, doorH);
        ctx.strokeStyle = defeated ? "#448844" : color;
        ctx.lineWidth = 2;
        ctx.strokeRect(doorX, doorY, doorW, doorH);
        // Door arch
        ctx.beginPath();
        ctx.arc(doorX + doorW / 2, doorY, doorW / 2, Math.PI, 0);
        ctx.fillStyle = defeated ? "#2a3a2a" : "#1a1a1a";
        ctx.fill();
        ctx.strokeStyle = defeated ? "#448844" : color;
        ctx.stroke();

        // Sign above door
        const signW = arena.width * 0.6;
        const signX = sx + (arena.width - signW) / 2;
        const signY = sy + 20;
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(signX, signY, signW, 30);
        ctx.strokeStyle = defeated ? "#448844" : color;
        ctx.lineWidth = 2;
        ctx.strokeRect(signX, signY, signW, 30);

        ctx.fillStyle = defeated ? "#44aa44" : color;
        ctx.font = "bold 16px monospace";
        ctx.textAlign = "center";
        ctx.fillText(defeated ? arena.name + " ✓" : arena.name, sx + arena.width / 2, signY + 21);

        // Big symbol on the building face
        ctx.font = "48px serif";
        ctx.globalAlpha = defeated ? 0.2 : 0.4;
        ctx.fillText(arena.symbol, sx + arena.width / 2, sy + arena.height / 2 + 10);
        ctx.globalAlpha = 1.0;
        ctx.textAlign = "left";

        // Skull torches if not defeated
        if (!defeated) {
            ctx.font = "18px serif";
            ctx.fillText("🔥", doorX - 20, doorY + 10);
            ctx.fillText("🔥", doorX + doorW + 4, doorY + 10);
        }
    }

    // Draw fire patches (from Lizard 2.0)
    for (let i = 0; i < firePatches.length; i++) {
        const fp = firePatches[i];
        const fpx = fp.x - cameraX;
        const fpy = fp.y - cameraY;
        if (fpx < -20 || fpx > canvas.width + 20 || fpy < -20 || fpy > canvas.height + 20) continue;

        const alpha = Math.min(0.6, fp.life / 100);
        ctx.fillStyle = "rgba(255, 80, 0, " + alpha + ")";
        ctx.beginPath();
        ctx.arc(fpx, fpy, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 200, 50, " + (alpha * 0.6) + ")";
        ctx.beginPath();
        ctx.arc(fpx, fpy, 10, 0, Math.PI * 2);
        ctx.fill();
        // Flicker
        ctx.fillStyle = "rgba(255, 255, 100, " + (alpha * 0.3) + ")";
        ctx.beginPath();
        ctx.arc(fpx + Math.random() * 6 - 3, fpy + Math.random() * 6 - 3, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Draw the active boss
function drawBoss(ctx, cameraX, cameraY) {
    // Draw boss intro cutscene
    if (bossIntroTimer > 0 && bossIntroType) {
        drawBossIntro(ctx);
        return;
    }

    if (!activeBoss) return;

    const boss = activeBoss;
    const sx = boss.x - cameraX;
    const sy = boss.y - cameraY;

    if (boss.type === "monkey2") drawMonkey2(ctx, sx, sy, boss);
    else if (boss.type === "lizard2") drawLizard2Boss(ctx, sx, sy, boss);
    else if (boss.type === "smasher1") drawSmasher1Boss(ctx, sx, sy, boss);

    // Draw boss projectiles
    for (let i = 0; i < bossProjectiles.length; i++) {
        const p = bossProjectiles[i];
        const px = p.x - cameraX;
        const py = p.y - cameraY;

        if (p.type === "banana") {
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(p.angle);
            ctx.fillStyle = "#ffdd00";
            ctx.beginPath();
            ctx.ellipse(0, 0, 10, 5, 0, 0, Math.PI);
            ctx.fill();
            ctx.fillStyle = "#ccaa00";
            ctx.beginPath();
            ctx.ellipse(0, -1, 8, 3, 0, Math.PI, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#886600";
            ctx.beginPath();
            ctx.arc(-9, 1, 2, 0, Math.PI * 2);
            ctx.arc(9, 1, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        } else if (p.type === "fireball") {
            ctx.fillStyle = "#ff4400";
            ctx.shadowColor = "#ff6600";
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(px, py, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = "#ffcc00";
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fill();
            // Smoke trail
            ctx.fillStyle = "rgba(80, 40, 10, 0.4)";
            ctx.beginPath();
            ctx.arc(px - p.vx * 2, py - p.vy * 2, 5, 0, Math.PI * 2);
            ctx.fill();
        } else if (p.type === "boomerang") {
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(p.angle);
            // Hammer head
            ctx.fillStyle = "#666688";
            ctx.fillRect(-14, -8, 28, 16);
            ctx.strokeStyle = "#444466";
            ctx.lineWidth = 2;
            ctx.strokeRect(-14, -8, 28, 16);
            // Handle
            ctx.fillStyle = "#8B6914";
            ctx.fillRect(-3, 8, 6, 14);
            ctx.restore();
        }
    }

    // Boss health bar
    drawBossHealthBar(ctx, boss);

    // Victory message
    if (bossVictoryTimer > 0) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, canvas.height / 2 - 50, canvas.width, 100);

        ctx.fillStyle = "#ffcc00";
        ctx.font = "bold 36px monospace";
        ctx.textAlign = "center";
        ctx.shadowColor = "#ffcc00";
        ctx.shadowBlur = 15;
        ctx.fillText("VICTORY!", canvas.width / 2, canvas.height / 2);
        ctx.shadowBlur = 0;

        const bossName = bossArenas[boss.type].name;
        const coinReward = boss.type === "monkey2" ? 50 : (boss.type === "lizard2" ? 75 : 100);
        ctx.fillStyle = "#ffffff";
        ctx.font = "16px monospace";
        ctx.fillText(bossName + " defeated! +" + coinReward + " coins", canvas.width / 2, canvas.height / 2 + 30);
        ctx.textAlign = "left";
    }
}

// Draw Monkey 2.0 — big scary monkey
function drawMonkey2(ctx, sx, sy, boss) {
    const w = boss.width;
    const h = boss.height;
    const cx = sx + w / 2;
    const cy = sx + h / 2;

    if (boss.damageFlash > 0 && boss.damageFlash % 3 < 2) {
        ctx.globalAlpha = 0.6;
    }

    if (boss.slamming) {
        const progress = boss.slamLandTimer / 40;
        const jumpHeight = Math.sin(progress * Math.PI) * 80;

        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        ctx.ellipse(cx, sy + h + 4, w / 2 * (1.5 - progress), 8 * (1.5 - progress), 0, 0, Math.PI * 2);
        ctx.fill();

        drawMonkey2Body(ctx, sx, sy - jumpHeight, w, h, boss);

        ctx.strokeStyle = "#ff4444";
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5 + (1 - progress) * 0.5;
        ctx.beginPath();
        ctx.arc(player.x + player.width/2 - (boss.x + w/2 - sx), player.y + player.height/2 - (boss.y + h/2 - sy), 40, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    } else {
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        ctx.ellipse(cx, sy + h + 4, w / 2.2, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        drawMonkey2Body(ctx, sx, sy, w, h, boss);
    }

    ctx.globalAlpha = 1.0;
}

function drawMonkey2Body(ctx, sx, sy, w, h, boss) {
    const cx = sx + w / 2;
    const cy = sy + h / 2;
    const r = w / 2;

    ctx.fillStyle = "#5a2a0a";
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#3a1a00";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#8a6040";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 5, r * 0.55, r * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#5a2a0a";
    ctx.beginPath();
    ctx.arc(cx - r + 4, cy - r + 6, 9, 0, Math.PI * 2);
    ctx.arc(cx + r - 4, cy - r + 6, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#cc6644";
    ctx.beginPath();
    ctx.arc(cx - r + 4, cy - r + 6, 5, 0, Math.PI * 2);
    ctx.arc(cx + r - 4, cy - r + 6, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#8a6040";
    ctx.beginPath();
    ctx.ellipse(cx, cy - 4, 14, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffeeee";
    ctx.beginPath();
    ctx.ellipse(cx - 9, cy - 6, 7, 8, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 9, cy - 6, 7, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#ff4444";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy - 8);
    ctx.lineTo(cx - 10, cy - 6);
    ctx.moveTo(cx + 14, cy - 8);
    ctx.lineTo(cx + 10, cy - 6);
    ctx.stroke();

    const lookX = (player.x - boss.x) > 0 ? 2 : -2;
    ctx.fillStyle = "#cc0000";
    ctx.beginPath();
    ctx.arc(cx - 9 + lookX, cy - 5, 4, 0, Math.PI * 2);
    ctx.arc(cx + 9 + lookX, cy - 5, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath();
    ctx.arc(cx - 9 + lookX, cy - 5, 2.5, 0, Math.PI * 2);
    ctx.arc(cx + 9 + lookX, cy - 5, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#3a1a00";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 16, cy - 16);
    ctx.lineTo(cx - 4, cy - 12);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 16, cy - 16);
    ctx.lineTo(cx + 4, cy - 12);
    ctx.stroke();

    ctx.fillStyle = "#3a1a00";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2, 5, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#220000";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 10, 10, 6, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(cx - 7, cy + 7);
    ctx.lineTo(cx - 5, cy + 13);
    ctx.lineTo(cx - 3, cy + 7);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 3, cy + 7);
    ctx.lineTo(cx + 5, cy + 13);
    ctx.lineTo(cx + 7, cy + 7);
    ctx.fill();

    ctx.fillStyle = "#5a2a0a";
    ctx.strokeStyle = "#3a1a00";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - r + 4, cy);
    ctx.quadraticCurveTo(cx - r - 14, cy + 4, cx - r - 10, cy + 18);
    ctx.quadraticCurveTo(cx - r - 6, cy + 22, cx - r + 2, cy + 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + r - 4, cy);
    ctx.quadraticCurveTo(cx + r + 14, cy + 4, cx + r + 10, cy + 18);
    ctx.quadraticCurveTo(cx + r + 6, cy + 22, cx + r - 2, cy + 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#8a6040";
    ctx.beginPath();
    ctx.arc(cx - r - 10, cy + 18, 6, 0, Math.PI * 2);
    ctx.arc(cx + r + 10, cy + 18, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ff4444";
    ctx.beginPath();
    ctx.moveTo(cx - 12, cy - r + 2);
    ctx.lineTo(cx - 8, cy - r - 12);
    ctx.lineTo(cx - 3, cy - r + 2);
    ctx.lineTo(cx + 2, cy - r - 15);
    ctx.lineTo(cx + 7, cy - r + 2);
    ctx.lineTo(cx + 12, cy - r - 10);
    ctx.lineTo(cx + 15, cy - r + 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#ff6644";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";
    ctx.fillText("2.0", cx, sy - 8);
    ctx.textAlign = "left";
}

// Draw Lizard 2.0 — giant armored lizard
function drawLizard2Boss(ctx, sx, sy, boss) {
    const w = boss.width;
    const h = boss.height;
    const cx = sx + w / 2;
    const cy = sy + h / 2;
    const r = w / 2;

    if (boss.damageFlash > 0 && boss.damageFlash % 3 < 2) ctx.globalAlpha = 0.6;

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(cx, sy + h + 4, r - 4, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Long thick tail
    ctx.strokeStyle = boss.enraged ? "#884422" : "#1a5a1a";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(cx - r, cy + 6);
    ctx.quadraticCurveTo(cx - r - 30, cy - 6, cx - r - 22, cy + 20);
    ctx.stroke();
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx - r - 22, cy + 20);
    ctx.quadraticCurveTo(cx - r - 16, cy + 30, cx - r - 26, cy + 26);
    ctx.stroke();
    ctx.lineCap = "butt";

    // Body — big oval
    const bodyColor = boss.enraged ? "#8a4422" : "#2a7a2a";
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = boss.enraged ? "#663311" : "#1a5a1a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * 0.85, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Armored scales — darker patches
    ctx.fillStyle = boss.enraged ? "#663311" : "#1a5a1a";
    for (let si = -3; si <= 3; si++) {
        for (let sj = -1; sj <= 1; sj++) {
            ctx.beginPath();
            ctx.arc(cx + si * 7, cy + 4 + sj * 7, 4, 0, Math.PI);
            ctx.fill();
        }
    }

    // Belly
    ctx.fillStyle = boss.enraged ? "#ccaa66" : "#88cc66";
    ctx.beginPath();
    ctx.ellipse(cx, cy + 6, r * 0.5, r * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head spikes — bigger than regular lizard
    ctx.fillStyle = boss.enraged ? "#cc3300" : "#1a6a1a";
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy - r + 2);
    ctx.lineTo(cx - 5, cy - r - 14);
    ctx.lineTo(cx - 1, cy - r + 2);
    ctx.lineTo(cx + 3, cy - r - 12);
    ctx.lineTo(cx + 7, cy - r + 2);
    ctx.lineTo(cx + 10, cy - r - 10);
    ctx.lineTo(cx + 12, cy - r + 2);
    ctx.closePath();
    ctx.fill();

    // Eyes — big, reptilian, glowing
    ctx.fillStyle = boss.enraged ? "#ff4400" : "#ccff44";
    ctx.beginPath();
    ctx.ellipse(cx - 10, cy - 8, 8, 6, -0.1, 0, Math.PI * 2);
    ctx.ellipse(cx + 10, cy - 8, 8, 6, 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(cx - 10, cy - 8, 8, 6, -0.1, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx + 10, cy - 8, 8, 6, 0.1, 0, Math.PI * 2);
    ctx.stroke();

    // Slit pupils
    const lookX = (player.x - boss.x) > 0 ? 1.5 : -1.5;
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath();
    ctx.ellipse(cx - 10 + lookX, cy - 8, 2, 5, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 10 + lookX, cy - 8, 2, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mouth — open, showing fire
    ctx.fillStyle = "#1a3a1a";
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy + 6);
    ctx.lineTo(cx - 6, cy + 12);
    ctx.lineTo(cx + 6, cy + 12);
    ctx.lineTo(cx + 14, cy + 6);
    ctx.closePath();
    ctx.fill();

    // Fire in mouth
    if (boss.attackTimer < 20) {
        ctx.fillStyle = "#ff6600";
        ctx.beginPath();
        ctx.arc(cx, cy + 9, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffcc00";
        ctx.beginPath();
        ctx.arc(cx, cy + 9, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    // Teeth
    ctx.fillStyle = "#ffffff";
    for (let t = -2; t <= 2; t++) {
        ctx.fillRect(cx + t * 5 - 1, cy + 6, 3, 4);
    }

    // Arms/legs — thick and clawed
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.ellipse(cx - r - 4, cy + 6, 8, 5, -0.3, 0, Math.PI * 2);
    ctx.ellipse(cx + r + 4, cy + 6, 8, 5, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Claws
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 2;
    for (let side = -1; side <= 1; side += 2) {
        const ax = cx + side * (r + 10);
        ctx.beginPath();
        ctx.moveTo(ax, cy + 3);
        ctx.lineTo(ax + side * 4, cy);
        ctx.moveTo(ax, cy + 6);
        ctx.lineTo(ax + side * 4, cy + 6);
        ctx.moveTo(ax, cy + 9);
        ctx.lineTo(ax + side * 4, cy + 12);
        ctx.stroke();
    }

    // "2.0" label
    ctx.fillStyle = boss.enraged ? "#ff4400" : "#44ff44";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "center";
    ctx.fillText("2.0", cx, sy - 8);

    // Enraged fire aura
    if (boss.enraged) {
        ctx.strokeStyle = "#ff4400";
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.4 + Math.sin(Date.now() / 100) * 0.2;
        ctx.beginPath();
        ctx.arc(cx, cy, r + 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    }

    ctx.textAlign = "left";
    ctx.globalAlpha = 1.0;
}

// Draw Smasher 1.0 — big armored brute with a hammer
function drawSmasher1Boss(ctx, sx, sy, boss) {
    const w = boss.width;
    const h = boss.height;
    const cx = sx + w / 2;
    const cy = sy + h / 2;
    const r = w / 2;

    if (boss.damageFlash > 0 && boss.damageFlash % 3 < 2) ctx.globalAlpha = 0.6;

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(cx, sy + h + 6, r - 4, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs — thick stumps
    ctx.fillStyle = "#444466";
    ctx.fillRect(cx - 18, sy + h - 16, 14, 22);
    ctx.fillRect(cx + 4, sy + h - 16, 14, 22);

    // Boots
    ctx.fillStyle = "#333344";
    ctx.fillRect(cx - 20, sy + h + 4, 18, 8);
    ctx.fillRect(cx + 2, sy + h + 4, 18, 8);

    // Body — big square torso with armor
    ctx.fillStyle = "#555577";
    ctx.beginPath();
    ctx.moveTo(cx - r + 5, sy + 20);
    ctx.lineTo(cx + r - 5, sy + 20);
    ctx.lineTo(cx + r - 2, sy + h - 10);
    ctx.lineTo(cx - r + 2, sy + h - 10);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#333355";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Chest armor plate
    ctx.fillStyle = "#666688";
    ctx.beginPath();
    ctx.moveTo(cx - 18, sy + 24);
    ctx.lineTo(cx + 18, sy + 24);
    ctx.lineTo(cx + 15, sy + 50);
    ctx.lineTo(cx - 15, sy + 50);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#8888aa";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Belt
    ctx.fillStyle = "#8B6914";
    ctx.fillRect(cx - r + 4, sy + h - 18, w - 8, 8);
    ctx.fillStyle = "#ffcc00";
    ctx.beginPath();
    ctx.arc(cx, sy + h - 14, 5, 0, Math.PI * 2);
    ctx.fill();

    // Arms
    ctx.fillStyle = "#555577";
    // Left arm
    ctx.fillRect(cx - r - 8, sy + 24, 12, 30);
    // Right arm (hammer arm)
    ctx.fillRect(cx + r - 4, sy + 24, 12, 30);

    // Gloves
    ctx.fillStyle = "#444466";
    ctx.beginPath();
    ctx.arc(cx - r - 2, sy + 56, 8, 0, Math.PI * 2);
    ctx.arc(cx + r + 2, sy + 56, 8, 0, Math.PI * 2);
    ctx.fill();

    // Head — helmet
    ctx.fillStyle = "#666688";
    ctx.beginPath();
    ctx.arc(cx, sy + 16, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#444466";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, sy + 16, 18, 0, Math.PI * 2);
    ctx.stroke();

    // Helmet visor
    ctx.fillStyle = "#333355";
    ctx.beginPath();
    ctx.moveTo(cx - 14, sy + 12);
    ctx.lineTo(cx + 14, sy + 12);
    ctx.lineTo(cx + 12, sy + 22);
    ctx.lineTo(cx - 12, sy + 22);
    ctx.closePath();
    ctx.fill();

    // Glowing eyes through visor
    ctx.fillStyle = "#ff4444";
    ctx.shadowColor = "#ff4444";
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(cx - 6, sy + 16, 3, 0, Math.PI * 2);
    ctx.arc(cx + 6, sy + 16, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Helmet spike
    ctx.fillStyle = "#666688";
    ctx.beginPath();
    ctx.moveTo(cx - 4, sy - 2);
    ctx.lineTo(cx, sy - 12);
    ctx.lineTo(cx + 4, sy - 2);
    ctx.closePath();
    ctx.fill();

    // Hammer (always visible, may be swinging)
    if (boss.hammerSwinging) {
        ctx.save();
        ctx.translate(cx + r + 2, sy + 56);

        if (boss.hammerWindup > 0) {
            // Winding up — hammer raised
            const windupPct = boss.hammerWindup / 30;
            ctx.rotate(-Math.PI * 0.6 * windupPct);

            // Warning flash
            ctx.fillStyle = "rgba(255, 100, 100, " + (windupPct * 0.4) + ")";
            ctx.beginPath();
            ctx.arc(0, 0, 60, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Swinging down
            const swingPct = 1 - (boss.hammerSwingTimer / 15);
            ctx.rotate(Math.PI * 0.5 * swingPct);
        }

        // Hammer handle
        ctx.fillStyle = "#8B6914";
        ctx.fillRect(-3, 0, 6, 35);
        // Hammer head
        ctx.fillStyle = "#555577";
        ctx.fillRect(-12, 30, 24, 16);
        ctx.strokeStyle = "#333355";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-12, 30, 24, 16);
        // Metal studs
        ctx.fillStyle = "#8888aa";
        ctx.beginPath();
        ctx.arc(-6, 38, 2, 0, Math.PI * 2);
        ctx.arc(6, 38, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    } else {
        // Idle — hammer held to the side
        ctx.fillStyle = "#8B6914";
        ctx.fillRect(cx + r + 8, sy + 40, 5, 30);
        ctx.fillStyle = "#555577";
        ctx.fillRect(cx + r - 2, sy + 66, 20, 12);
        ctx.strokeStyle = "#333355";
        ctx.lineWidth = 1;
        ctx.strokeRect(cx + r - 2, sy + 66, 20, 12);
    }

    // "1.0" label
    ctx.fillStyle = "#8888ff";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "center";
    ctx.fillText("1.0", cx, sy - 14);
    ctx.textAlign = "left";

    ctx.globalAlpha = 1.0;
}

// Draw the boss intro cutscene
function drawBossIntro(ctx) {
    const arena = bossArenas[bossIntroType];
    if (!arena) return;

    // Progress: 0 at start → 1 at end
    const progress = 1 - (bossIntroTimer / 180);

    // Black overlay that fades in then out
    const overlayAlpha = progress < 0.3 ? (progress / 0.3) * 0.85 : (progress > 0.8 ? (1 - progress) / 0.2 * 0.85 : 0.85);
    ctx.fillStyle = "rgba(0, 0, 0, " + overlayAlpha + ")";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cinematic bars (top and bottom)
    const barH = 60;
    const barAlpha = Math.min(1, progress * 3);
    ctx.fillStyle = "rgba(0, 0, 0, " + barAlpha + ")";
    ctx.fillRect(0, 0, canvas.width, barH);
    ctx.fillRect(0, canvas.height - barH, canvas.width, barH);

    // Warning line effects
    ctx.strokeStyle = arena.borderColor;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.3 + Math.sin(Date.now() / 150) * 0.2;
    ctx.beginPath();
    ctx.moveTo(0, barH);
    ctx.lineTo(canvas.width, barH);
    ctx.moveTo(0, canvas.height - barH);
    ctx.lineTo(canvas.width, canvas.height - barH);
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // Big boss symbol — fades in and pulses
    if (progress > 0.1) {
        const symbolAlpha = Math.min(1, (progress - 0.1) * 3);
        const symbolScale = 0.8 + Math.sin(Date.now() / 300) * 0.1;
        ctx.globalAlpha = symbolAlpha * 0.6;
        ctx.font = Math.round(80 * symbolScale) + "px serif";
        ctx.textAlign = "center";
        ctx.fillText(arena.symbol, canvas.width / 2, canvas.height / 2 - 20);
        ctx.globalAlpha = 1.0;
    }

    // Boss name — slides in from the side, big and bold
    if (progress > 0.25) {
        const nameProgress = Math.min(1, (progress - 0.25) * 3);
        const slideX = (1 - nameProgress) * 200;

        // Name shadow/glow
        ctx.shadowColor = arena.borderColor;
        ctx.shadowBlur = 20 + Math.sin(Date.now() / 200) * 5;
        ctx.fillStyle = arena.borderColor;
        ctx.font = "bold 48px monospace";
        ctx.textAlign = "center";
        ctx.globalAlpha = nameProgress;
        ctx.fillText(arena.name.toUpperCase(), canvas.width / 2 + slideX, canvas.height / 2 + 50);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
    }

    // Subtitle — "GET READY"
    if (progress > 0.5) {
        const subAlpha = Math.min(1, (progress - 0.5) * 3);
        ctx.globalAlpha = subAlpha * (0.5 + Math.sin(Date.now() / 200) * 0.3);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 18px monospace";
        ctx.textAlign = "center";
        ctx.fillText("GET READY", canvas.width / 2, canvas.height / 2 + 85);
        ctx.globalAlpha = 1.0;
    }

    // Horizontal slash lines for drama
    if (progress > 0.2 && progress < 0.9) {
        ctx.strokeStyle = arena.borderColor;
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.15;
        for (let i = 0; i < 8; i++) {
            const ly = canvas.height * 0.2 + i * (canvas.height * 0.6 / 8);
            ctx.beginPath();
            ctx.moveTo(0, ly);
            ctx.lineTo(canvas.width, ly);
            ctx.stroke();
        }
        ctx.globalAlpha = 1.0;
    }

    ctx.textAlign = "left";
}

// Draw the boss health bar at the top of the screen
function drawBossHealthBar(ctx, boss) {
    if (bossVictoryTimer > 0) return;

    const barW = 300;
    const barH = 16;
    const barX = (canvas.width - barW) / 2;
    const barY = 10;

    const bossName = bossArenas[boss.type].name.toUpperCase();
    const borderColor = bossArenas[boss.type].borderColor;

    ctx.fillStyle = borderColor;
    ctx.font = "bold 14px monospace";
    ctx.textAlign = "center";
    ctx.fillText(bossName, canvas.width / 2, barY - 2);

    ctx.fillStyle = "#220000";
    ctx.fillRect(barX - 2, barY, barW + 4, barH + 4);

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(barX - 2, barY, barW + 4, barH + 4);

    const hp = boss.hp / boss.maxHp;
    ctx.fillStyle = hp > 0.5 ? borderColor : (hp > 0.25 ? "#ff8800" : "#ff0000");
    ctx.fillRect(barX, barY + 2, barW * hp, barH);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px monospace";
    ctx.fillText(boss.hp + " / " + boss.maxHp, canvas.width / 2, barY + barH - 1);
    ctx.textAlign = "left";
}
