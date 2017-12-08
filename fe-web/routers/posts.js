const express = require('express');
const manager=require("./managers/posts");
const router = express.Router();
// define the detail route
router.get('/', function (req, res) {
    manager.getData().then(data=>{
        res.render("posts",data);
    })


});
module.exports = router;