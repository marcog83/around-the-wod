/**
 * Created by mgobbi on 03/08/2017.
 */
const {Connection} = require("./db-connection");
const {ObjectId} = require("mongodb");
const tap = require("./tap");
module.exports = {
    findAll(collectionId,limit=100){
        const connection = new Connection();
        connection.connect();
        return connection.collection(collectionId).then(collection => {
            return collection.find({})
                .sort({_sortOrder: 1})
                .limit(limit)
                .toArray();
        }).then(tap(_ => {
            connection.db.close();
        })).catch(tap(_ => {
            connection.db.close();
        }))

        // return Promise.all([{id: 1, label: "1"}, {id: 2, label: "2"}, {id: 3, label: "3"}])
    }
    , find(collectionId, query = {}){
        const connection = new Connection();
        connection.connect();
        return connection.collection(collectionId).then(collection => {
            return collection.find(query).toArray();
        }).then(tap(_ => {
            connection.db.close();
        })).catch(tap(_ => {
            connection.db.close();
        }))
    }
    , findOne(collectionId, id){
        const connection = new Connection();
        connection.connect();
        return connection.collection(collectionId).then(collection => {
            return collection.findOne({_id: ObjectId(id)});
        }).then(tap(_ => {
            connection.db.close();
        })).catch(tap(_ => {
            connection.db.close();
        }))
    }
    , queryOne(collectionId, query={}){
        const connection = new Connection();
        connection.connect();
        return connection.collection(collectionId).then(collection => {
            return collection.findOne(query);
        }).then(tap(_ => {
            connection.db.close();
        })).catch(tap(_ => {
            connection.db.close();
        }))
    }
    , save(collectionId, record, recordId = undefined){
        //deve salvare su db
        const connection = new Connection();
        connection.connect();
        return connection.collection(collectionId).then(collection => {

            if (typeof recordId === "string") {

                return collection.findOneAndUpdate({_id: ObjectId(recordId)}, {$set: record}, {upsert: true});
            } else {
                record._id = recordId;
                return collection.insertOne(record);
            }
        })
            .then(({insertedId = recordId}) => {
                return insertedId;
            })
            .then(tap(_ => {
                connection.db.close();
            })).catch(tap(_ => {
                connection.db.close();
            }))
    }
    , deleteOne(collectionId, recordId){
        //deve salvare su db
        const connection = new Connection();
        connection.connect();
        return connection.collection(collectionId).then(collection => {
            return collection.deleteOne({_id: ObjectId(recordId)});
        })

            .then(tap(_ => {
                connection.db.close();
            })).catch(tap(_ => {
                connection.db.close();
            }))
    }
};