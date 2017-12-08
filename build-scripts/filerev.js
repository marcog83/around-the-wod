/**
 * Created by mgobbi on 07/07/2017.
 */
var fs = require("fs");
var path = require("path");
var mkdirp = require("mkdirp");
var glob = require("glob");
var {DIST_FOLDER, dist, getDistFolder, CSS,   data} = require("./configuration");
var crypto = require('crypto');

var chalk = require('chalk');
var eachAsync = require('each-async');
var convert = require('convert-source-map');
const exists = function () {
    var filepath = path.join.apply(path, arguments);
    return fs.existsSync(filepath);
};
const isDir = function () {
    var filepath = path.join.apply(path, arguments);
    return exists(filepath) && fs.statSync(filepath).isDirectory();
};
function asset_path_regexp(asset_path) {
    return new RegExp(escape_for_regexp(asset_path), "ig");

}

function escape_for_regexp(string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}
function getFiles(src) {
    return new Promise(resolve => {
        glob(src, {}, function (er, files) {
            resolve(files);
        })
    })
}


function revFiles(config) {
    var promises = config.src.map(src => {
        return getFiles(src).then(files => {
            var filerev = {summary: {}};
            files.filter(file => !isDir(file))
                .forEach(file => {

                    var hash = crypto.createHash(config.options.algorithm).update(fs.readFileSync(file)).digest('hex');
                    var suffix = hash.slice(0, config.options.length);
                    var ext = path.extname(file);
                    var newName = [path.basename(file, ext), suffix, ext.slice(1)].join('.');

                    var dirname = path.dirname(file);
                    var resultPath = path.resolve(dirname, newName);
                    fs.renameSync(file, resultPath);
                    filerev.summary[path.basename(file)] = {
                        renamed: newName,
                        fullpath: [path.normalize(file), path.join(dirname, newName)]
                    };

                });
            return filerev.summary;
        })

    });
    return Promise.all(promises).then(response => {
        return response.reduce((prev, summary) => Object.assign(prev, summary), {});
    }).then(summary => {
        var assets = {};

        for (var filerev_path in summary) {
            var src = filerev_path;// file_path_to_web_path( filerev_path, assets_root );
            var dest = summary[filerev_path].renamed; //path.basename( grunt.filerev.summary[filerev_path] );
            var regexp = asset_path_regexp(src);
            assets[src] = {dest: dest, regexp: regexp};
        }
        return assets;
    })

}

function replaceFiles(options, assets_paths) {

    function log_view_changes(view_src, changes) {
        if (changes.length > 0) {
            console.log('✔ ' + view_src);
            for (var i in changes) {
                console.log('  ' + changes[i]);
            }
        }
    }

    function replace_assets_paths_in_view(assets_paths, view_src, views_root) {
        var view = fs.readFileSync(String(view_src)).toString();
        var changes = [];


        for (var asset_src in assets_paths) {
            var asset_dest = assets_paths[asset_src].dest;
            var changed = false;

            view = view.replace(assets_paths[asset_src].regexp, asset_dest);
            changes.push(asset_src + ' changed to ' + asset_dest);
        }
        // Create path, if necessary.
        mkdirp.sync(path.dirname(view_src));
        fs.writeFileSync(view_src, view, {});


        return changes;
    }

    const {assets_root, views_root = assets_root} = options;
    var promises = options.src.map(src => {
        return getFiles(src).then(files => {
            files.forEach(function (view_src) {
                var changes = replace_assets_paths_in_view(assets_paths, view_src, views_root);
                log_view_changes(view_src, changes);
            });
        })
    });

    return Promise.all(promises);

};


var config = {
    options: {
        algorithm: 'md5',
        length: 8
    },
    src: [
        "static/css/index.css"

    ]
};
var replace_options = {
    assets_root: DIST_FOLDER
    , src: [`fe-web/render/include/stylesheet.hbs`]
}
revFiles(config)
    .then(replaceFiles.bind(null, replace_options))
    .then(e => {
        process.exit(0)
    })
    .catch(e => {
        process.exit(1)
    })







