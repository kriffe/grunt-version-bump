
module.exports = function(grunt) {
    grunt.initConfig({
        // Configuration to be run (and then tested).
        version_bump: {
            files: [ __dirname + '/tmp/success_json_with_version.json' ],
            versionStructureFile: __dirname + '/tmp/failure_version_structure_non_consecutive_field_values2.json',
            incrementType:   'minor'
        }
    });

    grunt.loadTasks('./../tasks');
    grunt.registerTask('default', ['version_bump']);

};