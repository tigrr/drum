/* jshint node: true */

'use strict';

module.exports = function (grunt) {
	// Load all grunt tasks
	require('load-grunt-tasks')(grunt);
	// Show elapsed time at the end
	require('time-grunt')(grunt);

	// Project configuration.
	grunt.initConfig({
		// Metadata.
		pkg: grunt.file.readJSON('package.json'),
		banner: `/*!
 * jQuery Drum Control - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>
 * <%= pkg.homepage %>
 * Copyright (c) <%= pkg.author.name %>
 * Licensed <%= pkg.license %>
 */`,
		// Task configuration.
		uglify: {
			options: {
				banner: '<%= banner %>\n',
				output: {
					comments: /^!/
				}
			},
			dist: {
				files: {
					'jquery.drum.bare.min.js': ['src/jquery.drum.js', 'src/jquery.watch-drag.js'],
					'jquery.drum.min.js': ['lib/jquery-ui.widget.js', 'src/jquery.drum.js', 'src/jquery.watch-drag.js'],
				}
			}
		},
		watch: {
			src: {
				files: 'src/**/*',
				tasks: ['build'],
			}
		},
	});

	grunt.registerTask('build', ['uglify']);
};
