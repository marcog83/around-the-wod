/**
 * Created by mgobbi on 07/08/2017.
 */
const getById = require("./libs/get-entity-record-by-id");
const Dischi = require("../../../cms/fe-web/entities/Dischi");
const dischi = new Dischi();


module.exports = {
    getDisco: getById(dischi)
};