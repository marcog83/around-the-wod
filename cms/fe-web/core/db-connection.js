/**
 * Created by mgobbi on 03/08/2017.
 */
const MongoClient = require('mongodb').MongoClient;
const {DB_URL}=require("../../properties");





const Deferred = function () {
    let resolve, reject;
    let promise = new Promise((res, rej)=> {
        resolve = res;
        reject = rej;
    });
    return {resolve, reject, promise}
};

class Connection {
    constructor() {
        this.defer = Deferred();
    }

    connect() {
        MongoClient.connect(DB_URL, (err, db) => {
            // Get the collection
            if (err) {
                this.defer.reject(err);

            } else {
                this.db = db;
                this.defer.resolve(db);
            }
        });
        return this.defer.promise;
    }

    collection(name) {
        return this.defer.promise.then(db=>db.collection(name));

    }

    findAll(name) {
        return this.collection(name).then(c=>new Promise((res, rej)=> {
            c.find({}).toArray((err, docs)=> {
                if (err) {
                    rej(err);
                } else {
                    res(docs);
                }
            });
        }));
    }
}

exports.Connection = Connection;