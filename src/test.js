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

  updateCameraPosition: function(){
    three.camera.position.x = player.position.x + 2* Math.sin( player.rotation.y );
    three.camera.position.y = player.position.y + 2;
    three.camera.position.z = player.position.z + 2.5 * Math.cos( player.rotation.y );
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

    return new THREE.Mesh(cube_geometry, cube_material);
  },

  createPlayer: function(data){

    //playerData = data;

    // no idea why this does not work
    // player = create_cube(data);
    // console.log(player);

    player = new THREE.Mesh(
      new THREE.CubeGeometry(data.sizeX, data.sizeX, data.sizeX),
      new THREE.MeshLambertMaterial({color: 0x7777ff, transparent:true, opacity:0.8, side: THREE.DoubleSide})
    );

    player.rotation.set(0,0,0);
    player.position.x = data.x;
    player.position.y = data.y;
    player.position.z = data.z;

    playerId = data.playerId;
    moveSpeed = data.speed;
    turnSpeed = data.turnSpeed;
    this.updateCameraPosition();
    objects.push( player );
    three.scene.add( player );
    three.camera.lookAt( player.position );

  }

};

module.exports = test;
