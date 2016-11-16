var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
});

var ip_address = '192.168.0.10';
http.listen(3000, ip_address, function(){
  console.log('listening on *:3000');
});

//var http = require('http');
var polo = require('polo');
var apps = polo();

apps.put({
    name:'hello-world', // required - the name of the service
    port: 3000          // we are listening on port 8080.
});
