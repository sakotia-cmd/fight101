// items.js — Hamburgers and other items on the ground!

// All items currently on the ground
const items = [];

// Hamburger settings
const HAMBURGER_SIZE = 18;
const HAMBURGER_HEAL = 25;

// Drop a hamburger at a spot in the world
function spawnHamburger(x, y) {
    items.push({
        x: x,
        y: y,
        width: HAMBURGER_SIZE,
        height: HAMBURGER_SIZE,
        type: "hamburger"
    });
}

// Check if Jay is walking over any items and pick them up
function updateItems() {
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];

        if (item.age !== undefined) item.age++;

        if (rectsOverlap(
            player.x, player.y, player.width, player.height,
            item.x, item.y, item.width, item.height
        )) {
            if (item.type === "hamburger") {
                if (inventory.hamburgers < inventory.maxHamburgers) {
                    inventory.hamburgers++;
                    items.splice(i, 1);
                }
            } else if (item.type === "coin") {
                playerCoins++;
                items.splice(i, 1);
            } else {
                items.splice(i, 1);
            }
        }
    }
}

// Draw all items on the ground
function drawItems(ctx, cameraX, cameraY) {
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const screenX = item.x - cameraX;
        const screenY = item.y - cameraY;

        // Skip if off screen
        if (screenX + item.width < 0 || screenX > canvas.width ||
            screenY + item.height < 0 || screenY > canvas.height) {
            continue;
        }

        if (item.type === "hamburger") {
            drawHamburger(ctx, screenX, screenY, item.width);
        } else if (item.type === "coin") {
            drawCoin(ctx, screenX, screenY, item.width, item.age || 0);
        }
    }
}

// Draw a tasty hamburger
function drawHamburger(ctx, x, y, size) {
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    const halfSize = size / 2;

    // Bottom bun — brown
    ctx.fillStyle = "#c8842a";
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 3, halfSize, halfSize * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Patty — dark brown
    ctx.fillStyle = "#5c3317";
    ctx.fillRect(centerX - halfSize + 1, centerY - 1, size - 2, 4);

    // Lettuce — green edge
    ctx.fillStyle = "#44cc44";
    ctx.fillRect(centerX - halfSize, centerY - 3, size, 3);

    // Top bun — golden
    ctx.fillStyle = "#e8a830";
    ctx.beginPath();
    ctx.ellipse(centerX, centerY - 3, halfSize, halfSize * 0.5, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(centerX - halfSize, centerY - 3, size, 2);

    // Sesame seeds on top bun
    ctx.fillStyle = "#fff8dc";
    ctx.beginPath();
    ctx.ellipse(centerX - 3, centerY - 5, 1.5, 1, 0, 0, Math.PI * 2);
    ctx.ellipse(centerX + 3, centerY - 6, 1.5, 1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Little bounce/glow to make it inviting
    ctx.shadowColor = "#ffcc00";
    ctx.shadowBlur = 6;
    ctx.strokeStyle = "rgba(255, 200, 0, 0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, halfSize + 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
}
