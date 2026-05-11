// world.js — The city that Jay explores (organic Zelda-style layout!)

const WORLD_WIDTH = 4800;
const WORLD_HEIGHT = 4800;

const buildings = [];
const decorations = [];
const extraColliders = [];
const waterBodies = [];
const FACADE_HEIGHT = 50;

// Seeded random for consistent world generation
function makeRng(seed) {
    let s = seed | 0;
    return function () {
        s = Math.imul(s, 1664525) + 1013904223 | 0;
        return (s >>> 0) / 4294967296;
    };
}

// Building color palettes — each building is a unique storefront
const PALETTES = [
    { roof: "#5a5068", roofDark: "#4a4058", wall: "#c06030", wallDark: "#a04820", trim: "#3a2a1a", window: "#88ccee", sign: "#e84040", signText: "PIZZA" },
    { roof: "#506858", roofDark: "#405848", wall: "#6898a8", wallDark: "#507888", trim: "#2a3a3a", window: "#aaddee", sign: "#40a0e0", signText: "CYBER" },
    { roof: "#685850", roofDark: "#584840", wall: "#d0b888", wallDark: "#b09868", trim: "#4a3a2a", window: "#ddeebb", sign: "#e8a030", signText: "BAKERY" },
    { roof: "#585868", roofDark: "#484858", wall: "#9888a8", wallDark: "#786888", trim: "#2a2a3a", window: "#bbaadd", sign: "#aa44cc", signText: "NEON" },
    { roof: "#506050", roofDark: "#405040", wall: "#88a878", wallDark: "#688858", trim: "#2a3a2a", window: "#cceecc", sign: "#44bb44", signText: "FRESH" },
    { roof: "#685048", roofDark: "#584038", wall: "#b87858", wallDark: "#985838", trim: "#3a2a1a", window: "#eeccaa", sign: "#dd6622", signText: "TURBO" },
    { roof: "#505868", roofDark: "#404858", wall: "#7888b0", wallDark: "#586898", trim: "#2a2a3a", window: "#aabbee", sign: "#3388ff", signText: "TECH" },
    { roof: "#605858", roofDark: "#504848", wall: "#c8a8a8", wallDark: "#a88888", trim: "#3a2a2a", window: "#eecccc", sign: "#ee5577", signText: "CAFE" },
    { roof: "#586050", roofDark: "#485040", wall: "#a0b898", wallDark: "#809878", trim: "#2a3a2a", window: "#ccddcc", sign: "#55aa55", signText: "GAME" },
    { roof: "#605060", roofDark: "#504050", wall: "#b898b8", wallDark: "#987898", trim: "#3a2a3a", window: "#ddbbdd", sign: "#cc44aa", signText: "MEGA" },
];

// City districts — each has its own personality and ground color
const DISTRICTS = [
    { name: "Residential",  x: 0,    y: 0,    w: 1500, h: 1300, ground: "#6a8a5a", count: 8,  minSz: 100, maxSz: 170, pals: [2, 4, 7],        trees: 10 },
    { name: "Tech Quarter", x: 1500, y: 0,    w: 1600, h: 1300, ground: "#5a5a72", count: 9,  minSz: 160, maxSz: 260, pals: [1, 3, 6, 9],     trees: 3 },
    { name: "Industrial",   x: 3100, y: 0,    w: 1700, h: 1300, ground: "#68685a", count: 5,  minSz: 220, maxSz: 340, pals: [5, 6],            trees: 1 },
    { name: "Old Town",     x: 0,    y: 1300, w: 1200, h: 1400, ground: "#786e62", count: 7,  minSz: 110, maxSz: 190, pals: [0, 2, 5, 7],     trees: 5 },
    { name: "Downtown",     x: 1200, y: 1300, w: 1900, h: 1400, ground: "#82828a", count: 14, minSz: 180, maxSz: 300, pals: [0, 1, 3, 6, 9],  trees: 2 },
    { name: "Market",       x: 3100, y: 1300, w: 1700, h: 1400, ground: "#8a7a68", count: 10, minSz: 80,  maxSz: 170, pals: [0, 2, 5, 7, 8],  trees: 4 },
    { name: "Harbor",       x: 0,    y: 2700, w: 1200, h: 1300, ground: "#5a6878", count: 5,  minSz: 150, maxSz: 230, pals: [1, 6],            trees: 2 },
    { name: "South Side",   x: 1200, y: 2700, w: 1600, h: 1300, ground: "#6a6a6a", count: 7,  minSz: 130, maxSz: 220, pals: [0, 3, 5, 8],     trees: 3 },
    { name: "Park",         x: 2800, y: 2700, w: 1000, h: 1300, ground: "#3a8a2a", count: 1,  minSz: 80,  maxSz: 120, pals: [4],               trees: 18 },
    { name: "Hideout Zone", x: 3800, y: 2700, w: 1000, h: 1300, ground: "#5a6a52", count: 4,  minSz: 110, maxSz: 180, pals: [3, 4, 9],        trees: 6 },
    { name: "Outskirts",    x: 0,    y: 4000, w: 2400, h: 800,  ground: "#607a50", count: 4,  minSz: 100, maxSz: 160, pals: [2, 4],            trees: 8 },
    { name: "Suburbs",      x: 2400, y: 4000, w: 2400, h: 800,  ground: "#607060", count: 5,  minSz: 90,  maxSz: 150, pals: [2, 7, 8],        trees: 6 },
];

