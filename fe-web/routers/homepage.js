const express = require('express');
const manager=require("./managers/homepage");
const router = express.Router();
// define the detail route
router.get('/', function (req, res) {
    res.render("homepage",{});


});
module.exports = router;