var os = require('os');

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

  loadWorld: function(){

    var random_cube = this.create_cube();
    three.scene.add( random_cube );

    //add an ambient light
    var ambient = new THREE.AmbientLight( 0x050505 );
    three.scene.add( ambient );

    //add a directional light
    directionalLight = new THREE.DirectionalLight( 0xffffff, 2 );
    directionalLight.position.set( 2, 1.2, 10 ).normalize();
    three.scene.add( directionalLight );

    three.camera.position.set(1, 1, 0.5);
    var v = this;
    three.on('update', function () {
      if ( player ){
        //console.log(this);
        //v.updateCameraPosition();
        //checkKeyStates();
        //three.camera.lookAt( player.position );
      }
    });

    three.init();

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
    this.updateCameraPosition(data.playerId);
    three.camera.lookAt( obj.position );

  },

  addOtherPlayer: function(data){

    cube_geometry3 = new THREE.BoxGeometry(data.sizeX, data.sizeX, data.sizeX);
    cube_material3 = new THREE.MeshLambertMaterial({color: 0x7777ff});
    otherPlayer = new THREE.Mesh(cube_geometry3, cube_material3);

    otherPlayer.rel = data.playerId;
    otherPlayer.rotation.set(0,0,0);
    otherPlayer.position.x = data.x;
    otherPlayer.position.y = data.y;
    otherPlayer.position.z = data.z;

    objects.push( otherPlayer );
    three.scene.add( otherPlayer );

  },

  removeOtherPlayer: function(data){
    var obj = this.getObject(data.playerId);
    //var selectedObject = scene.getObjectByName(obj.name);
    three.scene.remove( obj );
  }

};

module.exports = test;
