
var host = {

  b: function(){
    console.log("boop");
  },

	player: function( user ){
		this.playerId = user.playerId;
		this.host = user.host;
		this.name = user.name;
    this.x = Math.random()*3;
    this.y = 0; //Math.random()*1;
    this.z = 0;
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
			var s = new ref.player( user );
			p.push( s );
		})
		return p;
	},

	boop: function( play ){
		var ref = this;
		play.forEach(function( p1 ){
			play.forEach(function( p2 ){
				if(p1.x < p2.x){
					console.log(p1.x+" < "+p2.x);
				}
			})
		})
		return play;
	},

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
