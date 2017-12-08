/**
 * Created by mgobbi on 01/12/2015.
 */
var utils = require("../utils/Utils");

//
var dist = {};

dist[utils.getDestPath(utils.JS) + "external-widgets/adv/enabler.min.js"] = [utils.getSourcePath(utils.JS) + "external-widgets/adv/enabler.min.js"];

dist[utils.getDestPath(utils.JS) + "external-widgets/mixpanel/mixpanel-alias-user.min.js"] = [utils.getSourcePath(utils.JS) + "external-widgets/mixpanel/mixpanel-alias-user.min.js"];

 //
module.exports = {

    dist: {
        
        files: dist

    }
};