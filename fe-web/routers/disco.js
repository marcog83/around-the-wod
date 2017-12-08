const express = require('express');
const manager = require("./managers/dischi");
const router = express.Router();




 router.get('/:id', function (req, res) {
     manager.getDetail(req.params.id).then(data=>{
         res.render("disco-detail", data);
     })


});
module.exports = router;