var grunt = require('grunt');

exports.simpleBump = {

    allVersions: function(test){

        var file1 = JSON.parse(grunt.file.read('tests/tmp/fail_test1.json')).version;
        test.done();
    }

};