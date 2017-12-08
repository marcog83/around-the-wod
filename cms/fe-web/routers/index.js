const express = require('express');

const router = express.Router();
// define the detail route
router.get('/', function (req, res) {

    res.render("index",{
        data:{
            title:"index"
        }
    });

});
module.exports = router;