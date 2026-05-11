// hideout.js — Jay's secret home base with decoration mode!

// Hideout location in the city
const hideout = {
    x: 4000,
    y: 3100,
    width: 180,
    height: 180,
    doorX: 0,
    doorY: 0,
    doorWidth: 50,
    doorHeight: 14
};

hideout.doorX = hideout.x + hideout.width / 2 - hideout.doorWidth / 2;
hideout.doorY = hideout.y + hideout.height;

// Are we inside the hideout right now?
let insideHideout = false;

// Has Jay found the capybara yet?
let capybaraMessageTimer = 0;

// Hideout interior dimensions (bigger now for decorating!)
const HIDEOUT_INTERIOR_WIDTH = 700;
const HIDEOUT_INTERIOR_HEIGHT = 500;

// Player position inside the hideout
let hideoutPlayerX = 350;
let hideoutPlayerY = 400;

// Decorate mode state
let decorateMode = false;
let decorateCursorX = 350;
let decorateCursorY = 250;
let decorateSelectedItem = 0;
let decoratePickedUp = null; // index of placed decoration being moved

// Try to enter or exit the hideout when E is pressed
function toggleHideout() {
    if (insideHideout) {
        const doorArea = {
            x: HIDEOUT_INTERIOR_WIDTH / 2 - 30,
            y: HIDEOUT_INTERIOR_HEIGHT - 40,
            width: 60,
            height: 40
        };
        if (rectsOverlap(hideoutPlayerX, hideoutPlayerY, player.width, player.height,
            doorArea.x, doorArea.y, doorArea.width, doorArea.height)) {
            insideHideout = false;
            decorateMode = false;
            player.x = hideout.doorX + hideout.doorWidth / 2 - player.width / 2;
            player.y = hideout.doorY + 15;
            if (capybara.found) {
                capybara.x = player.x + 25;
                capybara.y = player.y - 20;
            }
        }
    } else {
        if (rectsOverlap(player.x, player.y, player.width, player.height,
            hideout.doorX - 10, hideout.doorY - 15, hideout.doorWidth + 20, 30)) {
            insideHideout = true;
            hideoutPlayerX = HIDEOUT_INTERIOR_WIDTH / 2 - player.width / 2;
            hideoutPlayerY = HIDEOUT_INTERIOR_HEIGHT - 80;

            if (!capybara.found) {
                capybara.found = true;
                capybaraMessageTimer = 180;
            }
        }
    }
}

// Move Jay around inside the hideout (or move cursor in decorate mode)
function updateHideoutPlayer(keysPressed) {
    if (decorateMode) {
        updateDecorateCursor(keysPressed);
    } else {
        let newX = hideoutPlayerX;
        let newY = hideoutPlayerY;

        if (keysPressed["ArrowUp"] || keysPressed["w"] || keysPressed["W"]) newY -= player.speed;
        if (keysPressed["ArrowDown"] || keysPressed["s"] || keysPressed["S"]) newY += player.speed;
        if (keysPressed["ArrowLeft"] || keysPressed["a"] || keysPressed["A"]) newX -= player.speed;
        if (keysPressed["ArrowRight"] || keysPressed["d"] || keysPressed["D"]) newX += player.speed;

        const wallPadding = 15;
        newX = Math.max(wallPadding, Math.min(newX, HIDEOUT_INTERIOR_WIDTH - player.width - wallPadding));
        newY = Math.max(wallPadding, Math.min(newY, HIDEOUT_INTERIOR_HEIGHT - player.height - wallPadding));

        hideoutPlayerX = newX;
        hideoutPlayerY = newY;
    }

    if (capybaraMessageTimer > 0) capybaraMessageTimer--;
}

// Move the cursor in decorate mode
function updateDecorateCursor(keysPressed) {
    const speed = 3;
    if (keysPressed["ArrowUp"] || keysPressed["w"] || keysPressed["W"]) decorateCursorY -= speed;
    if (keysPressed["ArrowDown"] || keysPressed["s"] || keysPressed["S"]) decorateCursorY += speed;
    if (keysPressed["ArrowLeft"] || keysPressed["a"] || keysPressed["A"]) decorateCursorX -= speed;
    if (keysPressed["ArrowRight"] || keysPressed["d"] || keysPressed["D"]) decorateCursorX += speed;

    decorateCursorX = Math.max(20, Math.min(decorateCursorX, HIDEOUT_INTERIOR_WIDTH - 20));
    decorateCursorY = Math.max(20, Math.min(decorateCursorY, HIDEOUT_INTERIOR_HEIGHT - 20));

    // Move picked-up item with cursor
    if (decoratePickedUp !== null) {
        const item = placedDecorations[decoratePickedUp];
        if (item) {
            item.x = decorateCursorX - item.width / 2;
            item.y = decorateCursorY - item.height / 2;
        }
    }
}

