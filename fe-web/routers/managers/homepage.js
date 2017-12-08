const {getPosts, getInfo} = require("./facebook");
const {getGruppi} = require("./gruppi-manager");

exports.getData = () => {
    return Promise.all([
        getGruppi(3)
        , getPosts()
        , getInfo()
    ]).then(([gruppi, posts, info]) => {
        return {
            data: {
                _production: process.env.NODE_ENV == "production",
                seoData: {
                    seo_title: "Homepage | Stonebridge Studio"
                    , seo_shareImage: "http://www.stonebridgestudio.it/static/img/profile.jpg"
                    , seo_description: "This place got something."
                    , seo_url: "/"
                }
                , gruppi
                , info
                , posts: posts.filter(({full_picture, message}) => {
                    return full_picture && message
                }).slice(0, 6)
            }
        }
    })
};