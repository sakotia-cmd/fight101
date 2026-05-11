// vehicles.js — Drivable vehicles with blasters!

// All vehicles in the world
const vehicles = [];

// Is Jay currently driving a vehicle?
let inVehicle = false;
let currentVehicle = null;

// Vehicle types and their stats
const VEHICLE_TYPES = {
    car: {
        name: "Car", tier: 2,
        width: 56, height: 36,
        speed: 7, hp: 80,
        blasterDamage: 3, blasterSpeed: 8, blasterCooldown: 18,
        color: "#cc3333", accent: "#aa2222"
    },
    motorcycle: {
        name: "Motorcycle", tier: 2,
        width: 44, height: 24,
        speed: 9, hp: 50,
        blasterDamage: 2, blasterSpeed: 10, blasterCooldown: 12,
        color: "#333333", accent: "#555555"
    },
    train: {
        name: "Train", tier: 1,
        width: 70, height: 30,
        speed: 6, hp: 120,
        blasterDamage: 2, blasterSpeed: 7, blasterCooldown: 22,
        color: "#4488cc", accent: "#336699"
    },
    jet: {
        name: "Jet", tier: 3,
        width: 50, height: 34,
        speed: 11, hp: 100,
        blasterDamage: 5, blasterSpeed: 12, blasterCooldown: 15,
        color: "#888888", accent: "#666666"
    },
    submarine: {
        name: "Submarine", tier: 1,
        width: 54, height: 28,
        speed: 5, hp: 100,
        blasterDamage: 2, blasterSpeed: 6, blasterCooldown: 25,
        color: "#cc8800", accent: "#aa6600"
    }
};

// Blaster projectiles fired from vehicles
const vehicleProjectiles = [];
let vehicleBlasterCooldown = 0;

// Spawn vehicles around the city on roads
function spawnVehicles() {
    vehicles.length = 0;

    const spawns = [
        { type: "car",        x: 3775, y: 3000 },
        { type: "motorcycle", x: 3775, y: 3100 },
        { type: "jet",        x: 3775, y: 3200 },
        { type: "train",      x: 3775, y: 3300 },
        { type: "submarine",  x: 3775, y: 3400 },
        { type: "car",        x: 2200, y: 1275 },
        { type: "car",        x: 1475, y: 600  },
        { type: "motorcycle", x: 1900, y: 2675 },
        { type: "train",      x: 2600, y: 3975 },
    ];

    for (let i = 0; i < spawns.length; i++) {
        const s = spawns[i];
        const vType = VEHICLE_TYPES[s.type];
        vehicles.push({
            x: s.x, y: s.y,
            width: vType.width, height: vType.height,
            type: s.type,
            hp: vType.hp, maxHp: vType.hp,
            direction: "right",
            occupied: false
        });
    }
}

// Get in or out of a vehicle (press E)
function toggleVehicle() {
    if (inVehicle) {
        exitVehicle();
        return true;
    }

    for (let i = 0; i < vehicles.length; i++) {
        const v = vehicles[i];
        if (v.occupied) continue;
        const dist = Math.sqrt(
            Math.pow((player.x + player.width / 2) - (v.x + v.width / 2), 2) +
            Math.pow((player.y + player.height / 2) - (v.y + v.height / 2), 2)
        );
        if (dist < 60) {
            enterVehicle(v);
            return true;
        }
    }
    return false;
}

function enterVehicle(v) {
    inVehicle = true;
    currentVehicle = v;
    v.occupied = true;
    player.x = v.x + v.width / 2 - player.width / 2;
    player.y = v.y + v.height / 2 - player.height / 2;
}

function exitVehicle() {
    if (!currentVehicle) return;
    currentVehicle.occupied = false;
    player.x = currentVehicle.x + currentVehicle.width / 2 - player.width / 2;
    player.y = currentVehicle.y + currentVehicle.height + 5;
    inVehicle = false;
    currentVehicle = null;
}

