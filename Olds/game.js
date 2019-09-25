let gameScene = new Phaser.Scene('Game');
let gameSettings = {
    type: Phaser.AUTO,
    width: 640,
    height: 360,
    pixelArt: true,
    scene: gameScene,
    scale: {
        mode: Phaser.Scale.WIDTH_CONTROLS_HEIGHT
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y:0 }
        }
    },
};

let game = new Phaser.Game(gameSettings);
var movement = [0, 0, 0];
var cursors;

gameScene.init = function(){
   
}
gameScene.preload = function(){
    for(var i = 1; i <= 6; i++){
        this.load.image('idle'+i, 'assets/Idle/Idle_0'+i+'.png');
    }
    for(var i = 1; i <= 8; i++){
        this.load.image('run'+i, 'assets/Run/Run_0'+i+'.png');
    }
    this.load.image('bullet', 'assets/bullet.png');
}
gameScene.create = function(){
    gameScene.cameras.main.setBackgroundColor('#f2f7f0');
    this.otherPlayersOnline = this.physics.add.group();
    this.bullets = this.physics.add.group();
    this.socket = io();
    var mySelf = this;
    
    cursors = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
        enter: Phaser.Input.Keyboard.KeyCodes.ENTER
    });
    
    this.anims.create({
        key: 'idle',
        frames: [
            {key: 'idle1'},
            {key: 'idle2'},
            {key: 'idle3'},
            {key: 'idle4'},
            {key: 'idle5'},
            {key: 'idle6', duration: 30}
        ],
        frameRate: 10,
        repeat: 0
    });
    
    this.anims.create({
        key: 'run',
        frames: [
            {key: 'run1'},
            {key: 'run2'},
            {key: 'run3'},
            {key: 'run4'},
            {key: 'run5'},
            {key: 'run6'},
            {key: 'run7'},
            {key: 'run8', duration: 30}
        ],
        frameRate: 10,
        repeat: 0
    });
    
    this.socket.on('onlinePlayers', function (players){
        Object.keys(players).forEach(function (id){
           if(players[id].playerId === mySelf.socket.id){
               console.log("My id is " + mySelf.socket.id);
               createMyPlayer(mySelf, players[id]);
           }else{
               createOtherPlayer(mySelf, players[id]);
           }
        });
    });
    
    this.socket.on('playerConnection', function (playerStuff){
        createOtherPlayer(mySelf, playerStuff);
    });
    
    this.socket.on('handleMovement', function (playerStuff){
        if(playerStuff.playerId === mySelf.socket.id){
            mySelf.player.x = playerStuff.x;
            mySelf.player.y = playerStuff.y;
            mySelf.player.scaleX = playerStuff.orientation;
            if(playerStuff.isRunning){
                mySelf.player.play('run', true);
            }else{
                mySelf.player.play('idle', true);
            }
        }
        mySelf.otherPlayersOnline.getChildren().forEach(function(otherPlayer){
            if(playerStuff.playerId === otherPlayer.playerId){
                otherPlayer.x = playerStuff.x;
                otherPlayer.y = playerStuff.y;
                otherPlayer.scaleX = playerStuff.orientation;
                if(playerStuff.isRunning){
                    otherPlayer.play('run', true);
                }else{
                    otherPlayer.play('idle', true);
                }
            }
        });
    });
    
    this.socket.on('playerDisconnection', function (playerId){
        this.otherPlayersOnline.getChildren().forEach(function(otherPlayer){
            if(playerId === otherPlayer.playerId){
                otherPlayer.destroy(); 
            }
        });
    });
    this.socket.on('spawnBullet', function(bulletStuff){
        const newBullet = mySelf.add.sprite(bulletStuff.x, bulletStuff.y, 'bullet');
        newBullet.setOrigin(0.5, 0.5);
        mySelf.bullets.add(newBullet);
        console.log(newBullet);
    });
}
gameScene.update = function(){
    if(cursors.up.isDown){
        movement[1] = -1;
    }else if(cursors.down.isDown){
        movement[1] = 1;
    }else{
        movement[1] = 0;
    }
    if(cursors.left.isDown){
        movement[0] = -1;
    }else if(cursors.right.isDown){
        movement[0] = 1;
    }else{
        movement[0] = 0;
    }
    
    if(cursors.enter.isDown){
        movement[2] = 1;
    }else{
        movement[2] = 0;
    }
    
    this.socket.emit('handleInputs', movement);
    
    this.bullets.getChildren().forEach(function (bullet){
         //bullet.x += 3 * bullet.direction;
        //console.log(bullet.direction);
    }, this);
    
}
function createMyPlayer(mySelf, playerStuff){
    mySelf.player = mySelf.add.sprite(playerStuff.x, playerStuff.y, 'idle1');
    mySelf.player.setOrigin(0.5, 0.5);
    mySelf.player.play('idle');
}
function createOtherPlayer(mySelf, playerStuff){
    const otherPlayer = mySelf.add.sprite(playerStuff.x, playerStuff.y, 'idle1');
    otherPlayer.setOrigin(0.5, 0.5);
    otherPlayer.play('idle');
    otherPlayer.playerId = playerStuff.playerId;
    mySelf.otherPlayersOnline.add(otherPlayer);
}