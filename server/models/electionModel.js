const {Schema, model, Types} = require('mongoose')
const Counter = require('./counter');

const electionSchema = new Schema({
    title: {type: String, required: true},
    description: {type: String, required: true},
    thumbnail: {type: String, required: true},
    matchdate: {type: Date, required: true},
    matchnumber: {type: Number, required: true},
    matchtimeslot: {type: String, required: true },
    candidates: [{type: Types.ObjectId, ref:"Candidate", required: true}],
    voters: [{type: Types.ObjectId, ref:"Voter", required: true}],
    winner: {type: Types.ObjectId, ref: "Candidate", default: null},
    noresult: {type: Boolean, default: false},
    isClosed: {type: Boolean, default: false} 
}, {timestamps: true})


electionSchema.pre('validate', async function () {
    const doc = this;

    if (doc.isNew && !doc.matchnumber) {
        try {
            const counter = await Counter.findByIdAndUpdate(
                { _id: 'electionMatchNumber' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            
            doc.matchnumber = counter.seq;
            // No need to call next() here
        } catch (error) {
            // 2. Just throw the error instead of calling next(error)
            throw error; 
        }
    }
    // Function finishes naturally, which tells Mongoose to proceed
});

module.exports = model('Election', electionSchema)