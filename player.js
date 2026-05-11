// player.js — Jay, the main character!

// Jay's size in pixels
const PLAYER_SIZE = 36;

// How fast Jay moves (pixels per frame)
const PLAYER_SPEED = 4;

// Jay's state — where he is and how he's doing
const player = {
    x: 400,
    y: 400,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    speed: PLAYER_SPEED,
    direction: "down", // which way Jay is facing
    walkFrame: 0 // for walk animation
};

// Move Jay based on which keys are pressed
function updatePlayer(keysPressed) {
    let newX = player.x;
    let newY = player.y;
    let moving = false;

    // Check each direction (WASD and arrow keys both work)
    if (keysPressed["ArrowUp"] || keysPressed["w"] || keysPressed["W"]) {
        newY -= player.speed;
        player.direction = "up";
        moving = true;
    }
    if (keysPressed["ArrowDown"] || keysPressed["s"] || keysPressed["S"]) {
        newY += player.speed;
        player.direction = "down";
        moving = true;
    }
    if (keysPressed["ArrowLeft"] || keysPressed["a"] || keysPressed["A"]) {
        newX -= player.speed;
        player.direction = "left";
        moving = true;
    }
    if (keysPressed["ArrowRight"] || keysPressed["d"] || keysPressed["D"]) {
        newX += player.speed;
        player.direction = "right";
        moving = true;
    }

    if (moving) {
        player.walkFrame += 0.15;
    }

    // Don't let Jay walk outside the world
    newX = Math.max(0, Math.min(newX, WORLD_WIDTH - player.width));
    newY = Math.max(0, Math.min(newY, WORLD_HEIGHT - player.height));

    // Only move if Jay won't walk into a building
    // Check X and Y separately so Jay can slide along walls
    if (!collidesWithAnything(newX, player.y, player.width, player.height)) {
        player.x = newX;
    }
    if (!collidesWithAnything(player.x, newY, player.width, player.height)) {
        player.y = newY;
    }
}

// Draw Jay on the screen
function drawPlayer(ctx, cameraX, cameraY) {
    const screenX = player.x - cameraX;
    const screenY = player.y - cameraY;
    drawJayCharacter(ctx, screenX, screenY, player.direction, player.walkFrame, playerDamageFlash, playerInvincible);
}

