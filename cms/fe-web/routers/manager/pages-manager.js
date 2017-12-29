const Page = require("../../entities/pages/Page");
const {groupBy} = require("ramda");
const mapResponse = require("./mapResponse");
const entitiesList = require("../../entities/EntitiesList");
var byParentPage = groupBy(function (record) {
    if (!record.parentPage || !record.parentPage.value) {
        return "root"
    }
    return record.parentPage.value._id;
});


class PagesManager {
    constructor() {
        this._entities = entitiesList;
        this.pageEntity = entitiesList.filter(({name}) => name === "PAGE")[0]
    }

    entities() {
        return this.pageEntity.entity.findAll()
            .then(records => groupByParentPage(records).filter(({parentPage}) => !parentPage.value))
            .then(records => {
                return Object.assign({}, this.pageEntity.entity, {name: this.pageEntity.name, records});
            })
    }

    fromId(entityId, recordId) {

        const item = this._entities.filter(({entity}) => entity.id === entityId)[0];
        return item.entity.findById(recordId)
            .then(mapResponse(entityId, recordId))
            .then(response => response)
    }

    create(entityId) {
        console.log(entityId);
        const item = this._entities.filter(({entity}) => entity.id === entityId)[0];
        return item.entity.schema().then(mapResponse(entityId));

    }

    updatePageEntity(pageId) {
        return recordId => {
            return this.pageEntity.entity
                .update(pageId, {recordId}, true)
                .then(_ => recordId)
        }
    }
}

module.exports = PagesManager;

function groupByParentPage(records) {
    const groups = byParentPage(records);
    /*{
        "null": [{}, {}, {}]
        , 1: [{}]
        , 2: [{}]
        , 3: [{}]
    };*/
    return records.map(record => {
        record.children = groups[record._id];
        return record;
    })
        ;
}