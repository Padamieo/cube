var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


var t = require('./test.js');
var host = require('./host.js');

var three, player, socket;
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

  var id = socket.id;
  //player = host.addPlayer(id);

  //var player = host.playerForId(id);
  socket.emit('createPlayer', socket.id);//player);

  socket.broadcast.emit('addOtherPlayer', player);

  socket.on('requestOldPlayers', function(){
    for (var i = 0; i < players.length; i++){
      if (players[i].playerId != id){
        socket.emit('addOtherPlayer', players[i]);
      }
    }
  });

  socket.on('updatePosition', function(data){
    console.log('test'+data);
    // var newData = world.updatePlayerData(data);
    // socket.broadcast.emit('updatePosition', newData);
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
    socket.emit('removeOtherPlayer', player);
    host.removePlayer( player );
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
      //console.log(arg);
      var socket = io.connect('http://' + arg.ip+':'+arg.port);
      common(socket);
    });

  };

  function common(socket){
    /* common */
    three = THREE.Bootstrap();

    socket.on('createPlayer', function(data){
      player = host.addPlayer(data);
      t.createPlayer(player);
    });

    socket.on('connect', function(){
      t.loadWorld(socket);
      socket.emit('requestOldPlayers', {});
    });

    socket.on('addOtherPlayer', function(data){
      t.addOtherPlayer(data);
    });

    socket.on('updatePosition', function(data){
      //updatePlayerPosition(data);
      console.log('updatePosition'+data);
    });

    socket.on('removeOtherPlayer', function(data){
      t.removeOtherPlayer(data);
    });

  }

}
