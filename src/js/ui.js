var ui = {

	addUser: function(data){
		$("#users").append('<li id="'+data.playerId+'" >'+data.name+'</li>');
	}

};
