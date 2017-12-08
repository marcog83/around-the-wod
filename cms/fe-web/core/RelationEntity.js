/**
 * Created by mgobbi on 09/08/2017.
 */
const Entity = require("./Entity");
const dbManager = require("./db-manager");
const {ObjectId} = require("mongodb");
class RelationEntity extends Entity {
    constructor({relationFrom, relationTo, id} = {}) {
        super(id);
        this.relationTo = relationTo;
        this.relationFrom = relationFrom;
    }

    schema() {
        return Promise.resolve({})
    }

    findById(recordId) {
        return dbManager.findOne(this.id, recordId)
            .then((joinResponse = {}) => {
                if (joinResponse !== null) {
                    const _id = joinResponse[this.relationTo];
                    return dbManager.findOne(this.relationTo, _id)
                } else {
                    return null;
                }

            })
            .catch(e => {
                console.log(e);
                return null;
            })
    }

    getRelation() {
        return dbManager.findAll(this.relationTo)
            .catch(e => {
                console.log(e);
                return [];
            })
    }

    update(recordId, body) {
        // update(fromValue, toValue, recordId) {

        return dbManager.save(this.id, body, recordId).then(id => id.toString())

    }

    updateOrSave(relationFrom, relationTo) {
        const valueToSearch = {
            [this.relationFrom]: relationFrom
            , [this.relationTo]: relationTo
        };
        return dbManager.queryOne(this.id, valueToSearch)
            .then(response => {
                if (!response) {
                    return this.save(valueToSearch)
                } else {
                    return this.update(response._id.toString(), valueToSearch)
                }
            })
    }

    save(value) {
        const recordId = new ObjectId();

        return dbManager.save(this.id, value, recordId).then(id => id.toString())


    }
}
module.exports = RelationEntity;