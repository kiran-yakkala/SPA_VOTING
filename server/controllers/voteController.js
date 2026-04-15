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
            .populate('election', 'title thumbnail winner noresult')
            .populate({
                path: 'candidate',
                populate: {
                    path: 'team', // This matches the field in your Candidate schema
                    select: 'name image' // Get the team name and image
                }
            })
            .sort({ createdAt: -1 })
            .lean(); // Use lean to get plain JavaScript objects for easier modification

            // 2. Calculate total wins from the fetched history
        // A win is defined as: candidate._id matches election.winner
        const totalWins = votes.filter(vote => 
            vote.election && 
            vote.candidate && 
            vote.election.winner &&
            vote.election.winner.toString() === vote.candidate._id.toString()
        ).length;

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

        res.status(200).json({
            history: formattedVotes,
            totalWins: totalWins
        });
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

const cleanupDuplicateVotes = async (req, res, next) => {
    try {
        // 1. Find all groups of (voter + election) that have more than 1 vote
        const duplicates = await VoteModel.aggregate([
            {
                $group: {
                    _id: { voter: "$voter", election: "$election" },
                    count: { $sum: 1 },
                    votes: { $push: "$_id" }
                }
            },
            {
                $match: { count: { $gt: 1 } }
            }
        ]);

        let totalDeleted = 0;

        // 2. Iterate through each duplicate group
        for (const group of duplicates) {
            // Keep the first vote (earliest), delete the rest
            const [keep, ...toDelete] = group.votes;
            
            const result = await VoteModel.deleteMany({ _id: { $in: toDelete } });
            totalDeleted += result.deletedCount;
        }

        // 3. After cleaning, you MUST run your syncHistoricalVoterPoints script
        // to recalculate the net earnings with the correct vote counts.
        
        res.status(200).json({ 
            message: `Cleanup successful. Removed ${totalDeleted} duplicate votes.`,
            duplicatesFound: duplicates.length 
        });
    } catch (error) {
        return next(new HttpError("Cleanup failed: " + error.message, 500));
    }
};

module.exports = {getDetailedVoterHistory, getElectionVotes, cleanupDuplicateVotes}