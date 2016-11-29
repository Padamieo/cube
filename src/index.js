var app = require('express')();
var http = require('http').Server(app);
//var io = require('socket.io')(http);

var t = require('./test.js');
// var host = require('./host.js');

var three, player, socket, thisPlayer, camera, scene;
var players = [], objects = [], tempObjects = [];

var otherPlayers = [], otherPlayersId = [];

var keyState = {};


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/index.js', function(req, res){
  res.sendFile(__dirname + '/index.js');
});

var ip_address = t.getAddress();

http.listen(0, ip_address, function(){
  console.log('listening on *:' + http.address().port );
});


function myFunction(){

  document.getElementById("host").onclick = function(){
    console.log("hosting");

    var ipcRenderer = require('electron').ipcRenderer;

    ipcRenderer.send('server', ip_address);

    ipcRenderer.on('reply', function(event, service){

      ipcRenderer.send('advertise', service);

      var socket = io.connect('http://'+service.ip+':'+service.port);
      common(socket);

    });

    // var service = {
    //   ip: ip_address,
    //   port: http.address().port
    // }
    // ipcRenderer.send('advertise', service);
    //
    // var socket = io.connect('http://'+ip_address+':'+http.address().port);
    // common(socket);

  };

  document.getElementById("join").onclick = function(){
    console.log("joining");

    var ipcRenderer = require('electron').ipcRenderer;
    ipcRenderer.send('find', http.address().port);

    ipcRenderer.on('asynchronous-reply', function(event, service){

      var socket = io.connect('http://' + service.ip+':'+service.port);
      common(socket);

    });

  };

  function common(socket){
    /* common */
    three = THREE.Bootstrap();

    //var socket = io();

    socket.on('connect', function(){
      console.log(socket);
      //socket.emit('createPlayer', 0);
      t.loadWorld(socket);
      socket.emit('requestOldPlayers', 0);

    });

    socket.on('createPlayer', function(data){
      console.log(socket);
      //console.log(socket.id+" = "+data.playerId);
      // if( !thisPlayer ){
      //   t.createPlayer(data);
      //   socket.emit('requestPlayers', thisPlayer.playerId);
      //   socket.emit('add', data);
      // }
      t.createPlayer(data);

    });

    socket.on('addOtherPlayer', function(data){
      console.log(socket);
      console.log("addOtherPlayer");
      t.addOtherPlayer(data);
    });

    socket.on('addPlayer', function(data){
      console.log('addPlayer');

      // var a = [];
      // for(var i = 0; i < objects.length; i++){
      //   a.push(objects[i].playerId);
      // }
      // console.log(a);
      //
      // if (objects.filter(function(e){ e.playerId == data.playerId }).length > 0) {
      //   console.log("F:"+data.playerId);
      // }

      var d = objects.find( function( p ) {
        return p.playerId === data.playerId;
      } );

      if( !d ) {
        console.log("player:"+data.playerId+" not present will create");
        t.addOtherPlayer(data);
      }else{
        console.log("player:"+data.playerId+" present");
      }

      //if(thisPlayer.playerId != data.playerId){
      // t.addOtherPlayer(data);
      //}
    });

    socket.on('updatePlayers', function(data){
      console.log(socket.id+" = "+data.playerId);
      t.updateObject(data);
    });

    socket.on('removePlayer', function(data){
      t.removeOtherPlayer(data);
    });

  }

}
