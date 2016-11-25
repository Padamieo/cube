var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var t = require('./test.js');
var host = require('./host.js');

var three, player, socket, thisPlayer, camera, scene;
var players = [], objects = [];
var keyState = {};

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/index.js', function(req, res){
  res.sendFile(__dirname + '/index.js');
});

io.on('connection', function(socket){
  console.log('a user connected');
  console.log(socket.id);

  socket.on('createPlayer', function(data){

    //if playsers is 0 create all cubes

    var player = host.addPlayer(data);

    // have player replace cube

    socket.emit('createPlayer', player);

    socket.broadcast.emit('addPlayer', player);

    socket.on('requestPlayers', function(id){
      for (var i = 0; i < players.length; i++){
        if (players[i].playerId != id){
          socket.emit('addPlayer', players[i]);
        }
      }
    });

    socket.on('updatePlayer', function(data){
      t.updatePlayerData(data);
      socket.broadcast.emit('updatePlayers', data);
    });

    socket.on('disconnect', function(){
      host.removePlayer( socket.id );
      socket.broadcast.emit('removePlayer', socket.id );
    });

  });

});


var ip_address = t.getAddress();

http.listen(0, ip_address, function(){
  console.log('listening on *:' + http.address().port );
});


function myFunction(){

  document.getElementById("host").onclick = function(){
    console.log("hosting");

    var ipcRenderer = require('electron').ipcRenderer;
    var service = {
      ip: ip_address,
      port: http.address().port
    }
    ipcRenderer.send('advertise', service);

    var socket = io.connect('http://'+ip_address+':'+http.address().port);
    common(socket);

  };

  document.getElementById("join").onclick = function(){
    console.log("joining");

    var ipcRenderer = require('electron').ipcRenderer;
    ipcRenderer.send('find', http.address().port);

    ipcRenderer.on('asynchronous-reply', function(event, arg){

      var socket = io.connect('http://' + arg.ip+':'+arg.port);
      common(socket);
    });

  };

  function common(socket){
    /* common */
    three = THREE.Bootstrap();

    socket.on('connect', function(){
      socket.emit('createPlayer', socket.id);
      t.loadWorld(socket);
      socket.emit('requestPlayers', socket.id);
    });

    socket.on('createPlayer', function(data){
      t.createPlayer(data);
    });

    socket.on('addPlayer', function(data){
      if(socket.id != data.playerId){
        t.addOtherPlayer(data);
      }
    });

    socket.on('updatePlayers', function(data){
      t.updateObject(data);
    });

    socket.on('removePlayer', function(data){
      t.removeOtherPlayer(data);
    });

  }

}
