const {Schema, model, Types} = require('mongoose')

const teamSchema = new Schema({
    name: {type: String, required: true},
    description: {type: String, required: true},
    image: {type: String, required: true},
    motto: {type: String, required: true},
    lastfive: {type: String, required: false}
}, {timestamps: true})

module.exports = model('Team', teamSchema)