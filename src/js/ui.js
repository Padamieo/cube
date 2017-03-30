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

	addText: function(text, location, classes){
		var c = ( classes ? 'class="'+classes+'"' : '' );
		$( location+" .pt-triggers" ).prepend( '<p '+c+'>'+text+'</p>' );
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

	// test: function(){
	// 	var p = this.fullText("something something");
	// 	p.then(function(){
	// 		console.log("additional");
	// 	});
	// },

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
			const remote = require('electron').remote;
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
			console.log("startMatch");
			//$( "#lobby" ).hide();updatePlayers
			socket.emit('start');
		});

		this.exitAppSetup();
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
		//var body = document.querySelector('body');

		var set = new Promise(function(resolve, reject) {
			/*
			window.onkeydown = function (e) {
				if ( !e.metaKey ) {
					e.preventDefault();
				}
				//document.querySelector('.keycode-display').innerHTML = e.keyCode;
				//document.querySelector('.text-display').innerHTML =
				var b = e.keyCode;
				//var b = keyCodes[e.keyCode] || "huh? Let me know what browser and key this was. <a href=\"https://github.com/wesbos/keycodes/issues/new?title=Missing keycode ${e.keyCode}&body=Tell me what key it was or even better, submit a Pull request!\">Submit to Github</a>";
				console.log(b);
				resolve(b);
			};
			*/

			$(document).on("keydown", function(e){
				if ( !e.metaKey ) {
					e.preventDefault();
				}
				//console.log(e.keyCode);
				resolve(e.keyCode);
			})

			// if (/* everything turned out fine */) {
			// 	resolve("Stuff worked!");
			// } else {
			// 	reject(Error("It broke"));
			// }

		});

		set.then(function(reply){
			$(document).off("keydown");
			console.log("keydown");
			console.log(reply);
		});

		return set;
	},

	test: function(setting){
		//setKeys
		var ref = this;
		var b = this.keypres();
		b.then(function(r){
			ref[setting] = r;
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
		var defaultLanguage = 'en-Us';

		//get user set language
		//var language = defaultLanguage;

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
