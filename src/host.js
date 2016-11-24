
var host = {

  player: function(id){
    this.playerId = id;
    this.x = Math.random()*4;
    this.y = Math.random()*4;
    this.z = Math.random()*4;
    this.r_x = 0;
    this.r_y = 0;
    this.r_z = 0;
    this.sizeX = 1;
    this.sizeY = 1;
    this.sizeZ = 1;
    this.speed = 0.1;
    this.turnSpeed = 0.03;
  },

  addPlayer: function( id ){
    player = new this.player(id);
    players.push( player );
    return player;
  },

  removePlayer: function(player){
    console.log("remove player");

    var index = players.indexOf(player);
    if (index > -1) {
      players.splice(index, 1);
    }

  }

};

module.exports = host;
