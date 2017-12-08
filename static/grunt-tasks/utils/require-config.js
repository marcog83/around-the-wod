/**
 * Created by mgobbi on 18/09/2015.
 */

var definitions = require("../../js/definitions");
module.exports = {
    options: {
        paths: {

              "robojs": "../node_modules/robojs/dist/robojs"

            , "@most/create": "../node_modules/@most/create/dist/create"
            , "@most/multicast": "../node_modules/@most/multicast/dist/multicast"
            , "@most/prelude": "../node_modules/@most/prelude/dist/index"
            , "most": "../node_modules/most/dist/most"
            , "gsap": "../node_modules/gsap/src/uncompressed/TweenMax"
            ,jquery:"../node_modules/jquery/dist/jquery"


        },

        shim: {
            gsap:{
                exports:"TweenMax"
            }


        }
        , map: {

        }

    }
    , definitions: definitions
    , libraries: function () {
        return Object.keys(this.options.paths);
    },
    empty: function () {
        return Object.keys(this.options.paths).reduce(function (prev, curr) {
            prev[curr] = "empty:";
            return prev;
        }, {requireLib: "../node_modules/requirejs/require"})
    },

    get modules() {
        var defs = definitions;
        return Object.keys(defs).map(function (key) {
            return "./" + defs[key];
        })
    }


};