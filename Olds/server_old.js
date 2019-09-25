///indent with ctrl+alt+i
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var players = {};

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});


io.on('connection', function (socket) {
    console.log('a user connected with id: ' + socket.id);
    // create a new player and add it to our players object
    players[socket.id] = {
        rotation: 1,
        x: Math.floor(Math.random() * 500) + 50,
        y: Math.floor(Math.random() * 300) + 50,
        playerId: socket.id,
        running: 0,
        team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue'
    };
    // send the players object to the new player
    socket.emit('currentPlayers', players);
    // update all other players of the new player
    socket.broadcast.emit('newPlayer', players[socket.id]);
    socket.on('disconnect', function () {
        console.log('user disconnected');
        // remove this player from our players object
        delete players[socket.id];
        // emit a message to all players to remove this player
        io.emit('disconnect', socket.id);
    });
    socket.on('handleInputs', function(data){
        console.log(socket.id + " movement data is " + data);
        
        if(data[0] != 0 || data[1] != 0){
            players[socket.id].running = true;
        }else{
            players[socket.id].running = false;
        }
        
        if(data[0] != 0){
            players[socket.id].rotation = data[0];
        }
        
        players[socket.id].x += data[0];
        players[socket.id].y += data[1];
        
        io.emit('handleMovement', players[socket.id]);
    });
});
server.listen(8081, function () {
    console.log(`Listening on ${server.address().port}`);
});