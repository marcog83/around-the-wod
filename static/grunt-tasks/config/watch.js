/**
 * Created by mgobbi on 02/09/2015.
 */
var utils = require("../utils/Utils");
module.exports = {

    less: {
        // We watch and compile less files as normal but don't live reload here
        files: [utils.getSourcePath(utils.LESS) + '**/*.less'],
        tasks: ['less',"cssmin:base_min"]
    }

};