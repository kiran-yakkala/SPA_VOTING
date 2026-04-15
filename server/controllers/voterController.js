const VoterModel = require('../models/voterModel')
const HttpError = require('../models/ErrorModel');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken")
const electionModel = require('../models/electionModel');



/*
* Register new voter
* POST : api/voters/register
* UNPROTECTED
*/
const registerVoter = async (req, res, next) => {
    
    try {
        const {fullName, email, password, password2} = req.body;
         console.log("req data", req.body)

        if(!fullName || !email || !password || !password2) {
            return next(new HttpError("Fill in all fields", 422))
        }
console.log("before email check")
        // make all email lower
        const newEmail = email.toLowerCase();

        const voter = await VoterModel.findOne({email: newEmail})
        console.log(voter)

        // check if the email already exists in db
        const emailExists = await VoterModel.findOne({email: newEmail})
        if(emailExists) {
            console.log(" email exists")
            return next(new HttpError("Email already exists", 422)) 
        }
        console.log("before password length")
        // make sure password is 6+ chars
        if((password.trim().length) < 6) {
                 console.log("inside password length")
            return next(new HttpError("Password should be atleast 6 characters", 422))
        }
             console.log("after password length")
        // make sure password and confirm password ar same
        if(password != password2) {
            console.log("inside password check")
            return next(new HttpError("Passwords do not match", 422))
        }
                console.log("after password check")
        // hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        // no user/voter should be admin except for one with email "admin@gmail.com"
        console.log("after password hash")
        let isAdmin = false;
        if(newEmail == "admin@gmail.com"){
            isAdmin = true;
        }
console.log("before saving" , hashedPassword, isAdmin, fullName, newEmail)
        // save new voter to db
        const newVoter = await VoterModel.create({fullName, email:newEmail, 
            password: hashedPassword, isAdmin})
console.log("After saving")
        res.status(201).json(`New Voter ${fullName} created`)
        
    } catch(error) {
        console.log("In error ", error.message)
        return next(new HttpError("Voter registration failed", 422))
    }
}



// function to generate token
const generateToken = (payload) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "1d"})
    return token;
}



/*
* Login new voter
* POST : api/voters/login
* UNPROTECTED
*/
const loginVoter = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        if(!email || !password) {
            return next(new HttpError("Fill in all fields.", 422))
        }

        const newEmail = email.toLowerCase()
        const voter = await VoterModel.findOne({email:newEmail})
        if(!voter) {
             return next(new HttpError("Invalid credentials.", 422))
        }

        // compare passwords
        const comparePass = await bcrypt.compare(password, voter.password)
        if(!comparePass) {
             return next(new HttpError("Invalid credentials.", 422))
        }

        // generate token
        const {id: id, isAdmin, votedElections, fullName, emaila, points, netEarnings} = voter;
        const token = generateToken({id, isAdmin})

        res.status(201).json({token, id, votedElections, isAdmin, fullName, email, points, netEarnings})
    } catch(error) {
        console.log("In error ", error.message)
        return next(new HttpError("Login failed. Please check credentials or try agian later.", 422))
    }
}

/*
* Login new voter
* GET : api/voters/:id
* PROTECTED
*/
const getVoter = async (req, res, next) => {
    try {
        const {id} = req.params;
        console.log("In getVoter ", id)
        const voter = await VoterModel.findById(id.trim()).select("-password")
        

        res.status(201).json(voter)
    } catch(error) {
        console.log("In error ", error.message)
        return next(new HttpError("Could not get voter", 404))
    }
}

/*
* get all voters
* GET : api/voters
* PROTECTED
*/
const getVoters = async (req, res, next) => {
    try {       
        const voters = await VoterModel.find().select("-password")
        res.status(201).json(voters)
    } catch(error) {
        console.log("In error ", error.message)
        return next(new HttpError("Could not get all voters", 404))
    }
}

const getVoterHistory = async (req, res, next) => {
    const { id } = req.params; // Or req.query
console.log(id)
    try {
        
        // Find elections where this voterId exists in the 'voters' array
        const votedElections = await electionModel.find({ 
            voters: id
        })
        .populate('candidates') // Optional: show who the candidates were
        .sort({ createdAt: -1 }); // Optional: newest first

        if (!votedElections || votedElections.length === 0) {
            return res.status(200).json([]); // Return empty array if no votes found
        }

        res.status(200).json(votedElections);
    } catch (error) {
        console.error("Error fetching voter history:", error.message);
        return next(new HttpError("Could not retrieve voting history.", 500));
    }
};



module.exports = {registerVoter, loginVoter, getVoter, getVoters, getVoterHistory}

