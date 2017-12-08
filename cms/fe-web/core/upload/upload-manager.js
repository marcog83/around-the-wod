const {CLOUDINARY_URL, REMOTE_ASSETS_FOLDER} = require("../../../properties");
const multer = require('multer');

const path = require('path');
const crypto = require('crypto');


process.env.CLOUDINARY_URL = CLOUDINARY_URL;
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
const storage = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: REMOTE_ASSETS_FOLDER,
    allowedFormats: ['jpg', 'png'],
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(16, function (err, raw) {
            if (err) return cb(err);

            cb(null, raw.toString('hex'))
        })
    }
});

module.exports = ()=> multer({storage});
