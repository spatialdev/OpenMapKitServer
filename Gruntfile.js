/**
 * Created by DBaah on 3/1/17.
 */

module.exports = function (grunt) {
    
    grunt.initConfig({
        static_api_docs: {
            main: {
                src: "docs/custom-api-spec.yaml",
                dest: "public",
                options: {
                    filename: "custom-api-docs"
                }
            }
        },
        clean: ['public/api-docs.md']
    })

    grunt.loadNpmTasks('static-api-docs');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('default', ['static_api_docs:main', 'clean']);
}