var ui = {

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
	}

};
