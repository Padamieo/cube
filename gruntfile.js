module.exports = function(grunt){

	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
  	pkg: grunt.file.readJSON('package.json'),

    uglify:{
      options:{
        banner: '/*<%= pkg.name %> V<%= pkg.version %> made on <%= grunt.template.today("yyyy-mm-dd") %>*/\r',
        mangle: false,
        beautify: true,
				sourceMap: true
      },
      app:{
        files:{
          'app/index.js': [
						'node_modules/jquery/dist/jquery.js',
            'node_modules/three/build/three.js',
						'node_modules/three/examples/js/SkyShader.js',
						'src/js/ui.js',
						'src/js/sound.js',
						'src/js/game.js',
						'src/js/index.js',
          	'temp/modernizr-custom.js',
						'src/js/pagetransitions.js'
          ]
        }
      }
    },

  	copy: {
  		build:{
  			files:[{
  				cwd: 'src/',
  				src: ['**', '!**/js/*.js', '!**/*.jpg', '!**/*.less'],
  				dest: 'app/',
  				nonull: false,
  				expand: true,
  				flatten: false,
  				filter: 'isFile'
  			},]
  		}
  	},

		modernizr_builder: {
	    build: {
        options: {
          features: 'csstransitions,cssanimations',
          options: 'prefixed,prefixes',
          dest: 'temp/modernizr-custom.js'
        }
	    }
		},

		less: {
			live: {
				options: {
					strictMath: true,
					sourceMap: true,
					outputSourceFiles: true,
					sourceMapURL: 'style.css.map',
					sourceMapFilename: 'app/css/style.css.map'
				},
				src: 'src/less/style.less',
				dest: 'app/css/style.css'
			}
		},

    watch:{
      options: {
  		  livereload: 1337,
        spawn: false
  		},
      js:{
        files: ['src/js/**.js'],
        tasks: ['uglify:app'],
      },
      html:{
        files: ['src/**.html', 'src/**.js', 'src/**/**.json'],
        tasks: ['copy:build'],
      },
			less:{
				files: ['src/*/**.less'],
				tasks: ['less'],
			}
    }

	});

	// our default task, others will come later
	grunt.registerTask('default', [
		'modernizr_builder',
    'uglify:app',
    'copy:build',
		'less',
    'watch'
  ]);

	grunt.registerTask('test', [
		'modernizr_builder'
	]);

};