// Main roads — not a grid! Organic placement connecting districts
const ROADS = [
    { x: 0, y: 1260, w: 4800, h: 80, dir: "h" },
    { x: 1460, y: 0, w: 80, h: 4000, dir: "v" },
    { x: 0, y: 2660, w: 2800, h: 70, dir: "h" },
    { x: 3060, y: 1260, w: 70, h: 1470, dir: "v" },
    { x: 0, y: 3960, w: 4800, h: 70, dir: "h" },
    { x: 3760, y: 2660, w: 70, h: 1370, dir: "v" },
];

// Reserved areas where buildings can't spawn
const RESERVED = [
    { x: 300, y: 300, w: 200, h: 200 },
    { x: 3900, y: 3000, w: 400, h: 450 },
    { x: 2550, y: 350, w: 500, h: 450 },
    { x: 550, y: 3550, w: 550, h: 500 },
    { x: 1650, y: 1650, w: 600, h: 550 },
];

// === CITY GENERATION ===

function createCity() {
    const rng = makeRng(42);
    placeBuildings(rng);
    buildings.sort(function (a, b) { return a.y - b.y; });
    waterBodies.push({ x: 3050, y: 3200, w: 350, h: 220, rx: 40 });
    createDecorations(rng);
}

function placeBuildings(rng) {
    for (let di = 0; di < DISTRICTS.length; di++) {
        const dist = DISTRICTS[di];
        let placed = 0;
        let attempts = 0;

        while (placed < dist.count && attempts < dist.count * 10) {
            attempts++;
            const w = Math.round(dist.minSz + rng() * (dist.maxSz - dist.minSz));
            const h = Math.round(dist.minSz + rng() * (dist.maxSz - dist.minSz));
            const margin = 50;
            const x = Math.round(dist.x + margin + rng() * (dist.w - w - margin * 2));
            const y = Math.round(dist.y + margin + rng() * (dist.h - h - margin * 2));

            if (overlapsBuildings(x, y, w, h, 60)) continue;
            if (overlapsRoads(x, y, w, h + FACADE_HEIGHT + 20)) continue;
            if (overlapsReserved(x, y, w, h + FACADE_HEIGHT)) continue;

            const pi = dist.pals[Math.floor(rng() * dist.pals.length)];
            buildings.push({
                x: x, y: y, width: w, height: h,
                pal: PALETTES[pi],
                seed: Math.floor(rng() * 10000),
                stories: 1 + Math.floor(rng() * 3),
                hasAwning: rng() > 0.4,
                roofItems: Math.floor(rng() * 4)
            });
            placed++;
        }
    }
}

function overlapsBuildings(x, y, w, h, pad) {
    for (let i = 0; i < buildings.length; i++) {
        const b = buildings[i];
        if (x < b.x + b.width + pad && x + w + pad > b.x &&
            y < b.y + b.height + FACADE_HEIGHT + pad && y + h + pad > b.y) return true;
    }
    return false;
}

function overlapsRoads(x, y, w, h) {
    for (let i = 0; i < ROADS.length; i++) {
        const r = ROADS[i];
        if (x < r.x + r.w + 15 && x + w + 15 > r.x &&
            y < r.y + r.h + 15 && y + h + 15 > r.y) return true;
    }
    return false;
}

function overlapsReserved(x, y, w, h) {
    for (let i = 0; i < RESERVED.length; i++) {
        const r = RESERVED[i];
        if (x < r.x + r.w && x + w > r.x && y < r.y + r.h && y + h > r.y) return true;
    }
    return false;
}

