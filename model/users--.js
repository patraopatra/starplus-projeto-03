/* 
const MongoClient = require('mongodb').MongoClient;

module.exports = class users {
    static async find (){
        const conn = await MongoClient.connect('mongodb://localhost:27017');
        const db = conn.db('bancoWeb');
        return await db.collection('users').find().toArray();
    }
}
*/
const mongoose = require('mongoose')

const users = mongoose.model('users', {
    email: String,
    password: String
})

module.exports = users