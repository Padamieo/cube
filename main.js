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
var users = [];
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

			socket.on('newUser', function(id, name){
        if(host.contains( users, id ) == -1){
  				var user = host.addUser(users, id, name);
  				socket.emit( 'createUser', user );
  				socket.broadcast.emit( 'addUser', user );
        }
			})

			socket.on('requestUsers', function(id){
				for (var i = 0; i < users.length; i++){
					if (users[i].playerId != id){
						socket.emit('addUser', users[i]);
					}
				}
			});

			socket.on('start', function(){
        //confirm request is from host
				players = host.createPlayers(users);

				players = host.boop(players);

        for (var i = 0; i < players.length; i++){
          if(players[i].host === true){
            socket.emit( 'startMatch', players[i] );
          }else{
            socket.broadcast.emit( 'startMatch', players[i] );
          }
        };
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

  ipcMain.on('advertise', function(event, service) {
    //console.log('advertise');

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

    var pass = [];

    function partB() {
      if(pass){
        if(pass.length == 0){
          console.log("none found yet");
          //setTimeout(partB, 3000);
					event.sender.send('unfound');
        }else if(pass.length == 1){
          event.sender.send('found', pass[0].details);
        }else{
          console.log("more than one found");
        }
      }else{
        console.log("could not find a game ): ");
      }
    }

    var d = Discover();

    var success = d.join("service-details", function (data) {
      if (data.details) {
         console.log("B"+data);
        pass.push( data );
      }
    });

    if(success){
      setTimeout(partB, 3000); //this time should change depending on find type
    }else{
      console.log("could not find a game ): ");
    }

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
