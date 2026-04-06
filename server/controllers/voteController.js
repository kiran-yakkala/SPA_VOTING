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

        // 1. Find votes and use nested population: Vote -> Candidate -> Team
        const votes = await VoteModel.find({ voter: id })
            .populate('election', 'title thumbnail winner')
            .populate({
                path: 'candidate',
                populate: {
                    path: 'team', // This matches the field in your Candidate schema
                    select: 'name image' // Get the team name and image
                }
            })
            .sort({ createdAt: -1 })
            .lean(); // Use lean to get plain JavaScript objects for easier modification

        // 2. Flatten the data so 'fullName' comes from 'team.name'
        const formattedVotes = votes.map(vote => {
            if (vote.candidate && vote.candidate.team) {
                return {
                    ...vote,
                    candidate: {
                        ...vote.candidate,
                        fullName: vote.candidate.team.name, // Map team name to fullName
                        image: vote.candidate.team.image    // Map team image to image
                    }
                };
            }
            return vote;
        });

        res.status(200).json(formattedVotes);
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
        // 1. Fetch votes with nested population: Vote -> Candidate -> Team
        const votes = await VoteModel.find({ election: id })
            .populate('voter', 'fullName')
            .populate({
                path: 'candidate',
                select: '_id isWinner', // Get candidate fields
                populate: {
                    path: 'team',
                    select: 'name' // Get the team name
                }
            })
            .lean(); // Convert to plain objects for modification

        // 2. Flatten the candidate data so fullName comes from team.name
        const formattedVotes = votes.map(vote => {
            if (vote.candidate && vote.candidate.team) {
                return {
                    ...vote,
                    candidate: {
                        ...vote.candidate,
                        fullName: vote.candidate.team.name // Map team name to fullName
                    }
                };
            }
            return vote;
        });

        res.status(200).json(formattedVotes);
    } catch (error) {
        return next(new HttpError("Could not fetch voter mapping.", 500));
    }
};

module.exports = {getDetailedVoterHistory, getElectionVotes}