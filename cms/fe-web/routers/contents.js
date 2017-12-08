const express = require('express');
const ContentsManager = require('./manager/contents');
const multer = require('multer');
const multerPatch = require('./multer-patch');
const path = require('path');
const crypto = require('crypto');

const contentsManager = new ContentsManager();
const {CLOUDINARY_URL}=require("../../properties");
process.env.CLOUDINARY_URL=CLOUDINARY_URL;
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
const storage = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'folder-name',
    allowedFormats: ['jpg', 'png'],
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            if (err) return cb(err);

            cb(null, raw.toString('hex'))
        })
    }
});

const upload = multer({storage: storage});
const router = express.Router();
// define the detail route
router.get('/', function (req, res) {
    contentsManager.entities().then(data => {
        res.render("contents", {data});
    })


});
router.get('/:entityId/:recordId', function (req, res) {
    contentsManager.fromId(req.params.entityId, req.params.recordId).then(data => {

        res.render("new-contents", {data});
    })
});
router.get('/:entityId', function (req, res) {
    contentsManager.create(req.params.entityId).then(data => {
        res.render("new-contents", {data});
    })
});
router.get('/search/:id', function (req, res) {
    contentsManager.search(req.params.id).then(data => {
        res.render("search-contents", data);
    })
});
router.post("/save/:entityId", upload.any(), function (req, res) {
    contentsManager.save(req.params.entityId, req.files, req.body).then(recordId => {
        res.redirect(`/cms/contents/${req.params.entityId}/${recordId}`);
    });
});
router.post("/save/:entityId/:recordId", upload.any(), function (req, res) {
    contentsManager.update(req.params.entityId, req.params.recordId, req.files, req.body).then(recordId => {
        res.redirect(`/cms/contents/${req.params.entityId}/${recordId}`);
    });
});
router.get('/delete/:entityId/:recordId', function (req, res) {
    contentsManager.deleteOne(req.params.entityId, req.params.recordId).then(data => {
        res.redirect(`/cms/contents`);
    })
});
module.exports = router;