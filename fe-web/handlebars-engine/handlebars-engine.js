const fs = require('fs');

const jsonHelper = require('../../cms/fe-web/handlebars-engine/json-helper');
const switchHelper = require('../../cms/fe-web/handlebars-engine/switch-helper');
var glob = require("glob");
var path = require("path");
var Handlebars = require("handlebars");
const DEFINITION_DIR = 'fe-web/render/definitions/';
const LAYOUT_DIR = 'fe-web/render/layout/';
const DATA_DIR = 'fe-web/render/data/';
const INCLUDE_DIR = 'fe-web/render/include/';
let STATIC_INCLUDE_DIR = 'static/static-includes/';
if (process.env.NODE_ENV === "production") {
    STATIC_INCLUDE_DIR = 'fe-web/static/static-includes/';
}

const BODY_DIR = `fe-web/render/body/`;

var FrontendHandlebars = Handlebars.create();
jsonHelper(FrontendHandlebars);
switchHelper(FrontendHandlebars);
function getFile(filePath) {
    return new Promise(function (resolve, reject) {
        fs.readFile(filePath, function (err, content) {
            if (err) return reject(err);

            resolve(content.toString());

        })
    })
};
function registerIncludes() {
    return new Promise((resolve, reject) => {
        // options is optional

        glob(INCLUDE_DIR + "**/*.hbs", {}, (err, files) => {
            if (err) reject(err);
            resolve(files);
        })
    }).then(filenames => {
        return new Promise((resolve, reject) => {
            // options is optional

            glob(STATIC_INCLUDE_DIR + "**/*.hbs", {}, (err, files) => {
                if (err) reject(err);
                resolve(filenames.concat(files));
            })
        })
    }).then(filenames => {
        const promises = filenames.map(function (filename) {
            const nameParsed = path.parse(filename);
            const name = path.normalize(nameParsed.name);
            return new Promise((resolve, reject) => {
                fs.readFile(filename, 'utf8', (err, include) => {
                    if (err) throw err;
                    resolve({
                        include
                        , name
                    });
                });

            });

        });
        return Promise.all(promises)
    }).then(includes => {
        includes.forEach(({include, name}) => {
            FrontendHandlebars.registerPartial(name, include);
        })
    })

}
function isObject(x) {
    return Object.prototype.toString.call(x) === '[object Object]';
};
module.exports = function (options) {
    const {pages} = options;
    const cache = {};
    const includes = registerIncludes();
    return function engine(filePath, options, callback) { // define the template engine
        const key = this.name;
        const page = (pages[key] && isObject(pages[key])) ? pages[key] : {};
        const {layout = "index", body = key, data = key} = page;
        if (!cache[key]) {
            cache[key] = Promise.all([
                getFile(`${LAYOUT_DIR}${layout}.hbs`)
                , getFile(`${BODY_DIR}${body}.hbs`)
            ]).then(([layout, body]) => {
                const precompiled = FrontendHandlebars.precompile(layout);
                return {
                    template: FrontendHandlebars.template((new Function('return ' + precompiled))())
                    , body
                }
            });

        }
        includes.then(_ => cache[key]).then(({template, body}) => {
            FrontendHandlebars.registerPartial('body', body);
            const {data = {}} = options || {};
            data.__pagename__ = key;
            return callback(null, template(data));
        })
            .catch(err => {
                delete cache[key];
                callback(err);
            })


    }
};