import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uiActions } from '../store/ui-slice';
import axios from 'axios';
import { voteActions } from '../store/vote-slice';
import { useNavigate } from 'react-router-dom';

const ConfirmVote = (selectedElection) => {
    const [modalCandidate, setModalCandidate] = useState({});

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const closeCandidateModal = () => {
        // dispatch action to close modal
        dispatch(uiActions.closeVoteCandidateModal());
    }

    // get selected candidate from redux store
    const selectedVoteCandidate = useSelector(state => state.vote.selectedVoteCandidate);
    const currentVoter = useSelector(state => state?.vote?.currentVoter)
    // get the candidates slected to be voted for from DB
    const fetchCandidate = async () => {
        try{
            const savedToken = localStorage.getItem("token")
            console.log("In getCandidate ", selectedVoteCandidate)
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/candidates/${selectedVoteCandidate}`,
                          {withCredentials: true, headers:{Authorization: `Bearer ${savedToken}`}})
            setModalCandidate(response.data)
        } catch(error){
            console.log(error)
        }
    }

    // confirm vote for selected candidate
    const confirmVote = async () => {
         try{
            const savedToken = localStorage.getItem("token")
            console.log("In confirmVote ", selectedVoteCandidate)
             console.log("In confirmVote savedToken", savedToken)
        
            const electionId = typeof selectedElection === 'object' 
                ? selectedElection.selectedElection : selectedElection;
            const response = await axios.patch(`${process.env.REACT_APP_API_URL}/candidates/${selectedVoteCandidate}`,
                            {electionId},
                            {withCredentials: true, headers:{Authorization: `Bearer ${savedToken}`}})
            const voteResult = await response.data;
            dispatch(voteActions.changeCurrentVoter({...currentVoter, votedElections: voteResult}))
            navigate('/congrats')
        } catch(error){
            console.log(error)
        }

        closeCandidateModal()
        
    }

    useEffect(() => {        
        fetchCandidate();
    },[])


    return (
        <section className="modal">
            <div className="modal__content confirm__vote-content">
                 <h5>Confirm Your Vote</h5>
                 <div className="confirm__vote-image">
                    <img src={modalCandidate.image} alt={modalCandidate.fullName} />
                 </div>
                 <h2>{modalCandidate.fullName?.length > 17 ? `${modalCandidate.fullName.substring(0, 17)}...` : modalCandidate.fullName}</h2>
                 <p>{modalCandidate.motto?.length > 45 ? `${modalCandidate.motto.substring(0, 45)}...` : modalCandidate.motto}</p>
                 <div className="confirm__vote-cta">
                    <button className="btn" onClick={closeCandidateModal}>Cancel</button>
                    <button className="btn primary" onClick={confirmVote}>Confirm</button>
                 </div>
                 
            
            </div>
           
        </section>
    )
}

export default ConfirmVote;

