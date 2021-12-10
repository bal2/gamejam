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
            x: Math.random() * ((values.GRID_WIDTH - 100) - 100) + 100,
            y: Math.random() * ((values.GRID_HEIGHT - 100) - 100) + 100
        };
    });

    //bye bye
    socket.on('disconnect', () => {
        delete players[socket.id];
    })

    const moveSpeed = 8;

    //move me baby
    socket.on('movement', (data) => {
        var player = players[socket.id] || {};
        if (data.left && player.x - moveSpeed > 0) {
            player.x -= moveSpeed;
        }
        if (data.up && player.y - moveSpeed > 0) {
            player.y -= moveSpeed;
        }
        if (data.right && player.x + moveSpeed < 800) {
            player.x += moveSpeed;
        }
        if (data.down && player.y + moveSpeed < 600) {
            player.y += moveSpeed;
        }
    });
});

setInterval(() => {
    io.sockets.emit('state', players);
}, 1000 / 60);