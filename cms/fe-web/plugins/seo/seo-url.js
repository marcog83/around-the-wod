/**
 * Created by mgobbi on 28/11/2016.
 */
const getSlug = require("speakingurl");
const Connection = require("../../../cms/fe-web/core/db-connection").Connection;

const R = require("ramda");
exports.createURL = name => {
    return getSlug(name, {
        lang: "it"
    });
};
exports.save = (collection, name, original_url) => {
    console.log(name, original_url)
    return collection.findOneAndUpdate({name}, {$set: {name, original_url}}, {upsert: true})

};
var getURL = name => {
    var connection = new Connection();
    return connection.connect()
        .then(connection.collection.bind(connection, "SEO_URLS"))
        .then(coll => coll.findOne({name}))
        .then(R.tap(_ => connection.db.close()))
        .catch(R.tap(_ => connection.db.close()))
};

var getFromOriginalUrl = orginal_url => {
    var connection = new Connection();
    return connection.connect()
        .then(connection.collection.bind(connection, "SEO_URLS"))
        .then(coll => coll.findOne({orginal_url}))
        .then(R.tap(_ => connection.db.close()))
        .catch(R.tap(_ => connection.db.close()))
};

exports.getURL = getURL;
exports.getFromOriginalUrl = getFromOriginalUrl;
exports.middleware = (req, res, next) => {
    var name = "/" + req.param(0);
    return getURL(name).then(seoItem => {
        if (seoItem) {
            req.url = seoItem.original_url;
        }
        next();

    });
};