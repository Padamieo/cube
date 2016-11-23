var os = require('os');
var socket;
var test = {

  someFunction: function(){
    console.log("test somefunction");
  },

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

  loadWorld: function(socket){
  console.log(socket);
    // var random_cube = this.create_cube();
    // three.scene.add( random_cube );

    //add an ambient light
    var ambient = new THREE.AmbientLight( 0x050505 );
    three.scene.add( ambient );

    //add a directional light
    directionalLight = new THREE.DirectionalLight( 0xffffff, 2 );
    directionalLight.position.set( 2, 1.2, 10 ).normalize();
    three.scene.add( directionalLight );

    this.registerEvents();

    three.camera.position.set(1, 1, 0.5);

    var v = this;

    three.on('update', function () {
      if ( player ){

        v.checkKeyStates(player, socket);

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

  checkKeyStates: function( playerD , socket){

    var change = false;
    var obj = this.getObject(playerD.playerId);

    if (keyState[38] || keyState[87]) {
      obj.rotation.x += playerD.turnSpeed;
      change = true;
    }

    if (keyState[40] || keyState[83]) {
      obj.rotation.x -= playerD.turnSpeed;
      change = true;
    }

    if (keyState[37] || keyState[65]) {
      obj.rotation.y += playerD.turnSpeed;
      change = true;
    }

    if (keyState[39] || keyState[68]) {
      obj.rotation.y -= playerD.turnSpeed;
      change = true;
    }

    if (keyState[81]) {
      console.log("test");
      obj.position.x -= playerD.moveSpeed + obj.position.x; //* Math.cos(playerD.r_y);
      // obj.position.z += playerD.moveSpeed * Math.sin(player.rotation.y);
    }

    if (keyState[69]) {

    }

    if( change == true ){
      var pass = {
        playerId: playerD.playerId,
        x: obj.position.x,
        y: obj.position.y,
        z: obj.position.z,
        r_x: obj.rotation.x,
        r_y: obj.rotation.y,
        r_z: obj.rotation.z
      }

      if(socket){
        this.updatePlayerData(pass);
        socket.emit('updatePosition', pass);
      }
    }

  },

  updatePlayerData: function(pass){

    for(var i = 0; i < players.length; i++){
      if(players[i].playerId == pass.playerId){
        players[i].x = pass.x; //1;
        players[i].y = pass.y; //1;
        players[i].z = pass.z; //1;
        players[i].r_x = pass.r_x; //obj.rotation.x;
        players[i].r_y = pass.r_y; //obj.rotation.y;
        players[i].r_z = pass.r_z; //obj.rotation.z;
        //console.log(players[i]);
      }
    }

  },

  updateObject: function(data){

    //var obj = this.getObject(data.playerId);
    for(var i = 0; i < objects.length; i++){
      if(objects[i].rel == data.playerId){
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
      if(objects[i].rel == playerId){
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

  create_cube: function(data){

    if(data != undefined){
      var sizeX = data.sizeX;
      var sizeY = data.sizeY;
      var sizeZ = data.sizez;
    }else{
      var sizeX = 1;
      var sizeY = 1;
      var sizeZ = 1;
    }

    //this needs to be array to hold all cube_geometry or we end up with one cube with material
    cube_geometry = new THREE.BoxGeometry(sizeX, sizeY, sizeZ);
    cube_material = new THREE.MeshLambertMaterial({color: 0x7f1d1d});
    var temp = new THREE.Mesh(cube_geometry, cube_material);

    return temp;
  },

  createPlayer: function(data){

    // no idea why this does not work
    // player = create_cube(data);

    //think i need to change player to avatar or something
    var obj = new THREE.Mesh(
      new THREE.CubeGeometry(data.sizeX, data.sizeX, data.sizeX),
      new THREE.MeshLambertMaterial({color: 0x7777ff, transparent:true, opacity:0.8, side: THREE.DoubleSide})
    );

    obj.rel = data.playerId;

    obj.rotation.set(0,0,0);
    obj.position.x = data.x;
    obj.position.y = data.y;
    obj.position.z = data.z;

    objects.push( obj );
    three.scene.add( obj );

    //camera look at the player
    this.updateCameraPosition( data.playerId );
    three.camera.lookAt( obj.position );

  },

  addOtherPlayer: function(data){

    players.push( data );

    cube_geometry3 = new THREE.BoxGeometry(data.sizeX, data.sizeX, data.sizeX);
    cube_material3 = new THREE.MeshLambertMaterial({color: 0x777777});
    otherPlayer = new THREE.Mesh(cube_geometry3, cube_material3);

    otherPlayer.rel = data.playerId;

    otherPlayer.rotation.set(0,0,0);
    otherPlayer.position.x = data.x;
    otherPlayer.position.y = data.y;
    otherPlayer.position.z = data.z;

    objects.push( otherPlayer );
    three.scene.add( otherPlayer );

    //return otherPlayer;

  },

  removeOtherPlayer: function(data){
    var obj = this.getObject(data.playerId);
    //var selectedObject = scene.getObjectByName(obj.name);
    three.scene.remove( obj );
  }

};

module.exports = test;
