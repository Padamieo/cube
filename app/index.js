var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var t = require('./test.js');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/index.js', function(req, res){
  res.sendFile(__dirname + '/index.js');
});

io.on('connection', function(socket){
  console.log('a user connected');

});

var ip_address = t.getAddress(); //'192.168.0.3';//'10.50.74.5';

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

    t.someFunction();

  };

  document.getElementById("join").onclick = function(){
    console.log("joining");

    var ipcRenderer = require('electron').ipcRenderer;
    ipcRenderer.send('find', http.address().port);

    ipcRenderer.on('asynchronous-reply', (event, arg) => {
      console.log(arg);
      var socket = io.connect('http://'+arg.ip+':'+arg.port);
    });



  };

}
