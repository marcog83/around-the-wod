/**
 * Created by mgobbi on 01/09/2015.
 */
module.exports = function (grunt) {
    grunt.loadTasks('./grunt-tasks/tasks');
    var path = require('path');

    require('load-grunt-config')(grunt, {
        // path to task.js files, defaults to grunt dir
        configPath: path.join(process.cwd(), 'grunt-tasks/config'),

        loadGruntTasks: {
            pattern: 'grunt-*',
            config: require('./package.json'),
            scope: 'devDependencies'
        }

    });

    grunt.registerTask('build', [
       // "clean:dist",//pulisce la cartella dist
        "build-SVG",//crea le SVG
        "less",//crea i css
        "cssmin:dist"//minifica i css
       // ,"imagemin:dist" //ottimizza le immagini e le copia in dist
        ,"copy:dist"//copia tutto in dist
        ,'requirejs:libraries'//crea le librerie JS
        ,'requirejs:dist'// concatene librerie e applicazione JS in un unico file e lo copia in dist

        ,'uglify:dist'// minifica i files JS (enabler.min.js) e li sostituisce in dist
        ,'ac-file-revision'//crea la revision per i files JS e CSS. Es. optimized.b23k4jd.js

    ]);

    //crea gli SVG
    grunt.registerTask('build-SVG', [
        "svg_sprite"
    ]);



    // crea e sostituisce i files revisionati con HASH
    grunt.registerTask('ac-file-revision', [
        "ac-filerev:dist",
        "ac-filerev_replace:views"
    ]);


    // crea la libreria di dipendenze JS. Serve quando si aggiunge una libreria nuova
    grunt.registerTask('build-js-library', [
        "requirejs:libraries"

    ]);
};

 