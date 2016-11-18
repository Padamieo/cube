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
http.listen(0, ip_address, function(){
  console.log('listening on *:' + http.address().port );
});


function myFunction(){
  //var polo = require('polo');
  //var apps = polo();

  // var apps = polo({
  //     multicast: true,     // disables network multicast,
  //     monitor: true        // fork a monitor for faster failure detection
  // });

  document.getElementById("host").onclick = function(){
    console.log("hosting");

    var ServiceDiscovery = require('node-discovery');

    var d = new ServiceDiscovery({
      port: 12345
    });

    // advertise the process with an object
    d.advertise({
      name: 'something',
      details: 'about',
      this: 'service'
    });

    d.on('added', function(obj) {
      console.log('A new node has been added.');
    });

    // apps.put({
    //   name:'hello-world',
    //   port: 3000
    // });

    //var socket = io.connect('http://10.50.74.5:'+http.address().port);

  };

  document.getElementById("join").onclick = function(){
    console.log("joining");

    var ServiceDiscovery = require('node-discovery');
    //var d = new ServiceDiscovery();
    var d = new ServiceDiscovery({
      port: 12346
    });
    d.need('something');

    //var name = "hello-world";
    // apps.once('up', function(name, service) {
    //   console.log("test");
    //   console.log(service);
    //   console.log(apps);
    //   var socket = io.connect('http://10.50.74.5:'+http.address().port);
    // });

  };

}
