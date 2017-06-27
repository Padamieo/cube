//var game = {
function game(){

  this.addLight = function(color, position, name){
    var light = new THREE.PointLight( color, 1.5, 2000 );
    //light.color.setHSL( h, s, l );
    light.position.set( position.x, position.y, position.z );
    light.name = name;
    this.scene.add( light );
  },

  this.addLightAndLensFlare = function( h, s, l, x, y, z ) {
    var light = new THREE.PointLight( 0xffffff, 1.5, 2000 );
    light.color.setHSL( h, s, l );
    light.position.set( x, y, z );
    this.scene.add( light );
    var flareColor = new THREE.Color( 0xffffff );
    flareColor.setHSL( h, s, l + 0.5 );

    var lensFlare = new THREE.LensFlare( this.textureFlare0, this.width, 0.0, THREE.AdditiveBlending, flareColor );
    lensFlare.add( this.textureFlare2, this.width/2, 0.0, THREE.AdditiveBlending );
    lensFlare.add( this.textureFlare2, this.width/2, 0.0, THREE.AdditiveBlending );
    lensFlare.add( this.textureFlare2, this.width/2, 0.0, THREE.AdditiveBlending );
    lensFlare.add( this.textureFlare3, 60, 0.6, THREE.AdditiveBlending );
    lensFlare.add( this.textureFlare3, 70, 0.7, THREE.AdditiveBlending );
    lensFlare.add( this.textureFlare3, 120, 0.9, THREE.AdditiveBlending );
    lensFlare.add( this.textureFlare3, 70, 1.0, THREE.AdditiveBlending );
    lensFlare.customUpdateCallback = this.lensFlareUpdateCallback;
    lensFlare.position.copy( light.position );
    this.scene.add( lensFlare );
  },

  this.lensFlareUpdateCallback = function( object ) {
    var f, fl = object.lensFlares.length;
    //console.log(f);
    var flare;
    var vecX = -object.positionScreen.x * 2;
    var vecY = -object.positionScreen.y * 2;
    for( f = 0; f < fl; f++ ) {
      flare = object.lensFlares[ f ];
      flare.x = object.positionScreen.x + vecX * flare.distance;
      flare.y = object.positionScreen.y + vecY * flare.distance;
      flare.rotation = 0;
    }
    object.lensFlares[ 2 ].y += 0.025;
    object.lensFlares[ 3 ].rotation = object.positionScreen.x * 0.5 + THREE.Math.degToRad( 45 );
  },


  this.loadWorld = function( socket, data ){

    if(pkg.development){
      //maybe wrap in setting for stats / development mode in
      this.stats = new Stats();
      //this.stats.showPanel( 1 );
      this.stats.domElement.style.position	= 'absolute';
      this.stats.domElement.style.bottom	= '0px';
      document.body.appendChild( this.stats.domElement );
    }

    this.objects = [];
    this.players = [];
    this.keyState = {};
    this.shots = 0;

    this.sound = false; // will be defined in the options

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    var canvas = document.getElementById("canvasID");
    this.renderer = new THREE.WebGLRenderer({ canvas:canvas, antialias: true, alpha: true });

    this.renderer.gammaInput = true;
    this.renderer.gammaOutput = true;

    this.renderer.setSize(this.width, this.height);
    var container = document.getElementById('game');
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene;
    this.scene.background = new THREE.Color("#202020");

    // directionalLight = new THREE.DirectionalLight( 0xffffff, 2 );
    // directionalLight.position.set( 2, 1.2, 10 ).normalize();
    // this.scene.add( directionalLight );

    var ambient = new THREE.AmbientLight( 0x756e4e, 0.9 );
    this.scene.add( ambient );

    // var textureLoader = new THREE.TextureLoader();
    // this.textureFlare0 = textureLoader.load( "img/lensflare0.png" );
    // this.textureFlare2 = textureLoader.load( "img/lensflare2.png" );
    // this.textureFlare3 = textureLoader.load( "img/lensflare3.png" );
    // this.addLightAndLensFlare( 0.55, 0.9, 0.5, 100, 0, -100 );

    this.addLight(0xffffdd , {x:50,y:50,z:50}, 'one');
    //this.addLight(0xeeffff , {x:-50,y:-50,z:-50}, 'two');

    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 10000);
    this.camera.position.y = 0;
    this.camera.position.z = 0;
    this.scene.add(this.camera);

		this.TWEEN = require('tween.js'); //may want to bundle

    var WindowResize = require('three-window-resize');
    var windowResize = new WindowResize(this.renderer, this.camera);

    this.createPlayer(data);

    this.registerEvents(socket);

    this.render(socket);

  },

  this.onWindowResize = function(){
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  },

  this.render = function () {
    this.stats.begin();
  	var ref = this;
  	requestAnimationFrame(function(){ref.render()});
    if ( thisPlayer ){
      this.checkKeyStates();
    }

		if ( this.TWEEN ){
			this.TWEEN.update();
		}
    this.stats.end();
    if(this.renderer != null){
      this.renderer.render(this.scene, this.camera);
    }
  },

  this.deconstruct = function(){
    //may need to add promise
    this.deregisterEvents();

    ui.hideGUI();
    ui.menuchange('host');

    thisPlayer = null;

    this.keyState = {};

    this.scene = null;
    this.renderer = null;
    this.camera = null;
  },

  this.deregisterEvents = function(){
    $( window ).unbind();
    $( window ).off();
  },

  this.registerEvents = function(){
    var ref = this;
    console.log( "registerEvents" );

    //window.addEventListener('click', function(e) { ref.fire( e ); }, false );

    $( window ).bind( "click", function() {
      ref.fire( this );
    });

    // document.addEventListener('mousedown', onMouseDown, false);
    // document.addEventListener('mouseup', onMouseUp, false);
    // document.addEventListener('mousemove', onMouseMove, false);
    // document.addEventListener('mouseout', onMouseOut, false);

    $( window ).on( "keydown", function( event ) {
      ref.onKeyDown( event, ref );
    });

    $( window ).on( "keyup", function( event ) {
      ref.onKeyUp( event, ref );
    });
    //document.addEventListener('keydown', function(e) { ref.onKeyDown( e, ref ); }, false );
    //document.addEventListener('keyup', function(e) { ref.onKeyUp( e, ref ); }, false );

    // added for lensFlare size changes
    window.addEventListener( 'resize', this.onWindowResize, false );
  },

  this.onKeyDown = function( event, ref ){
    ref.keyState[event.keyCode || event.which] = true;
  },

  this.onKeyUp = function( event, ref ){
    ref.keyState[event.keyCode || event.which] = false;
  },

  this.fire = function( event ){

    var raycaster = new THREE.Raycaster(); // create once
    var mouse = new THREE.Vector2(); // create once

    // mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    // mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    //currently crosshair is set for center of screen this need to be somewhere visible for user
    mouse.x = 0;
    mouse.y = 0.5;

    raycaster.setFromCamera( mouse, this.camera );

    var intersects = raycaster.intersectObjects( this.objects, true );

    var scene = this.scene;

    if ( intersects.length > 0 ) {

      //var a = this.camera.getWorldDirection();
      var a = intersects[0].point;

      //var b = three.camera.getWorldPosition();
      if(!thisPlayer.playerId){
        return;
      }
      var obj = this.scene.getObjectByName( thisPlayer.playerId );
      var b = obj.getWorldPosition();

			var c = intersects[0].distance;
			// var c = obj.distanceTo( vec2 );

      //var d = Math.random() * 0xffffff;
      var d = 0x1AFF00;

      if(intersects[0].object.playerId){
        var name = intersects[0].object.name;
        e = { type:'player', name: name };
        //e = intersects[0].object.playerId;
      }else{
        var name = intersects[0].object.name;
        e = { type:'cube', name: name };
      }

    }else{
      //var obj = this.scene.getObjectByName(thisPlayer.playerId);
      //var direction = this.camera.getWorldDirection();

      var direction = raycaster.ray.direction;
      var obj = this.scene.getObjectByName(thisPlayer.playerId);
      var b = obj.getWorldPosition();

      var c = 999;
      var d = 0xFF0072;

      var a = new THREE.Vector3();
      a.addVectors ( b, direction.multiplyScalar( c ) );

      var  e = '';

    }

    var shot = {to:a, from:b, distance:c, color:d, hit:e};

    socket.emit('playerShot', shot);

  },

  this.confirmHit = function(data){
    if(data.type == 'player'){
      if(data.name === thisPlayer.playerId){
        console.log("confirm hit");

        this.hit(data.name);
        console.log("report to server");
        socket.emit('playerKill', thisPlayer.playerId);
      }
    }else if (data.type == 'cube'){
      this.hit(data.name);
    }
  },

  this.hit = function(id){
    console.log("hit");
    //console.log(id);
    for (var i = 0; i < this.objects.length; i++) {
      if(this.objects[i].name == id){
        this.objects.splice(i, 1);
      }
    }
    var obj = this.scene.getObjectByName( id );
    console.log( obj );
    var d = {
      x: obj.position.x,
      y: obj.position.y,
      z: obj.position.z
    }
    this.addSmallCubes(d);
    this.remove(id);
  },

  this.remove = function(name) {
    if(this.scene){
      this.scene.remove(this.scene.getObjectByName(name));
    }
  },

	this.addShot = function(data){
    console.log("addShot");
    if(data){

      this.shots++;

      var obj = this.getObject(thisPlayer.playerId);
      var playerpos = obj.getWorldPosition();

			if(this.sound){
			  sound.startSound(data.to, playerpos);
			}

      /*
      var arrow = new THREE.ArrowHelper( data.to, data.from, data.distance, '0xffffff');
      console.log(arrow);
      this.scene.add( arrow );
      */

      //current line and material working version
      var material = new THREE.LineBasicMaterial({
        color: data.color,
        transparent: true,
        opacity: 1
       });

      var geometry = new THREE.Geometry();
      geometry.vertices.push(data.to);
      geometry.vertices.push(data.from);

      line = new THREE.Line(geometry, material);
      line.name = "shot"+this.shots;
      this.scene.add( line );

      //current line and material working version
      var ref = this;
      this.trackOriginalOpacities(line);

      this.fadeMesh(line, "out", {
        duration: 250,
        easing: this.TWEEN.Easing.Back.In,
        callback : function (){

          if(data.hit != ''){
            ref.confirmHit(data.hit);
          }

          ref.fadeMesh(line, "in", {
            duration: 1000,
            easing: ref.TWEEN.Easing.Quintic.InOut,
            callback : function (){
              //console.log(line.name);
              ref.remove(line.name);
            }
          });

        }
      });

    }
	},

  // part of fadeMesh tracks original opacity
  this.trackOriginalOpacities = function(mesh) {
    var opacities = [],
    materials = mesh.material.materials ? mesh.material.materials : [mesh.material];
    for (var i = 0; i < materials.length; i++) {
      materials[i].transparent = true;
      opacities.push(materials[i].opacity);
    }
    mesh.userData.originalOpacities = opacities;
  },

  //fade mes may need refining
  // https://medium.com/@lachlantweedie/animation-in-three-js-using-tween-js-with-examples-c598a19b1263#.97d702fc5
  this.fadeMesh = function(mesh, direction, options) {
    options = options || {};
    // set and check
    var current = { percentage : direction == "in" ? 1 : 0 },
    // this check is used to work with normal and multi materials.
    mats = mesh.material.materials ? mesh.material.materials : [mesh.material],

    originals = mesh.userData.originalOpacities,
    easing = options.easing || this.TWEEN.Easing.Linear.None,
    duration = options.duration || 2000;
    // check to make sure originals exist
    if( !originals ) {
      console.error("Fade error: originalOpacities not defined, use trackOriginalOpacities");
      return;
    }
    // tween opacity back to originals
    var tweenOpacity = new this.TWEEN.Tween(current)
      .to({ percentage: direction == "in" ? 0 : 1 }, duration)
      .easing(easing)
      .onUpdate(function() {
        for (var i = 0; i < mats.length; i++) {
          mats[i].opacity = originals[i] * current.percentage;
        }
      })
      .onComplete(function(){
        if(options.callback){
          options.callback();
        }
      });
    tweenOpacity.start();
    return tweenOpacity;
  },

	this.fovChange = function(f){
		console.log(this.camera.fov);
		var current = this.camera.fov;
		if( f ){
			this.camera.fov = current+1;
		}else{
			this.camera.fov = current-1;
		}
		this.camera.updateProjectionMatrix();
	},

  this.escape = function(){
    console.log("escape");
    // ui.hideGUI();
    // this.keyState = {};
    // this.deregisterEvents();
    // ui.menuchange('options'); //maybe new escape?
    this.deconstruct();
  },

  this.checkKeyStates = function(){

    var change = false;
    var obj = this.getObject(thisPlayer.playerId);

    if( this.keyState[27] ){
      this.escape();
    }

		if( this.keyState[38] ){
			this.fovChange(true);
		}
		if( this.keyState[40] ){
			this.fovChange(false);
		}

    if ( this.keyState[ui.pitchZForward] ) {
      obj.rotateZ (thisPlayer.turnSpeed);
      change = true;
    }

    if ( this.keyState[ui.pitchZBackward] ) {
      obj.rotateZ (-thisPlayer.turnSpeed);
      change = true;
    }

    if ( this.keyState[ui.pitchYLeft] ) {
      obj.rotateY (thisPlayer.turnSpeed);
      change = true;
    }

    if ( this.keyState[ui.pitchYRight] ) {
      obj.rotateY (-thisPlayer.turnSpeed);
      change = true;
    }

    if ( this.keyState[ui.pitchXLeft ] ) {
      obj.rotateX (thisPlayer.turnSpeed);
      change = true
    }

    if ( this.keyState[ui.pitchXRight] ) {
      obj.rotateX (-thisPlayer.turnSpeed);
      change = true
    }

    if( change ){

      var pass = {
        playerId: thisPlayer.playerId,
        x: obj.position.x,
        y: obj.position.y,
        z: obj.position.z,
        r_x: obj.rotation.x,
        r_y: obj.rotation.y,
        r_z: obj.rotation.z
      }

      //global socket may want to change
      if(socket){
        socket.emit('updatePlayer', pass);
      }

    }

  },

  this.updateObject = function(data){
    for(var i = 0; i < this.players.length; i++){
      if(this.players[i].playerId == data.playerId){
        this.players[i].position.x = data.x;
        this.players[i].position.y = data.y;
        this.players[i].position.z = data.z;
        this.players[i].rotation.x = data.r_x;
        this.players[i].rotation.y = data.r_y;
        this.players[i].rotation.z = data.r_z;
      }
    }

  },

  this.getObject = function(playerId){
    for(var i = 0; i < this.players.length; i++){
      if(this.players[i].playerId == playerId){
        return this.players[i];
      }
    }
  },

  this.updateCameraPosition = function(playerId){
    var obj = this.getObject(playerId);
    this.camera.position.x = obj.position.x + 2* Math.sin( obj.rotation.y );
    this.camera.position.y = obj.position.y + 2;
    this.camera.position.z = obj.position.z + 2.5 * Math.cos( obj.rotation.y );
  },

  this.create_cube = function(data, color, opacity, alt){

		var material =  new THREE.MeshLambertMaterial({color: color, transparent:true, opacity:opacity, side: THREE.DoubleSide});

		// var material = new THREE.MeshStandardMaterial({color: "#111111", roughness: 0.1});
		// var envMap = new THREE.TextureLoader().load('img/s.png');
		// envMap.mapping = THREE.SphericalReflectionMapping;
    // //material.envMapIntensity = 1;
		// material.envMap = envMap;

		// var RoundedBoxGeometry = require('three-rounded-box')(THREE); //may want to bring in via uglify
		// var cube = new RoundedBoxGeometry(data.size, data.size, data.size, data.size*0.05, data.size*0.1);

		var cube = new THREE.CubeGeometry(data.size, data.size, data.size);

		var obj = new THREE.Mesh( cube, material );
		return obj;

  },

  this.position_rotation = function(o, data){
    o.rotation.set(
      data.r_x,
      data.r_y,
      data.r_z
    );
    o.position.x = data.x;
    o.position.y = data.y;
    o.position.z = data.z;
    return o;
  },

  this.createPlayer = function(data){

    //initial setup of local data store
    thisPlayer = data;

    var obj = this.create_cube(data, 0x7777ff, 0.8);

    obj.playerId = data.playerId; //may want to drop playerId in future
    obj.name = data.playerId;

    obj.rotation.set(0,0,0);
    obj.position.x = 0;
    obj.position.y = 0;
    obj.position.z = 0;

    this.players.push( obj );
    this.scene.add( obj );

    // var arrowHelper = this.arrow();
    // obj.add( arrowHelper );

    this.camera.position.set( 3, 1, 0 );

    //console.log(obj.position);
    var temp = new THREE.Vector3( -1, 0, 0 );
    this.camera.lookAt( temp );

    obj = this.position_rotation(obj, data);

    obj.add( this.camera );

  },

  this.arrow = function(){
    var from = new THREE.Vector3( 0, 0.5, 0.1 );
    var to = new THREE.Vector3( -1, 0.7, 0.1 );
    var direction = to.clone().sub(from);
    var length = direction.length();
    var arrowHelper = new THREE.ArrowHelper(direction.normalize(), from, length, 0xff0000 );
    //this.scene.add( arrowHelper );
    return arrowHelper;
  },

  this.addOtherPlayer = function(data){
    var index = ui.contains(this.players, data.playerId, 'playerId');
    if(index == -1){
      if(uuid != data.playerId){
        this.addPlayer(data);
      }
    }
  },

  this.addPlayer = function(data){
    var color = ( data.color ? data.color : 0xff7777 );
    var obj = this.create_cube(data, color, 0.9);
    obj.playerId = data.playerId; //may want to drop playerId in future
    obj.name = data.playerId;
    obj = this.position_rotation(obj, data);
    this.players.push( obj );
    this.objects.push( obj );
    this.scene.add( obj );
  },

	this.addCube = function(data){
    var color = ( data.color ? data.color : 0xfff777 );
		var obj = this.create_cube(data, color, 0.9);
		obj.name = data.name;
    obj = this.position_rotation(obj, data);
		this.objects.push( obj );
		this.scene.add( obj );
	},

  this.addSmallCubes = function (data){
    var size = 1;
    var half_size = size/2;
    var quart_size = half_size/2;
    var positions = [
      {x: -quart_size, y: -quart_size, z: -quart_size },
      {x: quart_size, y: quart_size, z: quart_size },
      {x: -quart_size, y: -quart_size, z: quart_size },
      {x: quart_size, y: -quart_size, z: -quart_size },
      {x: -quart_size, y: quart_size, z: quart_size },
      {x: quart_size, y: quart_size, z: -quart_size },
      {x: quart_size, y: -quart_size, z: -quart_size },
      {x: quart_size, y: -quart_size, z: quart_size },

    ];
    for (i = 0; i < 7; i++) {
      var special = {
        name: 'test',
        r_x: 0,
        r_y: 0,
        r_z: 0,
        x: data.x+positions[i].x,
        y: data.y+positions[i].y,
        z: data.z+positions[i].z,
        size: half_size,
        color: 0xff77ff
      };
      g.addCube(special, '');
    }

  },

  //not sure this works, may only remove from players array
  this.removeOtherPlayer = function(socket_id){

    //remove the players
    for(var i = 0; i < this.players.length; i++){
      if(this.players[i].playerId == socket_id){
        this.scene.remove( this.players[i] );
      }
    }

    //remove listing in players array incase
    var index = this.players.findIndex(function(obj){
      return obj.playerId === socket_id;
    })
    this.players.splice(index, 1);

  }

};
