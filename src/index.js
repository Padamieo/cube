var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


var t = require('./test.js');
var host = require('./host.js');

var three, player, socket, thisPlayer;
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
    console.log("server side create player");

    //if playsers is 0 create all cubes

    var player = host.addPlayer(data);

    // have player replace cubes

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





  });


/*
  // var id = socket.id;
  // player = host.addPlayer(id);

  //var player = host.playerForId(id);
  socket.emit('createPlayer', socket.id);//player);

  //socket.broadcast.emit('addOtherPlayer', player);

  socket.on('requestOldPlayers', function(id){
    //console.log(id);
    //console.log("add player");
    for (var i = 0; i < players.length; i++){
      if (players[i].playerId != id){
        socket.emit('addOtherPlayer', players[i]);
      }
    }

  });

  socket.on('addOtherPlayer', function(data){
    //if(data.playerId != socket.id){
      t.addOtherPlayer(data);
    //}
  });

  socket.on('updatePosition', function(data){
    // console.log('updatePosition');
    // console.log(data);
    // var newData = world.updatePlayerData(data);
    t.updatePlayerData(data);
    t.updateObject(data);
    socket.broadcast.emit('updatePosition', data);
  });

  socket.on('disconnect', function(){
    console.log('user disconnected');
    socket.emit('removeOtherPlayer', player);
    host.removePlayer( player );
  });
*/
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

    socket.on('connect', function(){
      console.log("connected");
      socket.emit('createPlayer', socket.id);
      t.loadWorld(socket);
      socket.emit('requestPlayers', socket.id);
    });

    socket.on('createPlayer', function(data){
      console.log("client side create player");
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


/*
    socket.on('createPlayer', function(data){
      console.log("create player");
      player = host.addPlayer(data);
      t.createPlayer(player);
      //socket.emit('addOtherPlayer', player);
    });

    socket.on('connect', function(){
      t.loadWorld(socket);
      socket.emit('requestOldPlayers', socket.id);
      //socket.emit('addOtherPlayer', player);
    });

    socket.on('addOtherPlayer', function(data){
      console.log('addOtherPlayer122333');
      console.log(data);
      t.addOtherPlayer(data);
    });

    socket.on('updatePosition', function(data){
      console.log("update everyone");
      t.updatePlayerData(data);
      t.updateObject(data);
      // console.log('updatePosition');
      // console.log(data);
    });

    socket.on('removeOtherPlayer', function(data){
      t.removeOtherPlayer(data);
    });
*/
  }

}
