var app = require('express')();
var http = require('http').Server(app);

//this works but may need some sort of compiler
var $ = require('jQuery');

var t = require('./game.js');

var three, player, socket, thisPlayer, camera, scene;
var players = [], objects = [], users = [];

var otherPlayers = [], otherPlayersId = [];

var keyState = {};

const uuid = t.genUUID();

const ipcRenderer = require('electron').ipcRenderer;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/index.js', function(req, res){
  res.sendFile(__dirname + '/index.js');
});

var ip_address = t.getAddress();

http.listen(0, ip_address, function(){
  console.log('listening on *:' + http.address().port );
  //ipcRenderer.send('outside', http.address().port );
});


(function startup(){

  document.getElementById("host").onclick = function(){
    console.log("hosting");

    ipcRenderer.send('setup', ip_address);

    ipcRenderer.on('hosting', function(event, service){
      ipcRenderer.send('advertise', service);
      common(service);
    });

		$(document).on("click", "#startMatch", function(){
			console.log("startMatch");
			$( "#lobby" ).hide();
			socket.emit('start');
		});

  };

  document.getElementById("join").onclick = function(){
    console.log("joining");

    ipcRenderer.send('find', 'local');

    ipcRenderer.on('found', function(event, service){
      //list found services
      common(service);
    });

  };


  function common(service){

		$( "#start" ).hide(); //may need to change to animation change

    io = require('socket.io-client'),
    socket = io.connect('http://'+service.ip+':'+service.port);


    socket.on('connect', function(){

      //socket.emit('newPlayer', uuid);
			var nameUser = "name";
			socket.emit('newUser', uuid, nameUser);

    });

		function createYes(data){
			$("#users").append('<li id="'+data.playerId+'" >'+data.name+'</li>');
		}

		socket.on('createUser', function(data){
			console.log("createUser");
      
			users.push(data);
			//change page visual, add this player to list with ready button if hosting
			socket.emit('requestUsers', uuid);
			createYes(data);
			if(data.host){
				$("#lobby").append('<button id="startMatch">Start</button>');
			}

		})

		socket.on('addUser', function(data){
			console.log("addUser");
			var index = t.contains(users, data.playerId);
			if(index == -1){
				if(uuid != data.playerId){
					users.push(data);
					createYes(data);
				}
			}
		});

    socket.on('startMatch', function(data){
      if(!thisPlayer){
        if(data.playerId == uuid){
    			three = THREE.Bootstrap();
          t.loadWorld(socket);
          t.createPlayer(data);
          socket.emit('requestPlayers', uuid);
        }
      }
    });

		//console.log(Math.log(1)); // use this to calculate number of cubes to players in match

    socket.on('addPlayer', function(data){
      var index = t.contains(players, data.playerId);
      if(index == -1){
        if(uuid != data.playerId){
          t.addOtherPlayer(data);
        }
      }
    });

    socket.on('updatePlayers', function(data){
      //may need to check uuid and data.playerId dont match or data is not incorrect between
      console.log(uuid+" = "+data.playerId);
      t.updateObject(data);
    });

    socket.on('removePlayer', function(data){
      t.removeOtherPlayer(data);
    });

  }

})()
