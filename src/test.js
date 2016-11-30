var os = require('os');

var test = {

  getAddress: function(idx) {
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

  temp: function(){
    var dis = 3;
    var tempObject = [
      ["rgb(255, 0, 0)", dis, dis],
      ["rgb(0, 0, 255)", -dis, -dis],
      ["rgb(255, 255, 0)", -dis, dis],
      ["rgb(0, 255, 0)", dis, -dis]
    ];

    var temp = {
      size: 1
    };

    for (var i = 0; i < tempObject.length; i++) {
      var color = new THREE.Color( tempObject[i][0] );
      var obj1 = this.create_cube(temp, color, 0.8);
      obj1.rotation.set(0,0,0);
      obj1.position.x = tempObject[i][1];
      obj1.position.y = 0;
      obj1.position.z = tempObject[i][2];
      three.scene.add( obj1 );
      tempObjects.push( obj1 );
    }
  },

  loadWorld: function(socket){

    // add all the generated cubes, or do they come in later
    //temp version
    this.temp();

    // sky = new THREE.Sky();
		// three.scene.add( sky.mesh );

    //add an ambient light
    var ambient = new THREE.AmbientLight( 0x333333 );
    three.scene.add( ambient );

    //add a directional light
    directionalLight = new THREE.DirectionalLight( 0xffffff, 2 );
    directionalLight.position.set( 2, 1.2, 10 ).normalize();
    three.scene.add( directionalLight );

    this.registerEvents();

    var v = this;

    three.on('update', function () {
      if ( thisPlayer ){

        v.checkKeyStates(socket);

        //three.camera.lookAt( player.position );

        //v.updateCameraPosition( player.playerId );

      }
    });

    three.init();

  },

  registerEvents: function(){
    // document.addEventListener('click', onMouseClick, false );
    // document.addEventListener('mousedown', onMouseDown, false);
    // document.addEventListener('mouseup', onMouseUp, false);
    // document.addEventListener('mousemove', onMouseMove, false);
    // document.addEventListener('mouseout', onMouseOut, false);
    document.addEventListener('keydown', this.onKeyDown, false );
    document.addEventListener('keyup', this.onKeyUp, false );
    //window.addEventListener( 'resize', onWindowResize, false );
  },

  onKeyDown: function( event ){
    //event = event || window.event;
    keyState[event.keyCode || event.which] = true;
  },

  onKeyUp: function( event ){
    //event = event || window.event;
    keyState[event.keyCode || event.which] = false;
  },

  checkKeyStates: function(socket){

    var change = false;
    var obj = this.getObject(thisPlayer.playerId);

    if (keyState[38] || keyState[87]) {
      //obj.rotation.x += thisPlayer.turnSpeed;
      obj.rotateZ (thisPlayer.turnSpeed);
      change = true;
    }

    if (keyState[40] || keyState[83]) {
      //obj.rotation.x -= thisPlayer.turnSpeed;
      obj.rotateZ (-thisPlayer.turnSpeed);
      change = true;
    }

    if (keyState[37] || keyState[65]) {
      //obj.rotation.y += thisPlayer.turnSpeed;
      obj.rotateY (thisPlayer.turnSpeed);
      change = true;
    }

    if (keyState[39] || keyState[68]) {
      obj.rotateY (-thisPlayer.turnSpeed);
      change = true;
    }

    if (keyState[81]) {
      obj.rotateX (thisPlayer.turnSpeed);
      change = true
    }

    if (keyState[69]) {
      obj.rotateX (-thisPlayer.turnSpeed);
      change = true
    }

    if( change ){

      //console.log("PASS: "+thisPlayer.playerId+" = "+socket.id);

      var pass = {
        playerId: thisPlayer.playerId,
        x: obj.position.x,
        y: obj.position.y,
        z: obj.position.z,
        r_x: obj.rotation.x,
        r_y: obj.rotation.y,
        r_z: obj.rotation.z
      }

      if(socket){
        socket.emit('updatePlayer', pass);
      }

    }

  },

  updateObject: function(data){

    for(var i = 0; i < objects.length; i++){
      if(objects[i].playerId == data.playerId){
        objects[i].position.x = data.x;
        objects[i].position.y = data.y;
        objects[i].position.z = data.z;
        objects[i].rotation.x = data.r_x;
        objects[i].rotation.y = data.r_y;
        objects[i].rotation.z = data.r_z;
      }
    }

  },

  getObject: function(playerId){
    for(var i = 0; i < objects.length; i++){
      if(objects[i].playerId == playerId){
        return objects[i];
      }
    }
  },

  updateCameraPosition: function(playerId){
    var obj = this.getObject(playerId);
    three.camera.position.x = obj.position.x + 2* Math.sin( obj.rotation.y );
    three.camera.position.y = obj.position.y + 2;
    three.camera.position.z = obj.position.z + 2.5 * Math.cos( obj.rotation.y );
  },

  create_cube: function(data, color, opacity){
    var obj = new THREE.Mesh(
      new THREE.CubeGeometry(data.size, data.size, data.size),
      new THREE.MeshLambertMaterial({color: color, transparent:true, opacity:opacity, side: THREE.DoubleSide})
    );
    return obj;
  },

  createPlayer: function(data){

    //initial setup of local data store
    thisPlayer = data;

    // no idea why this does not work
    var obj = this.create_cube(data, 0x7777ff, 0.8);

    obj.playerId = data.playerId;

    obj.rotation.set(0,0,0);
    obj.position.x = 0;
    obj.position.y = data.y;
    obj.position.z = 0;

    objects.push( obj );
    three.scene.add( obj );

    //camera look at the player
    //this.updateCameraPosition( data.playerId );
    //three.camera.lookAt( obj.position );

    three.camera.position.set( 3, 1, 0 );
    three.camera.lookAt( obj.position );

    obj.position.x = data.x;
    obj.position.y = data.y;
    obj.position.z = data.z;

    obj.add( three.camera );

    // camera = new THREE.PerspectiveCamera( 45, width / height, 1, 1000 );
    // three.scene.add( camera );

  },

  addOtherPlayer: function(data){

    var obj = this.create_cube(data, 0xff7777, 0.9);

    obj.playerId = data.playerId;

    obj.rotation.set(0,0,0);
    obj.position.x = data.x;
    obj.position.y = data.y;
    obj.position.z = data.z;

    otherPlayersId.push( data.playerId );
    otherPlayers.push( obj );
    objects.push( obj );
    three.scene.add( obj );

  },

  removeOtherPlayer: function(socket_id){

    //remove the objects
    for(var i = 0; i < objects.length; i++){
      if(objects[i].playerId == socket_id){
        three.scene.remove( objects[i] );
      }
    }

    //remove listing in objects array incase
    var index = objects.findIndex(function(obj){
      return obj.playerId === socket_id;
    })
    objects.splice(index, 1);

  },

  genUUID() {
    return '_' + Math.random().toString(36).substr(2, 9);
  },

  contains: function( objects, id ) {
    var index = objects.findIndex(function(obj){
      return obj.playerId === id;
    });
    return index;
  }

};

module.exports = test;