// Toggle decorate mode (T key)
function toggleDecorateMode() {
    if (!insideHideout || shopOpen) return;
    decorateMode = !decorateMode;
    if (decorateMode) {
        decorateCursorX = hideoutPlayerX + player.width / 2;
        decorateCursorY = hideoutPlayerY + player.height / 2;
        decorateSelectedItem = 0;
        decoratePickedUp = null;
    }
}

// Place or pick up a decoration (SPACE in decorate mode)
function decorateAction() {
    if (!decorateMode) return;

    // If we have a picked-up item, drop it
    if (decoratePickedUp !== null) {
        decoratePickedUp = null;
        return;
    }

    // Check if cursor is over a placed decoration — pick it up
    for (let i = placedDecorations.length - 1; i >= 0; i--) {
        const d = placedDecorations[i];
        if (decorateCursorX >= d.x && decorateCursorX <= d.x + d.width &&
            decorateCursorY >= d.y && decorateCursorY <= d.y + d.height) {
            decoratePickedUp = i;
            return;
        }
    }

    // Otherwise, place the selected owned decoration
    if (ownedDecorations.length > 0 && decorateSelectedItem < ownedDecorations.length) {
        const item = ownedDecorations[decorateSelectedItem];
        placedDecorations.push({
            type: item.type,
            name: item.name,
            icon: item.icon,
            width: item.width,
            height: item.height,
            x: decorateCursorX - item.width / 2,
            y: decorateCursorY - item.height / 2
        });
        ownedDecorations.splice(decorateSelectedItem, 1);
        if (decorateSelectedItem >= ownedDecorations.length) {
            decorateSelectedItem = Math.max(0, ownedDecorations.length - 1);
        }
    }
}

// Pick up a placed decoration back into inventory (E in decorate mode)
function decoratePickUpPlaced() {
    if (!decorateMode) return;

    for (let i = placedDecorations.length - 1; i >= 0; i--) {
        const d = placedDecorations[i];
        if (decorateCursorX >= d.x && decorateCursorX <= d.x + d.width &&
            decorateCursorY >= d.y && decorateCursorY <= d.y + d.height) {
            ownedDecorations.push({
                type: d.type, name: d.name, icon: d.icon,
                width: d.width, height: d.height
            });
            placedDecorations.splice(i, 1);
            if (decoratePickedUp === i) decoratePickedUp = null;
            return;
        }
    }
}

// Draw the hideout building on the city map (from outside)
function drawHideoutExterior(ctx, cameraX, cameraY) {
    const screenX = hideout.x - cameraX;
    const screenY = hideout.y - cameraY;

    if (screenX + hideout.width < 0 || screenX > canvas.width ||
        screenY + hideout.height < 0 || screenY > canvas.height) {
        return;
    }

    ctx.fillStyle = "#2a1f3d";
    ctx.fillRect(screenX, screenY, hideout.width, hideout.height);

    ctx.strokeStyle = "#ffaa00";
    ctx.shadowColor = "#ffaa00";
    ctx.shadowBlur = 12;
    ctx.lineWidth = 3;
    ctx.strokeRect(screenX, screenY, hideout.width, hideout.height);
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#ffaa00";
    ctx.font = "bold 14px monospace";
    ctx.textAlign = "center";
    ctx.shadowColor = "#ffaa00";
    ctx.shadowBlur = 8;
    ctx.fillText("HIDEOUT", screenX + hideout.width / 2, screenY - 8);
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#ffcc00";
    ctx.font = "28px serif";
    ctx.fillText("★", screenX + hideout.width / 2, screenY + hideout.height / 2 + 8);
    ctx.textAlign = "left";

    const doorScreenX = hideout.doorX - cameraX;
    const doorScreenY = hideout.doorY - cameraY;
    ctx.fillStyle = "#ffcc44";
    ctx.fillRect(doorScreenX, doorScreenY - 8, hideout.doorWidth, 12);

    const distToDoor = Math.sqrt(
        Math.pow(player.x - hideout.doorX - hideout.doorWidth / 2, 2) +
        Math.pow(player.y - hideout.doorY, 2)
    );
    if (distToDoor < 60) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px monospace";
        ctx.textAlign = "center";
        ctx.fillText("Press E to enter", screenX + hideout.width / 2, screenY - 22);
        ctx.textAlign = "left";
    }
}

