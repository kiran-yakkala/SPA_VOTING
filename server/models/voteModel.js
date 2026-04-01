
const {Schema, model, Types} = require('mongoose')

const voteSchema = new Schema({
    voter: { type: Types.ObjectId, ref: 'Voter', required: true },
    candidate: { type: Types.ObjectId, ref: 'Candidate', required: true },
    election: { type: Types.ObjectId, ref: 'Election', required: true },
}, { timestamps: true });

module.exports = model('Vote', voteSchema)