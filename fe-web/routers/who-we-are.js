const express = require('express');

const router = express.Router();
// define the detail route
router.get('/', function (req, res) {

    res.render("who-we-are",{
        data:{
            seoData: {
                seo_title: "Who we are | Stonebridge Studio"
                , seo_shareImage: "http://www.stonebridgestudio.it/static/img/profile.jpg"
                , seo_description: "This place got something."
                , seo_url: "/"
            }
        }
    });

});
module.exports = router;