module.exports = function(grunt) {

    grunt.loadTasks('tasks');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-clean');


    grunt.initConfig({

        nodeunit: {
            tests: ['tests/*_test.js']
        },

        clean: {
            test: ['tests/tmp']
        }
    });

    grunt.registerTask('copy', 'Copy fixtures to a temp location.', function() {
        grunt.file.copy('tests/fixtures/failure_json_with_no_version.json', 'tests/tmp/failure_json_with_no_version.json');
        grunt.file.copy('tests/fixtures/failure_not_a_json.json', 'tests/tmp/failure_not_a_json.json');
        grunt.file.copy('tests/fixtures/success_json_with_version.json', 'tests/tmp/success_json_with_version.json');
        grunt.file.copy('tests/fixtures/success_version_structure.json', 'tests/tmp/success_version_structure.json');
    });

    grunt.registerTask('test', [
        'copy',
        'nodeunit'
    ]);
    grunt.registerTask('default', ['test']);
}