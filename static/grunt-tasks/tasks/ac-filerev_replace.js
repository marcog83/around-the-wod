/*
 * grunt-filerev-replace
 * https://github.com/solidusjs/grunt-filerev-replace
 *
 * Copyright (c) 2013 Sparkart Group, Inc.
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');
var slash = require('slash');
 //fixme  docenti.css changed to docenti.83b91dc9.css
// fixme sovrascrive anche formazione-docenti.css changed to formazione-docenti.d7eadc97.css
// perchè la regexp per docenti.css prende anche quella per formazione-docenti.css
//
// quindi:
// '<link href="/fe-web/css/formazione-docenti.css" rel="stylesheet">'.replace(asset_path_regexp('docenti.css'),"docenti.83b91dc9.css")
//
// diventa:
// "<link href="/fe-web/css/formazione-docenti.83b91dc9.css" rel="stylesheet">"

module.exports = function(grunt) {
    grunt.registerMultiTask('ac-filerev_replace', 'Replace references to grunt-filerev files.', function() {
        var assets_root = this.options().assets_root;
        var views_root = this.options().views_root || assets_root;
        var assets_paths = filerev_summary_to_assets_paths( assets_root );

        this.files[0].src.forEach( function( view_src ){

            var changes = replace_assets_paths_in_view( assets_paths, view_src, views_root );
            log_view_changes( view_src, changes );
        });
    });

    function filerev_summary_to_assets_paths( assets_root ) {
        var assets = {};

        for( var filerev_path in grunt.filerev.summary ){
            var src =filerev_path ;// file_path_to_web_path( filerev_path, assets_root );
            var dest =grunt.filerev.summary[filerev_path].renamed //path.basename( grunt.filerev.summary[filerev_path] );
            var regexp = asset_path_regexp( src );
            assets[src] = { dest: dest, regexp: regexp };
        }
        return assets;
    }


    function asset_path_regexp( asset_path ) {
        return new RegExp(escape_for_regexp( asset_path ) ,"ig");

    }

    function escape_for_regexp( string ) {
        return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    function replace_assets_paths_in_view( assets_paths, view_src, views_root ) {
        var view = grunt.file.read( view_src );
        var changes = [];



        for( var asset_src in assets_paths ){
            var asset_dest = assets_paths[asset_src].dest;
            var changed = false;

            view = view.replace( assets_paths[asset_src].regexp, asset_dest );
            changes.push( asset_src +' changed to '.grey+ asset_dest );
        }

        grunt.file.write( view_src, view );
        return changes;
    }



    function log_view_changes( view_src, changes ) {
        if( changes.length > 0 ){
            grunt.log.writeln( '✔ '.green+ view_src );
            for( var i in changes ){
                grunt.log.writeln( '  '+ changes[i] );
            }
        }
    }
};
