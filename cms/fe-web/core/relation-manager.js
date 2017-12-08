/**
 * Created by mgobbi on 09/08/2017.
 */
const dbManager = require("./db-manager");

module.exports = {
    find(collectionId, key, value){
        var query = {};
        query[key] = value;
        return dbManager.find(collectionId, query);
    }
};
