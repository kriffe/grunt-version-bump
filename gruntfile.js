module.exports = function(grunt) {

    grunt.loadTasks('tasks');

    grunt.initConfig({
        version_bump: {
            files: ['package.json', 'test/tmp/test2.json', 'test/tmp/test3.txt'],
        }
    });
}