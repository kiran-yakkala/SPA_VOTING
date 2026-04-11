import React, { useEffect, useState } from 'react'; 
import {useNavigate, useParams} from 'react-router-dom';
import ElectionCandidate from '../components/ElectionCandidate';
import {IoMdAdd} from 'react-icons/io';
import {uiActions} from '../store/ui-slice';
import {voteActions} from '../store/vote-slice';
import {useDispatch, useSelector} from 'react-redux';
import AddCandidateModal from '../components/AddCandidateModal';
import axios from 'axios';
import VotersTable from '../components/VotersTable';

const ElectionDetails = () => {
  
  const {id} = useParams()
  const dispatch = useDispatch();
  const [currentElection, setCurrentElection] = useState([]);
  const [electionCandidates, setElectionCandidates] = useState([]);
  const [voters, setVoters] = useState([]);
  const [isAdmin, setIsAdmin] = React.useState([]);
  const [electionVotes, setElectionVotes] = React.useState([]);
  
  
  const addCandidateModalShowing = useSelector(state => state.ui.addCandidateModalShowing);
  const navigate = useNavigate();

  const openModal = () => {
    dispatch(uiActions.openAddCandidateModal());
    dispatch(voteActions.changeAddCandidateElectionId(id))
  }

  const getElection = async() => {
    
    try {
       const savedToken = localStorage.getItem("token")
       const response = await axios.get(`${process.env.REACT_APP_API_URL}/elections/${id}`,
                                {withCredentials: true, 
                                    headers: {
                                        'Authorization': `Bearer ${savedToken}` // Required for FormData
                                    }
                                })
        const election = await response.data;
        setCurrentElection(election)
        
    } catch(error) {
      console.log(error)
    }
    
  }

  const getCandidates = async() => {
    
    try {
       const savedToken = localStorage.getItem("token")
       const response = await axios.get(`${process.env.REACT_APP_API_URL}/elections/${id}/candidates`,
                                {withCredentials: true, 
                                    headers: {
                                        'Authorization': `Bearer ${savedToken}` // Required for FormData
                                    }
                                })
        
        const electionCandidates = await response.data;
        setElectionCandidates(electionCandidates)
        console.log("electionCandidates details..", electionCandidates)
    } catch(error) {
      console.log(error)
    }
    
  }

  const getVoters = async() => {
    
    try {
       const savedToken = localStorage.getItem("token")
       const response = await axios.get(`${process.env.REACT_APP_API_URL}/elections/${id}/voters`,
                                {withCredentials: true, 
                                    headers: {
                                        'Authorization': `Bearer ${savedToken}` // Required for FormData
                                    }
                                })
        setVoters(await response.data)
    } catch(error) {
      console.log(error)
    }
    
  }

  const getVotes = async() => {

  try{
    const savedToken = localStorage.getItem("token")
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/votes/election/${id}`,
            {withCredentials: true, headers:{Authorization: `Bearer ${savedToken}`}})
           
    const votes = await response.data;
    setElectionVotes(votes)

    console.log("elcetin votes in result... ", votes)

   
    
  } catch(error) {
    console.log(error)
  }
}

  const deleteElection = async() => {
    try {
       const savedToken = localStorage.getItem("token")
       await axios.delete(`${process.env.REACT_APP_API_URL}/elections/${id}`,
                                {withCredentials: true, 
                                    headers: {
                                        'Authorization': `Bearer ${savedToken}` // Required for FormData
                                    }
                                })
        navigate('/elections')
    } catch(error) {
      console.log(error)
    }
  }

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser")); // Convert string to Object
      const { token, isAdmin } = user; 
    if(token){
      setIsAdmin(isAdmin)
      getElection()
      getCandidates()
      getVoters()
      getVotes()
    } else {
      navigate('/')
    }
  }, [])

  return (
    <>
      <section className="electionDetails">
      <div className='container electionDetails__container'>
        <h2>{currentElection.title}</h2>
        <p>{currentElection.description}</p>
        <div className='electionDetails__image'>
          <img src={currentElection.thumbnail} alt={currentElection.title}/>
        </div>

        <menu className='electionDetails__candidates'>
          {
            electionCandidates.map(candidate => 
             <ElectionCandidate key={candidate.id}
                   {...candidate} 
                   hasVotes={electionVotes.length > 0} />)
          }
          {isAdmin && !currentElection.isClosed && electionCandidates.length < 2 && <button className="add__candidate-btn"
                  onClick = {openModal}><IoMdAdd /></button> }
        </menu>
        <VotersTable/>
        {isAdmin && voters.length === 0 && <button className="btn danger full"
                  onClick = {deleteElection}>Delete Election</button> }
        </div>
      </section>

      {addCandidateModalShowing && <AddCandidateModal/>}
    </>
    
  )
};

export default ElectionDetails;