// Update vehicle position (moves with Jay when driving)
function updateVehicle(keysPressed) {
    if (!inVehicle || !currentVehicle) return;

    const v = currentVehicle;
    const vType = VEHICLE_TYPES[v.type];
    let newX = v.x;
    let newY = v.y;
    let moving = false;

    if (keysPressed["ArrowUp"] || keysPressed["w"] || keysPressed["W"]) {
        newY -= vType.speed;
        v.direction = "up";
        moving = true;
    }
    if (keysPressed["ArrowDown"] || keysPressed["s"] || keysPressed["S"]) {
        newY += vType.speed;
        v.direction = "down";
        moving = true;
    }
    if (keysPressed["ArrowLeft"] || keysPressed["a"] || keysPressed["A"]) {
        newX -= vType.speed;
        v.direction = "left";
        moving = true;
    }
    if (keysPressed["ArrowRight"] || keysPressed["d"] || keysPressed["D"]) {
        newX += vType.speed;
        v.direction = "right";
        moving = true;
    }

    newX = Math.max(0, Math.min(newX, WORLD_WIDTH - v.width));
    newY = Math.max(0, Math.min(newY, WORLD_HEIGHT - v.height));

    if (!collidesWithAnything(newX, v.y, v.width, v.height)) {
        v.x = newX;
    }
    if (!collidesWithAnything(v.x, newY, v.width, v.height)) {
        v.y = newY;
    }

    player.x = v.x + v.width / 2 - player.width / 2;
    player.y = v.y + v.height / 2 - player.height / 2;
    player.direction = v.direction;

    if (vehicleBlasterCooldown > 0) vehicleBlasterCooldown--;

    // Enemies damage the vehicle on contact
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        if (enemy.damageCooldown > 0) continue;
        if (rectsOverlap(v.x, v.y, v.width, v.height,
                         enemy.x, enemy.y, enemy.width, enemy.height)) {
            damageVehicle(MONKEY_DAMAGE);
            enemy.damageCooldown = MONKEY_DAMAGE_COOLDOWN;
        }
    }
}

// Damage the vehicle Jay is in
function damageVehicle(amount) {
    if (!currentVehicle) return;
    currentVehicle.hp -= amount;
    if (currentVehicle.hp <= 0) {
        destroyVehicle();
    }
}

// Vehicle is destroyed — eject Jay
function destroyVehicle() {
    if (!currentVehicle) return;
    const vx = currentVehicle.x;
    const vy = currentVehicle.y;

    // Remove the vehicle from the array
    const idx = vehicles.indexOf(currentVehicle);
    if (idx !== -1) vehicles.splice(idx, 1);

    currentVehicle = null;
    inVehicle = false;

    player.x = vx;
    player.y = vy;

    // Schedule a respawn
    vehicleRespawnTimers.push({ timer: 600, type: null });
}

// Respawn timers for destroyed vehicles
const vehicleRespawnTimers = [];

function updateVehicleRespawns() {
    for (let i = vehicleRespawnTimers.length - 1; i >= 0; i--) {
        vehicleRespawnTimers[i].timer--;
        if (vehicleRespawnTimers[i].timer <= 0) {
            respawnRandomVehicle();
            vehicleRespawnTimers.splice(i, 1);
        }
    }
}

function respawnRandomVehicle() {
    const types = ["car", "motorcycle", "train", "jet", "submarine"];
    const type = types[Math.floor(Math.random() * types.length)];
    const vType = VEHICLE_TYPES[type];

    // Place on a random road
    const road = ROADS[Math.floor(Math.random() * ROADS.length)];
    const x = road.x + Math.random() * (road.w - vType.width);
    const y = road.y + Math.random() * (road.h - vType.height);

    vehicles.push({
        x: x, y: y,
        width: vType.width, height: vType.height,
        type: type,
        hp: vType.hp, maxHp: vType.hp,
        direction: "right",
        occupied: false
    });
}

