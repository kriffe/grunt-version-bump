module.exports = function(grunt) {

    grunt.loadTasks('tasks');

    grunt.initConfig({
        version_bump: {
            files: ['package.json', 'test/tmp/test2.json', 'test/tmp/test3.txt'],
            versionStructure: [
                {
                    name:       "major",
                    priority:   1,
                    order:      1,
                    prefix:     "",
                    resetable:  true,
                    resetTo:    0
                },
                {
                    name:       "minor",
                    priority:   2,
                    order:      2,
                    prefix:     ".",
                    resetable:  true,
                    resetTo:    0
                },
                {
                    name:       "patch",
                    priority:   4,
                    order:      3,
                    prefix:     ".",
                    resetable:  true,
                    resetTo:    0
                },
                {
                    name:       "phase",
                    priority:   3,
                    order:      4,
                    prefix:     "-",
                    values:     [ "SNAPSHOT", "alpha", "beta", "RELEASE" ],
                    resetable:  false
                },
                {
                    name:       "build",
                    priority:   5,
                    order:      5,
                    prefix:     ".",
                    resetable:  true,
                    resetTo:    1
                }
            ]
        }
    });
}