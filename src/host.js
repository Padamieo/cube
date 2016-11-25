
var host = {

  player: function( id ){
    this.playerId = id;
    this.x = 0; //Math.random()*3;
    this.y = 0; //Math.random()*1;
    this.z = 0; //Math.random()*3;
    this.r_x = 0;
    this.r_y = 0;
    this.r_z = 0;
    this.size = 1;
    this.speed = 0.1;
    this.turnSpeed = 0.03;
  },

  addPlayer: function( id ){
    player = new this.player(id);
    players.push( player );
    return player;
  },

  removePlayer: function( id ){
    var index = players.findIndex(function(pd){
      return pd.playerId === id;
    })
    players.splice(index, 1);
  }

};

module.exports = host;