// Fire the vehicle blaster (press SPACE while driving)
function fireVehicleBlaster() {
    if (!inVehicle || !currentVehicle) return;
    if (vehicleBlasterCooldown > 0) return;

    const v = currentVehicle;
    const vType = VEHICLE_TYPES[v.type];
    vehicleBlasterCooldown = vType.blasterCooldown;

    let angle;
    if (v.direction === "right") angle = 0;
    else if (v.direction === "down") angle = Math.PI * 0.5;
    else if (v.direction === "left") angle = Math.PI;
    else angle = -Math.PI * 0.5;

    vehicleProjectiles.push({
        x: v.x + v.width / 2 + Math.cos(angle) * (v.width / 2),
        y: v.y + v.height / 2 + Math.sin(angle) * (v.height / 2),
        vx: Math.cos(angle) * vType.blasterSpeed,
        vy: Math.sin(angle) * vType.blasterSpeed,
        damage: vType.blasterDamage,
        life: 50,
        tier: vType.tier
    });
}

// Update vehicle blaster projectiles
function updateVehicleProjectiles() {
    for (let i = vehicleProjectiles.length - 1; i >= 0; i--) {
        const p = vehicleProjectiles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        if (p.life <= 0 || p.x < 0 || p.x > WORLD_WIDTH || p.y < 0 || p.y > WORLD_HEIGHT) {
            vehicleProjectiles.splice(i, 1);
            continue;
        }

        if (collidesWithBuilding(p.x - 4, p.y - 4, 8, 8)) {
            vehicleProjectiles.splice(i, 1);
            continue;
        }

        if (activeBoss && !bossVictoryTimer &&
            rectsOverlap(p.x - 4, p.y - 4, 8, 8,
                         activeBoss.x, activeBoss.y, activeBoss.width, activeBoss.height)) {
            damageBoss(p.damage);
            vehicleProjectiles.splice(i, 1);
            continue;
        }

        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (rectsOverlap(p.x - 4, p.y - 4, 8, 8,
                             enemy.x, enemy.y, enemy.width, enemy.height)) {
                enemy.hp -= p.damage;
                vehicleProjectiles.splice(i, 1);

                if (enemy.hp <= 0) {
                    spawnCoins(enemy.x, enemy.y, 1 + Math.floor(Math.random() * 3));
                    if (Math.random() < 0.3) spawnHamburger(enemy.x, enemy.y);
                    enemies.splice(j, 1);
                }
                break;
            }
        }
    }
}

// Draw all vehicles
function drawVehicles(ctx, cameraX, cameraY) {
    for (let i = 0; i < vehicles.length; i++) {
        const v = vehicles[i];
        const sx = v.x - cameraX;
        const sy = v.y - cameraY;

        if (sx + v.width < -20 || sx > canvas.width + 20 ||
            sy + v.height < -20 || sy > canvas.height + 20) continue;

        if (v.occupied) continue; // driven vehicle drawn separately

        drawVehicleSprite(ctx, sx, sy, v);
    }
}

// Draw the vehicle Jay is currently driving (drawn around Jay)
function drawCurrentVehicle(ctx, cameraX, cameraY) {
    if (!inVehicle || !currentVehicle) return;
    const v = currentVehicle;
    const sx = v.x - cameraX;
    const sy = v.y - cameraY;
    drawVehicleSprite(ctx, sx, sy, v);

    // Health bar for the vehicle
    const barW = v.width + 10;
    const barH = 5;
    const barX = sx - 5;
    const barY = sy - 14;
    ctx.fillStyle = "#222";
    ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
    ctx.fillStyle = "#444";
    ctx.fillRect(barX, barY, barW, barH);
    const hp = v.hp / v.maxHp;
    ctx.fillStyle = hp > 0.5 ? "#44dd44" : (hp > 0.25 ? "#ffaa00" : "#ff2222");
    ctx.fillRect(barX, barY, barW * hp, barH);
}

