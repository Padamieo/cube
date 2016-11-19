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

var ip_address = '192.168.0.10';//'10.50.74.5';
http.listen(0, ip_address, function(){
  console.log('listening on *:' + http.address().port );
});


function myFunction(){
  var polo = require('polo');
  var apps = polo();

  // var apps = polo({
  //     multicast: true,     // disables network multicast,
  //     monitor: true        // fork a monitor for faster failure detection
  // });

  document.getElementById("host").onclick = function(){
    console.log("hosting");

    var ipcRenderer = require('electron').ipcRenderer;
    ipcRenderer.send('show-prop1');

    // apps.put({
    //   name:'hello-world',
    //   port: 3000
    // });

    //var socket = io.connect('http://10.50.74.5:'+http.address().port);

  };

  document.getElementById("join").onclick = function(){
    console.log("joining");

    var ipcRenderer = require('electron').ipcRenderer;
    ipcRenderer.send('show-prop2', 'bv232');

    // var name = "hello-world";
    // apps.once('up', function(name, service) {
    //   console.log("test");
    //   console.log(service);
    //   console.log(apps);
    //   var socket = io.connect('http://'+ip_address+':'+http.address().port);
    // });

  };

}
