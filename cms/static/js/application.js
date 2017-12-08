/**
 * Created by marcogobbi on 01/08/2017.
 */
define(function (require) {
    var rjs = require("robojs");
    var definitions = require("./definitions");
    return function () {
        rjs.bootstrap({definitions: definitions});
    }
});