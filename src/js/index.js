var app = require('express')();
//var http = require('http').Server(app);

//this works but may need some sort of compiler
var $ = require('jquery');

var pkg = ui.pkg();

// no longer required?
var socket, thisPlayer;
var users = [];

var g = 'a';

var uuid = ui.genUUID();

var nameUser = '';

var ipcRenderer = require('electron').ipcRenderer;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/index.js', function(req, res){
  res.sendFile(__dirname + '/index.js');
});

$( document ).ready(function() {
  startup();
});

function startup(){

  //not sure when best to initialize sound
  sound.init();

  //buld default handlebars pages
  ui.defaultPagesSetup();

  //untill we are loading user settings
  ui.setDefaultKeys();

  //focus for this page
  $( "#username" ).focus();

  $(document).on("click", "#join", function(){
    ui.joining();
  });

  ui.buttonSetup();

  $(document).on("click", ".join-host", function(){
    var details = $( this ).data( "host" );
    console.log("join host");
    ui.common(details);
  });

  $(document).on("click", "#host", function(){
    ui.hosting();
  });

  if(pkg.debug){
    ui.hosting();
  }

};
