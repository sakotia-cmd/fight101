// main.js — The game engine! This runs everything.

// Get the canvas (our game screen)
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Make the canvas fill the whole browser window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Track which keys are being held down right now
const keysPressed = {};

window.addEventListener("keydown", function (event) {
    keysPressed[event.key] = true;

    // Stop arrow keys from scrolling the page
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
        event.preventDefault();
    }

    // SPACE swings the sword, fires vehicle blaster, or places decoration
    if (event.key === " ") {
        if (decorateMode) {
            decorateAction();
        } else if (!insideHideout) {
            if (inVehicle) {
                fireVehicleBlaster();
            } else {
                trySwingSword();
            }
        }
    }

    // T toggles decorate mode inside hideout
    if (event.key === "t" || event.key === "T") {
        if (insideHideout && !shopOpen) {
            toggleDecorateMode();
        }
    }

    // E enters/exits the hideout, opens the shop, picks up decorations, or enters/exits vehicles
    if (event.key === "e" || event.key === "E") {
        if (decorateMode) {
            decoratePickUpPlaced();
        } else if (shopOpen) {
            // Do nothing — use ESC to close shop
        } else if (insideHideout && tryOpenShop()) {
            // Shop opened
        } else if (!insideHideout && toggleVehicle()) {
            // Got in or out of a vehicle
        } else if (!inVehicle) {
            toggleHideout();
        }
    }

    // ESC closes the shop or exits decorate mode
    if (event.key === "Escape") {
        if (shopOpen) closeShop();
        else if (decorateMode) decorateMode = false;
    }

    // Shop navigation
    if (shopOpen) {
        if (event.key === "ArrowUp" || event.key === "w" || event.key === "W") {
            shopSelectedIndex = Math.max(0, shopSelectedIndex - 1);
        }
        if (event.key === "ArrowDown" || event.key === "s" || event.key === "S") {
            shopSelectedIndex = Math.min(shopItems.length - 1, shopSelectedIndex + 1);
        }
        if (event.key === "Enter") {
            buySelectedItem();
        }
    }

    // Decorate mode item selection (1/2 to cycle through items)
    if (decorateMode && !shopOpen) {
        if (event.key === "1") {
            decorateSelectedItem = Math.max(0, decorateSelectedItem - 1);
        }
        if (event.key === "2") {
            decorateSelectedItem = Math.min(ownedDecorations.length - 1, decorateSelectedItem + 1);
        }
    }

    // H eats a hamburger to heal
    if (event.key === "h" || event.key === "H") {
        if (inventory.hamburgers > 0 && playerHP < playerMaxHP) {
            inventory.hamburgers--;
            playerHP = Math.min(playerHP + HAMBURGER_HEAL, playerMaxHP);
        }
    }

    // F feeds the capybara (must be inside hideout or near capybara)
    if (event.key === "f" || event.key === "F") {
        if (insideHideout && !decorateMode) {
            feedCapybara();
        }
    }

    // 1-4 switches weapons (only outside hideout or when not decorating)
    if (!decorateMode) {
        if (event.key === "1") switchWeapon(1);
        if (event.key === "2") switchWeapon(2);
        if (event.key === "3") switchWeapon(3);
        if (event.key === "4") switchWeapon(4);
    }

    // R restarts the game after game over
    if ((event.key === "r" || event.key === "R") && gameOver) {
        restartGame();
    }

    // Cheat code: M gives 9999 coins
    if (event.key === "m" || event.key === "M") {
        playerCoins = 9999;
    }
});

window.addEventListener("keyup", function (event) {
    keysPressed[event.key] = false;
});

// Camera position — follows Jay so he's always in the center
let cameraX = 0;
let cameraY = 0;

// Move the camera to keep Jay centered on screen
function updateCamera() {
    // Put Jay in the center of the screen
    cameraX = player.x - canvas.width / 2 + player.width / 2;
    cameraY = player.y - canvas.height / 2 + player.height / 2;

    // Don't let the camera go outside the world
    cameraX = Math.max(0, Math.min(cameraX, WORLD_WIDTH - canvas.width));
    cameraY = Math.max(0, Math.min(cameraY, WORLD_HEIGHT - canvas.height));
}

// Draw the HUD (heads-up display) — info shown on top of the game
function drawHUD() {
    // Game title
    ctx.fillStyle = "#00ff88";
    ctx.font = "bold 18px monospace";
    ctx.shadowColor = "#00ff88";
    ctx.shadowBlur = 10;
    ctx.fillText("FIGHT 101", 15, 30);
    ctx.shadowBlur = 0;

    // Health bar
    drawHealthBar(ctx);

    // Capybara info
    drawCapybaraHUD(ctx);

    // Inventory
    drawInventory(ctx);

    // Weapon display
    drawWeaponHUD(ctx);

    // Vehicle HUD (when driving)
    drawVehicleHUD(ctx);

    // Minimap showing boss arenas
    drawMinimap(ctx);

    // Controls reminder
    ctx.fillStyle = "#888899";
    ctx.font = "13px monospace";
    ctx.fillText("WASD/Arrows: move | SPACE: attack | 1-4: weapons | H: eat | E: interact", 15, canvas.height - 15);
}

