/**
 * Created by mgobbi on 02/09/2015.
 */
var utils = require("../utils/Utils");
module.exports = {
    all: {

        options: {
            sourceMap:true
            ,plugins: [
                new (require('less-plugin-autoprefix'))({browsers: ["last 3 versions","iOS > 7"]})
            ]
            ,sourceMapFileInline: true
            ,outputSourceFiles: true
        },

        files: [{
            expand: true, // set to true to enable options following options:
            cwd:  utils.getSourcePath(utils.LESS), // all sources relative to this path
            src: ["*.less","!_*.less","sprite.less"], // source folder patterns to match, relative to cwd
            dest: utils.getSourcePath(utils.CSS), // destination folder path prefix
            ext: ".css" // replace any existing extension with this value in dest folder
        }]
    }
};