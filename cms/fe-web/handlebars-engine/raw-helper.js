/**
 * Created by marcogobbi on 01/08/2017.
 */
!(function (factory) {
    if ('define' in this && define.amd) {
        define(["handlebars"], factory);
    } else {
        module.exports = factory;
    }
})(function(Handlebars) {

    /**
     * Raw
     * Output a partial as raw text
     *
     * Usage example:
     * {{raw "my-partial"}}
     *
     * To avoid escaping of html etc., use triple curly braces:
     * {{{raw "my-partial"}}}
     *
     * @param  {string} partialName Name of a registered partial.
     * @return {string}
     */
    Handlebars.registerHelper('raw', function(partialName) {
        var p=Handlebars.partials[partialName];
        try{
            return p({})
        }catch (e){
            return p;
        }
    });

})