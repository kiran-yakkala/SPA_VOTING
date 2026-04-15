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
const TeamModel = require('../models/teamModel');
const notificationModel = require('../models/notificationModel');


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
        const {title, description, matchdate, matchtimeslot, teams} = req.body;
        if(!title || !description || !matchdate || !matchtimeslot) {
            
            return next(new HttpError("Fill in all fields.", 422))
        }

        console.log("in adding election file...teams ", teams)
        let teamsArray = [];
        try {
            teamsArray = typeof req.body.teams === 'string' ? JSON.parse(req.body.teams) : req.body.teams;
        } catch (e) {
            console.log("Parsing teams failed", e);
        }

        if (!teamsArray || teamsArray.length < 2) {
            return next(new HttpError("Please select at least two teams for the match.", 422));
        }

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
            
            // 1. Create the Election first (temporarily without candidates)
            const newElection = await ElectionModel.create({
                title,
                description,
                matchdate,
                matchtimeslot,
                thumbnail: result.secure_url
            });

            // 2. Create Candidate entries for each selected Team
            // teamsArray contains the IDs of the Teams selected in your dropdowns
            const candidatePromises = teamsArray.map(teamId => {
                return CandidateModel.create({
                    election: newElection._id,
                    team: teamId,
                    voteCount: 0,
                    isWinner: false
                });
            });

            const createdCandidates = await Promise.all(candidatePromises);
            const candidateIds = createdCandidates.map(c => c._id);

            // 3. Link the new Candidates back to the Election
            newElection.candidates = candidateIds;
            await newElection.save();

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
       const { id } = req.params;
        
        // 1. Get election with nested team data
        const election = await ElectionModel.findById(id.trim()).populate({
            path: 'candidates',
            populate: { path: 'team' }
        }).lean(); // .lean() converts Mongoose documents to plain JS objects

        if (!election || !election.candidates) {
            return next(new HttpError("Election or candidates not found", 404));
        }

        // 2. Flatten the data: Move team properties to the top level
        const flattenedCandidates = election.candidates.map(candidate => {
            return {
                ...candidate,
                fullName: candidate.team?.name || "Unknown Team",
                image: candidate.team?.image || "",
                motto: candidate.team?.motto || "",
                // Keep the team object if you need other hidden fields later
            };
        });

        console.log("Flattened Candidates for Frontend:", flattenedCandidates);
        res.status(200).json(flattenedCandidates);
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
        if (!req.user.isAdmin) {
            return next(new HttpError("Only an admin can perform this action.", 403));
        }

        const { id } = req.params;
        const { title, description, winnerId, matchdate, matchtimeslot } = req.body;

        const existingElection = await ElectionModel.findById(id);
        if (!existingElection) {
            return next(new HttpError("Election not found", 404));
        }

        if (existingElection.isClosed) {
            return next(new HttpError("This election is already closed and cannot be modified.", 403));
        }

        // FIXED: Added ! to matchdate and matchtimeslot validation
        if (!title || !description || !matchdate || !matchtimeslot) {
            return next(new HttpError("Fill in all fields.", 422));
        }

        let updateData = { title, description, matchdate, matchtimeslot };

        // Handle Image Upload if provided
        if (req.files && req.files.thumbnail) {
            const { thumbnail } = req.files;
            if (thumbnail.size > 1000000) {
                return next(new HttpError("File size is too big. Should be less than 1 MB", 403));
            }

            let fileName = thumbnail.name;
            const extension = fileName.split(".").pop();
            fileName = fileName.split(".")[0] + uuid() + "." + extension;

            const uploadPath = path.join(__dirname, "..", "uploads", fileName);
            await thumbnail.mv(uploadPath);

            const result = await cloudinary.uploader.upload(uploadPath, { resource_type: "image" });
            if (!result.secure_url) {
                return next(new HttpError("Could not upload image to cloudinary", 422));
            }
            updateData.thumbnail = result.secure_url;
        }

        // Handle Closing the Election (Winner / No Result)
        if (winnerId) {
            updateData.isClosed = true;
            if (winnerId === 'NR') {
                updateData.noresult = true;
                updateData.winner = null;
            } else {
                // FIXED: Use findByIdAndUpdate for correct ID handling and execution
                const winnerCandidate = await CandidateModel.findByIdAndUpdate(
                    winnerId,
                    { isWinner: true },
                    { new: true, runValidators: true }
                );
                
                if (!winnerCandidate) {
                    return next(new HttpError("Winner candidate not found", 404));
                }
                updateData.winner = winnerId;
                updateData.noresult = false;
            }
        }

        const updatedElection = await ElectionModel.findByIdAndUpdate(id, updateData, { new: true });

        res.status(200).json({ message: "Election updated successfully", election: updatedElection });


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
        // only admin can close election
        if(!req.user.isAdmin) {
            return next(new HttpError("Only an admin can perform this action.", 403))
        }

        const {id} = req.params;  
        const { winnerId } = req.body;   
        // 1. Fetch current status
       const existingElection = await ElectionModel.findById(id).populate({
            path: 'candidates',
            populate: { path: 'team' } // This fetches the actual Team document for each candidate
        });
        
        if (!existingElection) {
            return next(new HttpError("Election not found", 404));
        }

        // 2. Check if already closed
        if (existingElection.isClosed) {
            return next(new HttpError("This election is already closed.", 403));
        }

        
        console.log("In close election ", id);
        console.log("In close election winnerId ", winnerId);

        // const matchName = existingElection.title;
        // // Format date to a readable string (e.g., "Apr 15, 2026")
        // const matchDate = new Date(existingElection.matchdate).toLocaleDateString('en-IN', {
        //     day: 'numeric',
        //     month: 'short',
        //     year: 'numeric'
        // });

        // const allVotes = await voteModel.find({ election: id });
        // if (allVotes.length === 0) { /* handle no-participation case */ }
        // let voterCount = allVotes.length;
        // if (voterCount !== 6) {
        //     console.log("allVotes.length is not equal to 6 ", allVotes.length);
        //     voterCount = 6;
        // }
        // const totalPool = allVotes.length * 50;
        // let winners = [];
        // let share = 50;
        // let message = "";
        // let netEarnings = 0;

       let winnerValue = null;
        let noResultValue = false;

        // 1. Handle "No Result" Logic
        if (winnerId === "NR") {
            noResultValue = true;
            winnerValue = null;
             // Extract all unique team IDs from the election candidates
            for (let candidate of existingElection.candidates) {
                if (candidate.team) {
                    await TeamModel.findByIdAndUpdate(candidate.team._id, {
                        $inc: { played: 1, points: 1 },
                        $set: { lastfive: updateForm(candidate.team.lastfive, 'NR') } // 'D' for Draw/NR
                    });
                }
            }

            // NR Logic: Everyone who participated gets 50 points back
            // winners = allVotes.map(v => v.voter);
            // netEarnings = share;
            // message = `Match: ${matchName} (${matchDate}) ended in No Result. 50 points have been refunded.`;

        } else if (winnerId) {
            // 2. Identify Winner and Loser Candidates from the election
            const winnerCand = existingElection.candidates.find(c => c._id.toString() === winnerId);
            const loserCand = existingElection.candidates.find(c => c._id.toString() !== winnerId);

            if (!winnerCand) return next(new HttpError("Winner candidate not found", 404));

            // Update Winner Candidate & Team
            await CandidateModel.findByIdAndUpdate(winnerId, { isWinner: true });
            await TeamModel.findByIdAndUpdate(winnerCand.team._id, {
                $inc: { played: 1, won: 1, points: 2 }, // Assuming 3 points for a win
                $set: { lastfive: updateForm(winnerCand.team.lastfive, 'W') } 
            });

            // Update Loser Team (if exists)
            if (loserCand) {
                await TeamModel.findByIdAndUpdate(loserCand.team._id, {
                    $inc: { played: 1, lost: 1 },
                    $set: { lastfive: updateForm(loserCand.team.lastfive, 'L') }
                });
            }
            winnerValue = winnerId;

             // Winner Logic: Only those who picked the winner split the pool
            // const winningVotes = allVotes.filter(v => v.candidate.toString() === winnerId);
            // if (winningVotes.length > 0) {
            //     console.log("winner updating. length...", winningVotes.length)
            //     winners = winningVotes.map(v => v.voter);
            //     // 2. Calculate the total share from the pool
            //     const totalShare = Math.floor(totalPool / winners.length);
                
            //     // 3. Subtract the initial 50 points stake to get net earnings
            //     netEarnings = totalShare - share; 

            //     // 4. Update the message 
            //     message = `Congrats! You picked the winner for ${matchName} (${matchDate}). Earned: ${netEarnings} pts (Total Share: ${share} pts).`;

            // }
        }

        // 3. Update Election with Winner and NoResult status
        const updatedElection = await ElectionModel.findByIdAndUpdate(
            id,
            { 
                winner: winnerValue, 
                isClosed: true, 
                noresult: noResultValue 
            },
            { new: true, runValidators: true }
        ).populate({
            path: 'winner',
            populate: { path: 'team' } // Deep populate to get the Team name/image
        });

        // 4. Flatten the response for the frontend (optional but consistent)
        const responseData = updatedElection.toObject();
        if (responseData.winner && responseData.winner.team) {
            responseData.winningCandidateName = responseData.winner.team.name;
        }

        // 5. Trigger Global Re-ranking
        await updateGlobalRankings();

        await distributeMatchPoints(id, winnerId);

        //6. Update Points for all winners and add notifications
        // if (winners.length > 0) {
        //     // 
        //     await voterModel.updateMany(
        //         { _id: { $in: winners } },
        //         { 
        //             $inc: { 
        //                 points: share, 
        //                 netEarnings: netEarnings 
        //             } 
        //         }
        //     );

            
        //     const notifications = winners.map(voterId => ({
        //         voter: voterId,
        //         message: message
        //     }));
        //     await notificationModel.insertMany(notifications);
        // }

        res.status(200).json(responseData);
    } catch (error){
        console.log("In error ", error.message);
        return next(new HttpError("Could not close specified election", 500));
    }
    
};

