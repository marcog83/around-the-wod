/**
 * Created by mgobbi on 07/08/2017.
 */
const getById = require("./libs/get-entity-record-by-id");
const Gruppi = require("../../../cms/fe-web/entities/Gruppi");
const gruppi = new Gruppi();
const SeoPlugin = require("../../../cms/fe-web/plugins/seo/seo-plugin");

function getGruppi(limit = 100) {
    return gruppi.findAll(limit, true)
        .then(response => {
            const promises = response.map(record => {
                return SeoPlugin.getValueFromRecordId(record._id, true)
                    .then(seo => Object.assign({seo}, record))

            });
            return Promise.all(promises)
        })

}


module.exports = {
    getGruppi
    , getGruppo: getById(gruppi)
};