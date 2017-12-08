const express = require('express');

const router = express.Router();
// define the detail route
router.get('/', function (req, res) {

    res.render("contacts",{data:{
        title:"Contatti | Stonebridge Studio"
    }});

});
module.exports = router;