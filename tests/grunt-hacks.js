module.exports = new function() {

    this.loadParentNpmTasks = function(grunt, pluginName) {
        var oldDirectory='', climb='', directory, content;

        // search for the right directory
        directory = climb+'node_modules/'+ pluginName;
        while (continueClimbing(grunt, oldDirectory, directory)) {
            climb += '../';
            oldDirectory = directory;
            directory = climb+'node_modules/'+ pluginName;
        }

        // load tasks or return an error
        if (grunt.file.exists(directory)) {
            grunt.loadTasks(directory+'/tasks');
        } else {
            grunt.fail.warn('Tasks plugin ' + pluginName + ' was not found.');
        }
    }

    function continueClimbing(grunt, oldDirectory, directory) {
        return !grunt.file.exists(directory) &&
            !grunt.file.arePathsEquivalent(oldDirectory, directory);
    }

}();