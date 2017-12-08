/**
 * Created by marcogobbi on 01/08/2017.
 */
define(function (require) {
    var Handlebars = require("handlebars");
    var jsonHelper = require("../libs/hbs/json-helper");
    var rawHelper = require("../libs/hbs/raw-helper");
    var switchHelper = require("../libs/hbs/switch-helper");
    var ifCondHelper = require("../libs/hbs/if-cond-helper");
    jsonHelper(Handlebars);
    rawHelper(Handlebars);
    switchHelper(Handlebars);

    ifCondHelper(Handlebars);
    [].slice.call(document.querySelectorAll("script[type='text/x-handlebars']"), 0).forEach(function (node) {
        var name = node.id.replace("-tpl", "");
        Handlebars.registerPartial(name, node.innerHTML);
    });
    return function (data) {
        var template = Handlebars.compile("{{#fields}} {{> field-builder this}}<a href='javascript:void(0);' class='js-delete'> <span class='typcn typcn-trash'></span></a> {{/fields}}");
        return template(data)
    };
});