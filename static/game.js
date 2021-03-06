let socket = io();

let movement = {
    up: false,
    down: false,
    left: false,
    right: false
}
document.addEventListener('keydown', (event) => {
    switch (event.keyCode) {
        case 65: // A
        case 37: // ->
            movement.left = true;
            break;
        case 87: // W
        case 38: // ^
            movement.up = true;
            break;
        case 68: // D
        case 39: // <-
            movement.right = true;
            break;
        case 83: // S
        case 40: // v
            movement.down = true;
            break;
    }
});
document.addEventListener('keyup', (event) => {
    switch (event.keyCode) {
        case 65: // A
        case 37: // ->
            movement.left = false;
            break;
        case 87: // W
        case 38: // ^
            movement.up = false;
            break;
        case 68: // D
        case 39: // <-
            movement.right = false;
            break;
        case 83: // S
        case 40: // v
            movement.down = false;
            break;
    }
});

socket.emit('new player');
setInterval(() => {
    socket.emit('movement', movement);
}, 1000 / 60);


socket.on('state', (state) => {
    drawScreen(state.players, state.map, state.mapUs);
});

// DRAWING
let canvas = document.getElementById('canvas');
canvas.width = GRID_WIDTH + 150; //Add width here to make room for the scoreboard
canvas.height = GRID_HEIGHT;

let context = canvas.getContext('2d');

let img = new Image();
img.src = '/static/sprite1.png';

function drawMap(map) {
    if (!img.complete)
        return;

    for (let i = 0; i < 19; i++) {
        for (let j = 0; j < 25; j++) {
            let tile = map[i * 25 + j];
            switch (tile) {
                case 2:
                    drawSprite(5, 0, j * 32, i * 32);
                    break;
                case 3:
                    drawSprite(4, 0, j * 32, i * 32);
                    break;
                case 4:
                    drawSprite(8, 2, j * 32, i * 32);
                    break;
                case 11:
                    drawSprite(11, 0, j * 32, i * 32);
                    break;
                case 12:
                    drawSprite(12, 0, j * 32, i * 32);
                    break;
                case 13:
                    drawSprite(13, 0, j * 32, i * 32);
                    break;
                case 14:
                    drawSprite(14, 0, j * 32, i * 32);
                    break;
                case 15:
                    drawSprite(15, 0, j * 32, i * 32);
                    break;
                case 16:
                    drawSprite(16, 0, j * 32, i * 32);
                    break;
                case 17:
                    drawSprite(17, 0, j * 32, i * 32);
                    break;
                case 18:
                    drawSprite(7, 6, j * 32, i * 32);
                    break;
                case 21:
                    drawSprite(11, 5, j * 32, i * 32);
                    break;
                case 22:
                    drawSprite(12, 5, j * 32, i * 32);
                    break;
                case 23:
                    drawSprite(13, 5, j * 32, i * 32);
                    break;
                case 24:
                    drawSprite(14, 5, j * 32, i * 32);
                    break;
                case 25:
                    drawSprite(15, 5, j * 32, i * 32);
                    break;
                case 26:
                    drawSprite(11, 6, j * 32, i * 32);
                    break;
                case 27:
                    drawSprite(12, 6, j * 32, i * 32);
                    break;
                case 28:
                    drawSprite(13, 6, j * 32, i * 32);
                    break;
                case 29:
                    drawSprite(14, 6, j * 32, i * 32);
                    break;
            }
        }
    }
}

function drawSprite(imgX, imgY, locX, locY) {
    context.drawImage(img, imgX * SPRITE_SIZE, imgY * SPRITE_SIZE, SPRITE_SIZE, SPRITE_SIZE, locX, locY, SPRITE_SCALE * SPRITE_SIZE, SPRITE_SCALE * SPRITE_SIZE);
}

function drawPlayers(players) {
    for (let id in players) {
        let player = players[id];

        drawSprite(player.sprite % 4 + (player.direction > 0 ? 4 : 0), (player.sprite % 2) + 1, player.x, player.y);

        if (player.extraPoints != null || player.speedBoost != null)
            drawSprite(16, (player.sprite % 4) + 5, player.x, player.y);

        if (id == socket.id) {
            context.beginPath();
            context.strokeStyle = '#ffc6c6';
            context.lineWidth = 1;
            context.strokeRect(player.x, player.y, SPRITE_SCALE * SPRITE_SIZE, SPRITE_SCALE * SPRITE_SIZE);

        }
    }
}

function drawScoreboard(players) {
    let y = 40;
    for (let id in players) {
        let player = players[id];

        context.font = "20px Arial";

        if (player.speedBoost != null) {
            context.fillStyle = "blue";
            context.strokeStyle = 'blue';
        }
        else if (player.extraPoints != null) {
            context.fillStyle = "#c8bb00";
            context.strokeStyle = "#c8bb00";
        }
        else {
            context.fillStyle = "black";
            context.strokeStyle = 'black';
        }

        context.strokeText(player.points + "p " + player.name, GRID_WIDTH + 10, y);

        y = y + 25;
    }
}

function drawScreen(players, map, us) {
    context.clearRect(0, 0, GRID_WIDTH + 150, GRID_HEIGHT);
    drawPlayers(players);
    drawScoreboard(players);
    drawMap(map);
}