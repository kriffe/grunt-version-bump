module.exports = function(grunt) {

    var detectIndent = require('detect-indent');

    // the name of the plugin
    var _grunt_plugin_name  = "version_bump";

    // the name of the field in the json object that describes the version string
    var _version_field      = "version";

    // array of objects, each describing an incrementable part
    var _incrementableParts = [];

    grunt.registerTask(_grunt_plugin_name, 'version bump', function() {

        // take the files to bump
        var configFiles = grunt.config(_grunt_plugin_name) ?  grunt.config(_grunt_plugin_name).files : ['package.json'];
        var files = Array.isArray(configFiles) ? configFiles : [configFiles];

        _incrementableParts = _getIncrementableParts();
        _testIncrementablePartsIntegrity();

        // take the incremenetable part from a provided argument or use the lowest-priority incrementable part
        var incrementable_part_name = this.args[0] || (grunt.config(_grunt_plugin_name) ? grunt.config(_grunt_plugin_name)['incrementType'] : false) || _incrementablePartsSortByField(null, "priority").slice(-1)[0]["name"];

        // check whether the incremenetable part is valid
        if ( _incrementablePartsToSimpleArray(null).indexOf(incrementable_part_name) === -1 ) {
            grunt.fail.fatal(
                new Error("Only these incrementable parts are supported: " + _incrementablePartsToSimpleArray(_incrementablePartsSortByField(null, "order")).join(","))
            );
        }

        // filter out files that do no exist
        files.filter(function(file_path) {
            // Remove nonexistent files.
            if (!grunt.file.exists(file_path)) {
                grunt.log.warn('File "' + file_path.cyan + '" not found.');
                return false;
            } else {
                return true;
            }
        })
        // iterate over the rest
        .forEach(function(file_path) {

            // get file content
            try {
                var file_content = grunt.file.read(file_path);
            } catch(err) {
                grunt.fail.fatal(new Error("Couldn't read " + file_path + ". Error: " + err.message));
            }

            // used to persist the indentation when modifying a file
            var indent = detectIndent(file_content) || '    ';

            // parse file content as a JSON
            try {
                var file_content_json = JSON.parse(file_content);
            } catch(err) {
                grunt.fail.fatal(new Error("Couldn't parse file (" + file_path + ") as JSON. Error: " + err.message));
            }

            // extract version string
            var version_string = file_content_json[_version_field];

            if (typeof(version_string) === "undefined") {
                grunt.fail.fatal(new Error("Couldn't find attribute version in the JSON parse of " + file_path));
            }

            var parsedVersion = _parseVersion(version_string);

            if (_checkConditionIfExists(parsedVersion, grunt.option('condition'))) {
                // alter the json object with a bumper version string
                file_content_json[_version_field] = _stringifyVersion(
                    _incrementIncrementablePart(
                        parsedVersion,
                        incrementable_part_name
                    )
                );

                grunt.log.ok('bumped [' + incrementable_part_name + '] from ' + version_string + ' to ' + file_content_json[_version_field]);

                // save the file with the altered json
                grunt.file.write(
                    file_path,
                    JSON.stringify(
                        file_content_json,
                        null,
                        indent
                    )
                );
            } else {
                grunt.log.ok('condition [' + grunt.option('condition') + '] was not met. skipping.');
            }
        });
    }); // registerTask

    /*
        Check if a given condition is met
     */
    function _checkConditionIfExists(parsedVersion, condition) {
        if (condition) {
            var parts = condition.split(':');
            if (parts.length == 2) {
                if (parsedVersion[parts[0]] && (parsedVersion[parts[0]] != parts[1])) {
                    return false;
                }
            }
        }
        return true;
    }

    /*
        return the incrementable parts array by loading it from config or from a file
     */
    function _getIncrementableParts() {
        if ( grunt.config(_grunt_plugin_name) ) {
            if ( grunt.config(_grunt_plugin_name)['versionStructure'] ) {
                return grunt.config(_grunt_plugin_name)['versionStructure'];
            }
            if ( grunt.config(_grunt_plugin_name)['versionStructureFile'] ) {
                return JSON.parse(grunt.file.read(grunt.config(_grunt_plugin_name)['versionStructureFile']));
            }
        }
        return JSON.parse(grunt.file.read('defaultVersionStructure.json'));
    } // _getIncrementableParts

    /*
        test incrementable parts array's integrity
     */
    function _testIncrementablePartsIntegrity() {

        var arr         = _incrementableParts;
        var arrLength   = arr.length;

        // check structure and fill defaults
        for (var i = 0 ; i < arrLength ; i++) {
            var item = arr[i];
            _testIncrementablePartsIntegrity_structureAndDefaults(item);
            _testIncrementablePartsIntegrity_fieldTypes(item);
            _testIncrementablePartsIntegrity_consecutive(item, arrLength, 'order', 1);
            _testIncrementablePartsIntegrity_consecutive(item, arrLength, 'priority', 1);
        }
    } // _testIncrementablePartsIntegrity

    /*
        test that each incrementable part field exists or if possible set a default value
     */
    function _testIncrementablePartsIntegrity_structureAndDefaults(item) {
        if (typeof item['name'] === 'undefined') {
            grunt.fail.fatal(new Error('invalid version structure: missing field name'));
        }
        if (typeof item['priority'] === 'undefined') {
            grunt.fail.fatal(new Error('invalid version structure: missing field priority'));
        }
        if (typeof item['order'] === 'undefined') {
            grunt.fail.fatal(new Error('invalid version structure: missing field order'));
        }
        if (typeof item['prefix'] === 'undefined') {
            item['prefix'] = ".";
        }
        if (typeof item['resettable'] === 'undefined') {
            grunt.fail.fatal(new Error('invalid version structure: missing field resettable'));
        }
        if (typeof item['resetTo'] === 'undefined') {
            item['resetTo'] = 0;
        }
    } // _testIncrementablePartsIntegrity_structureAndDefaults

    /*
        test incrementable part integrity related to the type of each field
     */
    function _testIncrementablePartsIntegrity_fieldTypes(item) {
        if (typeof item['name'] !== 'string') {
            grunt.fail.fatal(new Error('invalid version structure: name field should be string'));
        }
        if ((typeof item['priority'] !== 'number') || (item['priority'] <= 0)) {
            grunt.fail.fatal(new Error('invalid version structure: priority field should be positive integer'));
        }
        if ((typeof item['order'] !== 'number') || (item['order'] <= 0)) {
            grunt.fail.fatal(new Error('invalid version structure: order field should be positive integer'));
        }
        if (typeof item['prefix'] !== 'string') {
            grunt.fail.fatal(new Error('invalid version structure: prefix field should be positive string'));
        }
        if (typeof item['resettable'] !== 'boolean') {
            grunt.fail.fatal(new Error('invalid version structure: resettable field should be boolean'));
        }
        if ((typeof item['resetTo'] !== 'number') || (item['resetTo'] < 0)) {
            grunt.fail.fatal(new Error('invalid version structure: resetTo field should be non-negative integer'));
        }
    } // _testIncrementablePartsIntegrity_fieldTypes

    /*
        test incrementable part integrity related to the consecutivity of the specific field
     */
    function _testIncrementablePartsIntegrity_consecutive(item, arrLength, field, startFrom) {
        _testIncrementablePartsIntegrity_consecutive.obj = _testIncrementablePartsIntegrity_consecutive.obj || {};
        _testIncrementablePartsIntegrity_consecutive.obj[field] = _testIncrementablePartsIntegrity_consecutive.obj[field] || {};
        _testIncrementablePartsIntegrity_consecutive.obj[field]['counter'] = _testIncrementablePartsIntegrity_consecutive.obj[field]['counter'] || 0;

        if (typeof _testIncrementablePartsIntegrity_consecutive.obj[field]['dict'] === "undefined") {
            _testIncrementablePartsIntegrity_consecutive.obj[field]['dict'] = {};
            for (var i = startFrom ; i <= startFrom -1 + arrLength ; i++) {
                _testIncrementablePartsIntegrity_consecutive.obj[field]['dict'][i + ""] = false;
            }
        }

        _testIncrementablePartsIntegrity_consecutive.obj[field].counter++;
        if (typeof _testIncrementablePartsIntegrity_consecutive.obj[field]['dict'][item[field] + ''] === "undefined") {
            grunt.fail.fatal(new Error('invalid version structure: ' + field + ' field values should be consecutive'))
        }
        if (_testIncrementablePartsIntegrity_consecutive.obj[field]['dict'][item[field] + ''] === false) {
            _testIncrementablePartsIntegrity_consecutive.obj[field]['dict'][item[field] + ''] = true;
        } else {
            grunt.fail.fatal(new Error('invalid version structure: ' + field + ' field values should be consecutive'));
        }
    } // _testIncrementablePartsIntegrity_consecutive


    /*
        take an array of incrementable parts and sort it by the provided field name.
        if arr is not provided (i.e. null) it uses the configured array
     */
    function _incrementablePartsSortByField(arr, field) {

        if ( ! arr ) {
            var arr = _incrementableParts;
        }

        var retVal = arr.slice();

        retVal.sort(function(a,b) {
            if (a[field] < b[field]) {
                return -1;
            }
            if (a[field] > b[field]) {
                return 1;
            }
            return 0;
        });

        return retVal;

    } // _incrementablePartsSortByField

    /*
        take an array of incrementable parts and convert it to a simple array of only their names
        if arr is not provided (i.e. null) it uses the configured array
    */
    function _incrementablePartsToSimpleArray(arr) {

        if ( ! arr) {
            var arr = _incrementableParts;
        }

        var retVal = [];

        var arrLength = arr.length;

        for (var i = 0 ; i < arrLength ; i++) {
            retVal.push(arr[i]["name"]);
        }

        return retVal;
    } // _incrementablePartsToSimpleArray


    /*
        calculates human-readable pattern based on the configured array of incrementable parts
        e.g. "<major>.<minor>.<patch>-<stage>.<build>"
    */
    function _calcPattern() {

        var retVal = "";

        var sortedArr = _incrementablePartsSortByField(null, "order");

        var sortedArrLength = sortedArr.length;

        for (var i = 0 ; i < sortedArrLength ; i++) {
            retVal += sortedArr[i].prefix + "<" + sortedArr[i].name;
            if (typeof(sortedArr[i]['values']) !== "undefined") {
                retVal += ":" + sortedArr[i].values.join("|");
            }
            retVal += ">";
        }

        return retVal;

    } // _calcPattern

    /*
        take an array of parsed version string and convert it back to a version string
    */
    function _stringifyVersion(parsed_version) {

        var retVal = "";

        var sortedArr = _incrementablePartsSortByField(null, "order");
        var sortedArrLength = sortedArr.length;

        for (var i = 0 ; i < sortedArrLength ; i++) {
            retVal += sortedArr[i]['prefix'] + parsed_version[sortedArr[i]['name']];
        }

        return retVal;

    } // _stringifyVersion

    /*
        take an version string and parse it to an object
    */
    function _parseVersion(version_string) {

        var retVal = {};

        var regexp = "";

        var sortedArr = _incrementablePartsSortByField(null, "order");
        var sortedArrLength = sortedArr.length;

        for (var i = 0 ; i < sortedArrLength ; i++) {
            if (typeof(sortedArr[i]['prefix']) !== "undefined") {
                regexp += sortedArr[i]['prefix'];
            }
            if (typeof(sortedArr[i]['values']) !== "undefined") {
                regexp += "(" + sortedArr[i]['values'].join("|") + ")";
            } else {
                regexp += "(\\d+)";
            }
        }

        regexp = new RegExp(regexp);

        var m = regexp.exec(version_string);

        if (m != null) {
            for (var i = 0 ; i < sortedArrLength ; i++) {
                retVal[sortedArr[i]['name']] = _isInt(m[i+1]) ? parseInt(m[i+1]) : m[i+1];
            }
        } else {
            grunt.fail.fatal(new Error("current version (" + version_string + ") does not meet " + _calcPattern() + " pattern"));
        }

        return retVal;

    } // _parseVersion

    /*
        increment a specific incrementable part and reset the rest (if resettable)
        return the altered parsed_version
    */
    function _incrementIncrementablePart(parsed_version, incrementable_part_name) {

        var sortedArr = _incrementablePartsSortByField(null, "priority");
        var sortedArrSimple = _incrementablePartsToSimpleArray(sortedArr);

        var priorityOfIncrementablePart = sortedArrSimple.indexOf(incrementable_part_name);
        // increment
        if (typeof(sortedArr[priorityOfIncrementablePart]['values']) !== "undefined") {
            // take next value
            var currentValueIndex = sortedArr[priorityOfIncrementablePart]['values'].indexOf(parsed_version[incrementable_part_name]);
            parsed_version[incrementable_part_name] = sortedArr[priorityOfIncrementablePart]['values'][(currentValueIndex+1) % sortedArr[priorityOfIncrementablePart]['values'].length];
        } else {
            parsed_version[incrementable_part_name]++;
        }

        // reset incrementable parts of lower priority
        for (var i = priorityOfIncrementablePart + 1 ; i < sortedArr.length ; i++) {
            var val = sortedArr[i];

            if (val['resettable'] || false) {
                if (typeof(val['values']) !== "undefined") {
                    parsed_version[val['name']] = val['values'][0];
                } else {
                    parsed_version[val['name']] = val['resetTo'];
                }
            }
        }

        return parsed_version;

    } // _incrementIncrementablePart

    /*
        determine if a given string can be converted to integer
    */
    function _isInt(value) {

        return !isNaN(value) && (function(x) { return (x | 0) === x; })(parseFloat(value))

    } // _isInt

} // module.exports