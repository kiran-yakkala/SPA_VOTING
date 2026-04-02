const TeamModel = require('../models/teamModel')
const CandidateModel = require('../models/candidateModel')
const HttpError = require('../models/ErrorModel');
const {v4: uuid} = require("uuid")
const cloudinary = require('../utils/cloudinary')
const path = require("path")
const mongoose = require("mongoose");


/*
* get Teams
* GET : api/teams
* PROTECTED
*/
const getTeams = async (req, res, next) => {
    try {   
         console.log("in get all teams ")        
        const teams = await TeamModel.find();
        res.status(201).json(teams)
    } catch(error) {
        console.log("In error ", error.message)
        return next(new HttpError("Could not get teams", 404))
    }
}


/*
* get Teams
* GET : api/teams/:id
* PROTECTED
*/
const getTeam = async (req, res, next) => {
     try {   
         const {id} = req.params;     
         console.log("in get team by id : " , id)        
        const team = await TeamModel.findById(id);
        res.status(201).json(team)
    } catch(error) {
        console.log("In error ", error.message)
        return next(new HttpError("Could not get teams", 404))
    }
}



/*
* Add new Team
* POST : api/teams
* PROTECTED(only admin)
*/
const addTeam = async (req, res, next) => {
    try {
           
        // only admin can add election
        if(!req.user.isAdmin) {
            return next(new HttpError("Only an admin can perform this action.", 403))
        }
        console.log("in adding team body...", req.body)
        const {name, description, motto} = req.body;
        if(!name || !motto || !description) {
            
            return next(new HttpError("Fill in all fields.", 422))
        }

        console.log("in adding team file...", req.files)

        if(!req.files || !req.files.image) {
            return next(new HttpError("Choose an image.", 403))
        }

        const {image} = req.files;
        // image should be less than 1mb
        if(image.size > 1000000) {
            console.log("in adding election image.size...", thumbnail.size)
            return next(new HttpError("File size is too big. Should be less than 1 MB", 403))
        }

        // rename the image
        let fileName = image.name;
        fileName = fileName.split(".")
        fileName = fileName[0] + uuid() + "."+fileName[fileName.length - 1]
        console.log("in adding election fileName...", fileName)
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
            
            const newTeam = await TeamModel.create({
                name, motto, description, image: result.secure_url
            })

            res.status(201).json(newTeam)

        })
    } catch (error) {
        console.log("In error ", error.message)
        return next(new HttpError("Adding Team failed. Try agian later.", 422))
    }

}


/*
* update Team
* PATCH : api/teams/:id
* PROTECTED(only admin)
*/
const updateTeam = async (req, res, next) => {
    try {
        // only admin can update team
        if(!req.user.isAdmin) {
            return next(new HttpError("Only an admin can perform this action.", 403))
        }
         const {id} = req.params;        
        const {name, motto, description} = req.body;
        // 1. Fetch current status
        const existingTeam = await TeamModel.findById(id);

        if (!existingTeam) {
            return next(new HttpError("Team not found", 404));
        }
       
        if(!name || !motto || !description) {
            return next(new HttpError("Fill in all fields.", 422))
        }

        console.log("In update teams..", req.files)
        
        if(req.files && req.files.image) {    
            // thumbnail is given which is optional        

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
                const updateData = { name, motto , description, image: result.secure_url };
                await TeamModel.findByIdAndUpdate(id, updateData)

            })
           
            // save election to db
           
        } else {
            // update team to db without image
            const updateData = { name, motto, description };
            await TeamModel.findByIdAndUpdate(id, updateData)
        }

        res.status(200).json("Team updated successfully")

    } catch(error) {
        console.log("In error ", error.message)
        return next(new HttpError("Could not update Team", 404))
    }
}


/*
* Delete Team
* DELETE : api/teams/:id
* PROTECTED(only admin)
*/
const removeTeam = async (req, res, next) => {
    try {
        // only admin can delete Team
        if(!req.user.isAdmin) {
            return next(new HttpError("Only an admin can perform this action.", 403))
        }
        const {id} = req.params;        
       
        // Check if any candidate entry is using this team
        const isInUse = await CandidateModel.findOne({ team: id });

        if (isInUse) {
            return next(new HttpError("Cannot delete: This team is currently a candidate in one or more elections.", 403))
        }

        await Team.findByIdAndDelete(id);
        
        res.status(200).json("Team deleted successfully")
    } catch(error) {
        console.log("In error ", error.message)
        return next(new HttpError("Could not delete Team", 404))
    }
}

module.exports = {addTeam, getTeam, getTeams, removeTeam, updateTeam}