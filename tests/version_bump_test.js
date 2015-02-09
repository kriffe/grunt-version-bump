'use strict';

var cp = require("child_process"), command, options;

function callGruntfile(filename, whenDoneCallback) {
    var command, options;
    command = "grunt --gruntfile "+filename+" --no-color";
    options = {cwd: __dirname};
    cp.exec(command, options, whenDoneCallback);
}

function callNpmInstallAndGruntfile(filename, whenDoneCallback) {
    var command, options;
    command = "npm install";
    options = {cwd: __dirname};
    cp.exec(command, {}, function(error, stdout, stderr) {
        callGruntfile(filename, whenDoneCallback);
    });
}

function contains(where, what) {
    var index = where.toString().indexOf(what);
    return index>-1;
}

function containsWarning(buffer, warning) {
    return contains(buffer, 'Warning: Plugin failed: ' + warning);
}

function getTypicalErrorMessage(error, stdout, stderr) {
    return 'STDOUT: ' + stdout + ' STDERR: ' + stderr;
}

exports.version_bump_tester = {
    setUp: function(done) {
        // setup here if necessary
        done();
    },
    /*
        Test when the json of the file to be bumped does not have an attribute called version
     */
    fail_test1: function(test) {
        test.expect(1);
        callGruntfile('/mnt/trial/tests/fail_test1.js', function (error, stdout, stderr) {
            test.equal(contains(stdout, 'Couldn\'t find attribute version in the JSON parse'), true, getTypicalErrorMessage(error, stdout, stderr));
            test.done();
        });
    },
    /*
        Test when an unsupported increment type is requested
     */
    fail_test2: function(test) {
        test.expect(1);
        callGruntfile('/mnt/trial/tests/fail_test2.js', function (error, stdout, stderr) {
            test.equal(contains(stdout, 'Only these incrementable parts are supported'), true, getTypicalErrorMessage(error, stdout, stderr));
            test.done();
        });
    },
    /*
        Test when a specified file to be bumped does not exist
     */
    fail_test3: function(test) {
        test.expect(1);
        callGruntfile('/mnt/trial/tests/fail_test3.js', function (error, stdout, stderr) {
            test.equal(contains(stdout, 'not found'), true, getTypicalErrorMessage(error, stdout, stderr));
            test.done();
        });
    },
    /*
        Test when the provided file to be bumped is not a valid JSON
     */
    fail_test4: function(test) {
        test.expect(1);
        callGruntfile('/mnt/trial/tests/fail_test4.js', function (error, stdout, stderr) {
            test.equal(contains(stdout, 'Couldn\'t parse file'), true, getTypicalErrorMessage(error, stdout, stderr));
            test.done();
        });
    },
    success_test5: function(test) {
        test.expect(1);
        callGruntfile('/mnt/trial/tests/success_test5.js', function (error, stdout, stderr) {
            test.equal(contains(stdout, 'bumped [major] from 1.2.3-SNAPSHOT.4 to 2.0.0-SNAPSHOT.1'), true, getTypicalErrorMessage(error, stdout, stderr));
            test.done();
        });
    }
};
