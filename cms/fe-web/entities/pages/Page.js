/**
 * Created by mgobbi on 03/08/2017.
 */
const Entity = require("../../core/Entity");

const RelationEntity = require("../../core/RelationEntity");
const {TextSchema, RepeatableSchema, RelationSchema, BooleanSchema} = require("../../core/schemas");

class Page extends Entity {
    constructor() {
        super("page");


        this._schema = {
            name: new TextSchema({
                name: "name"
                , label: "Page Name"
            })
            , templateEntity: new RelationSchema({
                name: "templateEntity"
                , label: "Scegli un template da associare"
                , toEntity: new RelationEntity({
                    relationFrom: "page",
                    relationTo: "template-entity",
                    id: "page-template-entity"
                })
            })
            , parentPage: new RelationSchema({
                label: "Pagina Padre"
                , name: "parentPage"
                , toEntity: new RelationEntity({
                    relationFrom: "page",
                    relationTo: "page",
                    id: "page-page"
                })
            })
            , recordId: new TextSchema({
                name: "recordId"
                , label: "id del Record"
            })


        }
    }


}
;
module.exports = Page;