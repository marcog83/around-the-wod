/**
 * Created by mgobbi on 03/08/2017.
 */
const Entity = require("../core/Entity");
const {TextSchema, DocumentSchema} = require("../core/schemas");

module.exports = class SeoParams extends Entity {
    constructor() {
        super("seo-params");
        this._schema = {
            seo_original_url: new TextSchema({
                label: "Url Originale"
                , name: "seo_original_url"
                ,readonly:true
            })
            , seo_url: new TextSchema({
                label: "Friendly Url"
                , name: "seo_url"

            })
            , seo_title: new TextSchema({
                label: "Page title"
                , name: "seo_title"

            })
            , seo_description: new TextSchema({
                label: "Page description"
                , name: "seo_description"

            })
            , seo_shareImage: new DocumentSchema({
                label: "Image to Share"
                , name: "seo_shareImage"
                , mimetype: "image/*"
            })
            , seo_recordId: new TextSchema({
                label: "record id"
                , name: "seo_recordId"
                ,readonly:true
            })
        }
    }

    schema() {
        return Promise.resolve(this._schema)
    }

};