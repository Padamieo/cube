var ui = {

	//this is not game element
	getAddress: function(idx) {
		var os = require('os');

		var addresses = [],
		interfaces = os.networkInterfaces(),
		name, ifaces, iface;

		for (name in interfaces) {
			if(interfaces.hasOwnProperty(name)){
				ifaces = interfaces[name];
				if(!/(loopback|vmware|internal)/gi.test(name)){
					for (var i = 0; i < ifaces.length; i++) {
						iface = ifaces[i];
						if (iface.family === 'IPv4' &&  !iface.internal && iface.address !== '127.0.0.1') {
							addresses.push(iface.address);
						}
					}
				}
			}
		}
		// if an index is passed only return it.
		if(addresses.length = 1){
			return addresses.pop();
		}
		return addresses;
	},

	pkg: function(){
		try {
		  pkg = require('../package.json');
		  //console.log(pkg);
		} catch (e) {
		  // if (e.code !== 'MODULE_NOT_FOUND') {
		  //   throw e;
		  // }
		  // pkg = backupModule;
		  //console.log(pkg);
		  pkg = false;
		}

		if(pkg && pkg.development){
		  //console.log("dev");
		}

		return pkg;
	},

	addUser: function(data){
		$("#users").append('<li class="'+(data.host ? 'host' : '' )+'" id="'+data.playerId+'" >'+data.name+'</li>');
	},

	/*
	addText: function(text, location, classes){
		var c = ( classes ? 'class="'+classes+'"' : '' );
		$( location+" .pt-triggers" ).prepend( '<p '+c+'>'+text+'</p>' );
	},
	*/

	joining: function(){
		console.log("joining");

    var data = ui.defaultPageData("search");
    ui.handlebars("search", data);

    ipcRenderer.send('find', 'local');
		ui.menuchange('join');

    ipcRenderer.on('found', function(event, services){
      //ui.fadeSpinner();
      console.log(services);
      var data = ui.defaultPageData("search");
      var hosts = [];

      $.each(services, function( index, value ) {
        var gameName = value.details.host_name+" Game";
        var v = ui.contains(hosts, gameName, 'title' );
        if(v < 0){
          var details = value.details;
          var host_details = {name: "host", value: JSON.stringify(details)};
          hosts.push({id: index, class: "join-host", title: gameName, data: host_details})
        }
      });

      $.each(hosts, function( index, value ) {
        data.buttons.unshift(hosts[index]);
      });

      data.spinner = false;
			ui.handlebars("search", data);
    });

		ipcRenderer.on('unfound', function(event, service){
			console.log("unfound");
      var data = ui.defaultPageData("search");
      data.spinner = false;
      //TODO: add message that nothing was found local or online?
      ui.handlebars("search", data);
		});
	},

	hosting: function(){
		console.log("host");

		var ip_address = ui.getAddress();

		ipcRenderer.send('setup', ip_address);
		console.log("setup");

		ipcRenderer.on('hosting', function(event, service){
			console.log("hosting");
			//console.log(service);
			ui.host = true;
			service.host_name = nameUser;
			ipcRenderer.send('advertise', service);
			//console.log(service);
			ui.common(service);

		});

	},

	common: function(service){
	  console.log("common started");

	  io = require('socket.io-client'),
	  socket = io.connect('http://'+service.ip+':'+service.port);

	  socket.on('connect', function(){
			socket.emit('newUser', uuid, nameUser);
	  });

		socket.on('createUser', function(data){
			console.log("createUser");
	    ui.user = data;
	    console.log(data);
	    users.push(data);
	    ui.buildLobby(data);
	    socket.emit('requestUsers', uuid);
			if(pkg.debug){
				ui.startMatch();
			}else{
				ui.menuchange('host');
			}
		});

		socket.on('addUser', function(data){
			console.log("addUser");
	    //something is making this work weird
			// var index = g.contains(users, data.playerId, 'playerId');
			// if(index === -1){
			// 	if(uuid != data.playerId){
				users.push(data);
				ui.addUser(data);
			// 	}
			// }

		});

	  socket.on('removeUser', function(id){
	    console.log("removeUser");
	    var users = [];
	    var data = ui.user;
	    ui.buildLobby(data);
	    socket.emit('requestUsers', uuid);
	  });

	  socket.on('host-closed', function(data){
	    console.log("host closed");
	  });

	  //game mode
	  socket.on('startMatch', function(data, setup){
	    if(!thisPlayer){
	      if(data.playerId == uuid){

	        ui.updateScore(setup);
	        ui.showGUI(); // needs data to display
	        g = new game;
	        g.loadWorld(socket, data);

	        socket.emit('requestPlayers', uuid);
					socket.emit('requestCubes');

	        ui.menuchange('game');
	      }
	    }
	  });

	  socket.on('addPlayer', function(data){
	    g.addOtherPlayer(data);
	  });

		socket.on('addCubes', function(data){
			for (var i = 0; i < data.length; i++){
				g.addCube(data[i]);
			}
	    // var d = { x:0, y:0, z:0 };
	    // g.addSmallCubes( d ); // testing
		});

	  socket.on('updatePlayers', function(data){
	    //may need to check uuid and data.playerId dont match or data is not incorrect between
	    g.updateObject(data);
	  });

		socket.on('updateShots', function(data){
	    //console.log(data);
			g.addShot(data);
		});

		socket.on('reportKill', function(data){
	    console.log("reportKill");
	    console.log(data);
	    ui.updateScore(data);
	    g.hit(data.kill);

		});

	  // socket.on('removePlayer', function(data){
	  //   g.removeOtherPlayer(data);
	  // });

	  socket.on('endgame', function(data){
	    console.log("endgame");
	    console.log(data);
	    //show winner message
	    var promise = ui.fullText("Winner: "+data);
	    promise.then(function(){
	      //transition back to host
	      g.deconstruct();
	    });

	  });

	},

	fullText: function(text, time){

		var promise = new Promise(function( resolve ) {
			ui.elements = ( ui.elements != undefined ? ui.elements+1 : 0 );
			var id = 'ue'+ui.elements;
			$( "body" ).prepend( '<p id="'+id+'" class="full-text">'+text+'</p>' );
			var t = ( time ? time : 3000 );
			setTimeout(function(){
				resolve(id);
			}, t);
		});

		promise.then(function(result) {
			$( "#"+result ).remove();
		});

		return promise;
	},

	fadeSpinner: function(item){
		//this.addText('unable to find any avaliable host', '#search');
		$( '.spinner' ).fadeOut( "fast");
	},

	resetSpinner: function(){
		$( '.spinner' ).fadeIn( "fast");
	},

	menuchange: function(pagename){

		switch (pagename) {
			case 'main':
				page = 1;
				break;
			case 'host':
				page = 2;
				break;
			case 'options':
				page = 5;
				break;
			case 'join':
				page = 3;
				break;
			case 'game':
				page = 4;
				break;
			case 'start':
				page = 0;
				break;
		}

		var options = { animation: 6, showPage: page };
		PageTransitions.nextPage( options );
	},

	exitAppSetup: function(){
		$(document).on("click", "#exit", function(){
			var remote = require('electron').remote;
			var window = remote.getCurrentWindow();
			window.close();
		});
	},

	buttonSetup: function(){
		var ref = this;

		$(document).on("click", "#register", function(){

			console.log("submit name");
			var value = $( "#username" ).val();
			if(value){
				nameUser = value;
				// var d = { name: nameUser };
				// var b = JSON.stringify(d);
				// ref.updateL('users', b );
			}else{
				nameUser = "Player"+uuid;
			}

			ref.menuchange('main');
		});

		$(document).on("click", "#settings", function(){
			ref.menuchange('options');
		});

		$(document).on("click", "#stop-search", function(){
			ref.resetSpinner();
			ref.menuchange('main'); // may need to add a
		});


		$(document).on("click", "#stop-hosting", function(){
			console.log("stop-hosting");

			users = [];
			socket.emit('leave', uuid);
			socket.emit('dissembly');
			socket.disconnect();
			io = null;
			socket = null;
			//console.log("sdad");
			//may need to disable start
			ipcRenderer.send('unadvertise', '');

			ref.menuchange('main');
		});

		$(document).on("click", "#exit-hosting", function(){
			console.log("exit-hosting");
			users = [];
			socket.emit('leave', uuid);
			socket.disconnect();
			io = null;
			socket = null;
			ref.menuchange('main');
		});

		$(document).on("click", "#exit-options", function(){
			ref.menuchange('main');
		});

		$(document).on("click", "#startMatch", function(){
			ui.startMatch();
		});

		this.exitAppSetup();
	},

	startMatch: function (){
		console.log("startMatch");
		//$( "#lobby" ).hide();updatePlayers
		socket.emit('start');
	},

	setl: function(term, data){
		if(localStorage != undefined){
			if(localStorage.getItem(term) === null){
				localStorage.setItem(term, data );
			}
		}else{
			console.log("localstorage does not work");
		}
	},

	updateL: function(term, data){
		if(localStorage != undefined){
			localStorage.setItem(term, data );
		}
	},

	getl: function(term){
		if(localStorage != undefined){
			return localStorage.getItem(term);
		}
	},

	deletel: function(term){
		if(localStorage != undefined){
			localStorage.removeItem(term);
		}
	},

	setDefaultKeys: function(){
		this.pitchZForward = 87;
		this.pitchZBackward = 83;
		this.pitchYLeft = 65;
		this.pitchYRight = 68;
		this.pitchXLeft = 81;
		this.pitchXRight = 69;
	},

	keypres: function(){
		// https://github.com/wesbos/keycodes/blob/gh-pages/scripts.js

		var set = new Promise(function(resolve, reject) {
			//need to find way to identify gamepad and other devices input
			// $(window).keydown(function(e) {
			// 	console.log(e);
			// });

			$(document).on("keydown", function(e){
				if ( !e.metaKey ) {
					e.preventDefault();
				}
				resolve(e.keyCode);
			})
		});

		set.then(function(reply){
			$(document).off("keydown");
			console.log(reply);
		});

		return set;
	},

	test: function(){
		// nav = navigator.getGamepads();
		// console.log(nav);
		//
		// var event = new CustomEvent('build', { 'detail': ui.pitchXRight });
		// window.addEventListener('build', function (e) {
		// 	console.log("build event");
		// 	console.log(e);
		// }, false);


		// $(document).on("contextmenu", function(e){
		// 	console.log(e);
		// });


		// $(document).on("keypress", function(e){
		// 	console.log(e);
		// });

	},

	setKey: function(setting){
		var ref = this;
		var b = this.keypres();
		b.then(function(newKey){
			ref[setting] = newKey;
			console.log(ui[setting]);
		});
	},

	handlebars: function(page, data, template){
		var set_template = (template ? template : 'default' );
		var postTemplate = JST['src/templates/'+set_template+'.hbs']; // how do we know which template to use
		var html = postTemplate(data);
		this.swapContent(page, html);
	},

	swapContent: function(page, html){
    $( "#"+page+" .content").replaceWith( '<div class="content">'+html+'</div>' );
	},

	defaultPageData: function(request){

		//get language
		var lang = ui.getLanguage();

		if(request === 'login'){
			var data = {
				titlea: lang.titles.game.a,
				titleb: lang.titles.game.b,
				input: [{ id: 'username'}],
				buttons: [{
					id: 'register',
					title: lang.enter
				}]
			};
		}

		if(request === 'start'){
			var data = {
				titlea: lang.titles.start.a,
				titleb: lang.titles.start.b,
				buttons: [{
					id: 'host',
					title: lang.host
				},{
					id: 'join',
					title: lang.join
				},{
					id: 'settings',
					title: lang.options
				},{
					id: 'exit',
					title: lang.exit
				}]
			};
		}

		if(request === 'options'){
			var data = {
				titlea: lang.titles.options.a,
				titleb: lang.titles.options.b,
				buttons: [{
					id: 'exit-options',
					title: lang.return
				}]
			};
		}

		if(request.includes("lobby")){
			var data = {
				titlea: lang.titles.host.a,
				titleb: lang.titles.host.b,
				users: true
			};
			if(request.includes("host")){
				data.buttons = [{
					id: 'startMatch',
					title: lang.start
				},{
					id: 'stop-hosting',
					title: lang.stop
				}];
			}else{
				data.buttons = [{
					id: 'exit-hosting',
					title: lang.exit
				}];
			}
		};

		if(request === 'search'){
			var data = {
				titlea: lang.titles.join.a,
				titleb: lang.titles.join.b,
				buttons: [{
					id: 'stop-search',
					title: lang.stop
				}],
				spinner: true
			};
		};

		return data;
	},

	getLanguage: function(){
		var defaultLanguage = 'en-us';

		//get user set language
		//var language = defaultLanguage;
		//ensure its in lowercase and is xx-xx format

		var languageData;
		try {
			//TODO:may need to find way to make this work with .asar compression
			languageData = require(__dirname+'/languages/'+language+'.json');
		} catch (e) {
			languageData = require(__dirname+'/languages/'+defaultLanguage+'.json');
		};
		return languageData;
	},

	defaultPagesSetup: function(){

		var pages = ["login", "start", "options", "join"];

		for (var i = 0; i < pages.length; i++) {
			var data = this.defaultPageData(pages[i]);
			if(pages[i] === "options"){
				this.handlebars(pages[i], data, "options");
			}else{
				this.handlebars(pages[i], data);
			}

		}

	},

	//this probably should be a promise
	showGUI: function(){
		$( ".ui-score" ).fadeIn( "slow", function() {

	  });
		$( "#crosshair" ).fadeIn( "slow", function() {

	  });
	},

	hideGUI: function(){
		$( ".ui-score" ).fadeOut( "slow", function() {

		});
		$( "#crosshair" ).fadeOut( "slow", function() {

		});
	},

	updateScore: function(setup){
		var alive = setup.total-setup.alive;
		var total = setup.total;
		var text = alive+"/"+total;
		$( ".ui-score" ).text( text );
	},

	buildLobby: function(data){
    var userType = ( data.host && ui.host ? 'lobby-host' : 'lobby' );
    var page = ui.defaultPageData(userType);
    ui.handlebars('lobby', page);
    ui.addUser(data);
  },

	genUUID: function() {
		return '_' + Math.random().toString(36).substr(2, 9);
	},

	contains: function( array, id, term ) {
		var index = array.findIndex(function(a){
			return a[term] === id;
		});
		return index;
	}

};
