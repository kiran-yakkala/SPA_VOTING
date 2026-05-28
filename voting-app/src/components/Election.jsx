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
    const [timeLeft, setTimeLeft] = React.useState("");
    const [isVotingOpen, setIsVotingOpen] = React.useState(true);
    const [isUrgent, setIsUrgent] = React.useState(false);
console.log("is next... ", isNext);
    // 1. Get today's date as a string (e.g., "2023-10-27")
    const today = new Date().toLocaleDateString('en-CA')
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
        }// --- NEW TIMER LOGIC ---
        const cutoff = getVotingCutoff(matchdate, matchtimeslot);
        
        const timer = setInterval(() => {
            const now = new Date();
            const difference = cutoff - now;

            if (difference <= 0) {
                setTimeLeft("Voting Closed");
                setIsVotingOpen(false);
                setIsUrgent(false);
                clearInterval(timer);
            } else {
                 // Calculate days, hours, minutes, and seconds
                const d = Math.floor(difference / (1000 * 60 * 60 * 24));
                const h = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const m = Math.floor((difference / (1000 * 60)) % 60);
                const s = Math.floor((difference / 1000) % 60);
                
                // Build the string dynamically
                // HIDE if more than 2 days away
                if (d >= 2) {
                    setTimeLeft(""); 
                    setIsUrgent(false);
                } else {
                  // THRESHOLDS
                      const isUnderOneHour = difference < 3600000;   // 1 Hour
                      const isUnderOneDay = difference < 43200000;    // 12 Hours
                      
                      setIsUrgent(isUnderOneDay); // Red/Flash styling starts at 24h

                      let statusMessage = "";
                      if (isUnderOneHour) {
                          statusMessage = "⚡ FINAL CALL: ";
                      } else if (isUnderOneDay) {
                          statusMessage = "⏰ Closing Soon: ";
                      }

                      const dayDisplay = d > 0 ? `${d}d ` : "";
                      const hourDisplay = (h > 0 || d > 0) ? `${h}h ` : "";
                      
                      setTimeLeft(`${statusMessage}${dayDisplay}${hourDisplay}${m}m ${s}s left`);
                }
                setIsVotingOpen(true);
            }
        }, 1000);

        return () => clearInterval(timer); // Cleanup on unmount
    }, [matchdate, matchtimeslot, winner]); // Added dependencies

    const getVotingStatus = (matchDate, matchTimeSlot) => {
      try {
          // Extract "07:30 PM" from "Evening (07:30 PM)"
          const timePart = matchTimeSlot.match(/\(([^)]+)\)/)[1]; 
          
          // Create a date string for the match: "2026-03-28 07:30 PM"
          const matchDateTimeStr = `${matchDate.split('T')[0]} ${timePart}`;
          const matchDateTime = new Date(matchDateTimeStr);

          // Cutoff is 5 minutes before match start
          const cutoffTime = new Date(matchDateTime.getTime() - 5 * 60000);
          
          return new Date() < cutoffTime; // Returns true if voting is still allowed
      } catch (e) {
          return false; // Fail-safe: close voting if parsing fails
      }
    };

    const getVotingCutoff = (matchDate, matchTimeSlot) => {
    try {
        const timePart = matchTimeSlot.match(/\(([^)]+)\)/);
        if (!timePart || !timePart[1]) return null;
        
        // Extract only the YYYY-MM-DD part from the ISO string
        const dateStr = matchDate.split('T')[0]; 
        
        // Construct a full date string: "2026-03-28 07:30 PM"
        const matchDateTime = new Date(`${dateStr} ${timePart[1]}`);
        
        // Return the cutoff time (5 mins before)
        return new Date(matchDateTime.getTime() - 5 * 60000);
    } catch (e) {
        return null;
    }
};

     // 2. NEW VOTING STATUS LOGIC
    // Place it here, just before the return
    const votingOpen = getVotingStatus(matchdate, matchtimeslot);
    
  return (
    <>
        <article className={`election ${!isClosed && isTodayMatch ? 'election--today' : isNext ? 'election--next' : ''}`}>
        <div className='election__image'>
                <img src={thumbnail} alt={title}/>
                {/* Priority 1: Today's Match */}
                {!isClosed && isTodayMatch && (
                    <div className="match-badge today-badge glow-animation">
                        Today's Match
                    </div>
                )}

                {/* Priority 2: Next Match (Only show if it's NOT today) */}
                {!isTodayMatch && isNext && (
                    <div className="match-badge next-badge">
                        Next Match
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
                        {/* Show timer only if voting is open and they haven't voted yet */}
                    {canVote && isVotingOpen && timeLeft.length > 0 && (
                        <span className={`countdown-text 
                            ${isUrgent ? 'countdown-urgent' : ''} 
                            ${timeLeft.includes('FINAL') ? 'final-call-style' : ''}`}>
                            {timeLeft}
                        </span>
                    )}

                     {true ? (
                            /* TIMER IS OPEN: Voter can Vote or Change Vote */
                            <Link to={`/elections/${id}/candidates`} className='btn sm'>
                                {canVote ? "Vote Match" : "Change Vote"}
                            </Link>
                        ) : (
                            /* TIMER IS CLOSED: No more voting for regular users */
                            <>
                                    <button className="btn sm btn-disabled" disabled>Voting Closed</button>
                            </>
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
