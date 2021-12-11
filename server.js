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
    map: []
};

gameState.map = maps.MAPS[0];

io.on('connection', (socket) => {

    //join
    socket.on('new player', () => {
        gameState.players[socket.id] = {
            x: values.SPRITE_SIZE * 5,
            y: values.SPRITE_SIZE * 5
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

setInterval(() => {
    sendState();
}, 1000 / 60);

setInterval(() => {
    let numPres = gameState.map.filter(x => x == 2).length;

    if (numPres < 5) {
        let pos = Math.floor(Math.random() * gameState.map.length);
        if (gameState.map[pos] == 0) {
            gameState.map[pos] = 2;
            sendState();
        }
    }
}, 10000);


//Player movement
const moveSpeed = 4;

function movePlayer(data, id) {
    let player = gameState.players[id] || {};

    if (player == {})
        return;

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
        handleCollision(pTop * 25 + pLeft) &&
        handleCollision(pTop * 25 + pRight) &&
        handleCollision(pBottom * 25 + pLeft) &&
        handleCollision(pBottom * 25 + pRight)
    ) {
        player.x = newPos.x;
        player.y = newPos.y;
    }

}

function handleCollision(pos) {
    let tile = gameState.map[pos];

    if (tile == 1) {
        return false;
    }
    else if(tile == 2) {
        gameState.map[pos] = 0;
    }
        
    
    return true;
}