const CandidateModel = require('../models/candidateModel')
const HttpError = require('../models/ErrorModel');
const ElectionModel = require('../models/electionModel');
const {v4: uuid} = require("uuid")
const cloudinary = require('../utils/cloudinary')
const path = require("path");
const voterModel = require('../models/voterModel');
const voteModel = require('../models/voteModel');
const counter = require('../models/counter');
const electionModel = require('../models/electionModel');



/*
* Add new Election
* POST : api/elections
* PROTECTED(only admin)
*/
const addElection = async (req, res, next) => {
    try {
            //res.json(req.files.thumbnail);
        // only admin can add election
        if(!req.user.isAdmin) {
            return next(new HttpError("Only an admin can perform this action.", 403))
        }
        console.log("in adding election body...", req.body)
        const {title, description, matchdate, matchtimeslot} = req.body;
        if(!title || !description || !matchdate || !matchtimeslot) {
            
            return next(new HttpError("Fill in all fields.", 422))
        }

        console.log("in adding election file...", req.files)

        if(!req.files || !req.files.thumbnail) {
            return next(new HttpError("Choose a thumbnail.", 403))
        }

        const {thumbnail} = req.files;
        // image should be less than 1mb
        if(thumbnail.size > 1000000) {
            console.log("in adding election thumbnail.size...", thumbnail.size)
            return next(new HttpError("File size is too big. Should be less than 1 MB", 403))
        }

        // rename the image
        let fileName = thumbnail.name;
        fileName = fileName.split(".")
        fileName = fileName[0] + uuid() + "."+fileName[fileName.length - 1]
        console.log("in adding election fileName...", fileName)
        // upload file to upload folder
        await thumbnail.mv(path.join(__dirname, "..", "uploads", fileName), async(err) => {
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
            
            const newElection = await ElectionModel.create({
                title, description, matchdate, matchtimeslot, thumbnail: result.secure_url
            })

            res.status(201).json(newElection)

        })
    } catch (error) {
        console.log("In error ", error.message)
        return next(new HttpError("Adding election failed. Try agian later.", 422))
    }
         


}

/*
* get all Elections
* GET : api/elections
* PROTECTED
*/
const getElections = async (req, res, next) => {
     try {
        console.log("in get all elections")
        const elections = await ElectionModel.find();
        res.status(201).json(elections)
    } catch(error) {
        console.log("In error ", error.message)
        return next(new HttpError("Could not get all elections", 404))
    }
}


/*
* get single Elections
* GET : api/elections/:id
* PROTECTED
*/
const getElection = async (req, res, next) => {
     try {
        const {id} = req.params;     
        console.log("in get elections", id)   
        const election = await ElectionModel.findById(id)
        res.status(201).json(election)
    } catch(error) {
        console.log("In error ", error.message)
        return next(new HttpError("Could not get election", 404))
    }
}


/*
* get Election candidate
* GET : api/elections/:id/candidates
* PROTECTED
*/
const getElectionCandidates = async (req, res, next) => {
    try {
        const {id} = req.params;    
        console.log("in get all elections candidates ", id.trim())    
       // const candidates = await CandidateModel.find({election: id})
    //    res.status(200).json(candidates)
        const elections = await ElectionModel.findById(id.trim()).populate('candidates')
 console.log("in get all elections candidates ", elections.candidates)    
        res.status(200).json(elections.candidates)
    } catch(error) {
        console.log("In error ", error.message)
        return next(new HttpError("Could not get election candidates", 404))
    }
}

/*
* get Election candidate
* GET : api/elections/:id/candidates/votes
* PROTECTED
*/
const getElectionCandidatesWithVotes = async (req, res, next) => {
    try {
        const {id} = req.params;    
        console.log("in get all elections candidates ", id.trim())    
       // const candidates = await CandidateModel.find({election: id})
    //    res.status(200).json(candidates)
        const elections = await ElectionModel.findById(id.trim()).populate('candidates')
        console.log("in get all elections candidates ", elections.candidates)    
         //  If votes are in a separate collection, fetch them alongside
        const votes = await voteModel.find({ election: id })
            .populate('voter', 'fullName')
            .populate('candidate', '_id fullName');
        console.log("in get all elections votes ", votes)   
        res.status(200).json({elections, voterMap: votes})
    } catch(error) {
        console.log("In error ", error.message)
        return next(new HttpError("Could not get election candidates", 404))
    }
}


/*
* get Election voters
* GET : api/elections/:id/voters
* PROTECTED
*/
const getElectionVoters = async (req, res, next) => {
    try {
        const {id} = req.params;    
         console.log("in get all elections voters ", id.trim())        
        const elections = await ElectionModel.findById(id).populate('voters')
        res.status(201).json(elections.voters)
    } catch(error) {
        console.log("In error ", error.message)
        return next(new HttpError("Could not get election voters", 404))
    }
}