function createDecorations(rng) {
    // Trees per district
    for (let di = 0; di < DISTRICTS.length; di++) {
        const dist = DISTRICTS[di];
        for (let i = 0; i < dist.trees; i++) {
            let tx, ty, ok = false;
            for (let a = 0; a < 15; a++) {
                tx = dist.x + 30 + rng() * (dist.w - 60);
                ty = dist.y + 30 + rng() * (dist.h - 60);
                if (!overlapsBuildings(tx - 10, ty - 10, 30, 30, 15) &&
                    !overlapsRoads(tx - 10, ty - 10, 30, 30) &&
                    !overlapsWater(tx - 10, ty - 10, 30, 30)) {
                    ok = true;
                    break;
                }
            }
            if (ok) decorations.push({ type: "tree", x: tx, y: ty });
        }
    }

    // Cars parked along roads
    for (let ri = 0; ri < ROADS.length; ri++) {
        const road = ROADS[ri];
        const len = road.dir === "h" ? road.w : road.h;
        const count = Math.floor(len / 250);
        for (let i = 0; i < count; i++) {
            if (rng() > 0.6) continue;
            if (road.dir === "h") {
                const cx = road.x + 100 + rng() * (road.w - 200);
                const cy = road.y + (rng() > 0.5 ? -20 : road.h + 4);
                decorations.push({ type: "car", x: cx, y: cy, color: randomCarColor(rng) });
            } else {
                const cx = road.x + (rng() > 0.5 ? -22 : road.w + 4);
                const cy = road.y + 100 + rng() * (road.h - 200);
                decorations.push({ type: "carV", x: cx, y: cy, color: randomCarColor(rng) });
            }
        }
    }

    // Bollards near building entrances
    for (let i = 0; i < buildings.length; i++) {
        if (rng() > 0.35) continue;
        const b = buildings[i];
        decorations.push({ type: "bollard", x: b.x - 14, y: b.y + b.height + FACADE_HEIGHT + 6 });
        if (rng() > 0.5) {
            decorations.push({ type: "bollard", x: b.x + b.width + 16, y: b.y + b.height + FACADE_HEIGHT + 6 });
        }
    }

    // Lamp posts along roads
    for (let ri = 0; ri < ROADS.length; ri++) {
        const road = ROADS[ri];
        const step = 180 + rng() * 120;
        if (road.dir === "h") {
            for (let x = road.x + 80; x < road.x + road.w - 80; x += step) {
                decorations.push({ type: "lamp", x: x, y: road.y - 14 });
            }
        } else {
            for (let y = road.y + 80; y < road.y + road.h - 80; y += step) {
                decorations.push({ type: "lamp", x: road.x - 14, y: y });
            }
        }
    }

    // Manholes on roads
    for (let ri = 0; ri < ROADS.length; ri++) {
        const road = ROADS[ri];
        const len = road.dir === "h" ? road.w : road.h;
        const count = Math.floor(len / 500);
        for (let i = 0; i < count; i++) {
            if (rng() > 0.5) continue;
            if (road.dir === "h") {
                decorations.push({ type: "manhole", x: road.x + 120 + rng() * (road.w - 240), y: road.y + road.h / 2 - 12 });
            } else {
                decorations.push({ type: "manhole", x: road.x + road.w / 2 - 12, y: road.y + 120 + rng() * (road.h - 240) });
            }
        }
    }

    // Trash cans near buildings
    for (let i = 0; i < buildings.length; i++) {
        if (rng() > 0.3) continue;
        const b = buildings[i];
        decorations.push({ type: "trash", x: b.x + b.width + 16, y: b.y + b.height + FACADE_HEIGHT - 12 });
    }

    // Parking signs near buildings
    for (let i = 0; i < buildings.length; i++) {
        if (rng() > 0.18) continue;
        const b = buildings[i];
        decorations.push({ type: "parking", x: b.x - 12, y: b.y + b.height + FACADE_HEIGHT + 4 });
    }

    // Traffic lights at road intersections
    for (let i = 0; i < ROADS.length; i++) {
        for (let j = i + 1; j < ROADS.length; j++) {
            if (ROADS[i].dir === ROADS[j].dir) continue;
            const hR = ROADS[i].dir === "h" ? ROADS[i] : ROADS[j];
            const vR = ROADS[i].dir === "h" ? ROADS[j] : ROADS[i];
            if (vR.x < hR.x + hR.w && vR.x + vR.w > hR.x &&
                hR.y < vR.y + vR.h && hR.y + hR.h > vR.y) {
                decorations.push({ type: "trafficLight", x: vR.x - 12, y: hR.y - 12 });
                decorations.push({ type: "trafficLight", x: vR.x + vR.w + 4, y: hR.y + hR.h + 4 });
            }
        }
    }

    // Fountain in downtown center
    decorations.push({ type: "fountain", x: 2100, y: 1950 });

    // Benches in the park
    for (let i = 0; i < 5; i++) {
        const bx = 2900 + rng() * 700;
        const by = 2800 + rng() * 1000;
        if (!overlapsWater(bx, by, 30, 16)) {
            decorations.push({ type: "bench", x: bx, y: by });
        }
    }
}

function overlapsWater(x, y, w, h) {
    for (let i = 0; i < waterBodies.length; i++) {
        const wb = waterBodies[i];
        if (x < wb.x + wb.w + 10 && x + w > wb.x - 10 &&
            y < wb.y + wb.h + 10 && y + h > wb.y - 10) return true;
    }
    return false;
}

function randomCarColor(rng) {
    const colors = ["#cc3333", "#3366cc", "#33aa33", "#cccc33", "#cc6633", "#aa33cc", "#33cccc", "#eeeeee", "#555555", "#dd4444", "#4477dd"];
    return colors[Math.floor(rng() * colors.length)];
}

// === MAIN RENDER ===

function drawWorld(ctx, cameraX, cameraY, canvasWidth, canvasHeight) {
    drawGround(ctx, cameraX, cameraY, canvasWidth, canvasHeight);
    drawRoads(ctx, cameraX, cameraY, canvasWidth, canvasHeight);
    drawSidewalks(ctx, cameraX, cameraY, canvasWidth, canvasHeight);

    drawDecorationsLayer(ctx, cameraX, cameraY, canvasWidth, canvasHeight, "behind");

    for (let i = 0; i < buildings.length; i++) {
        const b = buildings[i];
        if (b.x + b.width + 12 < cameraX || b.x > cameraX + canvasWidth ||
            b.y + b.height + FACADE_HEIGHT < cameraY || b.y > cameraY + canvasHeight) continue;
        drawBuilding(ctx, b, cameraX, cameraY);
    }

    drawDecorationsLayer(ctx, cameraX, cameraY, canvasWidth, canvasHeight, "front");
}

// === GROUND & ROADS ===

