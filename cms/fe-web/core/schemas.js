/**
 * Created by mgobbi on 03/08/2017.
 */

const TEXT_SCHEMA = "text";
const HTML_SCHEMA = "html";
const NUMBER_SCHEMA = "number";
const DOCUMENT_SCHEMA = "document";
const LINK_SCHEMA = "link";
const DATE_SCHEMA = "date";
const REPEATABLE_SCHEMA = "repeatable";
const INVERSE_RELATION_SCHEMA = "inverse-relation";
const RELATION_SCHEMA = "relation";
const BOOLEAN_SCHEMA = "boolean";
const dbManager = require("./db-manager");
class Schema {
    constructor(name, label) {
        this.name = name;
        this.label = label;
        this.type = "";
    }

    mergeValue(value) {

        return Promise.resolve(Object.assign({}, this, {value}));
    }

    resolve() {
        return Promise.resolve(this);
    }

    clone() {

    }

    save(value) {
        return Promise.resolve(value);
    }

    update(value) {
        return Promise.resolve(value);
    }
}
exports.BooleanSchema=class BooleanSchema extends Schema {
    constructor({name, label,readonly} = {}) {
        super(name, label);
        this.type = BOOLEAN_SCHEMA;
        this.readonly = readonly;
    }

    clone() {
        return new BooleanSchema(this);
    }
};
exports.TextSchema = class TextSchema extends Schema {
    constructor({name, label,readonly} = {}) {
        super(name, label);
        this.type = TEXT_SCHEMA;
        this.readonly = readonly;
    }

    clone() {
        return new TextSchema(this);
    }
};
exports.HtmlSchema = class HtmlSchema extends Schema {
    constructor({name, label} = {}) {
        super(name, label);
        this.type = HTML_SCHEMA;
    }

    clone() {
        return new HtmlSchema(this);
    }
};
exports.NumberSchema = class NumberSchema extends Schema {
    constructor({name, label} = {}) {
        super(name, label);
        this.type = NUMBER_SCHEMA;
    }
    save(value) {
        return Promise.resolve(Number(value));
    }
    clone() {
        return new NumberSchema(this);
    }
};
exports.LinkSchema = class LinkSchema extends Schema {
    constructor({name, label} = {}) {
        super(name, label);
        this.type = LINK_SCHEMA;
    }

    clone() {
        return new LinkSchema(this);
    }
};
exports.DocumentSchema = class DocumentSchema extends Schema {
    constructor({name, label, mimetype} = {}) {
        super(name, label);
        this.type = DOCUMENT_SCHEMA;
        this.mimetype = mimetype;
    }

    clone() {
        return new DocumentSchema(this);
    }
};
exports.DateSchema = class DateSchema extends Schema {
    constructor({name, label, date_type = 'date'} = {}) {
        super(name, label);
        this.type = DATE_SCHEMA;
        this.date_type = date_type;
    }

    clone() {
        return new DateSchema(this);
    }
};
class RepeatableSchema extends Schema {
    constructor({name, label, field} = {}) {
        super(name, label);
        this.type = REPEATABLE_SCHEMA;
        this.field = field;
        this.field.name = `${this.name}[]`;
    }

    clone() {
        return new RepeatableSchema(this);
    }

    resolve() {
        return this.field.resolve().then(_ => this);
    }

    mergeValue(values) {
        let promises = [];
        if (values) {
            promises = values
                .filter(v => v)
                .map(v => {
                    return this.field.clone().mergeValue(v);
                })
        }
        return Promise.all(promises)
            .then(values => {

                return Object.assign({}, this, {value: values})
            });

    }

    save(values) {
        let promises = [];
        if (values) {
            promises = values
                .filter(v => v)
                .map(v => {
                    return this.field.save(v);
                })
        }
        return Promise.all(promises)
    }

    update(values, recordId) {
        let promises = [];
        if (values) {
            promises = values
                .filter(v => v)
                .map(v => {
                    return this.field.update(v, recordId)
                })
        }
        return Promise.all(promises)

    }
}
;

class RelationSchema extends Schema {
    constructor({name, label, toEntity, options} = {}) {
        super(name, label);
        this.type = RELATION_SCHEMA;
        this.toEntity = toEntity;
        this.options = options || [];//= this.getRelation();
    }

    clone() {
        return new RelationSchema(Object.assign({}, this));
    }

    resolve() {
        return this.getRelation().then(_ => this);
    }


    mergeValue(recordId) {

        return this.toEntity.findById(recordId).then(value => {
           if(value){
               value._id = value._id.toString();
           }
            return Object.assign({}, this, {value});
        })
    }

    getRelation() {
        return this.toEntity.getRelation()
            .then(response => {
                return response.map(record => {

                    return {
                        label: record.name || ""
                        , value: record._id.toString()

                    };
                })
            })
            .then(response => {
                this.options = response;
                return response;
            })
            .catch(e => {
                console.log(e);
            })
    }

    save(value,recordId) {
        return this.toEntity.updateOrSave(recordId, value);
    }

    update(value, recordId) {
        return this.toEntity.updateOrSave(recordId, value);
    }
}

class InverseRelationSchema extends RepeatableSchema {
    constructor({name, label, entityName} = {}) {
        super(name, label, {});
        this.type = INVERSE_RELATION_SCHEMA;
        this.entityName = entityName;
        this.field = this;
        this.field.name = this.name;
    }

    clone() {
        return new InverseRelationSchema(Object.assign({}, this));
    }

    resolve() {
        return this.getRelation().then(_ => this);
    }

    mergeValue(recordId) {
        return dbManager.findOne(this.entityName, recordId).then(value => {
            return Object.assign({}, this, {value});
        });
        // return this.toEntity.findById(recordId).then(value => {
        //
        //     return Object.assign({}, this, {value});
        // })
    }

    getRelation() {
        return this.toEntity.findAll()
            .then(response => {
                return response.map(record => {

                    return {
                        label: record.name.value || ""
                        , value: record._id

                    };
                })
            })
            .then(response => {
                this.options = response;
                return response;
            });
    }

}
;

exports.RelationSchema = RelationSchema;
exports.RepeatableSchema = RepeatableSchema;
exports.InverseRelationSchema = InverseRelationSchema;