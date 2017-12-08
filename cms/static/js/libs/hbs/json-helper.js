/**
 * Created by mgobbi on 01/08/2017.
 */

// usage {{{json user}}}
!(function (factory) {
    if ('define' in this && define.amd) {
        define([], function(){
            return factory
        });
    } else {
        module.exports = factory;
    }
})(function(Handlebars){
    Handlebars.registerHelper('json', function(context) {
        return JSON.stringify(context);
    });
});