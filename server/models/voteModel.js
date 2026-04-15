
const {Schema, model, Types} = require('mongoose')

const voteSchema = new Schema({
    voter: { type: Types.ObjectId, ref: 'Voter', required: true },
    candidate: { type: Types.ObjectId, ref: 'Candidate', required: true },
    election: { type: Types.ObjectId, ref: 'Election', required: true },
}, { timestamps: true });

// This ensures a Voter can only have ONE vote per Election
voteSchema.index({ voter: 1, election: 1 }, { unique: true });

module.exports = model('Vote', voteSchema)