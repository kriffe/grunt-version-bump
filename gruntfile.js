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
        grunt.file.copy('tests/fixtures/fail_test1.json', 'tests/tmp/fail_test1.json');
        grunt.file.copy('tests/fixtures/success_test1_version_structure.json', 'tests/tmp/success_test1_version_structure.json');
        grunt.file.copy('tests/fixtures/success_test2.json', 'tests/tmp/success_test2.json');
        grunt.file.copy('tests/fixtures/fail_test4.json', 'tests/tmp/fail_test4.json');
    });

    grunt.registerTask('test', [
        'copy',
        'nodeunit'
    ]);
    grunt.registerTask('default', ['test']);
}