// Helper to manage the "lastfive" string with hyphens (e.g., "W-W-D-L-W")
const updateForm1 = (currentForm = "", result) => {
    // 1. Remove existing hyphens and split into an array of characters
    let formArray = currentForm.replace(/-/g, '').split('');
    
    // 2. Add the newest result ('W', 'L', or 'D') to the front
    formArray.unshift(result);
    
    // 3. Keep only the 5 most recent results and join with a hyphen
    return formArray.slice(0, 5).join('-');
};

const updateForm = (currentForm = "", result) => {
    // 1. Split by hyphen to handle multi-character strings like "NR"
    // Filter out empty strings in case the initial value is empty
    let formArray = currentForm ? currentForm.split('-').filter(item => item !== "") : [];
    
    // 2. Add the newest result ("W", "L", or "NR") to the front
    formArray.unshift(result);
    
    // 3. Keep only the 5 most recent results and join back with hyphens
    return formArray.slice(0, 5).join('-');
};

// HELPER: Re-calculate ranking for all teams
const updateGlobalRankings = async () => {
    // Sort by points (descending), then by won (descending) as tie-breaker
    const teams = await TeamModel.find().sort({ points: -1, won: -1 });
    
    const rankUpdates = teams.map((team, index) => {
        return TeamModel.findByIdAndUpdate(team._id, { ranking: index + 1 });
    });

    await Promise.all(rankUpdates);
};

