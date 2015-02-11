
module.exports = function(grunt) {
    grunt.initConfig({
        // Configuration to be run (and then tested).
        version_bump: {
            files: [ __dirname + '/tmp/failure_not_a_json.json' ],
            versionStructureFile: __dirname + '/tmp/success_version_structure.json',
            incrementType:   'major'
        }
    });

    grunt.loadTasks('./../tasks');
    grunt.registerTask('default', ['version_bump']);

};