// var app = require('express')();
// var http = require('http').Server(app);
// var io = require('socket.io')(http);
//
// app.get('/', function(req, res){
//   res.sendFile(__dirname + '/index.html');
// });
//
// io.on('connection', function(socket){
//   console.log('a user connected');
// });
//
// var ip_address = '192.168.0.10';
// http.listen(3000, ip_address, function(){
//   console.log('listening on *:3000');
// });

var http = require('http');
var polo = require('polo');
var apps = polo();

apps.once('up', function(name, service) {                   // up fires everytime some service joins
    console.log(apps.get(name));                        // should print out the joining service, e.g. hello-world
});