const distributeMatchPoints = async (electionId, winnerId) => {
    try {

        // 1. Fetch Election details to get Name and Date
        const election = await electionModel.findById(electionId);
        if (!election) return;

        const matchName = election.title;
        // Format date to a readable string (e.g., "Apr 15, 2026")
        const matchDate = new Date(election.matchdate).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });

        // 2. Get all participants
        const allVotes = await voteModel.find({ election: electionId });
        if (allVotes.length === 0) return;

        const totalPool = allVotes.length * 50;
        let winners = [];
        let share = 50;
        let netEarnings = 0;
        let message = "";

        if (winnerId === "NR") {
            // Split equally (Refund 50 points each)
            winners = allVotes.map(v => v.voter);
            netEarnings = share;
            message = `Match: ${matchName} (${matchDate}) ended in No Result. 50 points have been refunded.`;
            await voterModel.updateMany(
                { _id: { $in: winners } },
                { 
                    $inc: { 
                        points: share,     
                    } 
                }
            );

            // 3. Create notifications for all winners/participants
            const notifications = winners.map(voterId => ({
                voter: voterId,
                message: message
            }));
            await notificationModel.insertMany(notifications);
        } else {
            // Split pool among correct voters
            const winningVotes = allVotes.filter(v => v.candidate.toString() === winnerId);
            const losingVotes = allVotes.filter(v => v.candidate.toString() !== winnerId);

            if (winningVotes.length > 0) {
                winners = winningVotes.map(v => v.voter);
                // 2. Calculate the total share from the pool
                const totalShare = Math.floor(totalPool / winners.length);
                
                // 3. Subtract the initial 50 points stake to get net earnings
                
                netEarnings = totalShare - share; 

                // 4. Enhanced message for Winners
                message = `Congrats! You picked the winner for ${matchName} (${matchDate}). Earned: ${netEarnings} pts (Total Share: ${share} pts).`;

                await voterModel.updateMany(
                    { _id: { $in: winners } },
                    { $inc: { points: share, netEarnings: netEarnings  } }
                );

                // 3. Create notifications for all winners/participants
                const notifications = winners.map(voterId => ({
                    voter: voterId,
                    message: message
                }));
                await notificationModel.insertMany(notifications);

            }

            if (losingVotes.length > 0) {
                const losers = losingVotes.map(v => v.voter);
                if(losingVotes.length === allVotes.length) {
                    netEarnings = 0; 
                    //  Enhanced message for Losers
                    message = `Your pick for ${matchName} (${matchDate}) lost. Your profit has decreased by 0 pts.`;
                } else {
                    netEarnings = -50; 
                    //  Enhanced message for Losers
                    message = `Your pick for ${matchName} (${matchDate}) lost. Your profit has decreased by 50 pts.`;
                }         
               

                // Losers get 50 points (refunded to balance) 
                // BUT we subtract 50 from netShare to record the loss
                await voterModel.updateMany(
                    { _id: { $in: losers } },
                    { 
                        $inc: { 
                            points: share,       // Keep the refund if you want them to keep their balance
                            netEarnings: netEarnings     // Subtract 50 to track the loss
                        } 
                    }
                );

                // 3. Create notifications for all winners/participants
                const notifications = winners.map(voterId => ({
                    voter: voterId,
                    message: message
                }));
                await notificationModel.insertMany(notifications);
            }           
        }       

    } catch (error) {
        console.error("Error distributing points:", error);
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

const syncHistoricalData = async () => {
    try {
        // 1. Reset all teams to 0 stats before recalculating
        await TeamModel.updateMany({}, {
            played: 0, won: 0, lost: 0, points: 0, lastfive: ""
        });

        // 2. Fetch all closed elections
        const closedElections = await ElectionModel.find({ isClosed: true }).populate('candidates');

        for (const election of closedElections) {
            const { winner, noresult, candidates } = election;

            if (noresult) {
                // NR Logic: +1 point, +1 played for all participating teams
                for (const cand of candidates) {
                    const team = await TeamModel.findById(cand.team);
                    if (team) {
                        await TeamModel.findByIdAndUpdate(team._id, {
                            $inc: { played: 1, points: 1 },
                            $set: { lastfive: updateForm(team.lastfive, 'NR') }
                        });
                    }
                }
            } else if (winner) {
                // Win/Loss Logic
                const winnerCand = candidates.find(c => c._id.toString() === winner.toString());
                const loserCand = candidates.find(c => c._id.toString() !== winner.toString());

                if (winnerCand) {
                    const winTeam = await TeamModel.findById(winnerCand.team);
                    await TeamModel.findByIdAndUpdate(winnerCand.team, {
                        $inc: { played: 1, won: 1, points: 2 },
                        $set: { lastfive: updateForm(winTeam.lastfive, 'W') }
                    });
                }

                if (loserCand) {
                    const loseTeam = await TeamModel.findById(loserCand.team);
                    await TeamModel.findByIdAndUpdate(loserCand.team, {
                        $inc: { played: 1, lost: 1 },
                        $set: { lastfive: updateForm(loseTeam.lastfive, 'L') }
                    });
                }
            }
        }

        // 3. Recalculate rankings once all matches are processed
        await updateGlobalRankings();

        console.log("Historical data synced successfully.");
    } catch (error) {
        console.log("In error Sync failed", error.message);
    }
};

const syncHistoricalVoterPoints = async (req, res, next) => {
    try {
        // 1. Reset everyone to 0
        await voterModel.updateMany({}, { points: 0, netEarnings: 0 });

        // 2. Delete ALL existing notifications to start fresh
        await notificationModel.deleteMany({});
        console.log("Existing notifications cleared.");

        // 2. Fetch all closed elections
        const elections = await electionModel.find({ isClosed: true });

        for (const election of elections) {
            // Reuse the helper logic for each match
            await distributeMatchPoints(election._id, election.winner ? election.winner.toString() : "NR");
        }

        res.status(200).json({ message: "Voter points and netShare synced with historical results." });
    } catch (error) {
        return next(new HttpError("Sync failed: " + error.message, 500));
    }
};


module.exports = {getElection, getElections, addElection, updateElection, 
    removeElection, getElectionCandidates, getElectionVoters, getElectionsForIds,
    getElectionCandidatesWithVotes, closeElection, migrateData, syncHistoricalData, syncHistoricalVoterPoints}