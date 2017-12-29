const SeoPlugin = require("../../plugins/seo/seo-plugin");
module.exports=function mapResponse(entityId, recordId) {
    return record => {
        const fields = Object.keys(record).map(key => record[key]);

        return SeoPlugin.getFromRecordId(recordId).then(seo => {
            return {
                entityId
                , recordId
                , fields
                , seo
            }
        })

    }
}