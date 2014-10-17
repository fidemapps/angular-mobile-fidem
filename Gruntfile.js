module.exports = function (grunt) {

    grunt.initConfig({
        uglify: {
            default: {
                options: {
                    preserveComments: 'some',
                    sourceMap: 'angular-mobile-fidem.min.map',
                    sourceMappingURL: 'angular-mobile-fidem.min.map'
                },
                files: {
                    'angular-fidem.min.js': 'angular-mobile-fidem.js'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.registerTask('default', ['uglify']);
};