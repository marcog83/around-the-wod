/**
 * Created by marcogobbi on 14/09/2017.
 */
const SeoPlugin = require("../../../../cms/fe-web/plugins/seo/seo-plugin");
const extractValue = require("./extractValue");
module.exports=(entity)=>{
    return (id)=>{
        return entity.findById(id)
            .then(response => {
                return Promise.all([
                    SeoPlugin.getValueFromRecordId(id)
                        .then(extractValue({}))
                    , SeoPlugin.parseEntity(response)
                ])
            }).then(([seo, response]) => {
                return extractValue({seo})(response);
            })
    }
}