// Draw Jay's character at any position (used by both city and hideout)
function drawJayCharacter(ctx, screenX, screenY, direction, walkFrame, damageFlash, invincible) {
    const w = PLAYER_SIZE;
    const h = PLAYER_SIZE;
    const cx = screenX + w / 2;
    const cy = screenY + h / 2;

    // Flicker when invincible
    if (invincible > 0 && Math.floor(invincible / 3) % 2 === 0) {
        ctx.globalAlpha = 0.3;
    }
    // Flash red when hit
    if (damageFlash > 0 && damageFlash % 4 < 2) {
        ctx.globalAlpha = 0.5;
    }

    // Walk bob
    const bob = Math.sin(walkFrame * 6) * 2;

    // Shadow under Jay
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(cx, screenY + h + 2, w / 2.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs (two little rectangles that alternate when walking)
    const legSpread = Math.sin(walkFrame * 6) * 4;
    ctx.fillStyle = "#3a3a5a";
    ctx.fillRect(cx - 8 + legSpread, screenY + h - 8 + Math.abs(bob) / 2, 7, 10);
    ctx.fillRect(cx + 1 - legSpread, screenY + h - 8 + Math.abs(bob) / 2, 7, 10);

    // Shoes
    ctx.fillStyle = "#cc3333";
    ctx.fillRect(cx - 9 + legSpread, screenY + h + 1, 9, 4);
    ctx.fillRect(cx - legSpread, screenY + h + 1, 9, 4);

    // Body / torso — blue shirt
    ctx.fillStyle = "#2196F3";
    const bodyY = screenY + 10 + bob * 0.3;
    ctx.beginPath();
    ctx.moveTo(cx - 12, bodyY + 4);
    ctx.lineTo(cx + 12, bodyY + 4);
    ctx.lineTo(cx + 10, bodyY + 22);
    ctx.lineTo(cx - 10, bodyY + 22);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#1565C0";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Shirt collar
    ctx.fillStyle = "#1976D2";
    ctx.beginPath();
    ctx.moveTo(cx - 8, bodyY + 4);
    ctx.lineTo(cx, bodyY + 8);
    ctx.lineTo(cx + 8, bodyY + 4);
    ctx.lineTo(cx + 10, bodyY + 4);
    ctx.lineTo(cx, bodyY + 10);
    ctx.lineTo(cx - 10, bodyY + 4);
    ctx.closePath();
    ctx.fill();

    // Arms
    ctx.fillStyle = "#c68642";
    const armSwing = Math.sin(walkFrame * 6) * 6;
    // Left arm
    ctx.fillRect(cx - 15, bodyY + 6 + armSwing, 5, 14);
    // Right arm
    ctx.fillRect(cx + 10, bodyY + 6 - armSwing, 5, 14);

    // Hands
    ctx.fillStyle = "#d4944e";
    ctx.beginPath();
    ctx.arc(cx - 12.5, bodyY + 20 + armSwing, 3.5, 0, Math.PI * 2);
    ctx.arc(cx + 12.5, bodyY + 20 - armSwing, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Head — round
    const headY = screenY + 2 + bob * 0.5;
    const headR = 13;

    // Head circle
    ctx.fillStyle = "#c68642";
    ctx.beginPath();
    ctx.arc(cx, headY + headR, headR, 0, Math.PI * 2);
    ctx.fill();

    // Head outline
    ctx.strokeStyle = "#a06830";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, headY + headR, headR, 0, Math.PI * 2);
    ctx.stroke();

    // Hair — black fohawk
    ctx.fillStyle = "#1a1a1a";
    // Base hair
    ctx.beginPath();
    ctx.arc(cx, headY + headR - 2, headR + 1, Math.PI * 1.1, Math.PI * 1.9);
    ctx.fill();
    // Fohawk spike (tall in the middle)
    ctx.beginPath();
    ctx.moveTo(cx - 6, headY + 2);
    ctx.lineTo(cx - 2, headY - 8);
    ctx.lineTo(cx + 2, headY - 10);
    ctx.lineTo(cx + 5, headY - 7);
    ctx.lineTo(cx + 8, headY + 2);
    ctx.closePath();
    ctx.fill();

    // Ears
    ctx.fillStyle = "#c68642";
    ctx.beginPath();
    ctx.arc(cx - headR + 1, headY + headR, 4, 0, Math.PI * 2);
    ctx.arc(cx + headR - 1, headY + headR, 4, 0, Math.PI * 2);
    ctx.fill();

    // Eyes — big and expressive
    const eyeY = headY + headR - 3;

    // Pupil offset based on direction
    let pupilOX = 0, pupilOY = 0;
    if (direction === "left") pupilOX = -2;
    if (direction === "right") pupilOX = 2;
    if (direction === "up") pupilOY = -2;
    if (direction === "down") pupilOY = 2;

    // White of eyes
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.ellipse(cx - 5, eyeY, 5, 6, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 5, eyeY, 5, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye outline
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx - 5, eyeY, 5, 6, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx + 5, eyeY, 5, 6, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Pupils
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath();
    ctx.arc(cx - 5 + pupilOX, eyeY + pupilOY, 2.5, 0, Math.PI * 2);
    ctx.arc(cx + 5 + pupilOX, eyeY + pupilOY, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Eye shine
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(cx - 4 + pupilOX, eyeY - 1 + pupilOY, 1, 0, Math.PI * 2);
    ctx.arc(cx + 6 + pupilOX, eyeY - 1 + pupilOY, 1, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 9, eyeY - 7);
    ctx.lineTo(cx - 2, eyeY - 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 2, eyeY - 8);
    ctx.lineTo(cx + 9, eyeY - 7);
    ctx.stroke();

    // Big smile
    ctx.strokeStyle = "#8B4513";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, eyeY + 6, 5, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    // Teeth showing in smile
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(cx, eyeY + 6, 4, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.fill();

    // Reset alpha
    ctx.globalAlpha = 1.0;
}
