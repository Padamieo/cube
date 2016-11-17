var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/index.js', function(req, res){
  res.sendFile(__dirname + '/index.js');
});

io.on('connection', function(socket){
  console.log('a user connected');
});


var ip_address = '10.50.74.5';
http.listen(3000, ip_address, function(){
  console.log('listening on *:3000');
});


var polo = require('polo');
var apps = polo();


function myFunction(){
  var socket = io.connect('http://10.50.74.5:3000');

  apps.put({
    name:'hello-world', // required - the name of the service
    port: 3000          // we are listening on port 8080.
  });

  // look for server
  // apps.once('up', function(name, service) {
  //   console.log(apps.get(name));
  // });

}
