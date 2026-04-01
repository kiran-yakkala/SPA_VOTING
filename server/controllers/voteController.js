const VoteModel = require('../models/voteModel');
const HttpError = require('../models/ErrorModel');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");


/*
* Update Candidate
* GET : api/votes/:id

*/
const getDetailedVoterHistory = async (req, res, next) => {
    const { id } = req.params;

    try {
        // Find all votes cast by this specific voter
        const votes = await VoteModel.find({ voter: id })
            .populate('election', 'title thumbnail winner')  // Get election title, thumbnail, etc.
            .populate('candidate', 'fullName image') // Get the candidate's name they chose
            .sort({ createdAt: -1 });

        res.status(200).json(votes);
    } catch (error) {
        return next(new HttpError("Could not fetch voting details", 500));
    }
};


/*
* Update Candidate
* GET : api/votes/election/:id

*/

const getElectionVotes = async (req, res, next) => {
    const { id } = req.params;
    try {
        // Find all votes for this election
        const votes = await VoteModel.find({ election: id })
            .populate('voter', 'fullName')     // Get voter names
            .populate('candidate', '_id fullName isWinner'); // Get candidate names

        res.status(200).json(votes);
    } catch (error) {
        return next(new HttpError("Could not fetch voter mapping.", 500));
    }
};

module.exports = {getDetailedVoterHistory, getElectionVotes}