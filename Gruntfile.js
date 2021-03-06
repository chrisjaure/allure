'use strict';

module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    jasmine_node: {
      projectRoot: 'test',
      specNameMatcher: '.spec'
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      src: {
        src: ['src/**/*.js', '!src/public/prism.js']
      },
      test: {
        src: ['test/*.js']
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      src: {
        files: '<%= jshint.src.src %>',
        tasks: ['jasmine_node']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test', 'jasmine_node']
      },
      dev: {
        files: ['src/public/index.html', 'src/*.js', 'src/plugins/*.js', 'test/fixture/*.md', 'test/server.js'],
        tasks: ['develop'],
        options: { nospawn: true }
      }
    },
    develop: {
      server: {
        file: 'test/server.js'
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.loadNpmTasks('grunt-develop');

  // Default task.
  grunt.registerTask('default', ['jshint', 'jasmine_node']);
  grunt.registerTask('dev', ['develop', 'watch']);

};
