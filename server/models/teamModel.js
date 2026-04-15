const {Schema, model, Types} = require('mongoose')

const teamSchema = new Schema({
    name: {type: String, required: true},
    description: {type: String, required: true},
    image: {type: String, required: true},
    motto: {type: String, required: true},
    lastfive: {type: String, required: false, default: ""},
    ranking:  {type: Number, required: false, default: 0},
    played: {type: Number, required: false, default: 0},
    won:  {type: Number, required: false, default: 0},
    lost:  {type: Number, required: false, default: 0},
    points: {type: Number, required: false, default: 0}
}, {timestamps: true})

module.exports = model('Team', teamSchema)