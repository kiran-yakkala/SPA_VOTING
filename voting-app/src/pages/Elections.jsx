import React, { useEffect } from 'react';  

import Election from '../components/Election';
import AddElectionModal from '../components/AddElectionModal';
import {useDispatch, useSelector} from 'react-redux';
import {uiActions} from '../store/ui-slice';
import UpdateElectionModal from '../components/UpdateElectionModal';
import axios from 'axios';
import Loader from '../components/Loader';
import { useNavigate } from 'react-router-dom';

const Elections = () => {

const [elections, setElections] = React.useState([]);
const [isLoading, setIsLoading] = React.useState(false);
const [isAdmin, setIsAdmin] = React.useState([]);


const dispatch = useDispatch();
const navigate = useNavigate();

// open election modal
const openModal = () => {
  dispatch(uiActions.openElectionModal())
}

const electionModalShowing = useSelector(state => state.ui.electionModalShowing);
const updateElectionModalShowing = useSelector(state => state.ui.updateElectionModalShowing);

// Helper to create a comparable timestamp from date and timeslot
const getSortableDate = (match) => {
    if (!match.matchdate || !match.matchtimeslot) return 0;

    // 1. Get ONLY the date part: "2026-04-03"
    const datePart = match.matchdate.split('T')[0];

    // 2. Extract time from: "Evening (07:30 PM)" -> "07:30 PM"
    const timeMatch = match.matchtimeslot.match(/\((.*?)\)/);
    const timePart = timeMatch ? timeMatch[1] : "00:00 AM";

    // 3. Combine: "2026-04-03 07:30 PM"
    const timestamp = new Date(`${datePart} ${timePart}`).getTime();

    return isNaN(timestamp) ? 0 : timestamp;
};


// 1. Sort Ongoing Matches (Earliest first)
const ongoingElections = elections
    .filter(election => !election.isClosed)
    .sort((a, b) => getSortableDate(a) - getSortableDate(b));

// Helper to check if a specific date is today in local time
const isDateToday = (dateString) => {
    if (!dateString) return false;
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local
    const matchDay = new Date(dateString).toISOString().split('T')[0];
    return today === matchDay;
};

// Logic to determine "Next Match" ID
// If the first match is NOT today, it is the 'Next' match.
// If the first match IS today, then the second match (if it exists) is 'Next'.
const firstMatch = ongoingElections[0];
const secondMatch = ongoingElections[1];

const nextMatchId = (firstMatch && !isDateToday(firstMatch.matchdate)) 
    ? firstMatch._id 
    : secondMatch?._id;

// 2. Sort Closed Matches (Most recent first)
const closedElections = elections
    .filter(election => election.isClosed)
    .sort((a, b) => getSortableDate(b) - getSortableDate(a));



const getElections = async() => {
  setIsLoading(true)
  try {
      const savedToken = localStorage.getItem("token")
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/elections`,
              {withCredentials: true, headers:{Authorization: `Bearer ${savedToken}`}})
        const electionsData = await response.data

        setElections(electionsData)
  } catch(error){
    console.log(error)
  }
  setIsLoading(false)
}

useEffect(() =>{
    const user = JSON.parse(localStorage.getItem("currentUser")); // Convert string to Object
      const { token, isAdmin } = user; 
    
    if(token){
      setIsAdmin(isAdmin)
      getElections()
    } else {
      navigate('/')
    }
},[])

  return (

   <>
      <section className='elections'>
      <div className='container elections__container'>
        <header className='elections__header'>
          <h1>Ongoing Matches</h1>
          {isAdmin && <button className='btn primary' 
                              onClick={openModal}>Add New Match</button>}
        </header>
        {isLoading && <Loader/>}
       <menu className='elections__menu scrollable'>
          {ongoingElections.length > 0 ? (
            ongoingElections.map(election => (
              <Election key={election._id} election={election} isNext={election._id === nextMatchId} />
            ))
          ) : (
            <p>No active matches at the moment.</p>
          )}
        </menu>
        {closedElections.length > 0 && (
          <>
            <header className='elections__header' style={{ marginTop: '4rem' }}>
              <h1>Closed Matches</h1>
            </header>
            <menu className='elections__menu scrollable'>
              {closedElections.map(election => (
                <Election key={election._id} election={election}/>
              ))}
            </menu>
          </>
        )}
      </div>
    </section>

    {electionModalShowing && <AddElectionModal/>}
    {updateElectionModalShowing && <UpdateElectionModal />}
   </>
  );
};

export default Elections;
