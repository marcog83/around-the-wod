const {getGruppi, getGruppo} = require("./gruppi-manager");
const jsonld = require("../../../cms/fe-web/plugins/seo/json-ld");

exports.getData = () => {
    return Promise.all([
        getGruppi()

    ]).then(([gruppi]) => {
        return {
            data: {
                _production: process.env.NODE_ENV == "production",
                seoData: {
                    seo_title: "Artists | Stonebridge Studio"
                    , seo_shareImage: "http://www.stonebridgestudio.it/static/img/profile.jpg"
                    , seo_description: "This place got something."
                    , seo_url: "/gruppi"
                }
                , gruppi

            }
        }
    })
};
exports.getDetail = (id) => {
    return getGruppo(id)
        .then((gruppo) => {
            return {
                data: {
                    _production: process.env.NODE_ENV == "production",
                    seoData: gruppo.seo
                    , gruppo
                    , jsonld: jsonld.getGroup(gruppo)

                }
            }
        })
};