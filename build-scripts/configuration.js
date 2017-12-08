/**
 * Created by mgobbi on 04/07/2017.
 */
const SRC_FOLDER = `${process.cwd()}/static-web/`;
const DIST_FOLDER = `${process.cwd()}/dist/`;
var INCLUDE_DIR = `${process.cwd()}/web/include/`;
var DEFINITION_DIR = `${process.cwd()}/web/definition/`;
var DATA_DIR = `${process.cwd()}/web/data/`;
var BODY_DIR = `${process.cwd()}/web/body/`;
var LAYOUT_DIR = `${process.cwd()}/web/layout/`;

const getPath = (pattern) => {
    return id => {
        return pattern.replace("{{id}}", id);
    }
};
module.exports = {
    CSS: "css",
    LESS: "less",
    JS: "js",
    IMG: "img",
    DIST_FOLDER
    , SRC_FOLDER
    , INCLUDE_DIR
    , DATA_DIR
    , BODY_DIR
    , DEFINITION_DIR
    , LAYOUT_DIR

    , src: getPath(`${SRC_FOLDER}{{id}}/`)
    , dist: getPath(`${DIST_FOLDER}{{id}}/`)
    , getDistFolder: _ => DIST_FOLDER

    , data: {
        js_name_production:"js/optimized.js"

    }

};