
var host = {

  b: function(){
    console.log("boop");
  },

	cube_defaults: function(obj, random, size){
		var r = ( random ? random : 3 );
		var s = ( size ? size : 1 );
		obj.x = Math.random()*r;
		obj.y = Math.random()*r;
		obj.z = Math.random()*r;
		obj.r_x = 0;
		obj.r_y = 0;
		obj.r_z = 0;
		obj.size = s;
		return obj;
	},

	player: function( user ){
		var u = {};
		u.playerId = user.playerId;
		u.host = user.host;
		u.name = user.name;
		u.type = 'user';
		u = host.cube_defaults(u);
    u.speed = 0.1;
    u.turnSpeed = 0.03;
		return u;
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

	boop: function( playersArray ){

		if(playersArray.length >= 1){
			var v = 5;
		}else{
			var v = (Math.log(playersArray.length)*10).toFixed(0);
			console.log(v+"IMPORTANT");
		}

		for (var i = 0; i < v; i++) {
			var cube = {};
			cube.type = 'cube';
			cube = host.cube_defaults(cube);
			playersArray.push(cube);
		}
		// console.log(playersArray.length);
		// console.log(Math.log(2));
		// console.log(Math.log(6));

		var coArray = ["x","y","z"];
		for(var i = 0; i < coArray.length; i++){
			this.sortArrayObects( playersArray, coArray[i] );
	    this.space (playersArray, coArray[i] );
	    var largest = this.largest( playersArray, coArray[i] );
	    this.shiftall( playersArray, array[i], (largest/2) );
		}

		/*
		this.sortArrayObects(playersArray, "x");
    this.space(playersArray, "x");
    var x = this.largest(playersArray, "x");
    this.shiftall(playersArray, "x", (x/2));

    this.sortArrayObects(playersArray, "y");
    this.space(playersArray, "y");
    var y = this.largest(playersArray, "y");
    this.shiftall(playersArray, "y", (y/2));

    this.sortArrayObects(playersArray, "z");
    this.space(playersArray, "z");
    var z = this.largest(playersArray, "z");
    this.shiftall(playersArray, "z", (z/2));
		*/

		//var close = this.example(tempObject);

		var o = host.group(playersArray, 'type');
		objects = [];
		objects = o.cube;

		return o.user;

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

	group: function(arr, key) {
		return arr.reduce(function(obj, x) {
			if (!obj[x[key]]) {
				obj[x[key]] = [];
			}
			obj[x[key]].push(x);
			return obj;
		}, {});
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
  },

	largest: function(array, key){
    var largest = 0;
    array.forEach(function( obj ){
      if(obj[key] > largest){
        largest = obj[key];
      }
    });
    return largest;
  },

  shiftall: function(array, key, shift){
    for (var i = 0; i < array.length; i++) {
      array[i][key] = array[i][key]-shift;
    };
  },

  space: function(array, key, distance){
    for (var i = 0; i < array.length; i++) {
      array[i][key] = array[i][key]+(i*0.8);
    }
  },

  sortArrayObects: function(array, key){
    array.sort(function(a, b) {
      return a[key] - b[key];
    });
  },

  proximityTest: function(array, dis){
		var dis = ( dis ? dis : 3 );
    close = false;
    array.forEach(function( obj1 ){
      array.forEach(function( obj2 ){
        if( obj1.playerId === obj2.playerId ){
          return;
        }

        if( obj1.x+dis > obj2.x || obj1.x-dis < obj2.x ){
          close = true;
        }
      })
    })
    return close;
  }

};

module.exports = host;
