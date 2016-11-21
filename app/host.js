
var host = {

  player: function(){
    this.playerId = players.length;
    this.x = 1;
    this.y = 0;
    this.z = 1;
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
    player = new this.player();
    player.playerId = id;
    players.push( player );
    return player;
  },

  playerForId: function( id ){
    var index;
    for (var i = 0; i < otherPlayersId.length; i++){
      if (otherPlayersId[i] == id){
        index = i;
        break;
      }
    }
    return otherPlayers[index];
  }

};

module.exports = host;