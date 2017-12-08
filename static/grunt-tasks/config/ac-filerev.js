/**
 * Created by mgobbi on 26/06/2016.
 */
var Utils = require("../utils/Utils");
module.exports = {
    options: {
        algorithm: 'md5',
        length: 8
    },
    dist: {
        src: [
            Utils.getDestPath(Utils.CSS) + "**/*.css",
            !Utils.getDestPath(Utils.CSS) + "base.css",
            Utils.getDestPath(Utils.JS) + "optimized.js"
        ]

    }
};
