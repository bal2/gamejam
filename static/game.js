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
            movement.left = true;
            break;
        case 87: // W
            movement.up = true;
            break;
        case 68: // D
            movement.right = true;
            break;
        case 83: // S
            movement.down = true;
            break;
    }
});
document.addEventListener('keyup', (event) => {
    switch (event.keyCode) {
        case 65: // A
            movement.left = false;
            break;
        case 87: // W
            movement.up = false;
            break;
        case 68: // D
            movement.right = false;
            break;
        case 83: // S
            movement.down = false;
            break;
    }
});

socket.emit('new player');
setInterval(() => {
    socket.emit('movement', movement);
}, 1000 / 60);

var canvas = document.getElementById('canvas');
canvas.width = GRID_WIDTH;
canvas.height = GRID_HEIGHT;

var context = canvas.getContext('2d');

socket.on('state', (players) => {
    drawScreen(players, 0);
});

// DRAWING
let img = new Image();
img.src = '/static/sprite1.png';

function drawMap(id) {
    if (!img.complete)
        return;

    for (let i = 0; i < 19; i++) {
        for (let j = 0; j < 25; j++) {
            if (MAPS[id][i * 25 + j] == 1)
                drawSprite(11, 0, j * 32, i * 32)
        }
    }
}

function drawSprite(imgX, imgY, locX, locY) {
    context.drawImage(img, imgX * SPRITE_SIZE, imgY * SPRITE_SIZE, SPRITE_SIZE, SPRITE_SIZE, locX, locY, SPRITE_SCALE * SPRITE_SIZE, SPRITE_SCALE * SPRITE_SIZE);
}

function drawPlayers(players) {
    for (var id in players) {
        var player = players[id];
        drawSprite(0, 1, player.x, player.y);

        if (id == socket.id) {
            context.beginPath();
            context.strokeStyle = '#f00';  // some color/style
            context.lineWidth = 1;         // thickness
            context.strokeRect(player.x, player.y, SPRITE_SCALE * SPRITE_SIZE, SPRITE_SCALE * SPRITE_SIZE);

        }
    }
}

function drawScreen(players, map) {
    context.clearRect(0, 0, 800, 600);
    drawPlayers(players);
    drawMap(map);
}