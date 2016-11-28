
var host = {

  b: function(){
    console.log("boop");
  },

  player: function( ){
    this.playerId = 0;
    this.x = Math.random()*3;
    this.y = 0; //Math.random()*1;
    this.z = Math.random()*3;
    this.r_x = 0;
    this.r_y = 0;
    this.r_z = 0;
    this.size = 1;
    this.speed = 0.1;
    this.turnSpeed = 0.03;
  },

  addPlayer: function( players ){
    player = new this.player();
    console.log("BPP"+players.length);
    player.playerId = players.length+1;

    players.push( player );
    return player;
  },

  updatePlayerData: function(players, data){

    for(var i = 0; i < players.length; i++){
      if(players[i].playerId == data.playerId){
        players[i].x = data.x;
        players[i].y = data.y;
        players[i].z = data.z;
        players[i].r_x = data.r_x;
        players[i].r_y = data.r_y;
        players[i].r_z = data.r_z;
      }
    }

  },

  removePlayer: function( id ){
    var index = players.findIndex(function(pd){
      return pd.playerId === id;
    })
    players.splice(index, 1);
  }

};

module.exports = host;
