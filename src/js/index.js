var app = require('express')();
var http = require('http').Server(app);

//this works but may need some sort of compiler
var $ = require('jQuery');

//var t = require('./game.js');
//console.log(test);
var t = game;

var three, player, socket, thisPlayer, camera, scene;
var players = [], objects = [], users = [];

var otherPlayers = [], otherPlayersId = [];

var keyState = {};

const uuid = t.genUUID();

var nameUser = '';

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

$( document ).ready(function() {
  startup();
});

function startup(){

  //focus for this page
  $( "#username" ).focus();

  document.getElementById("host").onclick = function(){
    console.log("host");

    ipcRenderer.send('setup', ip_address);
    console.log("setup");

    ipcRenderer.on('hosting', function(event, service){
      console.log("hosting");
      ipcRenderer.send('advertise', service);
      console.log(service);
      common(service);
    });

		$(document).on("click", "#startMatch", function(){
			console.log("startMatch");
			//$( "#lobby" ).hide();
			socket.emit('start');
		});

  };

  document.getElementById("join").onclick = function(){
    console.log("joining");

    ipcRenderer.send('find', 'local');
		ui.menuchange('join');

    ipcRenderer.on('found', function(event, services){
			ui.fadeSpinner();
			$.each(services, function( index, value ) {

				ui.addButton("#search .pt-triggers", 'join2', "A"+index, true);
				//needs to add on click trigger to common service
        document.getElementById("A"+index).onclick = function(){
          var dets = value.details;
          console.log(value.details);
          console.log("pressed join");
          common(dets);
        };

			});
      //common(service);

    });

		ipcRenderer.on('unfound', function(event, service){
			console.log("unfound");
      ui.fadeSpinner();
		});

  };

  ui.buttonSetup();

  function common(service){
    console.log("common started");
		//$( "#start" ).hide(); //may need to change to animation change

    io = require('socket.io-client'),
    socket = io.connect('http://'+service.ip+':'+service.port);


    socket.on('connect', function(){

			//var nameUser = "name";
			socket.emit('newUser', uuid, nameUser);

    });

		socket.on('createUser', function(data){
			console.log("createUser");

			users.push(data);
			//change page visual, add this player to list with ready button if hosting
			socket.emit('requestUsers', uuid);
			ui.addUser(data);
			ui.menuchange('host');
			if(data.host){
				// $("#lobby").append('<button id="startMatch" class="pt-touch-button" >Start</button>');
				ui.addButton("#lobby", 'Start', 'startMatch');
        ui.addButton("#lobby", 'stop hosting', 'stop-hosting');
        // <button id="stop-hosting" class="pt-touch-button" >stop hosting</button>
			}

		})

		socket.on('addUser', function(data){
			console.log("addUser");
			var index = t.contains(users, data.playerId);
			if(index == -1){
				if(uuid != data.playerId){
					users.push(data);
					ui.addUser(data);
				}
			}
		});

    socket.on('startMatch', function(data){
      if(!thisPlayer){
        if(data.playerId == uuid){
    			three = THREE.Bootstrap({element: '#game'});
          t.loadWorld(socket);
          t.createPlayer(data);
          socket.emit('requestPlayers', uuid);
          ui.menuchange('game');
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

};
