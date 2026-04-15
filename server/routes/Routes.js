const {Router} = require("express");
const { getDetailedVoterHistory, getElectionVotes, cleanupDuplicateVotes } = require("../controllers/voteController");
const { registerVoter, loginVoter, getVoter, getVoters, getVoterHistory } = require("../controllers/voterController");
const {getElection, getElections, addElection, updateElection, 
    removeElection, getElectionCandidates, getElectionVoters, getElectionsForIds, 
    getElectionCandidatesWithVotes, closeElection, migrateData, syncHistoricalData, syncHistoricalVoterPoints} = require("../controllers/electionController")
const {addCandidate, getCandidate, getCandidates, removeCandidate, updateCandidate} = require("../controllers/candidateController")
const {addTeam, getTeam, getTeams, removeTeam, updateTeam} = require("../controllers/teamController")
const {getNotifications, updateNotifications} = require("../controllers/notificationController")
const router = Router()
const authMiddleware = require("../middleware/authMiddleware")



router.get('/', (req, res) => {
    res.json("This actually works")
})

router.post('/voters/register', registerVoter);
router.post('/voters/login', loginVoter);
router.get('/voters/:id', authMiddleware, getVoter);
router.get('/voters', authMiddleware, getVoters);
router.get('/voter/:id/history', authMiddleware, getVoterHistory);

router.get('/votes/:id', authMiddleware, getDetailedVoterHistory);
router.get('/votes/election/:id', authMiddleware, getElectionVotes);
router.post('/votes/cleanupDuplicateVotes', authMiddleware, cleanupDuplicateVotes);


router.post('/elections', authMiddleware, addElection);
router.get('/elections', authMiddleware, getElections);
router.get('/elections/:id', authMiddleware, getElection);
router.delete('/elections/:id', authMiddleware, removeElection);
router.patch('/elections/:id', authMiddleware, updateElection);
router.get('/elections/:id/candidates', authMiddleware, getElectionCandidates);
router.get('/elections/:id/voters', authMiddleware, getElectionVoters);
router.get('/getElectionsForIds', authMiddleware, getElectionsForIds);
router.get('/elections/:id/candidates/votes', authMiddleware, getElectionCandidatesWithVotes);
router.patch('/elections/:id/close', authMiddleware, closeElection);

router.post('/candidates', authMiddleware, addCandidate);
router.get('/candidates/:id', authMiddleware, getCandidate);
router.get('/candidates', authMiddleware, getCandidates);
router.delete('/candidates/:id', authMiddleware, removeCandidate);
router.patch('/candidates/:id', authMiddleware, updateCandidate);

router.post('/teams', authMiddleware, addTeam);
router.get('/teams/:id', authMiddleware, getTeam);
router.get('/teams', authMiddleware, getTeams);
router.delete('/teams/:id', authMiddleware, removeTeam);
router.patch('/teams/:id', authMiddleware, updateTeam);

router.post('/migrate', authMiddleware, migrateData)
router.post('/syncHistoricalData', authMiddleware, syncHistoricalData)
router.post('/syncHistoricalVoterPoints', authMiddleware, syncHistoricalVoterPoints)


router.get('/notifications', authMiddleware, getNotifications)
router.patch('/notifications/readAll', authMiddleware, updateNotifications)

module.exports = router;

// https://www.youtube.com/watch?v=RB9fsVn1ag4