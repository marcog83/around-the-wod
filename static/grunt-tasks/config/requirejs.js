/**
 * Created by mgobbi on 25/09/2015.
 */
var config = require("../utils/require-config");
var utils = require("../utils/Utils");
module.exports = {
    //librerie di terze parti
    libraries: {
        options: {
            baseUrl: utils.getSourcePath(utils.JS),
            paths: config.options.paths,
            shim: config.options.shim,
            map: config.options.map,

            include: config.libraries(),
            optimize: "none",
            out: utils.getSourcePath(utils.JS) + "libs/libraries.js"
        }
    },
    //la dist per produzione
    dist: {
        options: {
            // wrap:true,
            preserveLicenseComments: false,

            findNestedDependencies: true,
            paths: config.empty(),
            shim: config.options.shim,
            map: config.options.map,
            baseUrl: utils.getSourcePath(utils.JS),
            mainConfigFile: utils.getSourcePath(utils.JS) + "/config.js",
            name: "config",
            optimize: "uglify2",
            generateSourceMaps: false,

            include: config.modules.concat(["requireLib"]),
            out: utils.getDestPath(utils.JS) + "/optimized.js"
        }
    }

};