function drawGround(ctx, cameraX, cameraY, canvasWidth, canvasHeight) {
    ctx.fillStyle = "#4a5a4a";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // District ground colors
    for (let di = 0; di < DISTRICTS.length; di++) {
        const d = DISTRICTS[di];
        const sx = d.x - cameraX;
        const sy = d.y - cameraY;
        if (sx + d.w < 0 || sx > canvasWidth || sy + d.h < 0 || sy > canvasHeight) continue;

        ctx.fillStyle = d.ground;
        ctx.fillRect(sx, sy, d.w, d.h);

        // Subtle border between districts
        ctx.strokeStyle = "rgba(0,0,0,0.12)";
        ctx.lineWidth = 2;
        ctx.strokeRect(sx, sy, d.w, d.h);
    }

    // District name labels (very subtle)
    ctx.font = "bold 16px monospace";
    ctx.textAlign = "center";
    for (let di = 0; di < DISTRICTS.length; di++) {
        const d = DISTRICTS[di];
        const sx = d.x + d.w / 2 - cameraX;
        const sy = d.y + 30 - cameraY;
        if (sx < -200 || sx > canvasWidth + 200 || sy < -30 || sy > canvasHeight + 30) continue;
        ctx.fillStyle = "rgba(255,255,255,0.12)";
        ctx.fillText(d.name.toUpperCase(), sx, sy);
    }
    ctx.textAlign = "left";

    // Park walking paths (stone)
    const parkDist = DISTRICTS[8]; // Park
    const psx = parkDist.x - cameraX;
    const psy = parkDist.y - cameraY;
    if (psx + parkDist.w > 0 && psx < canvasWidth && psy + parkDist.h > 0 && psy < canvasHeight) {
        ctx.fillStyle = "#b8a888";
        // Horizontal path
        roundRect(ctx, psx + 40, psy + parkDist.h / 2 - 12, parkDist.w - 80, 24, 8);
        ctx.fill();
        ctx.strokeStyle = "#a09070";
        ctx.lineWidth = 2;
        roundRect(ctx, psx + 40, psy + parkDist.h / 2 - 12, parkDist.w - 80, 24, 8);
        ctx.stroke();
        // Vertical path
        roundRect(ctx, psx + parkDist.w / 2 - 12, psy + 40, 24, parkDist.h - 80, 8);
        ctx.fill();
        roundRect(ctx, psx + parkDist.w / 2 - 12, psy + 40, 24, parkDist.h - 80, 8);
        ctx.stroke();
    }

    // Park pond
    for (let wi = 0; wi < waterBodies.length; wi++) {
        const wb = waterBodies[wi];
        const wx = wb.x - cameraX;
        const wy = wb.y - cameraY;
        if (wx + wb.w < 0 || wx > canvasWidth || wy + wb.h < 0 || wy > canvasHeight) continue;

        ctx.fillStyle = "#3a6aaa";
        roundRect(ctx, wx, wy, wb.w, wb.h, wb.rx || 20);
        ctx.fill();
        ctx.strokeStyle = "#2a5a8a";
        ctx.lineWidth = 3;
        roundRect(ctx, wx, wy, wb.w, wb.h, wb.rx || 20);
        ctx.stroke();

        // Water shine
        ctx.fillStyle = "rgba(140,200,255,0.2)";
        ctx.beginPath();
        ctx.ellipse(wx + wb.w * 0.35, wy + wb.h * 0.35, wb.w * 0.2, wb.h * 0.15, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Lily pads
        ctx.fillStyle = "#3a7a3a";
        ctx.beginPath();
        ctx.arc(wx + wb.w * 0.6, wy + wb.h * 0.5, 8, 0.2, Math.PI * 1.9);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(wx + wb.w * 0.75, wy + wb.h * 0.65, 6, 0.3, Math.PI * 1.8);
        ctx.fill();
    }
}

function drawRoads(ctx, cameraX, cameraY, canvasWidth, canvasHeight) {
    for (let ri = 0; ri < ROADS.length; ri++) {
        const road = ROADS[ri];
        const sx = road.x - cameraX;
        const sy = road.y - cameraY;
        if (sx + road.w < 0 || sx > canvasWidth || sy + road.h < 0 || sy > canvasHeight) continue;

        // Road surface
        ctx.fillStyle = "#888890";
        ctx.fillRect(sx, sy, road.w, road.h);

        // Road edge lines
        ctx.fillStyle = "#9a968e";
        if (road.dir === "h") {
            ctx.fillRect(sx, sy, road.w, 3);
            ctx.fillRect(sx, sy + road.h - 3, road.w, 3);
        } else {
            ctx.fillRect(sx, sy, 3, road.h);
            ctx.fillRect(sx + road.w - 3, sy, 3, road.h);
        }

        // Yellow center dashes
        ctx.fillStyle = "#e0d040";
        if (road.dir === "h") {
            const cy = sy + road.h / 2 - 1.5;
            for (let dx = road.x; dx < road.x + road.w; dx += 30) {
                const x = dx - cameraX;
                if (x + 18 < 0) continue;
                if (x > canvasWidth) break;
                ctx.fillRect(x, cy, 18, 3);
            }
        } else {
            const cx = sx + road.w / 2 - 1.5;
            for (let dy = road.y; dy < road.y + road.h; dy += 30) {
                const y = dy - cameraY;
                if (y + 18 < 0) continue;
                if (y > canvasHeight) break;
                ctx.fillRect(cx, y, 3, 18);
            }
        }
    }

    // Crosswalks at intersections
    ctx.fillStyle = "#f0f0f0";
    for (let i = 0; i < ROADS.length; i++) {
        for (let j = i + 1; j < ROADS.length; j++) {
            if (ROADS[i].dir === ROADS[j].dir) continue;
            const hR = ROADS[i].dir === "h" ? ROADS[i] : ROADS[j];
            const vR = ROADS[i].dir === "h" ? ROADS[j] : ROADS[i];
            if (vR.x < hR.x + hR.w && vR.x + vR.w > hR.x &&
                hR.y < vR.y + vR.h && hR.y + hR.h > vR.y) {
                // Horizontal crosswalk stripes (across the vertical road)
                for (let s = 0; s < vR.w; s += 10) {
                    const cx = vR.x + s - cameraX;
                    ctx.fillRect(cx, hR.y - 14 - cameraY, 6, 10);
                    ctx.fillRect(cx, hR.y + hR.h + 4 - cameraY, 6, 10);
                }
                // Vertical crosswalk stripes (across the horizontal road)
                for (let s = 0; s < hR.h; s += 10) {
                    const cy = hR.y + s - cameraY;
                    ctx.fillRect(vR.x - 14 - cameraX, cy, 10, 6);
                    ctx.fillRect(vR.x + vR.w + 4 - cameraX, cy, 10, 6);
                }
            }
        }
    }
}

function drawSidewalks(ctx, cameraX, cameraY, canvasWidth, canvasHeight) {
    const sw = 14;
    for (let i = 0; i < buildings.length; i++) {
        const b = buildings[i];
        const sx = b.x - cameraX;
        const sy = b.y - cameraY;
        const totalH = b.height + FACADE_HEIGHT;
        if (sx + b.width + sw + 12 < 0 || sx - sw > canvasWidth ||
            sy + totalH + sw < 0 || sy - sw > canvasHeight) continue;

        ctx.fillStyle = "#c8c4bc";
        // Top
        ctx.fillRect(sx - sw, sy - sw, b.width + sw * 2 + 12, sw);
        // Bottom (below facade)
        ctx.fillRect(sx - sw, sy + totalH, b.width + sw * 2 + 12, sw);
        // Left
        ctx.fillRect(sx - sw, sy, sw, totalH);
        // Right (past side wall)
        ctx.fillRect(sx + b.width + 12, sy, sw, totalH);

        // Tile lines on sidewalk
        ctx.strokeStyle = "#bab4aa";
        ctx.lineWidth = 0.6;
        for (let tx = sx - sw; tx <= sx + b.width + sw + 12; tx += 14) {
            ctx.beginPath();
            ctx.moveTo(tx, sy - sw); ctx.lineTo(tx, sy);
            ctx.moveTo(tx, sy + totalH); ctx.lineTo(tx, sy + totalH + sw);
            ctx.stroke();
        }

        // Curb outline
        ctx.strokeStyle = "#9a968e";
        ctx.lineWidth = 2;
        ctx.strokeRect(sx - sw, sy - sw, b.width + sw * 2 + 12, totalH + sw * 2);
    }
}

// === BUILDING RENDERER (3/4 perspective) ===

function drawBuilding(ctx, b, cameraX, cameraY) {
    const sx = b.x - cameraX;
    const sy = b.y - cameraY;
    const p = b.pal;

    // === ROOFTOP ===
    ctx.fillStyle = p.roof;
    ctx.fillRect(sx, sy, b.width, b.height);
    ctx.fillStyle = p.roofDark;
    ctx.fillRect(sx, sy, b.width, 4);
    ctx.fillRect(sx, sy, 4, b.height);

    drawRoofItems(ctx, sx, sy, b);

    ctx.strokeStyle = "#2a2a30";
    ctx.lineWidth = 3;
    ctx.strokeRect(sx, sy, b.width, b.height);

    // === SOUTH FACADE ===
    const facadeY = sy + b.height;
    const fh = FACADE_HEIGHT;

    ctx.fillStyle = p.wall;
    ctx.fillRect(sx, facadeY, b.width, fh);
    ctx.fillStyle = p.wallDark;
    ctx.fillRect(sx, facadeY + fh - 8, b.width, 8);
    ctx.strokeStyle = "#2a2a30";
    ctx.lineWidth = 3;
    ctx.strokeRect(sx, facadeY, b.width, fh);

    // Story dividers
    if (b.stories > 1) {
        ctx.strokeStyle = p.trim;
        ctx.lineWidth = 2;
        for (let s = 1; s < b.stories; s++) {
            const ly = facadeY + (fh / b.stories) * s;
            ctx.beginPath();
            ctx.moveTo(sx + 3, ly);
            ctx.lineTo(sx + b.width - 3, ly);
            ctx.stroke();
        }
    }

    // Windows
    const winW = 20, winH = 14;
    const floorH = fh / b.stories;
    for (let story = 0; story < b.stories; story++) {
        const fy = facadeY + story * floorH + (floorH - winH) / 2;
        const numWindows = Math.floor((b.width - 50) / 30);
        const startX = sx + (b.width - numWindows * 30) / 2;
        for (let w = 0; w < numWindows; w++) {
            const wx = startX + w * 30;
            ctx.fillStyle = p.trim;
            ctx.fillRect(wx - 1, fy - 1, winW + 2, winH + 2);
            const litSeed = Math.sin(wx * 3.1 + fy * 7.3 + b.seed);
            ctx.fillStyle = litSeed > 0.2 ? p.window : "#2a2a3a";
            ctx.fillRect(wx, fy, winW, winH);
            ctx.strokeStyle = p.trim;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(wx + winW / 2, fy);
            ctx.lineTo(wx + winW / 2, fy + winH);
            ctx.stroke();
        }
    }

    // Door
    const doorW = 24;
    const doorH = floorH - 4;
    const doorX = sx + b.width / 2 - doorW / 2;
    const doorY = facadeY + (b.stories - 1) * floorH + 2;
    ctx.fillStyle = p.trim;
    ctx.fillRect(doorX - 2, doorY - 1, doorW + 4, doorH + 2);
    ctx.fillStyle = "#4a3520";
    roundRect(ctx, doorX, doorY, doorW, doorH, 2);
    ctx.fill();
    ctx.fillStyle = "#88bbdd";
    ctx.fillRect(doorX + 3, doorY + 2, doorW - 6, doorH * 0.4);
    ctx.fillStyle = "#d4aa30";
    ctx.beginPath();
    ctx.arc(doorX + doorW - 5, doorY + doorH / 2, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Awning
    if (b.hasAwning) {
        const awnW = 60;
        const ax = sx + b.width / 2 - awnW / 2;
        const ay = doorY - 4;
        ctx.fillStyle = p.sign;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax + awnW, ay);
        ctx.lineTo(ax + awnW - 4, ay + 12);
        ctx.lineTo(ax + 4, ay + 12);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#2a2a30";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        for (let sc = ax + 4; sc < ax + awnW - 8; sc += 10) {
            ctx.beginPath();
            ctx.arc(sc + 5, ay + 12, 4, 0, Math.PI);
            ctx.fill();
        }
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = 1;
        for (let sl = ax + 10; sl < ax + awnW - 4; sl += 10) {
            ctx.beginPath();
            ctx.moveTo(sl, ay);
            ctx.lineTo(sl - 2, ay + 12);
            ctx.stroke();
        }
    }

    // Shop sign
    if (b.pal.signText) {
        ctx.font = "bold 13px monospace";
        const tw = ctx.measureText(b.pal.signText).width;
        const signW = tw + 20;
        const signX = sx + b.width / 2 - signW / 2;
        const signY = facadeY - 2;
        ctx.fillStyle = p.sign;
        roundRect(ctx, signX, signY - 16, signW, 18, 3);
        ctx.fill();
        ctx.strokeStyle = "#2a2a30";
        ctx.lineWidth = 2;
        roundRect(ctx, signX, signY - 16, signW, 18, 3);
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText(b.pal.signText, sx + b.width / 2, signY - 3);
        ctx.textAlign = "left";
    }

    // === EAST FACADE (depth wall) ===
    const sideW = 12;
    ctx.fillStyle = p.wallDark;
    ctx.fillRect(sx + b.width, facadeY, sideW, fh);
    ctx.strokeStyle = "#2a2a30";
    ctx.lineWidth = 2;
    ctx.strokeRect(sx + b.width, facadeY, sideW, fh);
    ctx.fillStyle = p.roofDark;
    ctx.fillRect(sx + b.width, sy, sideW, b.height);
    ctx.strokeStyle = "#2a2a30";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx + b.width + sideW, sy);
    ctx.lineTo(sx + b.width + sideW, facadeY + fh);
    ctx.stroke();
}

