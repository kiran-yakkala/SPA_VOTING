const CandidateModel = require('../models/candidateModel')
const HttpError = require('../models/ErrorModel');
const ElectionModel = require('../models/electionModel');
const {v4: uuid} = require("uuid")
const cloudinary = require('../utils/cloudinary')
const path = require("path")
const mongoose = require("mongoose");
const voterModel = require('../models/voterModel');
const voteModel = require('../models/voteModel');

/*
* Add Candidate
* POST : api/candidates
* PROTECTED(only admin)
*/
const addCandidate = async (req, res, next) => {
    try {
        // only admin can add candidate
        if(!req.user.isAdmin) {
            return next(new HttpError("Only an admin can perform this action.", 403))
        }

        const {fullName, motto, currentElection} = req.body;
        if(!fullName || !motto) {
            return next(new HttpError("Fill in all fields.", 422))
        }

        if(!req.files.image) {
            return next(new HttpError("Choose an image.", 403))
        }

        const {image} = req.files;
        // image should be less than 1mb
        if(image.size > 1000000) {
            return next(new HttpError("File size is too big. Should be less than 1 MB", 403))
        }

        // rename the image
        let fileName = image.name;
        fileName = fileName.split(".")
        fileName = fileName[0] + uuid() + "."+fileName[fileName.length - 1]

        // upload file to upload folder
        await image.mv(path.join(__dirname, "..", "uploads", fileName), async(err) => {
            if(err) {
                return next(new HttpError(err))
            } 
            // store image to cloudinary
            const result = await cloudinary.uploader
                                .upload(path.join(__dirname, "..", "uploads", fileName),
                                        {resource_type: "image"})
            if(!result.secure_url) {
                return next(new HttpError("Could not upload image to cloudinary", 422))
            }

            // save election to db
            
            const newCandidate = await CandidateModel.create({
                fullName, motto, image: result.secure_url, election: currentElection
            })

            // get election and push candidate to election
            let election = await ElectionModel.findById(currentElection)

            const sess = await mongoose.startSession()
            sess.startTransaction();
            await newCandidate.save({session: sess}) 
            election.candidates.push(newCandidate)
            await election.save({session: sess})
            await sess.commitTransaction()

            res.status(201).json("candidate added successfully")

        })

    } catch(error) {
        console.log("In error ", error.message)
        return next(new HttpError("Could not add candidate", 404))
    }
}

/*
* Get Candidate
* GET : api/candidates/:id
* PROTECTED
*/
const getCandidate = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log("In getCandidate ", id);

        // 1. Find the candidate and populate the linked team data
        const candidate = await CandidateModel.findById(id)
            .populate('team')
            .lean(); // Converts to plain JS object so we can modify it

        if (!candidate) {
            return next(new HttpError("Candidate not found", 404));
        }

        // 2. Flatten the team details into the top level
        const flattenedCandidate = {
            ...candidate,
            fullName: candidate.team?.name || "Unknown Team",
            image: candidate.team?.image || "",
            motto: candidate.team?.motto || "",
            // You can also add lastfive here if needed
            lastfive: candidate.team?.lastfive || ""
        };

        res.status(200).json(flattenedCandidate);

    } catch(error) {
        console.log("In error ", error.message)
        return next(new HttpError("Could not get candidate", 404))
    }
}

/*
* Get all Candidate
* GET : api/candidates
* PROTECTED
*/
const getCandidates = async (req, res, next) => {
    try {
              
        // 1. Find all candidates and populate their linked team data
        const candidates = await CandidateModel.find()
            .populate('team')
            .lean(); // Convert to plain JS objects for modification

        // 2. Flatten the data for each candidate in the array
        const flattenedCandidates = candidates.map(candidate => ({
            ...candidate,
            fullName: candidate.team?.name || "Unknown Team",
            image: candidate.team?.image || "",
            motto: candidate.team?.motto || "",
            lastfive: candidate.team?.lastfive || ""
        }));

        // Use 200 for successful GET requests
        res.status(200).json(flattenedCandidates);

    } catch(error) {
        console.log("In error ", error.message)
        return next(new HttpError("Could not get all candidates", 404))
    }
}

/*
* Remove Candidate
* DELETE : api/candidates/:id
* PROTECTED(only admin)
*/
const removeCandidate = async (req, res, next) => {
    try {
        // only admin can add candidate
        if(!req.user.isAdmin) {
            return next(new HttpError("Only an admin can perform this action.", 403))
        }

        const {id} = req.params;  
        let currentCandidate =  await CandidateModel.findById(id).populate('election')
        
        if(!currentCandidate) {
            return next(new HttpError("Could not delete candidate.", 403))
        } else {
            
            const sess = await mongoose.startSession()
            sess.startTransaction();           
            console.log("in delete candidate", currentCandidate) 
            console.log("in delete candidate election ", currentCandidate.election) 
             console.log("in delete candidate election.candidates", currentCandidate.election.candidates) 
            await currentCandidate.deleteOne({session: sess}) 

            let election = await ElectionModel.findById(currentCandidate.election);
            console.log("in update candidate 5.2", election)
           
            if(election.candidates){
                election.candidates.pull(currentCandidate)
            }            
            await election.save({session: sess})
            
            await sess.commitTransaction()

            res.status(200).json("Candidate deleted successfully")
        }
      
    } catch(error) {
        console.log("In error ", error.message)
        return next(new HttpError("Could not delete candidate", 404))
    }
}

/*
* Update Candidate
* PATCH : api/candidates

*/
const updateCandidate = async (req, res, next) => {
    try {
        
        console.log("in update candidate")
        const {id: candidateId} = req.params;  
        console.log("in update candidate req.user", req.user)
        const {electionId: selectedElection} = req.body;

        const voter = await voterModel.findById(req.user.id);

    // Check if electionId is already in the user's votedElections array
    if (voter.votedElections.includes(selectedElection)) {
        console.log("in update candidate - already voted for this match")
        return res.status(201).json(voter.votedElections); 
    }
        
        // get the candidate
        let currentCandidate =  await CandidateModel.findById(candidateId);
        
        const newVoteCount = currentCandidate.voteCount + 1;
        await CandidateModel.findByIdAndUpdate(candidateId, {voteCount: newVoteCount},
            {new : true});
       
        // starting a session for realtionship between voter and election
        const sess = await mongoose.startSession();
        sess.startTransaction();

        await voter.save({session:sess})
             
        
        let election = await ElectionModel.findById(selectedElection);
        
        election.voters.push(voter);
       
        voter.votedElections.push(election);
        await election.save({session: sess})
        console.log("in update candidate6", election)
        await voter.save({session: sess})
        console.log("in update candidate7", voter)

        // adding entry in vote 
        const newVote = new voteModel({
            voter: voter,
            candidate: currentCandidate,
            election: election
        });
        await newVote.save({ session: sess });

        await sess.commitTransaction();
console.log("in update candidate last", voter.votedElections)
        res.status(201).json(voter.votedElections)
    } catch(error) {
        console.log("In error ", error.message)
        return next(new HttpError("Could not update candidate", 404))
    }
}

module.exports = {addCandidate, getCandidate, getCandidates, removeCandidate, updateCandidate}