// Draw the hideout interior
function drawHideoutInterior(ctx) {
    // Floor
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const offsetX = (canvas.width - HIDEOUT_INTERIOR_WIDTH) / 2;
    const offsetY = (canvas.height - HIDEOUT_INTERIOR_HEIGHT) / 2;

    // Room floor
    ctx.fillStyle = "#2a2a4e";
    ctx.fillRect(offsetX, offsetY, HIDEOUT_INTERIOR_WIDTH, HIDEOUT_INTERIOR_HEIGHT);

    // Walls
    ctx.strokeStyle = "#ffaa00";
    ctx.lineWidth = 4;
    ctx.strokeRect(offsetX, offsetY, HIDEOUT_INTERIOR_WIDTH, HIDEOUT_INTERIOR_HEIGHT);

    // Floor tiles
    ctx.strokeStyle = "rgba(255, 170, 0, 0.1)";
    ctx.lineWidth = 1;
    const tileSize = 40;
    for (let tx = offsetX; tx < offsetX + HIDEOUT_INTERIOR_WIDTH; tx += tileSize) {
        ctx.beginPath();
        ctx.moveTo(tx, offsetY);
        ctx.lineTo(tx, offsetY + HIDEOUT_INTERIOR_HEIGHT);
        ctx.stroke();
    }
    for (let ty = offsetY; ty < offsetY + HIDEOUT_INTERIOR_HEIGHT; ty += tileSize) {
        ctx.beginPath();
        ctx.moveTo(offsetX, ty);
        ctx.lineTo(offsetX + HIDEOUT_INTERIOR_WIDTH, ty);
        ctx.stroke();
    }

    // Training area (top-left)
    const trainingX = offsetX + 30;
    const trainingY = offsetY + 30;
    const trainingW = 180;
    const trainingH = 120;

    ctx.fillStyle = "rgba(0, 200, 100, 0.1)";
    ctx.fillRect(trainingX, trainingY, trainingW, trainingH);
    ctx.strokeStyle = "#00cc66";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(trainingX, trainingY, trainingW, trainingH);
    ctx.setLineDash([]);

    ctx.fillStyle = "#00cc66";
    ctx.font = "bold 12px monospace";
    ctx.textAlign = "center";
    ctx.fillText("TRAINING AREA", trainingX + trainingW / 2, trainingY - 8);

    // Draw placed decorations
    for (let i = 0; i < placedDecorations.length; i++) {
        const d = placedDecorations[i];
        const dx = offsetX + d.x;
        const dy = offsetY + d.y;

        // Draw the decoration
        drawDecorationItem(ctx, dx, dy, d);

        // Highlight in decorate mode if cursor is over it
        if (decorateMode) {
            if (decorateCursorX >= d.x && decorateCursorX <= d.x + d.width &&
                decorateCursorY >= d.y && decorateCursorY <= d.y + d.height) {
                ctx.strokeStyle = "#ffcc00";
                ctx.lineWidth = 2;
                ctx.setLineDash([3, 3]);
                ctx.strokeRect(dx - 2, dy - 2, d.width + 4, d.height + 4);
                ctx.setLineDash([]);
            }
        }
    }

    // Draw the capybara inside the hideout
    if (capybara.found) {
        const capyScreenX = offsetX + 80;
        const capyScreenY = offsetY + 60;

        ctx.fillStyle = "#a0724a";
        ctx.beginPath();
        ctx.ellipse(capyScreenX + 20, capyScreenY + 15, 20, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#b0825a";
        ctx.beginPath();
        ctx.ellipse(capyScreenX + 35, capyScreenY + 8, 12, 10, -0.2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#8a6240";
        ctx.beginPath();
        ctx.arc(capyScreenX + 38, capyScreenY - 2, 4, 0, Math.PI * 2);
        ctx.arc(capyScreenX + 44, capyScreenY, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.arc(capyScreenX + 40, capyScreenY + 6, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#5a3a20";
        ctx.beginPath();
        ctx.arc(capyScreenX + 47, capyScreenY + 10, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#5a3a20";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(capyScreenX + 42, capyScreenY + 12, 4, 0, Math.PI * 0.8);
        ctx.stroke();

        ctx.fillStyle = "#ffcc00";
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "center";
        ctx.fillText("Lv" + capybara.level, capyScreenX + 15, capyScreenY - 10);

        const jayScreenX = offsetX + hideoutPlayerX;
        const jayScreenY = offsetY + hideoutPlayerY;
        const distToCapy = Math.sqrt(
            Math.pow(jayScreenX - capyScreenX, 2) +
            Math.pow(jayScreenY - capyScreenY, 2)
        );
        if (distToCapy < 100 && inventory.hamburgers > 0 && !decorateMode) {
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 11px monospace";
            ctx.fillText("Press F to feed hamburger", capyScreenX + 20, capyScreenY + 40);
        }
    }
    ctx.textAlign = "left";

    // Exit door
    const doorX = offsetX + HIDEOUT_INTERIOR_WIDTH / 2 - 30;
    const doorY = offsetY + HIDEOUT_INTERIOR_HEIGHT - 30;
    ctx.fillStyle = "#ffcc44";
    ctx.fillRect(doorX, doorY, 60, 25);
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";
    ctx.fillText("EXIT (E)", doorX + 30, doorY + 16);
    ctx.textAlign = "left";

    // Shopkeeper
    drawShopkeeper(ctx, offsetX, offsetY);

    // Draw Jay (only when not in decorate mode)
    if (!decorateMode) {
        const jayX = offsetX + hideoutPlayerX;
        const jayY = offsetY + hideoutPlayerY;
        drawJayCharacter(ctx, jayX, jayY, player.direction, player.walkFrame, 0, 0);
    }

    // Draw decorate mode UI
    if (decorateMode) {
        drawDecorateUI(ctx, offsetX, offsetY);
    }

    // Shop menu
    drawShopMenu(ctx);

    // Capybara found message
    if (capybaraMessageTimer > 0) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(canvas.width / 2 - 180, canvas.height / 2 - 40, 360, 80);
        ctx.strokeStyle = "#ffcc00";
        ctx.lineWidth = 2;
        ctx.strokeRect(canvas.width / 2 - 180, canvas.height / 2 - 40, 360, 80);

        ctx.fillStyle = "#ffcc00";
        ctx.font = "bold 24px monospace";
        ctx.textAlign = "center";
        ctx.fillText("You found a Capybara!", canvas.width / 2, canvas.height / 2);
        ctx.fillStyle = "#ffffff";
        ctx.font = "14px monospace";
        ctx.fillText("Feed it hamburgers to level it up!", canvas.width / 2, canvas.height / 2 + 25);
        ctx.textAlign = "left";
    }

    // Hideout title
    ctx.fillStyle = "#ffaa00";
    ctx.font = "bold 18px monospace";
    ctx.shadowColor = "#ffaa00";
    ctx.shadowBlur = 10;
    ctx.fillText("JAY'S HIDEOUT", 15, 30);
    ctx.shadowBlur = 0;

    // Decorate mode hint
    if (!decorateMode && !shopOpen) {
        ctx.fillStyle = "#888899";
        ctx.font = "12px monospace";
        ctx.fillText("T: Decorate Mode", 15, canvas.height - 15);
    }
}

// Draw a single decoration item
function drawDecorationItem(ctx, dx, dy, d) {
    if (d.type === "trophy") {
        // Trophy pedestal
        ctx.fillStyle = "#4a3a2a";
        ctx.fillRect(dx + 4, dy + d.height - 8, d.width - 8, 8);
        ctx.fillStyle = "#ffcc00";
        ctx.fillRect(dx + 6, dy + d.height - 10, d.width - 12, 4);
        // Trophy icon
        ctx.font = "20px serif";
        ctx.textAlign = "center";
        ctx.fillText(d.icon, dx + d.width / 2, dy + d.height - 14);
        // Name
        ctx.fillStyle = "#ffcc00";
        ctx.font = "bold 7px monospace";
        ctx.fillText(d.name.replace(" Trophy", ""), dx + d.width / 2, dy + d.height + 8);
        ctx.textAlign = "left";
    } else if (d.type === "award") {
        // Award frame
        ctx.fillStyle = "#2a2040";
        ctx.fillRect(dx, dy, d.width, d.height);
        ctx.strokeStyle = "#ffaa00";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(dx, dy, d.width, d.height);
        // Award icon
        ctx.font = "16px serif";
        ctx.textAlign = "center";
        ctx.fillText(d.icon, dx + d.width / 2, dy + d.height / 2 + 6);
        ctx.textAlign = "left";
    } else if (d.type === "furniture") {
        // Furniture icon
        ctx.font = (Math.max(d.width, d.height) - 4) + "px serif";
        ctx.textAlign = "center";
        ctx.fillText(d.icon, dx + d.width / 2, dy + d.height - 4);
        ctx.textAlign = "left";
    }
}

// Draw the decorate mode UI
function drawDecorateUI(ctx, offsetX, offsetY) {
    // Cursor
    const cx = offsetX + decorateCursorX;
    const cy = offsetY + decorateCursorY;

    ctx.strokeStyle = "#ffcc00";
    ctx.lineWidth = 2;
    // Crosshair
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy);
    ctx.lineTo(cx - 4, cy);
    ctx.moveTo(cx + 4, cy);
    ctx.lineTo(cx + 10, cy);
    ctx.moveTo(cx, cy - 10);
    ctx.lineTo(cx, cy - 4);
    ctx.moveTo(cx, cy + 4);
    ctx.lineTo(cx, cy + 10);
    ctx.stroke();

    // Pulsing circle
    const pulse = Math.sin(Date.now() / 200) * 2 + 12;
    ctx.strokeStyle = "rgba(255, 204, 0, 0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, pulse, 0, Math.PI * 2);
    ctx.stroke();

    // Item being carried
    if (decoratePickedUp !== null) {
        ctx.fillStyle = "rgba(255, 204, 0, 0.2)";
        const pi = placedDecorations[decoratePickedUp];
        if (pi) {
            ctx.fillRect(offsetX + pi.x - 2, offsetY + pi.y - 2, pi.width + 4, pi.height + 4);
        }
    }

    // Owned items panel (bottom of screen)
    const panelH = 80;
    const panelY = canvas.height - panelH - 5;
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(5, panelY, canvas.width - 10, panelH);
    ctx.strokeStyle = "#ffcc00";
    ctx.lineWidth = 2;
    ctx.strokeRect(5, panelY, canvas.width - 10, panelH);

    ctx.fillStyle = "#ffcc00";
    ctx.font = "bold 12px monospace";
    ctx.fillText("DECORATE MODE — Items to place:", 15, panelY + 16);

    if (ownedDecorations.length === 0) {
        ctx.fillStyle = "#888899";
        ctx.font = "11px monospace";
        ctx.fillText("No items yet! Buy furniture at the shop or earn awards.", 15, panelY + 38);
    } else {
        const itemW = 50;
        const startItemX = 15;
        for (let i = 0; i < ownedDecorations.length && i < 10; i++) {
            const ix = startItemX + i * (itemW + 8);
            const iy = panelY + 24;
            const selected = (i === decorateSelectedItem);

            ctx.fillStyle = selected ? "rgba(255, 204, 0, 0.2)" : "rgba(50, 50, 80, 0.5)";
            ctx.fillRect(ix, iy, itemW, itemW);
            ctx.strokeStyle = selected ? "#ffcc00" : "#444";
            ctx.lineWidth = selected ? 2 : 1;
            ctx.strokeRect(ix, iy, itemW, itemW);

            // Icon
            ctx.font = "22px serif";
            ctx.textAlign = "center";
            ctx.fillText(ownedDecorations[i].icon, ix + itemW / 2, iy + 34);
            ctx.textAlign = "left";

            // Name below
            ctx.fillStyle = selected ? "#ffcc00" : "#aaa";
            ctx.font = "7px monospace";
            ctx.textAlign = "center";
            ctx.fillText(ownedDecorations[i].name, ix + itemW / 2, iy + itemW + 9);
            ctx.textAlign = "left";
        }
    }

    // Controls
    ctx.fillStyle = "#888899";
    ctx.font = "10px monospace";
    ctx.fillText("Arrows: move cursor | 1/2: select item | SPACE: place/grab | E: pick up | T: exit decorate", 15, panelY + panelH - 6);
}

// Register the hideout as a collidable object
extraColliders.push({
    x: hideout.x,
    y: hideout.y,
    width: hideout.width,
    height: hideout.height
});
