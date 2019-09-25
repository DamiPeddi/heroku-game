var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use(express.static(__dirname + '/public'));

var players = {};

var bullets = [];
var bulletId = 1;

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
        isShooting: false,
        canShoot: true,
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
        //console.log(socket.id + " movement data is " + data);

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
        
        if(data[2] != 0 && players[socket.id].canShoot && !players[socket.id].isShooting){
            players[socket.id].isShooting = true;
            players[socket.id].canShoot = false;
            
            //shooting here
            var bullet = {
                x: players[socket.id].x,
                y: players[socket.id].y - 10,
                ownerId: socket.id,
                id: bulletId,
                direction: players[socket.id].orientation,
            };
            bullets.push(bullet);
            io.emit('spawnBullet', bullet);
            bulletId += 1;

        }else if(data[2] == 0){
            players[socket.id].isShooting = false;
            players[socket.id].canShoot = true;
        }
        
        
        io.emit('handleMovement', players[socket.id]);
    });
});

server.listen(8081, function(){
    console.log('Server running on port ' + server.address().port);
});