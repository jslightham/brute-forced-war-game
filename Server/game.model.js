const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Database schema for a game
let Game = new Schema({
    deck: {
        type: Array
    },
    winner: {
        type: Number
    },

}, {
    collection: 'game'
});

module.exports = mongoose.model('Game', Game);