// Draw the minimap in the bottom-right corner
function drawMinimap(ctx) {
    const mapW = 120;
    const mapH = 120;
    const mapX = canvas.width - mapW - 10;
    const mapY = canvas.height - mapH - 35;
    const scaleX = mapW / WORLD_WIDTH;
    const scaleY = mapH / WORLD_HEIGHT;

    // Background
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(mapX - 2, mapY - 2, mapW + 4, mapH + 4);
    ctx.fillStyle = "#2a2a2a";
    ctx.fillRect(mapX, mapY, mapW, mapH);

    // Boss arenas
    for (const key in bossArenas) {
        const a = bossArenas[key];
        ctx.fillStyle = a.defeated ? "#336633" : a.borderColor;
        ctx.globalAlpha = 0.7;
        ctx.fillRect(mapX + a.x * scaleX, mapY + a.y * scaleY,
                     Math.max(4, a.width * scaleX), Math.max(4, a.height * scaleY));
        ctx.globalAlpha = 1.0;
    }

    // Hideout
    ctx.fillStyle = "#ffcc00";
    ctx.fillRect(mapX + 3900 * scaleX, mapY + 3000 * scaleY, 4, 4);

    // Jay's position — blinking dot
    if (Math.floor(Date.now() / 300) % 2 === 0) {
        ctx.fillStyle = "#00ffaa";
    } else {
        ctx.fillStyle = "#00ff44";
    }
    ctx.beginPath();
    ctx.arc(mapX + player.x * scaleX, mapY + player.y * scaleY, 3, 0, Math.PI * 2);
    ctx.fill();

    // Border
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 1;
    ctx.strokeRect(mapX, mapY, mapW, mapH);
}

// The main game loop — runs about 60 times per second
function gameLoop() {
    if (insideHideout) {
        // === HIDEOUT SCENE ===
        if (!gameOver && !shopOpen) {
            updateHideoutPlayer(keysPressed);
        }

        // Draw the hideout interior
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawHideoutInterior(ctx);

        // Draw inventory and capybara HUD on top
        drawInventory(ctx);
        drawCapybaraHUD(ctx);
    } else {
        // === CITY SCENE ===
        if (!gameOver) {
            if (inVehicle) {
                updateVehicle(keysPressed);
            } else {
                updatePlayer(keysPressed);
            }
            updateEnemies();
            updateItems();
            updateCombat(keysPressed);
            updateProjectiles();
            updateVehicleProjectiles();
            updateVehicleRespawns();
            updateCapybara();
            checkBossArenaEntry();
            updateBoss();
            checkAwards();
        }
        updateCamera();

        // Draw everything
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the city
        drawWorld(ctx, cameraX, cameraY, canvas.width, canvas.height);

        // Draw boss arenas
        drawBossArenas(ctx, cameraX, cameraY);

        // Draw the hideout building
        drawHideoutExterior(ctx, cameraX, cameraY);

        // Draw parked vehicles
        drawVehicles(ctx, cameraX, cameraY);

        // Draw items on the ground (hamburgers)
        drawItems(ctx, cameraX, cameraY);

        // Draw enemies (monkeys)
        drawEnemies(ctx, cameraX, cameraY);

        // Draw the vehicle Jay is driving (under Jay)
        drawCurrentVehicle(ctx, cameraX, cameraY);

        // Draw Jay on top of the city
        if (!inVehicle) {
            drawPlayer(ctx, cameraX, cameraY);
        }

        // Draw the capybara following Jay
        drawCapybara(ctx, cameraX, cameraY);

        // Draw the sword swing animation
        drawSword(ctx, cameraX, cameraY);

        // Draw player projectiles (arrows, bullets)
        drawProjectiles(ctx, cameraX, cameraY);

        // Draw vehicle blaster projectiles
        drawVehicleProjectiles(ctx, cameraX, cameraY);

        // Draw the boss
        drawBoss(ctx, cameraX, cameraY);

        // Draw the HUD on top of everything
        drawHUD();

        // Draw game over screen if Jay's HP hit 0
        drawGameOver(ctx);
    }

    // Do it all again next frame
    requestAnimationFrame(gameLoop);
}

// Spawn the monkeys and start the game!
spawnMonkeys();
gameLoop();
