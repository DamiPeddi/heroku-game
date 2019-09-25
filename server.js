var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use(express.static(__dirname + '/public'));

var players = {};

app.get('/', function (req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    console.log('A new player with id: ' + socket.id + ' has connected!');

    players[socket.id] = {
        x: Math.floor(Math.random() * 500) + 50,
        y: Math.floor(Math.random() * 250) + 50,
        orientation: 1,
        isRunning: false,
        playerId: socket.id
    };

    socket.emit('onlinePlayers', players);

    socket.broadcast.emit('playerConnection', players[socket.id]);

    socket.on('disconnect', function(){
        console.log('Player with id: ' + socket.id + ' has disconnected!');

        delete players[socket.id];

        io.emit('playerDisconnection', socket.id);
    });

    socket.on('handleInputs', function(data){
        console.log(socket.id + " movement data is " + data);

        if(data[0] != 0 || data[1] != 0){
            players[socket.id].isRunning = true;
        }else{
            players[socket.id].isRunning = false;
        }

        if(data[0] != 0){
            players[socket.id].orientation = data[0];
        }

        players[socket.id].x += data[0];
        players[socket.id].y += data[1];

        io.emit('handleMovement', players[socket.id]);
    });
});

var port = process.env.PORT;
if(port == null || port == ""){
  port = 8081;
}

server.listen(port, function(){
    console.log('Server running on port ' + server.address().port);
});