function drawRoofItems(ctx, sx, sy, b) {
    var p = b.pal;
    if (b.roofItems === 0 || b.roofItems === 2) {
        ctx.fillStyle = "#888890";
        ctx.fillRect(sx + 20, sy + 15, 28, 20);
        ctx.strokeStyle = "#666670";
        ctx.lineWidth = 2;
        ctx.strokeRect(sx + 20, sy + 15, 28, 20);
        ctx.beginPath();
        ctx.arc(sx + 34, sy + 25, 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = p.roofDark;
        ctx.fillRect(sx + 22, sy + 35, 26, 3);
    }
    if (b.roofItems === 1 || b.roofItems === 2) {
        ctx.fillStyle = "#777780";
        ctx.fillRect(sx + b.width - 50, sy + 20, 8, 8);
        ctx.fillRect(sx + b.width - 35, sy + 18, 8, 12);
        ctx.strokeStyle = "#555560";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(sx + b.width - 50, sy + 20, 8, 8);
        ctx.strokeRect(sx + b.width - 35, sy + 18, 8, 12);
    }
    if (b.roofItems === 3) {
        ctx.fillStyle = "#999";
        ctx.beginPath();
        ctx.arc(sx + 40, sy + 30, 10, Math.PI * 0.8, Math.PI * 1.8);
        ctx.lineTo(sx + 40, sy + 30);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#666";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillRect(sx + 38, sy + 30, 4, 12);
    }
    ctx.fillStyle = "#666670";
    for (let rx = sx + 15; rx < sx + b.width - 10; rx += 40) {
        ctx.fillRect(rx, sy + b.height - 6, 3, 6);
    }
    ctx.strokeStyle = "#666670";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx + 15, sy + b.height - 3);
    ctx.lineTo(sx + b.width - 10, sy + b.height - 3);
    ctx.stroke();
}

