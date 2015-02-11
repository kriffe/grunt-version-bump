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
    fail_json_with_no_version: function(test) {
        test.expect(1);
        callGruntfile('/mnt/trial/tests/fail_json_with_no_version.js', function (error, stdout, stderr) {
            test.equal(contains(stdout, 'Couldn\'t find attribute version in the JSON parse'), true, getTypicalErrorMessage(error, stdout, stderr));
            test.done();
        });
    },
    /*
        Test when an unsupported increment type is requested
     */
    fail_unsupported_increment_type: function(test) {
        test.expect(1);
        callGruntfile('/mnt/trial/tests/fail_unsupported_increment_type.js', function (error, stdout, stderr) {
            test.equal(contains(stdout, 'Only these incrementable parts are supported'), true, getTypicalErrorMessage(error, stdout, stderr));
            test.done();
        });
    },
    /*
        Test when a specified file to be bumped does not exist
     */
    fail_no_bump_file: function(test) {
        test.expect(1);
        callGruntfile('/mnt/trial/tests/fail_no_bump_file.js', function (error, stdout, stderr) {
            test.equal(contains(stdout, 'not found'), true, getTypicalErrorMessage(error, stdout, stderr));
            test.done();
        });
    },
    /*
        Test when the provided file to be bumped is not a valid JSON
     */
    fail_bump_file_not_valid_json: function(test) {
        test.expect(1);
        callGruntfile('/mnt/trial/tests/fail_bump_file_not_valid_json.js', function (error, stdout, stderr) {
            test.equal(contains(stdout, 'Couldn\'t parse file'), true, getTypicalErrorMessage(error, stdout, stderr));
            test.done();
        });
    },
    /*
        Test if major bump works well
     */
    success_bump_major: function(test) {
        test.expect(1);
        callGruntfile('/mnt/trial/tests/success_bump_major.js', function (error, stdout, stderr) {
            test.equal(contains(stdout, 'bumped [major] from 1.2.3-SNAPSHOT.4 to 2.0.0-SNAPSHOT.1'), true, getTypicalErrorMessage(error, stdout, stderr));
            test.done();
        });
    },
    /*
        Test if minor bump works well
     */
    success_bump_minor: function(test) {
        test.expect(1);
        callGruntfile('/mnt/trial/tests/success_bump_minor.js', function (error, stdout, stderr) {
            test.equal(contains(stdout, 'bumped [minor] from 2.0.0-SNAPSHOT.1 to 2.1.0-SNAPSHOT.1'), true, getTypicalErrorMessage(error, stdout, stderr));
            test.done();
        });
    },
    /*
        Test if patch bump works well
     */
    success_bump_patch: function(test) {
        test.expect(1);
        callGruntfile('/mnt/trial/tests/success_bump_patch.js', function (error, stdout, stderr) {
            test.equal(contains(stdout, 'bumped [patch] from 2.1.0-SNAPSHOT.1 to 2.1.1-SNAPSHOT.1'), true, getTypicalErrorMessage(error, stdout, stderr));
            test.done();
        });
    },
    /*
     Test if stage bump works well
     */
    success_bump_stage: function(test) {
        test.expect(1);
        callGruntfile('/mnt/trial/tests/success_bump_stage.js', function (error, stdout, stderr) {
            test.equal(contains(stdout, 'bumped [stage] from 2.1.1-SNAPSHOT.1 to 2.1.0-alpha.1'), true, getTypicalErrorMessage(error, stdout, stderr));
            test.done();
        });
    },
    /*
     Test if build bump works well
     */
    success_bump_build: function(test) {
        test.expect(1);
        callGruntfile('/mnt/trial/tests/success_bump_build.js', function (error, stdout, stderr) {
            test.equal(contains(stdout, 'bumped [build] from 2.1.0-alpha.1 to 2.1.0-alpha.2'), true, getTypicalErrorMessage(error, stdout, stderr));
            test.done();
        });
    }
};
