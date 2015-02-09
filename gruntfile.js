module.exports = function(grunt) {

    grunt.loadTasks('tasks');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-clean');


    grunt.initConfig({

        nodeunit: {
            tests: ['tests/*.js']
        },

        clean: {
            test: ['tests/tmp']
        }
    });

    grunt.registerTask('copy', 'Copy fixtures to a temp location.', function() {
        grunt.file.copy('tests/fixtures/fail_test1.json', 'tests/tmp/fail_test1.json');
    });

    grunt.registerTask('test', [
        'copy',
        'nodeunit',
        'clean'
    ]);
    grunt.registerTask('default', ['test']);
}