// Draw a single vehicle
function drawVehicleSprite(ctx, sx, sy, v) {
    const vType = VEHICLE_TYPES[v.type];

    if (v.type === "car") {
        drawVehicleCar(ctx, sx, sy, v, vType);
    } else if (v.type === "motorcycle") {
        drawVehicleMotorcycle(ctx, sx, sy, v, vType);
    } else if (v.type === "train") {
        drawVehicleTrain(ctx, sx, sy, v, vType);
    } else if (v.type === "jet") {
        drawVehicleJet(ctx, sx, sy, v, vType);
    } else if (v.type === "submarine") {
        drawVehicleSubmarine(ctx, sx, sy, v, vType);
    }

    // "Press E" hint when Jay is close and not driving
    if (!v.occupied && !inVehicle) {
        const dist = Math.sqrt(
            Math.pow((player.x + player.width / 2) - (v.x + v.width / 2), 2) +
            Math.pow((player.y + player.height / 2) - (v.y + v.height / 2), 2)
        );
        if (dist < 60) {
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 10px monospace";
            ctx.textAlign = "center";
            ctx.fillText("Press E", sx + v.width / 2, sy - 6);
            ctx.fillStyle = "#aaaaaa";
            ctx.font = "9px monospace";
            ctx.fillText(vType.name, sx + v.width / 2, sy + v.height + 12);
            ctx.textAlign = "left";
        }
    }
}

// === Vehicle Drawing Functions ===

