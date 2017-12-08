const express = require('express');
const manager=require("./managers/homepage");
const router = express.Router();
// define the detail route
router.get('/', function (req, res) {
    manager.getData().then(data=>{
        res.render("homepage",data);
    })


});
module.exports = router;