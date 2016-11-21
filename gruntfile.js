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
  				src: ['**', '!**/index.js', '!**/*.jpg', '!**/*.css'],
  				dest: 'app/',
  				nonull: false,
  				expand: true,
  				flatten: false,
  				filter: 'isFile'
  			},]
  		}
  	},

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

	// our default task, others will come later
	grunt.registerTask('default', [
    'uglify:app',
    'copy:build',
    'watch'
  ]);

};
