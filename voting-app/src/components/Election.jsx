import React, { useEffect } from 'react';  
import { Link } from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {uiActions} from '../store/ui-slice';
import {voteActions} from '../store/vote-slice';
import axios from 'axios';
import CloseElectionModal from './CloseElectionModal';
import {getOrdinalDate} from './util'


const Election = ({ election, isNext }) => {
    const { _id: id, title, description, thumbnail, isClosed, winner, matchdate, matchtimeslot, noresult } = election;
    const dispatch = useDispatch();
    const [isAdmin, setIsAdmin] = React.useState([]);
    const [winningCandidate, setWinningCandidate] = React.useState([])
    const [canVote, setCanVote] = React.useState(true);
    const openCloseElectionModalShowing = useSelector(state => state.ui.closeElectionModalShowing);

    // 1. Get today's date as a string (e.g., "2023-10-27")
    const today = new Date().toISOString().split('T')[0];
    // 2. Format the match's date the same way
    const matchDay = new Date(matchdate).toISOString().split('T')[0];
    // 3. Compare only the date strings
    const isTodayMatch = today === matchDay;

    // Open update election modal
    const openModal = () => {
        dispatch(uiActions.openUpdateElectionModal())
        dispatch(voteActions.changeIdOfElectionToUpdate(id))
    }

     // Open update election modal
    const openCloseElectionModal = () => {
        dispatch(uiActions.openElectionCloseModal())
        dispatch(voteActions.changeIdOfElectionToUpdate(id))
    }

    // check if voter has already voted
      const getVoter = async() => {
        try {
          const user = JSON.parse(localStorage.getItem("currentUser")); // Convert string to Object
          const { token, id: voterId } = user;  
    
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/voters/${voterId}`,
                  {withCredentials: true, headers:{Authorization: `Bearer ${token}`}})
          const votedElections = await response.data.votedElections;
    
          if(votedElections && votedElections.includes(id)){
            setCanVote(false);
          }
        } catch(error){
          console.log(error)
        }
      }

      const getWinningCandidate = async() => {
        try {
          const user = JSON.parse(localStorage.getItem("currentUser")); // Convert string to Object
          const { token } = user; 
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/candidates/${winner}`,
                  {withCredentials: true, headers:{Authorization: `Bearer ${token}`}})
          const winningCandidate = await response.data;

          setWinningCandidate(winningCandidate);
          
        } catch(error){
          console.log(error)
        }
      }
    
    useEffect(() =>{
        const user = JSON.parse(localStorage.getItem("currentUser")); // Convert string to Object
        const { isAdmin } = user; 
        setIsAdmin(isAdmin)
        getVoter()
        if(winner) {
          getWinningCandidate()
        }
    },[])

  return (
    <>
        <article className={`election ${isTodayMatch ? 'election--next' : ''}`}>
        <div className='election__image'>
                <img src={thumbnail} alt={title}/>
                {/* --- ADD THE NEXT LABEL HERE --- */}
                {isTodayMatch  && (
                    <div className="next-match-badge glow-animation">
                        Todays MATCH
                    </div>
                )}
            </div>
        
        <div className='election__info'>
            <Link to={`/elections/${id}`}><h4>{title}</h4></Link>
            <p>{description?.length > 255 ? description?.substring(0, 255) + '...' : description}</p>
            <p>{getOrdinalDate(matchdate)} - {matchtimeslot}</p>
            {isClosed && (
                    <div className="election__winner-box">
                        <div className="winner-display-row">
                          <span className="winner-label">🏆 Winner:</span>
                          <h5 className="winner-name"> 
                              {noresult ? "No Result" : winningCandidate?.fullName || "Results Pending"}
                          </h5>
                      </div>
                    </div>
            )}
            <div className='election__cta'>
                {!canVote && <Link to={`/elections/${id}`} className='btn sm'>View Votes</Link>}
                {!isClosed && <>
                 {canVote ? (
                    <Link to={`/elections/${id}/candidates`} className='btn sm'>
                      Vote Match
                    </Link>
                  ) : (
                    <button className='btn sm btn-disabled' disabled={true}>
                      Already Voted
                    </button>
                  )}
                  {isAdmin && <button className='btn sm primary' onClick={openCloseElectionModal}>Close Match</button>}
                  {isAdmin && <button className='btn sm primary' onClick={openModal}>Edit</button>}
                </>}
            </div>
        </div>
        </article>  
        {openCloseElectionModalShowing && <CloseElectionModal/>}
    </>
    
    )
}

export default Election;
