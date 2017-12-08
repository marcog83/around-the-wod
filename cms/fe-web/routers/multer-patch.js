/**
 * Created by mgobbi on 08/08/2017.
 */
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var mkdirp = require('mkdirp');
module.exports = function (storage) {
    storage._handleFile = function _handleFile(req, file, cb) {
        var that = this;

        that.getDestination(req, file, function (err, destination, getFinalPath) {
            if (err) return cb(err);

            that.getFilename(req, file, function (err, filename) {
                if (err) return cb(err);

                var finalPath = getFinalPath ? getFinalPath(destination, filename) : path.join(destination, filename);
                var outStream = fs.createWriteStream(finalPath);

                file.stream.pipe(outStream);
                outStream.on('error', cb);
                outStream.on('finish', function () {
                    cb(null, {
                        destination: destination,
                        filename: filename,
                        path: finalPath,
                        size: outStream.bytesWritten
                    })
                })
            })
        })
    }
}