/*
* update Election
* PATCH : api/elections/:id
* PROTECTED(only admin)
*/
const updateElection = async (req, res, next) => {
    try {
        // only admin can add election
        if(!req.user.isAdmin) {
            return next(new HttpError("Only an admin can perform this action.", 403))
        }
         const {id} = req.params;        
        const {title, description, winnerId, matchdate, matchtimeslot} = req.body;
        // 1. Fetch current status
        const existingElection = await ElectionModel.findById(id);

        if (!existingElection) {
            return next(new HttpError("Election not found", 404));
        }

        // 2. Check if already closed
        if (existingElection.isClosed) {
            return next(new HttpError("This election is already closed and cannot be modified.", 403));
        }
       
        if(!title || !description || matchdate || matchtimeslot) {
            return next(new HttpError("Fill in all fields.", 422))
        }
        
        if(req.files && req.files.thumbnail) {    
            // thumbnail is given which is optional        

            const {thumbnail} = req.files;
            // image should be less than 1mb
            if(thumbnail.size > 1000000) {
                return next(new HttpError("File size is too big. Should be less than 1 MB", 403))
            }

            // rename the image
            let fileName = thumbnail.name;
            fileName = fileName.split(".")
            fileName = fileName[0] + uuid() + "."+fileName[fileName.length - 1]

            // upload file to upload folder
            await thumbnail.mv(path.join(__dirname, "..", "uploads", fileName), async(err) => {
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

            })
            // save election to db
            const updateData = { title, description, matchdate, matchtimeslot, thumbnail: result.secure_url };
            if (winnerId) {
                if(winnerId === 'NR'){
                    updateData.noresult = true;
                } else {
                    // 1. Fetch the winner's name from the Candidate collection nad update the winner
                    await CandidateModel.updateOne(
                        winnerId, 
                        { isWinner: true }, 
                        { new: true, runValidators: true } // 'new: true' returns the updated doc
                    );
                }
               
                updateData.isClosed = true;
                
            }
            await ElectionModel.findByIdAndUpdate(id, updateData)
        } else {
            // save election to db
            const updateData = { title, description, matchdate, matchtimeslot };
            if (winnerId) {
                if(winnerId === 'NR'){
                    updateData.noresult = true;
                } else {
                    // 1. Fetch the winner's name from the Candidate collection nad update the winner
                    await CandidateModel.updateOne(
                        winnerId, 
                        { isWinner: true }, 
                        { new: true, runValidators: true } // 'new: true' returns the updated doc
                    );
                }
               
                updateData.isClosed = true;
            }
            await ElectionModel.findByIdAndUpdate(id, updateData)
        }

        res.status(200).json("Election updated successfully")

    } catch(error) {
        console.log("In error ", error.message)
        return next(new HttpError("Could not update election", 404))
    }
}


/*
* Delete Election
* DELETE : api/elections/:id
* PROTECTED(only admin)
*/
const removeElection = async (req, res, next) => {
    try {
        // only admin can add election
        if(!req.user.isAdmin) {
            return next(new HttpError("Only an admin can perform this action.", 403))
        }
        const {id} = req.params;        
        await ElectionModel.findByIdAndDelete(id);
        // delete candidates that belong to this election
        await CandidateModel.deleteMany({election: id})
        // delete votes that belong to this election
        await voteModel.deleteMany({election: id})
        res.status(200).json("Election deleted successfully")
    } catch(error) {
        console.log("In error ", error.message)
        return next(new HttpError("Could not delete election", 404))
    }
}

const getElectionsForIds = async (req, res, next) => {
    try {
        
        // Expecting an array of IDs, e.g., ["id1", "id2"]
        const { ids } = req.body; 

        // If no IDs are provided, you might want to return an error or all elections
        if (!ids || !Array.isArray(ids)) {
            return next(new HttpError("Please provide an array of Election IDs", 400));
        }

        // Use $in to find multiple IDs at once
        const elections = await ElectionModel.find({
            _id: { $in: ids }
        });

        res.status(200).json(elections); // Changed to 200 (OK)
    } catch(error) {
        console.log("In error ", error.message);
        return next(new HttpError("Could not fetch specified elections", 500));
    }
}

/*
* Delete Election
* POST : api/elections/:id
* PROTECTED(only admin)
*/
const closeElection = async (req, res, next) => {
    try {
        // only admin can add election
        if(!req.user.isAdmin) {
            return next(new HttpError("Only an admin can perform this action.", 403))
        }

        const {id} = req.params;  
        const { winnerId } = req.body;   
        // 1. Fetch current status
        const existingElection = await ElectionModel.findById(id);
        
        if (!existingElection) {
            return next(new HttpError("Election not found", 404));
        }

        // 2. Check if already closed
        if (existingElection.isClosed) {
            return next(new HttpError("This election is already closed.", 403));
        }

        
        console.log("In close election ", id);
        console.log("In close election winnerId ", winnerId);
        const winnerCandidate = await CandidateModel.findByIdAndUpdate(
            winnerId, 
            { isWinner: true }, 
            { new: true, runValidators: true} // 'new: true' returns the updated doc
        );

        
        if (!winnerCandidate) {
            return next(new HttpError("Winner candidate not found", 404));
        }
        
        const updatedElection = await ElectionModel.findByIdAndUpdate(
            id, 
            { winner: winnerId, isClosed: true}, 
            { new: true, runValidators: true } // Return updated doc & validate
        ).populate('winner');

        res.status(200).json(updatedElection);
    } catch (error){
        console.log("In error ", error.message);
        return next(new HttpError("Could not close specified election", 500));
    }
    
};

const migrateData = async () => {
    // 1. Sort all old matches by creation date
    const matches = await electionModel.find().sort({ createdAt: 1 });
   

    // 3. Set the counter to the last assigned number
    await counter.findByIdAndUpdate(
        { _id: 'electionMatchNumber' },
        { $set: { seq: matches.length } },
        { upsert: true }
    );
};


module.exports = {getElection, getElections, addElection, updateElection, 
    removeElection, getElectionCandidates, getElectionVoters, getElectionsForIds,
    getElectionCandidatesWithVotes, closeElection, migrateData}