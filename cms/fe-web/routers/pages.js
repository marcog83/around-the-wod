const express = require('express');
const router = express.Router();
const PagesManager = require('./manager/pages-manager');
const UploadManager = require('../core/upload/upload-manager');
const ContentsManager = require('./manager/contents');
const contentsManager = new ContentsManager();
const upload = UploadManager();
// define the detail route
const pagesManager = new PagesManager();
router.get('/', function (req, res) {
    pagesManager.entities().then(data => {
        res.render("pages", {data});
    })


});
router.get('/:pageId/:entityId', function (req, res) {
    pagesManager.create(req.params.entityId).then(data => {
        res.render("page-content", {data: Object.assign(data, {pageId: req.params.pageId})});
    })
});
router.get("/:pageId/:entityId/:recordId", (req, res) => {
    pagesManager.fromId(req.params.entityId, req.params.recordId).then(data => {
        res.render("page-content", {data: Object.assign(data, {pageId: req.params.pageId})});
    })
});
router.post("/save/:pageId/:entityId", upload.any(), function (req, res) {
    contentsManager.save(req.params.entityId, req.files, req.body)
        .then(pagesManager.updatePageEntity(req.params.pageId))
        .then(recordId => {
            res.redirect(`/cms/pages`);
            // res.redirect(`/cms/pages/${req.params.pageId}/${req.params.entityId}/${recordId}`);
        });
});
router.post("/save/:pageId/:entityId/:recordId", upload.any(), function (req, res) {
    contentsManager.update(req.params.entityId, req.params.recordId, req.files, req.body)
        .then(pagesManager.updatePageEntity(req.params.pageId))
        .then(recordId => {
            res.redirect(`/cms/pages`);
            // res.redirect(`/cms/pages/${req.params.pageId}/${req.params.entityId}/${recordId}`);
        });
});
module.exports = router;