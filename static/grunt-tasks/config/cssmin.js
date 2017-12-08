/**
 * Created by mgobbi on 02/10/2015.
 */
var utils = require("../utils/Utils");
var files={};
files[utils.getSourcePath(utils.CSS)+"base.css"]=[utils.getSourcePath(utils.CSS)+"base.css"];
module.exports = {
    options: {
        shorthandCompacting: false,
        roundingPrecision: -1
    },
    dist: {
        files: [
            // includes files within path
            {
                expand: true
                , cwd: utils.getSRC()
                , src: ['css/*.css'

                ]
                , dest: utils.getHTDOCS()
            }
        ]
    },
    base_min: {
        files: files
    }
};
