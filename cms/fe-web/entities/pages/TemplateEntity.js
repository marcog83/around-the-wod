/**
 * Created by mgobbi on 03/08/2017.
 */
const Entity = require("../../core/Entity");

const {TextSchema} = require("../../core/schemas");

class TemplateEntity extends Entity {
    constructor() {
        super("template-entity");
        this._schema = {
            name: new TextSchema({
                label: "Nome"
                , name: "name"
            }),
            template: new TextSchema({
                label: "Nome del template"
                , name: "template"
            })

            , entityId: new TextSchema({
                label: "Nome dell'entity"
                , name: "entityId"
            })


        }
    }


}
;
module.exports = TemplateEntity;