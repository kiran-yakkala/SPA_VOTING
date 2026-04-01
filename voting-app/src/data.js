import Thumbnail1 from './assets/flag1.jpg';
import Thumbnail2 from './assets/flag2.jpg';
import Thumbnail3 from './assets/flag3.png';
import Candidate1 from './assets/candidate1.jpg';
import Candidate2 from './assets/candidate2.jpg';
import Candidate3 from './assets/candidate3.jpg';
import Candidate4 from './assets/candidate4.jpg';
import Candidate5 from './assets/candidate5.jpg';
import Candidate6 from './assets/candidate6.jpg';
import Candidate7 from './assets/candidate7.jpg';


export const elections = [
    {
        id : "e1",
        title : "Presidential Election 2024",
        description : "Vote for your favorite candidate in the upcoming presidential election.",    
        thumbnail : Thumbnail1,
        candidates : ["c1", "c2", "c3", "c4"],
        voters : []  
    },
    {
        id : "e2",
        title : "Legan SRCPresidential Election 2024",
        description : "Vote for your favorite candidate in the upcoming presidential election.",    
        thumbnail : Thumbnail2,
        candidates : ["c5", "c6", "c7"],
        voters : []  
    },
    {
        id : "e3",
        title : "Stanford Presidential Election 2024",
        description : "Vote for your favorite candidate in the upcoming presidential election.",    
        thumbnail : Thumbnail3,
        candidates : [],
        voters : []  
    }
]



export const candidates = [
    {
        id : "c1",
        fullName : "Candidate 1",
        image : Candidate1,
        motto:"Make America Great Again",
        voteCount: 23,
        election: "e1"
    },
    {
        id : "c2",
        fullName : "Candidate 2",
        image : Candidate2,
        motto:"Make America Great Again",
        voteCount: 15,
        election: "e1"
    },
    {
        id : "c3",
        fullName : "Candidate 3",
        image : Candidate3,
        motto:"Make America Great Again",
        voteCount: 14,
        election: "e1"
    },
    {
        id : "c4",
        fullName : "Candidate 4",
        image : Candidate4,
        motto:"Make America Great Again",
        voteCount: 25,
        election: "e1"
    },
    {
        id : "c5",
        fullName : "Candidate 5",
        image : Candidate5,
        motto:"Make America Great Again",
        voteCount: 12,
        election: "e2"
    },{
        id : "c6",
        fullName : "Candidate 6",
        image : Candidate6,
        motto:"Make America Great Again",
        voteCount: 5,
        election: "e2"
    },
    {
        id : "c7",
        fullName : "Candidate 7",
        image : Candidate7,
        motto:"Make America Great Again",
        voteCount: 11,
        election: "e2"
    },

]



export const voters = [
    {
        id : "v1",
        fullName : "Admin User",
        email : "admin@gmail.com",
        password : "admin123",
        votedElections : ["e1", "e2"],
        isAdmin : true
    },
    {
        id : "v2",
        fullName : "Voter 2",
        email : "voter2@gmail.com",
        password : "voter2123",
        votedElections : ["e3", "e4"],
        isAdmin : false
    },
    {
        id : "v3",
        fullName : "Voter 3",
        email : "voter3@gmail.com",
        password : "voter3123",
        votedElections : ["e5", "e6"],
        isAdmin : false
    },
    {
        id : "v4",
        fullName : "Voter 4",
        email : "voter4@gmail.com",
        password : "voter4123",
        votedElections : [],
        isAdmin : false
    }
]

