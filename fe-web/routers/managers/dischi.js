const {getDisco} = require("./dischi-manager");
const jsonld = require("../../../cms/fe-web/plugins/seo/json-ld");

exports.getDetail = (id) => {
    return getDisco(id).then(disco => {
        return {
            data: {
                _production: process.env.NODE_ENV == "production",
                seoData: disco.seo
                , disco
                , jsonld: jsonld.getDisco(disco)
            }
        }
    })
}