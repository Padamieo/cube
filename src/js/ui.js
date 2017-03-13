var ui = {

	pkg: function(){
		try {
		  pkg = require('../package.json');
		  console.log(pkg);
		} catch (e) {
		  // if (e.code !== 'MODULE_NOT_FOUND') {
		  //   throw e;
		  // }
		  // pkg = backupModule;
		  console.log(pkg);
		  pkg = false;
		}

		if(pkg && pkg.development){
		  console.log("dev");
		}

		return pkg;
	},

	addButton: function(where, text, id, pend){
		var insert = ( id ? 'id="'+id+'"' : '' );
		var add = '<button '+insert+' class="pt-touch-button" >'+text+'</button>';
		if(pend){
			$(where).prepend(add);
		}else{
			$(where).append(add);
		}
	},

	addUser: function(data){
		$("#users").append('<li id="'+data.playerId+'" >'+data.name+'</li>');
	},

	addText: function(text, location, classes){
		var c = ( classes ? 'class="'+classes+'"' : '' );
		$( location+" .pt-triggers" ).prepend( '<p '+c+'>'+text+'</p>' );
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
		document.getElementById("exit").addEventListener("click", function (e) {
			const remote = require('electron').remote;
			var window = remote.getCurrentWindow();
			window.close();
		});
	},

	buttonSetup: function(){
		var ref = this;

		document.getElementById("register").onclick = function(){
			console.log("submit name");
			var value = $( "#username" ).val();
			if(value){
				nameUser = value;
			}else{
				nameUser = "Player"+uuid;
			}
			ref.menuchange('main');
		};

		document.getElementById("options").onclick = function(){
			ref.menuchange('options');
		};

		document.getElementById("stop-search").onclick = function(){
			ref.resetSpinner();
			ref.menuchange('main'); // may need to add a
		};

		$(document).on("click", "#stop-hosting", function(){
			socket.emit('dissembly');
			io = null;
			socket = null;
			//console.log("sdad");
			//may need to disable start
			ref.menuchange('main');
		});

		document.getElementById("exit-options").onclick = function(){
			ref.menuchange('main');
		};

		this.exitAppSetup();
	},

	setl: function(term){
		if(localStorage != undefined){
			if(localStorage.getItem(term) === null){
				localStorage.setItem(term, true );
			}
		}else{
			console.log("localstorage does not work");
		}

	},

	getl: function(term){
		if(localStorage != undefined){
			localStorage.getItem(term);
		}
	},

	keypres: function(){
		// https://github.com/wesbos/keycodes/blob/gh-pages/scripts.js
		var body = document.querySelector('body');
		body.onkeydown = function (e) {
			if ( !e.metaKey ) {
				e.preventDefault();
			}
			document.querySelector('.keycode-display').innerHTML = e.keyCode;
			document.querySelector('.text-display').innerHTML =
			keyCodes[e.keyCode] || "huh? Let me know what browser and key this was. <a href=\"https://github.com/wesbos/keycodes/issues/new?title=Missing keycode ${e.keyCode}&body=Tell me what key it was or even better, submit a Pull request!\">Submit to Github</a>";
		};
	},

	handlebars: function(page, data, template){
		var postTemplate = JST['src/templates/example.hbs']; // how do we know which template to use
		var html = postTemplate(data);
		this.swapContent(page, html);
	},

	swapContent: function(page, html){
    $( "#"+page+" .content").replaceWith( '<div class="content">'+html+'</div>' );
	},

	defaultPageData: function(request){

		//get language

		if(request === 'login'){
			var data = {
				titlea: 'cube',
				titleb: 'game',
				input: [{ id: 'username'}],
				buttons: [{
					id: 'register',
					title: 'enter'
				}]
			};
		}

		if(request === 'start'){
			var data = {
				titlea: 'main',
				titleb: 'menu',
				buttons: [{
					id: 'host',
					title: 'host'
				},{
					id: 'join',
					title: 'join'
				},{
					id: 'options',
					title: 'options'
				},{
					id: 'exit',
					title: 'exit'
				}]
			};
		}

		return data;
	},

	defaultPagesSetup: function(){

		var data = this.defaultPageData('login');
		this.handlebars('login', data);

		var data = this.defaultPageData('start');
		this.handlebars('start', data);

	}

};
