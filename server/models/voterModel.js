const {Schema, model, Types} = require('mongoose')

const voterSchema = new Schema({
    fullName: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    votedElections: [{type: Types.ObjectId, ref:"Election", required: true}],
    isAdmin: {type:Boolean, default: false},
    points: {type: Number, default: 0},
    netEarnings: { type: Number, default: 0 }
}, {timestamps: true})

module.exports = model('Voter', voterSchema)