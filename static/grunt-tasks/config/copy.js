/**
 * Created by mgobbi on 06/05/2016.
 */
var utils = require("../utils/Utils");
module.exports = {
    dist: {
        files: [
            // includes files within path
            {
                expand: true
                , cwd: utils.getSRC()
                , src: [
                'css/font/*'
                , "static-includes/scripts.hbs"
                , "static-includes/stylesheet.hbs"

                , "gfx/*"
                , "img/*"

            ]
                , dest: utils.getHTDOCS()
            }


        ]
    }
};