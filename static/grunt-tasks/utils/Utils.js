/**
 * Created by mgobbi on 07/09/2015.
 */
module.exports =
{
    CSS: "css",
    LESS: "less",
    GFX: "gfx",
    IMG: "img",
    VIDEO: "video",
    JS: "js",
    JSON: "json",
    EXCEL:"excel",
    PARTIALS: "partials",

    _source_pattern: "./{{id}}/",
    _dest_pattern: "../fe-web/static/{{id}}/",
    getSourcePath: function (id) {
        return this._source_pattern.replace("{{id}}", id);
    },
    getDestPath: function (id) {
        return this._dest_pattern.replace("{{id}}", id);
    },
    getHTDOCS: function () {
        return "../fe-web/static/"
    },
    getSRC: function () {
        return "./"
    }
};
