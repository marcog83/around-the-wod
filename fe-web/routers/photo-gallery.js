const express = require('express');

const router = express.Router();
// define the detail route
router.get('/', function (req, res) {

    res.render("photo-gallery",{
        data:{
            title:"Photo Gallery | Stonebridge Studio"
        }
    });

});
module.exports = router;