const fs = require('fs');
const mergeDeep = require('./merge-deep');
const switchHelper = require('./switch-helper');
const jsonHelper = require('./json-helper');
const rawHelper = require('./raw-helper');
const ifCondHelper = require('./if-cond-helper');
const glob = require("glob");
const path = require("path");
const Handlebars = require("handlebars");
const DEFINITION_DIR = 'cms/fe-web/render/definitions/';
const LAYOUT_DIR = 'cms/fe-web/render/layout/';
const DATA_DIR = 'cms/fe-web/render/data/';
const INCLUDE_DIR = 'cms/fe-web/render/include/';
const BODY_DIR = `cms/fe-web/render/body/`;
const CMSHandlebars = Handlebars.create();
switchHelper(CMSHandlebars);
jsonHelper(CMSHandlebars);
rawHelper(CMSHandlebars);
ifCondHelper(CMSHandlebars);
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
            CMSHandlebars.registerPartial(name, include);
        })
    })

}
function isObject(x) {
    return Object.prototype.toString.call(x) === '[object Object]';
};
module.exports = function (options) {
    const {pages} = options;
    const cache = {};

    return function engine(filePath, options, callback) { // define the template engine
        const key = this.name;
        const page = (pages[key] && isObject(pages[key])) ? pages[key] : {};
        const includes = registerIncludes();
        const {layout = "index", body = key, data = key} = page;
        if (!cache[key]) {
            cache[key] = Promise.all([
                getFile(`${LAYOUT_DIR}${layout}.hbs`)
                , getFile(`${BODY_DIR}${body}.hbs`)
            ]).then(([layout, body]) => {
                const precompiled =CMSHandlebars.compile(layout)// Handlebars.precompile(layout);
                return {
                    template: precompiled//Handlebars.template((new Function('return ' + precompiled))())
                    , body
                }
            });

        }
        includes.then(_ => cache[key]).then(({template, body}) => {
            CMSHandlebars.registerPartial('body', body);
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