// === DECORATION RENDERERS ===

function drawDecorationsLayer(ctx, cameraX, cameraY, canvasWidth, canvasHeight, layer) {
    for (let i = 0; i < decorations.length; i++) {
        const d = decorations[i];
        const sx = d.x - cameraX;
        const sy = d.y - cameraY;
        if (sx < -60 || sx > canvasWidth + 60 || sy < -60 || sy > canvasHeight + 60) continue;

        if (layer === "behind") {
            if (d.type === "manhole") drawManhole(ctx, sx, sy);
        } else {
            if (d.type === "car") drawCar(ctx, sx, sy, d.color);
            else if (d.type === "carV") drawCarVertical(ctx, sx, sy, d.color);
            else if (d.type === "tree") drawTree(ctx, sx, sy);
            else if (d.type === "bollard") drawBollard(ctx, sx, sy);
            else if (d.type === "lamp") drawLamp(ctx, sx, sy);
            else if (d.type === "parking") drawParkingSign(ctx, sx, sy);
            else if (d.type === "trash") drawTrash(ctx, sx, sy);
            else if (d.type === "trafficLight") drawTrafficLight(ctx, sx, sy);
            else if (d.type === "fountain") drawFountain(ctx, sx, sy);
            else if (d.type === "bench") drawBench(ctx, sx, sy);
        }
    }
}

