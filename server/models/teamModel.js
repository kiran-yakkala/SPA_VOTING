const {Schema, model, Types} = require('mongoose')

const teamSchema = new Schema({
    name: {type: String, required: true},
    description: {type: String, required: true},
    image: {type: String, required: true},
    motto: {type: String, required: true},
    lastfive: {type: String, required: false},
    ranking:  {type: Number, required: false},
    played: {type: Number, required: false},
    won:  {type: Number, required: false},
    lost:  {type: Number, required: false},
    points: {type: Number, required: false}
}, {timestamps: true})

module.exports = model('Team', teamSchema)