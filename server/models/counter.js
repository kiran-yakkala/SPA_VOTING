const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // The name of the collection (e.g., 'matchId')
    seq: { type: Number, default: 0 }
});

module.exports = mongoose.model('Counter', counterSchema);