
var host = {

  b: function(){
    console.log("boop");
  },

  player: function( id ){
    this.playerId = id;
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

	test: function( user ){
		this.playerId = user.playerId;
		this.host = user.host;
		this.name = user.name;
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

	user: function( id, host, name ){
		this.playerId = id;
		this.host = host;
		this.name = name;
	},

	createPlayers: function( users ){
		var ref = this;
		var p = [];
		users.forEach(function( user ){
			var s = new ref.test( user );
			p.push( s );
		})
		return p;
	},

  // addPlayer: function( players, id ){
  //   player = new this.player(id);
  //   players.push( player );
  //   console.log(players);
  //   return player;
  // },

	addUser: function( users, id, name){
		var host = (users.length == 0 ? true : false );
		var user = new this.user(id, host, name);
    users.push( user );
    return user;
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
    var index = this.contains( players, id );
    players.splice(index, 1);
  },

  contains: function( players, id ) {
    var index = players.findIndex(function(pd){
      return pd.playerId === id;
    });
    return index;
  }

};

module.exports = host;
