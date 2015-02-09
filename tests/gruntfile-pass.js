/*jslint node: true */
'use strict';

module.exports = function(grunt) {
    var loader = require("./grunt-hacks.js");

    grunt.initConfig({
        // Configuration to be run (and then tested).
        version_bump: {
            files: ['tests/tmp/fail_test1.json'],
        }
    });

    grunt.loadTasks('./../tasks');
    grunt.registerTask('default', ['version_bump']);

};