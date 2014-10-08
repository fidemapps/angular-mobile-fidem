module.exports = function (grunt) {

    grunt.initConfig({
        uglify: {
            default: {
                options: {
                    preserveComments: 'some',
                    sourceMap: 'angular-fidem.min.map',
                    sourceMappingURL: 'angular-fidem.min.map'
                },
                files: {
                    'angular-fidem.min.js': 'angular-fidem.js'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.registerTask('default', ['uglify']);
};