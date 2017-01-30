module.exports = function(grunt){

  //var pkg = grunt.file.readJSON('package.json');

	grunt.initConfig({
  	pkg: grunt.file.readJSON('package.json'),

    uglify:{
      options:{
        banner: '/*<%= pkg.name %> V<%= pkg.version %> made on <%= grunt.template.today("yyyy-mm-dd") %>*/\r',
        mangle: false,
        beautify: true
      },
      app:{
        files:{
          'app/index.js': [
            //'node_modules/socket.io/socket.io.js',
            //'node_modules/socket.io-client/socket.io.js',
            'node_modules/three/build/three.js',
						'node_modules/three/examples/js/SkyShader.js',
            'node_modules/threestrap/build/threestrap.js',
            'src/index.js'
          ]
        }
      }
    },

  	copy: {
  		build:{
  			files:[{
  				cwd: 'src/',
  				src: ['**', '!**/index.js', '!**/*.jpg'],
  				dest: 'app/',
  				nonull: false,
  				expand: true,
  				flatten: false,
  				filter: 'isFile'
  			},]
  		}
  	},

		modernizr: {
		  dist: {
		    "parseFiles": true,
		    "customTests": [],
		    "devFile": "/PATH/TO/modernizr-dev.js",
		    "dest": "/PATH/TO/modernizr-output.js",
		    "tests": [
		      // Tests
		    ],
		    "options": [
		      "setClasses",
					"csstransitions",
					"cssanimations"
		    ],
		    "uglify": true
		  }
		}

    watch:{
      options: {
  		  livereload: 1337,
        spawn: false
  		},
      js:{
        files: ['src/**.js', 'src/**/**.js'],
        tasks: ['copy:build', 'uglify:app'],
      },
      html:{
        files: ['src/**.html'],
        tasks: ['copy:build'],
      }
    }

	});

	// Load the grunt tasks
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks("grunt-modernizr");

	// our default task, others will come later
	grunt.registerTask('default', [
    'uglify:app',
    'copy:build',
    'watch'
  ]);

};
