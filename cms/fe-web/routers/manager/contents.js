/**
 * Created by marcogobbi on 31/07/2017.
 */


const SeoPlugin = require("../../plugins/seo/seo-plugin");
const entitiesList = require("../../entities/EntitiesList");
const mapResponse=require("./mapResponse")


module.exports = class ContentsManager {
    constructor() {
        this._entities = entitiesList;
    }

    fromId(entityId, recordId) {
        console.log(entityId);
        const item = this._entities.filter(({entity}) => entity.id === entityId)[0];

        return item.entity.findById(recordId)
            .then(mapResponse(entityId, recordId))
            .then(response => response)
    }

    create(entityId) {
        console.log(entityId);
        const entity = this._entities.filter(({entity}) => entity.id === entityId)[0].entity;
        return entity.schema().then(mapResponse(entityId));

    }

    search() {

    }

    entities() {

        const promises = this._entities
            .filter(({excludeFromContents}) => !excludeFromContents)
            .map(({entity, name}) => {
                return entity.findAll().then(records => {
                    return Object.assign({}, entity, {name, records});
                })
            });
        return Promise.all(promises).then(entities => {
            return {
                entities
            }
        }).catch(e => {
            console.log(e);
            return {
                entities: []
            }
        })
    }

    save(entityId, files, body) {
        const entityWrapper = this._entities.filter(({entity}) => entity.id === entityId)[0];
        const entity = entityWrapper.entity;

        files.forEach(file => {
            body[file.fieldname] = file.secure_url; //`${file.destination}/${file.filename}`;
        });
        var saveObject = Object.entries(body).reduce((prev, [key, value]) => {
            if (key.match(/seo_/gi)) {
                prev.seo[key] = value;
            } else {
                prev.body[key] = value;
            }
            return prev;
        }, {seo: {}, body: {}});

        return entity.save(saveObject.body).then(recordId => {
            if (entityWrapper.excludeFromSeo) {
                return recordId;
            }else{
                const seo = SeoPlugin.createNew(saveObject, entityId, recordId);

                return SeoPlugin.save(seo).then(_=>recordId)
            }

        });
        //
    }

    update(entityId, recordId, files, body) {
        const entityWrapper = this._entities.filter(({entity}) => entity.id === entityId)[0];
        const entity = entityWrapper.entity;

        files.forEach(file => {
            body[file.fieldname] = file.secure_url;//`${file.destination}/${file.filename}`;
        });
        var saveObject = Object.entries(body).reduce((prev, [key, value]) => {
            if (key.match(/seo_/gi)) {
                prev.seo[key] = value;
            } else {
                prev.body[key] = value;
            }
            return prev;
        }, {seo: {}, body: {}});

        return entity.update(recordId, saveObject.body).then(recordId => {

            if (entityWrapper.excludeFromSeo) {
                return recordId;
            }else{
                const seo = SeoPlugin.createNew(saveObject, entityId, recordId);
                return SeoPlugin.update(recordId, seo).then(_=>recordId)
            }

        });
        //  return entity.update(recordId, body);
    }

    deleteOne(entityId, recordId) {
        console.log(entityId, recordId);
        const entity = this._entities.filter(({entity}) => entity.id === entityId)[0].entity;
        return entity.deleteOne(recordId);
    }
};