function drawBollard(ctx, x, y) {
    ctx.fillStyle = "#ee8822";
    ctx.beginPath();
    ctx.arc(x + 5, y + 5, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#cc6600";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + 5, y + 5, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#ffaa44";
    ctx.beginPath();
    ctx.arc(x + 4, y + 3, 2, 0, Math.PI * 2);
    ctx.fill();
}

function drawManhole(ctx, x, y) {
    ctx.fillStyle = "#808088";
    ctx.strokeStyle = "#606068";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x + 12, y + 12, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#707078";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 2, y + 12); ctx.lineTo(x + 22, y + 12);
    ctx.moveTo(x + 12, y + 2); ctx.lineTo(x + 12, y + 22);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x + 12, y + 12, 6, 0, Math.PI * 2);
    ctx.stroke();
}

function drawCar(ctx, x, y, color) {
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.beginPath();
    ctx.ellipse(x + 24, y + 18, 28, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = color;
    roundRect(ctx, x, y + 3, 48, 20, 5);
    ctx.fill();
    ctx.strokeStyle = "#2a2a30";
    ctx.lineWidth = 2.5;
    roundRect(ctx, x, y + 3, 48, 20, 5);
    ctx.stroke();
    ctx.fillStyle = darkenColor(color, 25);
    roundRect(ctx, x + 8, y - 3, 32, 10, 4);
    ctx.fill();
    ctx.strokeStyle = "#2a2a30";
    ctx.lineWidth = 2;
    roundRect(ctx, x + 8, y - 3, 32, 10, 4);
    ctx.stroke();
    ctx.fillStyle = "#aaddff";
    ctx.fillRect(x + 11, y - 1, 12, 7);
    ctx.fillRect(x + 25, y - 1, 12, 7);
    ctx.strokeStyle = "#2a2a30";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 11, y - 1, 12, 7);
    ctx.strokeRect(x + 25, y - 1, 12, 7);
    ctx.fillStyle = "#222";
    ctx.beginPath();
    ctx.arc(x + 12, y + 23, 5, 0, Math.PI * 2);
    ctx.arc(x + 36, y + 23, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#666";
    ctx.beginPath();
    ctx.arc(x + 12, y + 23, 2.5, 0, Math.PI * 2);
    ctx.arc(x + 36, y + 23, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffaa";
    ctx.beginPath();
    ctx.arc(x + 46, y + 8, 2.5, 0, Math.PI * 2);
    ctx.arc(x + 46, y + 17, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff3333";
    ctx.beginPath();
    ctx.arc(x + 2, y + 8, 2.5, 0, Math.PI * 2);
    ctx.arc(x + 2, y + 17, 2.5, 0, Math.PI * 2);
    ctx.fill();
}

function drawCarVertical(ctx, x, y, color) {
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.beginPath();
    ctx.ellipse(x + 11, y + 24, 9, 28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = color;
    roundRect(ctx, x, y, 22, 48, 5);
    ctx.fill();
    ctx.strokeStyle = "#2a2a30";
    ctx.lineWidth = 2.5;
    roundRect(ctx, x, y, 22, 48, 5);
    ctx.stroke();
    ctx.fillStyle = darkenColor(color, 25);
    roundRect(ctx, x + 2, y + 8, 18, 32, 4);
    ctx.fill();
    ctx.strokeStyle = "#2a2a30";
    ctx.lineWidth = 2;
    roundRect(ctx, x + 2, y + 8, 18, 32, 4);
    ctx.stroke();
    ctx.fillStyle = "#aaddff";
    ctx.fillRect(x + 3, y + 11, 16, 11);
    ctx.fillRect(x + 3, y + 26, 16, 11);
    ctx.strokeStyle = "#2a2a30";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 3, y + 11, 16, 11);
    ctx.strokeRect(x + 3, y + 26, 16, 11);
    ctx.fillStyle = "#222";
    ctx.beginPath();
    ctx.arc(x - 1, y + 12, 4.5, 0, Math.PI * 2);
    ctx.arc(x - 1, y + 36, 4.5, 0, Math.PI * 2);
    ctx.fill();
}

function drawTree(ctx, x, y) {
    ctx.fillStyle = "#887766";
    ctx.strokeStyle = "#2a2a30";
    ctx.lineWidth = 2;
    roundRect(ctx, x - 4, y + 16, 24, 10, 3);
    ctx.fill();
    roundRect(ctx, x - 4, y + 16, 24, 10, 3);
    ctx.stroke();
    ctx.fillStyle = "#7a5a3a";
    ctx.fillRect(x + 5, y - 2, 6, 20);
    ctx.strokeStyle = "#2a2a30";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 5, y - 2, 6, 20);
    ctx.fillStyle = "#3a8830";
    ctx.beginPath();
    ctx.arc(x + 8, y - 6, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#4aaa40";
    ctx.beginPath();
    ctx.arc(x + 2, y - 3, 8, 0, Math.PI * 2);
    ctx.arc(x + 15, y - 2, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#5ac850";
    ctx.beginPath();
    ctx.arc(x + 8, y - 12, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#2a6820";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + 8, y - 6, 14, 0, Math.PI * 2);
    ctx.stroke();
}

function drawLamp(ctx, x, y) {
    ctx.fillStyle = "#555";
    ctx.strokeStyle = "#2a2a30";
    ctx.lineWidth = 2;
    ctx.fillRect(x + 3, y, 5, 22);
    ctx.strokeRect(x + 3, y, 5, 22);
    ctx.fillStyle = "#777";
    roundRect(ctx, x - 2, y - 6, 16, 8, 2);
    ctx.fill();
    ctx.strokeStyle = "#2a2a30";
    ctx.lineWidth = 1.5;
    roundRect(ctx, x - 2, y - 6, 16, 8, 2);
    ctx.stroke();
    ctx.fillStyle = "#ffffcc";
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(x + 5, y - 2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
}

function drawParkingSign(ctx, x, y) {
    ctx.fillStyle = "#666";
    ctx.fillRect(x + 4, y + 8, 4, 14);
    ctx.fillStyle = "#3366cc";
    roundRect(ctx, x, y - 2, 12, 12, 2);
    ctx.fill();
    ctx.strokeStyle = "#2a2a30";
    ctx.lineWidth = 1.5;
    roundRect(ctx, x, y - 2, 12, 12, 2);
    ctx.stroke();
    ctx.fillStyle = "white";
    ctx.font = "bold 9px monospace";
    ctx.fillText("P", x + 2, y + 8);
}

function drawTrash(ctx, x, y) {
    ctx.fillStyle = "#556655";
    roundRect(ctx, x, y, 12, 14, 2);
    ctx.fill();
    ctx.strokeStyle = "#2a2a30";
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, 12, 14, 2);
    ctx.stroke();
    ctx.fillStyle = "#667766";
    ctx.fillRect(x - 1, y - 2, 14, 4);
    ctx.strokeStyle = "#2a2a30";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 1, y - 2, 14, 4);
}

function drawTrafficLight(ctx, x, y) {
    ctx.fillStyle = "#444";
    ctx.fillRect(x + 3, y + 10, 4, 16);
    ctx.fillStyle = "#333";
    ctx.fillRect(x, y, 10, 12);
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, 10, 12);
    var lightColor = Math.sin(x * 0.13 + y * 0.17) > 0 ? "#44dd44" : "#dddd44";
    ctx.fillStyle = lightColor;
    ctx.beginPath();
    ctx.arc(x + 5, y + 6, 3, 0, Math.PI * 2);
    ctx.fill();
}

function drawFountain(ctx, x, y) {
    // Base
    ctx.fillStyle = "#888";
    ctx.beginPath();
    ctx.ellipse(x + 25, y + 35, 30, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#2a2a30";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(x + 25, y + 35, 30, 14, 0, 0, Math.PI * 2);
    ctx.stroke();
    // Water
    ctx.fillStyle = "#5a9acc";
    ctx.beginPath();
    ctx.ellipse(x + 25, y + 32, 24, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    // Center pillar
    ctx.fillStyle = "#777";
    ctx.fillRect(x + 22, y + 12, 6, 22);
    ctx.strokeStyle = "#2a2a30";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 22, y + 12, 6, 22);
    // Water spray
    ctx.strokeStyle = "#8abcee";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x + 25, y + 12, 10, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
    // Sparkle
    ctx.fillStyle = "rgba(200,230,255,0.5)";
    ctx.beginPath();
    ctx.arc(x + 25, y + 8, 3, 0, Math.PI * 2);
    ctx.fill();
}

function drawBench(ctx, x, y) {
    ctx.fillStyle = "#8a6a4a";
    ctx.fillRect(x, y + 4, 30, 6);
    ctx.strokeStyle = "#2a2a30";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y + 4, 30, 6);
    ctx.fillStyle = "#7a5a3a";
    ctx.fillRect(x + 2, y, 26, 5);
    ctx.fillStyle = "#555";
    ctx.fillRect(x + 2, y + 10, 3, 6);
    ctx.fillRect(x + 25, y + 10, 3, 6);
}

// === COLLISION ===

function collidesWithBuilding(x, y, width, height) {
    for (let i = 0; i < buildings.length; i++) {
        const b = buildings[i];
        if (x < b.x + b.width + 12 && x + width > b.x &&
            y < b.y + b.height + FACADE_HEIGHT && y + height > b.y) return true;
    }
    for (let i = 0; i < waterBodies.length; i++) {
        const wb = waterBodies[i];
        if (x < wb.x + wb.w && x + width > wb.x &&
            y < wb.y + wb.h && y + height > wb.y) return true;
    }
    return false;
}

function collidesWithAnything(x, y, width, height) {
    if (collidesWithBuilding(x, y, width, height)) return true;
    for (let i = 0; i < extraColliders.length; i++) {
        const c = extraColliders[i];
        if (x < c.x + c.width && x + width > c.x && y < c.y + c.height && y + height > c.y) return true;
    }
    return false;
}

// === UTILITIES ===

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function darkenColor(hex, amount) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    r = Math.max(0, r - amount);
    g = Math.max(0, g - amount);
    b = Math.max(0, b - amount);
    return "#" + r.toString(16).padStart(2, "0") + g.toString(16).padStart(2, "0") + b.toString(16).padStart(2, "0");
}

// === INIT ===
createCity();
