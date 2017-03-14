var app = require('express')();
//var http = require('http').Server(app);

//this works but may need some sort of compiler
var $ = require('jQuery');

var pkg = ui.pkg();

// no longer required?
var player, socket, thisPlayer;
var users = [];

const uuid = game.genUUID();

var nameUser = '';

const ipcRenderer = require('electron').ipcRenderer;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/index.js', function(req, res){
  res.sendFile(__dirname + '/index.js');
});

var ip_address = ui.getAddress();

$( document ).ready(function() {
  startup();
});

function startup(){

  //not sure when best to initialize sound
  sound.init();

  //buld default handlebars pages
  ui.defaultPagesSetup();

  //focus for this page
  $( "#username" ).focus();

  //document.getElementById("host").onclick = function(){
  $(document).on("click", "#host", function(){
    console.log("host");

    ipcRenderer.send('setup', ip_address);
    console.log("setup");

    ipcRenderer.on('hosting', function(event, service){
      console.log("hosting");
      service.host_name = nameUser;
      ipcRenderer.send('advertise', service);
      //console.log(service);
      common(service);
    });

		$(document).on("click", "#startMatch", function(){
			console.log("startMatch");
			//$( "#lobby" ).hide();updatePlayers
			socket.emit('start');
		});

  });

  //document.getElementById("join").onclick = function(){
  $(document).on("click", "#join", function(){
    console.log("joining");

    ipcRenderer.send('find', 'local');
		ui.menuchange('join');

    ipcRenderer.on('found', function(event, services){
			ui.fadeSpinner();

			$.each(services, function( index, value ) {
        console.log(value);
        var gameName = value.details.host_name+" Game";
				ui.addButton("#search .pt-triggers", gameName, "A"+index, true);
				//needs to add on click trigger to common service
        document.getElementById("A"+index).onclick = function(){
          var dets = value.details;
          console.log(value.details);
          console.log("pressed join");
          common(dets);
        };

			});

    });

		ipcRenderer.on('unfound', function(event, service){
			console.log("unfound");
      ui.fadeSpinner();
		});

  });

  ui.buttonSetup();

  function common(service){
    console.log("common started");
		//$( "#start" ).hide(); //may need to change to animation change

    io = require('socket.io-client'),
    socket = io.connect('http://'+service.ip+':'+service.port);

    socket.on('connect', function(){
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

		});

		socket.on('addUser', function(data){
			console.log("addUser");
			var index = game.contains(users, data.playerId);
			if(index == -1){
				if(uuid != data.playerId){
					users.push(data);
					ui.addUser(data);
				}
			}
		});

    socket.on('startMatch', function(data, setup){
      if(!thisPlayer){
        if(data.playerId == uuid){

          ui.updateScore(setup);
          ui.showScore(); // needs data to display

          game.loadWorld(socket, data);

          socket.emit('requestPlayers', uuid);
					socket.emit('requestCubes');

          ui.menuchange('game');
        }
      }
    });

    socket.on('addPlayer', function(data){
      game.addOtherPlayer(data);
    });

		socket.on('addCubes', function(data){
			for (var i = 0; i < data.length; i++){
				game.addCube(data[i]);
			}
		});

    socket.on('updatePlayers', function(data){
      //may need to check uuid and data.playerId dont match or data is not incorrect between
      game.updateObject(data);
    });

		socket.on('updateShots', function(data){
      //console.log(data);
			game.addShot(data);
		});

		socket.on('reportKill', function(data){
      console.log(data);
      game.hit(data.id);

		});

    socket.on('removePlayer', function(data){
      game.removeOtherPlayer(data);
    });

  }

};
