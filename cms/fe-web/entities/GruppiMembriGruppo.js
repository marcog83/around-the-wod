/**
 * Created by mgobbi on 03/08/2017.
 */
const RelationEntity = require("../core/RelationEntity");



class GruppiMembriGruppo extends RelationEntity {
    constructor({relationTo = "gruppi"} = {}) {
        super("gruppi-membri-gruppo");
        this.relationTo = relationTo;
        // this._schema = _buildRelationTo(relationTo);
    }

    schema() {
        return Promise.resolve({})
    }

    getRelation() {
        return dbManager.findAll(this.relationTo).then(records => {
                return Promise.all(records);
            })
            .catch(e => {
                console.log(e);
            })
    }

}
module.exports = GruppiMembriGruppo;