let gameScene = new Phaser.Scene('Game');

let config = {
    type: Phaser.AUTO,
    width: 640,
    height: 360,
    scale: {
        mode: Phaser.Scale.WIDTH_CONTROLS_HEIGHT
    },
    scene: gameScene,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
    },
};
let game = new Phaser.Game(config);
gameScene.init = function(){
}
gameScene.preload = function(){
    
    for(var i=1; i<=6; i++){
        this.load.image('idle'+i, 'assets/Idle/Idle_0'+i+'.png');
    }
    
    for(var i=1; i<=8; i++){
        this.load.image('run'+i, 'assets/Run/Run_0'+i+'.png');
    }
    
}
gameScene.create = function(){
    gameScene.cameras.main.setBackgroundColor('#f2f7f0');
    
    
    
    this.socket = io();
    var self = this;
    this.otherPlayers = this.physics.add.group();
    
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
        frameRate : 7,
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
        frameRate : 8,
        repeat: 0
    });

   
    
    this.socket.on('currentPlayers', function (players) {
        Object.keys(players).forEach(function (id) {
            if (players[id].playerId === self.socket.id) {
                console.log("My id: " + self.socket.id);
                addPlayer(self, players[id]);
            }else{
                addOtherPlayers(self, players[id]);
            }
        });
    });
    this.socket.on('newPlayer', function (playerInfo) {
        addOtherPlayers(self, playerInfo);
    });
    this.socket.on('disconnect', function (playerId) {
        self.otherPlayers.getChildren().forEach(function (otherPlayer) {
            if (playerId === otherPlayer.playerId) {
                otherPlayer.destroy();
            }
        });
    });
    this.socket.on('handleMovement', function (playerInfo){
        if(playerInfo.playerId === self.socket.id){
            self.ship.x = playerInfo.x;
            self.ship.y = playerInfo.y;
            self.ship.scaleX = playerInfo.rotation;
            if(playerInfo.running){
                self.ship.play('run', true);
            }else{
                self.ship.play('idle', true);
            }
        }
        self.otherPlayers.getChildren().forEach(function(otherPlayer){
           if(playerInfo.playerId === otherPlayer.playerId){
               otherPlayer.x = playerInfo.x;
               otherPlayer.y = playerInfo.y;
               otherPlayer.scaleX = playerInfo.rotation;
               if(playerInfo.running){
                   otherPlayer.play('run', true);
               }else{
                   otherPlayer.play('idle', true);
               }
           } 
        });
    });

}
gameScene.update = function(){
    var movement = [0,0];
    var cursors = this.input.keyboard.addKeys({
        up:Phaser.Input.Keyboard.KeyCodes.W,
        down:Phaser.Input.Keyboard.KeyCodes.S,
        left:Phaser.Input.Keyboard.KeyCodes.A,
        right:Phaser.Input.Keyboard.KeyCodes.D
    }); 
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
    
    this.socket.emit('handleInputs', movement);
    
}

function addPlayer(self, playerInfo) {
    
    self.ship = self.add.sprite(playerInfo.x, playerInfo.y, 'idle1').setOrigin(0.5, 0.5);
    self.ship.play('idle');
    if (playerInfo.team === 'blue') {
        //self.ship.setTint(0x0000ff);
    } else {
        //self.ship.setTint(0xff0000);
    }
}
function addOtherPlayers(self, playerInfo) {
    console.log("new player at: " + playerInfo.x + " " + playerInfo.y);
    const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'idle1').setOrigin(0.5, 0.5);
    otherPlayer.play('idle');
    if (playerInfo.team === 'blue') {
        //otherPlayer.setTint(0x0000ff);
    } else {
        //otherPlayer.setTint(0xff0000);
    }
    otherPlayer.playerId = playerInfo.playerId;
    self.otherPlayers.add(otherPlayer);
}