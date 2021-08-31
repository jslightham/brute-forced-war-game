const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Database schema for a contributor
let Contributor = new Schema({
    count: {
        type: Number
    },
    ip: {
        type: String
    }
}, {
    collection: 'contributors'
});

module.exports = mongoose.model('Contributor', Contributor);