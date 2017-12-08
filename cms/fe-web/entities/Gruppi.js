/**
 * Created by mgobbi on 03/08/2017.
 */
const Entity = require("../core/Entity");
const Dischi = require("./Dischi");
const MembriGruppo = require("./MembriGruppo");
const RelationEntity = require("../core/RelationEntity");
const {TextSchema, HtmlSchema, DocumentSchema,NumberSchema, LinkSchema, RepeatableSchema, RelationSchema} = require("../core/schemas");
class Gruppi extends Entity {
    constructor() {
        super("gruppi");
        this._schema = {
             name: new TextSchema({
                label: "Nome"
                , name: "name"
            })
            , biography: new HtmlSchema({
                label: "Biografia"
                , name: "biography"
            })
            , informations: new TextSchema({
                label: "Informazioni"
                , name: "informations"
                , maxlength: "140"
            })
            , location: new TextSchema({
                label: "Luogo"
                , name: "location"
            }),
            coverImage: new DocumentSchema({
                label: "Cover Image"
                , name: "coverImage"
                , mimetype: "image/*"
            })
            , profileImage: new DocumentSchema({
                label: "Profile Image"
                , name: "profileImage"
                , mimetype: "image/*"
            })
            , email: new TextSchema({
                label: "Email"
                , name: "email"
            })
            , website: new LinkSchema({
                label: "Website"
                , name: "website"
            })
            , genere: new RepeatableSchema({
                label: "genere musicale"
                , name: "genere"
                , field: new TextSchema()
            })
            , membri: new RepeatableSchema({
                label: "componente gruppo"
                , name: "membri"
                , field: new RelationSchema({
                    toEntity: new RelationEntity({
                        relationFrom: "gruppi",
                        relationTo: "membri-gruppo",
                        id: "gruppi-membri-gruppo"
                    })
                })
            })
            , dischi: new RepeatableSchema({
                label: "Dischi"
                , name: "dischi"
                , field: new RelationSchema({
                    toEntity: new RelationEntity({
                        relationFrom: "gruppi",
                        relationTo: "dischi",
                        id: "gruppi-dischi"
                    })
                })
            })
            , videos_embed: new RepeatableSchema({
                label: "Video Embed"
                , name: "videos_embed"
                , field: new HtmlSchema()
            })
            , tracks_embed: new RepeatableSchema({
                label: "Traccia musicale Embed"
                , name: "tracks_embed"
                , field: new HtmlSchema()
            })
            ,_sortOrder: new NumberSchema({
                label: "Ordinamento"
                , name: "_sortOrder"
            })

        }
    }


}
;
module.exports = Gruppi;