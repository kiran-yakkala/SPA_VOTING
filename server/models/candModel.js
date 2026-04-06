const {Schema, model, Types} = require('mongoose')

const candidateSchema = new Schema({
    election: {type: Types.ObjectId, ref:"Election", required: true},
    team: {type: Types.ObjectId, ref:"Team", required: true},
    voteCount: {type:Number, default: 0},
    isWinner: {type: Boolean, default: false} 
}, {timestamps: true})

module.exports = model('Candidate', candidateSchema)