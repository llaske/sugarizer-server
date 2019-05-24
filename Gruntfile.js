/*global module:false*/
module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		// Metadata.
		pkg: grunt.file.readJSON('package.json'),
		banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= "* " + pkg.repository + "\\n" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;' +
      ' Licensed <%= pkg.license %> */\n',
		// Task configuration.
		uglify: {
			options: {
				banner: '<%= banner %>'
			},
			dynamic_mappings: {
				expand: true,
				src: [
					'dashboard/public/js/*.js'
				],
				dest: 'build/'
			}
		},
		imagemin: {
			options: {
				optimizationLevel: 0 // Select optimization level between 0 and 7. See https://github.com/gruntjs/grunt-contrib-imagemin#optimizationlevel-png for more info
			},
			dynamic: {
				files: [{
					expand: true,
					src: ['dashboard/public/img/*.{png,jpg,gif}'],
					dest: 'build/'
				}]
			}
		}
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-imagemin');

	// Default task.
	grunt.registerTask('default', ['uglify', 'imagemin']);

};
