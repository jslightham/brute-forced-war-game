const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Database schema for a pending game
let PendingGame = new Schema({
    deck: {
        type: Array
    },
    time: {
        type: Date
    }
}, {
    collection: 'pending'
});

module.exports = mongoose.model('PendingGame', PendingGame);