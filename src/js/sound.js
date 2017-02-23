var sound = {

	init: function(){

		this.context = '';
		this.soundSource = '';
		this.soundBuffer = '';
		this.url = 'http://localhost/sound/test.wav';

		if (typeof AudioContext !== "undefined") {
			this.context = new AudioContext();
		} else if (typeof webkitAudioContext !== "undefined") {
			//context = new webkitAudioContext();
		} else {
			throw new Error('AudioContext not supported. :(');
		}

	},

	startSound: function(sound, user) {
		var ref = this;
		// Note: this loads asynchronously
		var request = new XMLHttpRequest();
		request.open("GET", this.url, true);
		request.responseType = "arraybuffer";

		// Our asynchronous callback
		request.onload = function() {
			var audioData = request.response;
			ref.audioGraph(audioData, sound, user);
		};
		request.send();
	},

	audioGraph: function(audioData, sound, user) {
		var panner;
		var ref = this;

		// Same setup as before
		this.soundSource = this.context.createBufferSource();
		var soundBuffer = ref.soundBuffer;
		ref.context.decodeAudioData(audioData, function(soundBuffer){
			ref.soundSource.buffer = soundBuffer;
			panner = ref.context.createPanner();
			panner.setPosition(sound.x, sound.y, sound.z);
			ref.soundSource.connect(panner);
			panner.connect(ref.context.destination);

			// Each context has a single 'Listener'
			ref.context.listener.setPosition(user.x, user.y, user.z);

			// Finally
			ref.playSound(ref.soundSource);
		});
	},

	playSound: function() {
		// play the source now
		this.soundSource.start(this.context.currentTime);
	}

};