function drawVehicleCar(ctx, sx, sy, v, vType) {
    const w = v.width, h = v.height;
    const horizontal = (v.direction === "left" || v.direction === "right");

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(sx + w / 2, sy + h + 2, w / 2.2, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = vType.color;
    roundRect(ctx, sx + 2, sy + 4, w - 4, h - 6, 6);
    ctx.fill();
    ctx.strokeStyle = vType.accent;
    ctx.lineWidth = 1.5;
    roundRect(ctx, sx + 2, sy + 4, w - 4, h - 6, 6);
    ctx.stroke();

    // Roof/cabin
    ctx.fillStyle = "#557799";
    roundRect(ctx, sx + w * 0.25, sy + h * 0.15, w * 0.5, h * 0.55, 4);
    ctx.fill();

    // Windshield glare
    ctx.fillStyle = "rgba(200,230,255,0.4)";
    roundRect(ctx, sx + w * 0.27, sy + h * 0.18, w * 0.22, h * 0.48, 3);
    ctx.fill();

    // Wheels
    ctx.fillStyle = "#222";
    ctx.fillRect(sx + 4, sy, 10, 6);
    ctx.fillRect(sx + w - 14, sy, 10, 6);
    ctx.fillRect(sx + 4, sy + h - 4, 10, 6);
    ctx.fillRect(sx + w - 14, sy + h - 4, 10, 6);

    // Hubcaps
    ctx.fillStyle = "#888";
    ctx.beginPath();
    ctx.arc(sx + 9, sy + 3, 2, 0, Math.PI * 2);
    ctx.arc(sx + w - 9, sy + 3, 2, 0, Math.PI * 2);
    ctx.arc(sx + 9, sy + h - 1, 2, 0, Math.PI * 2);
    ctx.arc(sx + w - 9, sy + h - 1, 2, 0, Math.PI * 2);
    ctx.fill();

    // Headlights
    ctx.fillStyle = "#ffee88";
    if (v.direction === "right") {
        ctx.fillRect(sx + w - 3, sy + 8, 4, 5);
        ctx.fillRect(sx + w - 3, sy + h - 13, 4, 5);
    } else {
        ctx.fillRect(sx - 1, sy + 8, 4, 5);
        ctx.fillRect(sx - 1, sy + h - 13, 4, 5);
    }
}

function drawVehicleMotorcycle(ctx, sx, sy, v, vType) {
    const w = v.width, h = v.height;

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(sx + w / 2, sy + h + 2, w / 3, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wheels
    ctx.fillStyle = "#222";
    ctx.beginPath();
    ctx.arc(sx + 8, sy + h / 2, 8, 0, Math.PI * 2);
    ctx.arc(sx + w - 8, sy + h / 2, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(sx + 8, sy + h / 2, 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(sx + w - 8, sy + h / 2, 8, 0, Math.PI * 2);
    ctx.stroke();

    // Spokes
    ctx.fillStyle = "#666";
    ctx.beginPath();
    ctx.arc(sx + 8, sy + h / 2, 3, 0, Math.PI * 2);
    ctx.arc(sx + w - 8, sy + h / 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // Frame
    ctx.fillStyle = vType.color;
    ctx.beginPath();
    ctx.moveTo(sx + 14, sy + h / 2 - 2);
    ctx.lineTo(sx + w - 14, sy + h / 2 - 2);
    ctx.lineTo(sx + w - 10, sy + h / 2 + 2);
    ctx.lineTo(sx + 10, sy + h / 2 + 2);
    ctx.closePath();
    ctx.fill();

    // Seat
    ctx.fillStyle = "#664422";
    roundRect(ctx, sx + w * 0.3, sy + h * 0.1, w * 0.35, h * 0.35, 3);
    ctx.fill();

    // Handlebars
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx + w - 12, sy + h * 0.2);
    ctx.lineTo(sx + w - 8, sy + 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sx + w - 12, sy + h * 0.8);
    ctx.lineTo(sx + w - 8, sy + h - 2);
    ctx.stroke();

    // Engine
    ctx.fillStyle = "#555";
    ctx.fillRect(sx + 14, sy + h / 2 - 4, 12, 8);

    // Headlight
    ctx.fillStyle = "#ffee88";
    ctx.beginPath();
    ctx.arc(sx + w - 3, sy + h / 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // Exhaust
    ctx.fillStyle = "#777";
    ctx.fillRect(sx, sy + h / 2 - 1, 6, 3);
}

function drawVehicleTrain(ctx, sx, sy, v, vType) {
    const w = v.width, h = v.height;

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(sx + w / 2, sy + h + 2, w / 2.2, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = vType.color;
    roundRect(ctx, sx, sy + 2, w, h - 4, 4);
    ctx.fill();
    ctx.strokeStyle = vType.accent;
    ctx.lineWidth = 1.5;
    roundRect(ctx, sx, sy + 2, w, h - 4, 4);
    ctx.stroke();

    // Stripe
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(sx + 4, sy + h / 2 - 2, w - 8, 4);

    // Windows
    ctx.fillStyle = "#aaddee";
    for (let wx = sx + 8; wx < sx + w - 10; wx += 14) {
        roundRect(ctx, wx, sy + 5, 10, h * 0.35, 2);
        ctx.fill();
    }

    // Front
    ctx.fillStyle = "#ffee88";
    ctx.fillRect(sx + w - 3, sy + 6, 4, h - 12);

    // Wheels
    ctx.fillStyle = "#333";
    ctx.fillRect(sx + 6, sy + h - 3, 8, 5);
    ctx.fillRect(sx + 20, sy + h - 3, 8, 5);
    ctx.fillRect(sx + w - 28, sy + h - 3, 8, 5);
    ctx.fillRect(sx + w - 14, sy + h - 3, 8, 5);
}

function drawVehicleJet(ctx, sx, sy, v, vType) {
    const w = v.width, h = v.height;
    const cx = sx + w / 2;
    const cy = sy + h / 2;

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.beginPath();
    ctx.ellipse(cx, sy + h + 4, w / 2.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wings
    ctx.fillStyle = "#666";
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy - h * 0.7);
    ctx.lineTo(cx + 2, cy);
    ctx.lineTo(cx - 4, cy + h * 0.7);
    ctx.closePath();
    ctx.fill();

    // Body (fuselage)
    ctx.fillStyle = vType.color;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.42, h * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = vType.accent;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.42, h * 0.3, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Cockpit
    ctx.fillStyle = "#88ccee";
    ctx.beginPath();
    ctx.ellipse(cx + w * 0.2, cy, 6, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cockpit glare
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.beginPath();
    ctx.ellipse(cx + w * 0.22, cy - 1, 3, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tail fin
    ctx.fillStyle = "#555";
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.38, cy);
    ctx.lineTo(cx - w * 0.45, cy - 10);
    ctx.lineTo(cx - w * 0.3, cy);
    ctx.closePath();
    ctx.fill();

    // Jet exhaust glow
    if (v.occupied) {
        ctx.fillStyle = "rgba(255, 150, 50, 0.6)";
        ctx.beginPath();
        ctx.ellipse(cx - w * 0.44, cy, 4 + Math.random() * 3, 3, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawVehicleSubmarine(ctx, sx, sy, v, vType) {
    const w = v.width, h = v.height;
    const cx = sx + w / 2;
    const cy = sy + h / 2;

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.beginPath();
    ctx.ellipse(cx, sy + h + 2, w / 2.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hull
    ctx.fillStyle = vType.color;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2, w * 0.46, h * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = vType.accent;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2, w * 0.46, h * 0.38, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Conning tower
    ctx.fillStyle = vType.accent;
    roundRect(ctx, cx - 6, sy + 1, 12, h * 0.4, 3);
    ctx.fill();

    // Periscope
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, sy + 1);
    ctx.lineTo(cx, sy - 6);
    ctx.lineTo(cx + 5, sy - 6);
    ctx.stroke();

    // Porthole windows
    ctx.fillStyle = "#aaddee";
    ctx.beginPath();
    ctx.arc(cx - 12, cy + 2, 4, 0, Math.PI * 2);
    ctx.arc(cx + 12, cy + 2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#886600";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx - 12, cy + 2, 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 12, cy + 2, 4, 0, Math.PI * 2);
    ctx.stroke();

    // Propeller
    ctx.fillStyle = "#777";
    ctx.beginPath();
    ctx.moveTo(sx + 1, cy);
    ctx.lineTo(sx - 4, cy - 6);
    ctx.lineTo(sx - 2, cy);
    ctx.lineTo(sx - 4, cy + 6);
    ctx.closePath();
    ctx.fill();
}

// Draw vehicle blaster projectiles
function drawVehicleProjectiles(ctx, cameraX, cameraY) {
    for (let i = 0; i < vehicleProjectiles.length; i++) {
        const p = vehicleProjectiles[i];
        const sx = p.x - cameraX;
        const sy = p.y - cameraY;

        if (sx < -10 || sx > canvas.width + 10 || sy < -10 || sy > canvas.height + 10) continue;

        // Blaster bolt — color by tier
        const colors = { 1: "#44aaff", 2: "#ff8844", 3: "#ffee44" };
        const glows  = { 1: "#2288dd", 2: "#dd6622", 3: "#ddcc22" };
        const color = colors[p.tier] || "#ff8844";
        const glow = glows[p.tier] || "#dd6622";

        // Glow
        ctx.fillStyle = glow;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(sx, sy, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Bolt
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(sx, sy, 4, 0, Math.PI * 2);
        ctx.fill();

        // Bright center
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Trail
        const angle = Math.atan2(p.vy, p.vx);
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.5;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx - Math.cos(angle) * 10, sy - Math.sin(angle) * 10);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    }
}

// Draw vehicle HUD when driving
function drawVehicleHUD(ctx) {
    if (!inVehicle || !currentVehicle) return;

    const v = currentVehicle;
    const vType = VEHICLE_TYPES[v.type];

    const panelX = canvas.width - 220;
    const panelY = 15;
    const panelW = 200;
    const panelH = 50;

    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(panelX, panelY, panelW, panelH);
    ctx.strokeStyle = vType.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX, panelY, panelW, panelH);

    // Vehicle name + tier
    ctx.fillStyle = vType.color;
    ctx.font = "bold 13px monospace";
    ctx.fillText(vType.name + " (Tier " + vType.tier + ")", panelX + 8, panelY + 16);

    // Health bar
    const barX = panelX + 8;
    const barY = panelY + 24;
    const barW = panelW - 16;
    const barH = 10;
    ctx.fillStyle = "#333";
    ctx.fillRect(barX, barY, barW, barH);
    const hp = v.hp / v.maxHp;
    ctx.fillStyle = hp > 0.5 ? "#44dd44" : (hp > 0.25 ? "#ffaa00" : "#ff2222");
    ctx.fillRect(barX, barY, barW * hp, barH);
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    // HP numbers
    ctx.fillStyle = "#fff";
    ctx.font = "bold 9px monospace";
    ctx.fillText(v.hp + "/" + v.maxHp, barX + barW / 2 - 15, barY + 9);

    // Controls hint
    ctx.fillStyle = "#888";
    ctx.font = "10px monospace";
    ctx.fillText("SPACE: blaster | E: exit", panelX + 8, panelY + 46);
}

// Spawn vehicles when the game starts
spawnVehicles();
