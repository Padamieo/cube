'use strict';

const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const ipcMain = electron.ipcMain;

const path = require('path')

const url = require('url')

const Discover = require('node-discover');

var players = [];
var host = require('./app/host.js');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 750,
    minHeight: 510,
    webPreferences:{
      devTools: true
    }
  })

  //frame: false

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'app/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  mainWindow.webContents.openDevTools()


  ipcMain.on('setup', function(event, ip) {

    var app = require('express')();
    var http = require('http').Server(app);
    var io = require('socket.io')(http);

    // app.get('/', function(req, res){
    //   res.sendfile('app/index2.html');
    // });

    http.listen(0, function(){

      console.log('listening on *:' + http.address().port );

      var service = {
        ip: ip,
        port: http.address().port
      }

      event.sender.send('hosting', service );

    });

    io.on('connection', function(socket){
      console.log('new connection');
      console.log(socket.id);

      socket.on('newPlayer', function(id){
        if(host.contains( players, id ) == -1){
          //if players is 0 create all cubes

          //console.log(players.length+1);
          //var id = socket.id;
          var player = host.addPlayer(players, id);

          // have player replace cube

          socket.emit('createPlayer', player);

          socket.broadcast.emit('addPlayer', player);

        }else{
          console.log("duplicate connection");
        }

      });

      socket.on('requestPlayers', function(id){
        for (var i = 0; i < players.length; i++){
          if (players[i].playerId != id){
            socket.emit('addPlayer', players[i]);
          }
        }
      });

      socket.on('updatePlayer', function(data){
        host.updatePlayerData(players, data);
        socket.broadcast.emit('updatePlayers', data);
      });

      socket.on('disconnect', function(d){
        console.log("need uuid to remove now");
        console.log(d);
        // host.removePlayer( socket.id );
        // socket.broadcast.emit('removePlayer', socket.id );
      });

    });

  });


  //current test
  function test(port){
    console.log("running natman-api");
    var natman = require('natman-api');

    var privatePort = port; //The port on your machine that you want to forward
    var publicPort = 80; //The port you want to open to the rest of the world.

    natman(privatePort, publicPort);
  };

  var getIP = require('external-ip')();

  getIP(function (err, ip) {
    if (err) {
      throw err;
    }
    console.log(ip);
  });

  ipcMain.on('outside', function(event, port){
    console.log("triggered outside:"+port);
    getIP();
    test(port);
  });
  //current test end


  ipcMain.on('advertise', function(event, service) {
    console.log('advertise');

    var d = Discover();

    d.advertise({ something : "something" });

    d.on('added', function(obj) {

      var success = d.send("service-details", { details : service });

      if (!success) {
        //could not send on that channel; probably because it is reserved
        console.log("issue sending service details");
      }
    });


  });

  ipcMain.on('find', function(event, scope) {
    console.log('find '+scope);

    var d = Discover();

    var success = d.join("service-details", function (data) {
      console.log("something join");
        if (data.details) {
          //connect to the new redis master
          console.log(data.details);
          event.sender.send('found', data.details);
        }
    });

    console.log(success);

  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }

})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
