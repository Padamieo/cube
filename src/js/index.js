var app = require('express')();
//var http = require('http').Server(app);

//this works but may need some sort of compiler
var $ = require('jquery');

var pkg = ui.pkg();

// no longer required?
var socket, thisPlayer;
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


  $(document).on("click", "#host", function(){
    console.log("host");

    var ip_address = ui.getAddress();

    ipcRenderer.send('setup', ip_address);
    console.log("setup");

    ipcRenderer.on('hosting', function(event, service){
      console.log("hosting");
      //console.log(service);
      ui.host = true;
      service.host_name = nameUser;
      ipcRenderer.send('advertise', service);
      //console.log(service);
      common(service);
    });

  });


  $(document).on("click", "#join", function(){
    console.log("joining");

    var data = ui.defaultPageData("search");
    ui.handlebars("search", data);

    ipcRenderer.send('find', 'local');
		ui.menuchange('join');

    ipcRenderer.on('found', function(event, services){
      //ui.fadeSpinner();
      console.log(services);
      var data = ui.defaultPageData("search");
      var hosts = [];

      $.each(services, function( index, value ) {
        var gameName = value.details.host_name+" Game";
        var v = game.contains(hosts, gameName, 'title' );
        if(v < 0){
          var details = value.details;
          var host_details = {name: "host", value: JSON.stringify(details)};
          hosts.push({id: index, class: "join-host", title: gameName, data: host_details})
        }
      });

      $.each(hosts, function( index, value ) {
        data.buttons.unshift(hosts[index]);
      });

      data.spinner = false;
			ui.handlebars("search", data);
    });

		ipcRenderer.on('unfound', function(event, service){
			console.log("unfound");
      var data = ui.defaultPageData("search");
      data.spinner = false;
      //TODO: add message that nothing was found local or online?
      ui.handlebars("search", data);
		});

  });


  ui.buttonSetup();

  $(document).on("click", ".join-host", function(){
    var details = $( this ).data( "host" );
    console.log("join host");
    common(details);
  });

  function common(service){
    console.log("common started");

    io = require('socket.io-client'),
    socket = io.connect('http://'+service.ip+':'+service.port);

    socket.on('connect', function(){
			socket.emit('newUser', uuid, nameUser);
    });

		socket.on('createUser', function(data){

			console.log("createUser");
      ui.user = data;
      console.log(data);
      users.push(data);
      ui.buildLobby(data);
      socket.emit('requestUsers', uuid);
			ui.menuchange('host');

		});

		socket.on('addUser', function(data){
			console.log("addUser");
      //something is making this work weird
			// var index = game.contains(users, data.playerId, 'playerId');
			// if(index === -1){
			// 	if(uuid != data.playerId){
					users.push(data);
					ui.addUser(data);
			// 	}
			// }
		});

    socket.on('removeUser', function(id){
      console.log("removeUser");
      var users = [];
      var data = ui.user;
      ui.buildLobby(data);
      socket.emit('requestUsers', uuid);
    });

    socket.on('host-closed', function(data){
      console.log("host closed");
    });

    //game mode
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
      console.log("reportKill");
      console.log(data);
      ui.updateScore(data);
      game.hit(data.kill);

		});

    socket.on('removePlayer', function(data){
      game.removeOtherPlayer(data);
    });

    socket.on('endgame', function(data){
      console.log("endgame");
      console.log(data);
      //show winner message
      //transition back to host
      //destory old canvas
    });

  }

};
