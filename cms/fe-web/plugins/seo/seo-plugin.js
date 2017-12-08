/**
 * Created by mgobbi on 12/09/2017.
 */
const getSlug = require("speakingurl");
const SeoParams = require("../../entities/SeoParams");
const seoEntity = new SeoParams();
exports.fromEntity = entity => {

};
exports.getFromOriginalUrl = seo_original_url => {

    return seoEntity.queryOne({seo_original_url});

};

const getValueFromRecordId = (seo_recordId, exclude_merge) => {
    return seoEntity.queryOne({seo_recordId: seo_recordId.toString()}, exclude_merge);
}
const getFromRecordId = seo_recordId => {
    return seoEntity.queryOne({seo_recordId}).then(record => {
        //if (!record.length)return {fields:[]};
        const fields = Object.keys(record).map(key => record[key]);
        return {fields}

    })
};
exports.getValueFromRecordId = getValueFromRecordId;
exports.getFromRecordId = getFromRecordId;
exports.save = body => {
    return seoEntity.save(body);
};
exports.update = (recordId, body) => {
    return seoEntity.update(recordId, body);
};
exports.middleware = (req, res, next) => {

    const seo_url = req.originalUrl;
    return seoEntity.queryOne({seo_url}, true).then(seoItem => {
        if (seoItem.seo_original_url != "") {
            req.url = seoItem.seo_original_url;
        }
        next();

    });
};
const createURL = name => {
    return getSlug(name, {
        lang: "it"
    });
};
exports.createNew = ({body, seo}, entityId, recordId) => {
    let result = Object.assign({}, seo);
    result.seo_recordId = recordId.toString();
    result.seo_original_url = result.seo_original_url || `/${entityId}/${recordId}`;
    result.seo_url = result.seo_url || `/${createURL(body.name)}`;
    result.seo_title = result.seo_title || `Stonebridge Studio :: ${body.name}`;

    return result;
};
exports.parseEntity = response => {
    var promises = Object.entries(response).map(([key, schema]) => {
        if (schema.value) {
            if (schema.type === "relation") {
                return getValueFromRecordId(schema.value._id, true).then(seo => {
                    schema.value.seo = seo;
                    return schema;
                })
            } else if (schema.type === "repeatable" && schema.field.type === "relation") {
                const repeatPromises = schema.value.map(v => {
                    return getValueFromRecordId(v.value._id, true)

                        .then(seo => {
                            v.value.seo = seo;
                            return schema;
                        });
                });
                return Promise.all(repeatPromises).then(_ => {
                    return schema;
                });
            } else {
                return Promise.resolve(schema)
            }
        } else {
            return Promise.resolve(schema)
        }

    });
    return Promise.all(promises).then(_response => {
        return _response.reduce((prev, curr) => {
            prev[curr.name] = curr;
            return prev;
        }, {})
    })
}