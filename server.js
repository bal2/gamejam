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

var players = {};
io.on('connection', (socket) => {

    //join
    socket.on('new player', () => {
        players[socket.id] = {
            x: values.SPRITE_SIZE * 5,
            y: values.SPRITE_SIZE * 5,
            map: 0
        };
    });

    //bye bye
    socket.on('disconnect', () => {
        delete players[socket.id];
    });

    //move me baby
    socket.on('movement', (data) => {
        movePlayer(data, socket.id);
    });
});

setInterval(() => {
    io.sockets.emit('state', players);
}, 1000 / 60);


//Player movement
const moveSpeed = 4;

function movePlayer(data, id) {
    let player = players[id] || {};

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

    let pTop = Math.floor(newPos.y / (values.SPRITE_SIZE * values.SPRITE_SCALE));
    let pBottom = Math.floor((newPos.y + 32) / (values.SPRITE_SIZE * values.SPRITE_SCALE));
    let pLeft = Math.floor(newPos.x / (values.SPRITE_SIZE * values.SPRITE_SCALE));
    let pRight = Math.floor((newPos.x + 32) / (values.SPRITE_SIZE * values.SPRITE_SCALE));

    if (maps.MAPS[player.map][pTop * 25 + pLeft] > 0)
        return;
    if (maps.MAPS[player.map][pTop * 25 + pRight] > 0)
        return;
    if (maps.MAPS[player.map][pBottom * 25 + pLeft] > 0)
        return;
    if (maps.MAPS[player.map][pBottom * 25 + pRight] > 0)
        return;

    // let p = pTop * 25 + pBottom;
    // if (maps.MAPS[player.map][p] > 0)
    //     return;

    player.x = newPos.x;
    player.y = newPos.y;
}