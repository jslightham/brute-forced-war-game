const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Database schema for a statistic
let Stat = new Schema({
    count: {
        type: Array
    },
    player1Count: {
        type: Number
    },
    player2Count: {
        type: Number
    },
    drawCount: {
        type: Number
    },
    noEndCount: {
        type: Number
    }

}, {
    collection: 'stats'
});

module.exports = mongoose.model('Stat', Stat);