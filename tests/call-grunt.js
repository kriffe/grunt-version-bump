'use strict';

module.exports = new function() {
    var filename, directory;

    this.runGruntfile = function(filename) {
        var grunt = require('grunt'), path = require('path'), directory, filename;
        // split filename into directory and file
        directory = path.dirname(filename);
        filename = path.basename(filename);
        //change directory
        process.chdir(directory);
        //call grunt
        grunt.tasks(['default'], {gruntfile:filename, color:false}, function() {
            /* Do we want to do something here? */
        });
    };

    //get first command line argument
    filename = process.argv[2];
    this.runGruntfile(filename);
}();