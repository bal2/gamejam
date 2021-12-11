// Dependencies
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var maps = require('./shared/maps');
var values = require('./shared/values');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));
app.use('/shared', express.static(__dirname + '/shared'));


// Routing
app.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, 'index.html'));
});

// Start server.
server.listen(5000, () => {
    console.log('Starting server on port 5000');
});

// WebSocket handlers

var gameState = {
    players: {},
    map: [],
    mapUs: new Date()
};

gameState.map = maps.MAPS[0];

io.on('connection', (socket) => {

    //join
    socket.on('new player', () => {
        gameState.players[socket.id] = {
            x: values.SPRITE_SIZE * 5,
            y: values.SPRITE_SIZE * 5,
            name: getName(),
            points: 0,
            sprite: 0,
            speedBoost: null,
            extraPoints: null
        };
    });

    //bye bye
    socket.on('disconnect', () => {
        delete gameState.players[socket.id];
    });

    //move me baby
    socket.on('movement', (data) => {
        movePlayer(data, socket.id);
    });
});

function sendState() {
    io.sockets.emit('state', gameState);
}

//State update interval
setInterval(() => {
    sendState();
}, 1000 / 60);

//Present spawn interval
setInterval(() => {
    let numPres = gameState.map.filter(x => x == 2 || x == 3).length;

    if (numPres < 5) {
        let pos = Math.floor(Math.random() * gameState.map.length);
        if (gameState.map[pos] == 0) {
            gameState.map[pos] = 2;
            gameState.mapUs = new Date();
            sendState();
        }
    }
}, 5000);

//Bonus spawn interval
setInterval(() => {
    let numPres = gameState.map.filter(x => x == 2 || x == 3).length;

    if (numPres < 5) {
        let pos = Math.floor(Math.random() * gameState.map.length);
        if (gameState.map[pos] == 0) {
            gameState.map[pos] = 3;
            gameState.mapUs = new Date();
            sendState();
        }
    }
}, 59000);

var nCounter = 0;

function getName() {
    let n = values.NAMES[nCounter % values.NAMES.length];

    let existing = 0;

    for (let id in gameState.players) {
        let p = gameState.players[id];
        if (p.name.includes(n)) existing++;
    }

    if (existing > 0) n = n + "_" + existing;

    nCounter++;
    return n;
}


//Player movement
function movePlayer(data, id) {
    let player = gameState.players[id] || {};

    if (player == {})
        return;

    let moveSpeed = 4;

    if (player.speedBoost != null) {
        if (player.speedBoost > new Date())
            moveSpeed += 2;
        else
            player.speedBoost = null;
    }

    if (player.extraPoints < new Date())
        player.extraPoints = null;

    let newPos = {
        x: player.x,
        y: player.y
    };

    if (data.left) {
        newPos.x -= moveSpeed;
    }
    if (data.up) {
        newPos.y -= moveSpeed;
    }
    if (data.right) {
        newPos.x += moveSpeed;
    }
    if (data.down) {
        newPos.y += moveSpeed;
    }

    //Get player rectangle
    let pTop = Math.floor(newPos.y / (values.SPRITE_SIZE * values.SPRITE_SCALE));
    let pBottom = Math.floor((newPos.y + 32) / (values.SPRITE_SIZE * values.SPRITE_SCALE));
    let pLeft = Math.floor(newPos.x / (values.SPRITE_SIZE * values.SPRITE_SCALE));
    let pRight = Math.floor((newPos.x + 32) / (values.SPRITE_SIZE * values.SPRITE_SCALE));

    //Handle collision for all sides of player
    if (
        handleCollision(pTop * 25 + pLeft, player) &&
        handleCollision(pTop * 25 + pRight, player) &&
        handleCollision(pBottom * 25 + pLeft, player) &&
        handleCollision(pBottom * 25 + pRight, player)
    ) {

        if (player.x != newPos.x || player.y != newPos.y) {
            player.sprite++;

            if (player.sprite % 8 == 0)
                player.sprite = 0;
        }

        player.x = newPos.x;
        player.y = newPos.y;

    }

}

function handleCollision(pos, player) {
    let tile = gameState.map[pos];

    if (tile > 10) {
        return false;
    }
    else if (tile == 2) {
        gameState.map[pos] = 0;
        gameState.mapUs = new Date();
        player.points++;

        if (player.extraPoints != null)
            player.points += 2;
    }
    else if (tile == 3) {
        gameState.map[pos] = 0;
        gameState.mapUs = new Date();

        let p = Math.floor(Math.random() * 2);
        let b = new Date();
        b.setSeconds(b.getSeconds() + 10);

        if (p == 0)
            player.speedBoost = b;
        else if (p == 1)
            player.extraPoints = b;
    }

    return true;
}