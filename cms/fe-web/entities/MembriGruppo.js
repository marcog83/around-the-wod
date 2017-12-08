/**
 * Created by mgobbi on 03/08/2017.
 */
const Entity = require("../core/Entity");
// const Dischi = require("./Dischi");
// const Gruppi = require("./Gruppi");
const {TextSchema, HtmlSchema, DocumentSchema, DateSchema, RepeatableSchema, RelationSchema} = require("../core/schemas");
module.exports = class MembriGruppo extends Entity {
    constructor() {
        super("membri-gruppo");
        this._schema = {
            name: new TextSchema({
                label: "Nome"
                , name: "name"
            })
            , biography: new HtmlSchema({
                label: "Biografia"
                , name: "biography"
            })
            , birth: new DateSchema({
                name: "birth"
                , label: "Anno di nascita"
            })
            , profileImage: new DocumentSchema({
                label: "Profile Image"
                , name: "profileImage"
                , mimetype: "image/*"
            })

            , strumenti: new RepeatableSchema({
                label: "Strumento"
                , name: "strumenti"
                , field: new TextSchema()
            })
        }
    }

    schema() {
        return Promise.resolve(this._schema);
    }

};