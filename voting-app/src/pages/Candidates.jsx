import React, { useEffect } from 'react';  
import { useNavigate, useParams } from 'react-router-dom';
import Candidate from '../components/Candidate';
import ConfirmVote from '../components/ConfirmVote';
import { useSelector } from 'react-redux';
import axios from 'axios';

const Candidates = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  // access cnotrol
  useEffect(()=>{
    if(!token){
      navigate('/')
    }
  },[])

  const {id: selectedElection} = useParams();
  const voteCandidateModalShowing = useSelector(state => state.ui.voteCandidateModalShowing);
  const [candidates, setCandidates] = React.useState([]);
  const [canVote, setCanVote] = React.useState(true);

  const getCandidates = async() => {
    try {
      const savedToken = localStorage.getItem("token")
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/elections/
        ${selectedElection}/candidates`,
              {withCredentials: true, headers:{Authorization: `Bearer ${savedToken}`}})
        setCandidates(response.data)
    } catch(error){
      console.log(error)
    }
  }




  // check if voter has already voted
  const getVoter = async() => {
    try {
      const user = JSON.parse(localStorage.getItem("currentUser")); // Convert string to Object
      const { token, id } = user;  
      console.log("can vote id...", id)

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/voters/${id}`,
              {withCredentials: true, headers:{Authorization: `Bearer ${token}`}})
      const votedElections = await response.data.votedElections;
      console.log("can vote votedElections...", votedElections)

      if(votedElections.includes(selectedElection)){
        console.log("can vote selectedElection...", selectedElection)
        setCanVote(false);
      }
      console.log("can vote ...", canVote)
    } catch(error){
      console.log(error)
    }
  }

  useEffect(() => {
    getCandidates()
    getVoter()
  }, [])



  return (
    <>
      <section className="candidates">

      {!canVote ? 
        <header className="candidates__header">
        
          <h1>Already Voted</h1>
          <p>You are only permitted to vote only once.
            Please come back tomorrow, because you won't be allowed to vote in this match again.</p>
        
        </header>
      :  <> 
          {candidates.length > 0 ?
            <header className="candidates__header">
          
              <h1>Vote your Candidate</h1>
              <p>These are the candidates for the selected match.
              Please vote one and wisely, because you won't be allowed to vote in this match again.</p>
          
            </header>
          
          :
            <header className="candidates__header">
          
              <h1>Inactive match</h1>
              <p>These are no candidates for the selected match.
              Please check back later.</p>
          
            </header>
          }
           <div className="container candidates__container">
            {candidates.map(candidate => 
            <Candidate key={candidate._id} {...candidate} />)}
          </div>
        </>
      }
     
    </section>

    {voteCandidateModalShowing && <ConfirmVote selectedElection={selectedElection}/>}
    </>
    
  );
};

export default Candidates;