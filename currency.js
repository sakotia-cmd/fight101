// currency.js — Coins! Defeat enemies to earn money.

// How many coins Jay has
let playerCoins = 0;

// Coin item settings
const COIN_SIZE = 12;
const COIN_BOUNCE_SPEED = 0.08;

// Spawn coins at a spot (1-3 coins scattered around the position)
function spawnCoins(x, y, count) {
    for (let i = 0; i < count; i++) {
        const offsetX = (Math.random() - 0.5) * 30;
        const offsetY = (Math.random() - 0.5) * 30;
        items.push({
            x: x + offsetX,
            y: y + offsetY,
            width: COIN_SIZE,
            height: COIN_SIZE,
            type: "coin",
            age: 0
        });
    }
}

// Draw a shiny coin
function drawCoin(ctx, x, y, size, age) {
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    const bounce = Math.sin(age * COIN_BOUNCE_SPEED) * 2;
    const r = size / 2;

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + r + 2, r - 1, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Coin body — gold
    ctx.fillStyle = "#ffd700";
    ctx.beginPath();
    ctx.arc(centerX, centerY + bounce, r, 0, Math.PI * 2);
    ctx.fill();

    // Coin outline
    ctx.strokeStyle = "#b8960f";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY + bounce, r, 0, Math.PI * 2);
    ctx.stroke();

    // Inner ring
    ctx.strokeStyle = "#e8c020";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY + bounce, r - 2.5, 0, Math.PI * 2);
    ctx.stroke();

    // Dollar sign
    ctx.fillStyle = "#b8960f";
    ctx.font = "bold 8px monospace";
    ctx.textAlign = "center";
    ctx.fillText("$", centerX, centerY + bounce + 3);
    ctx.textAlign = "left";

    // Sparkle
    ctx.fillStyle = "#ffffaa";
    ctx.globalAlpha = 0.6 + Math.sin(age * 0.1) * 0.3;
    ctx.beginPath();
    ctx.arc(centerX - 2, centerY + bounce - 2, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Glow ring
    ctx.shadowColor = "#ffd700";
    ctx.shadowBlur = 4;
    ctx.strokeStyle = "rgba(255, 215, 0, 0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY + bounce, r + 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
}
