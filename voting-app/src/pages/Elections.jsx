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

 // 2. DERIVE the lists (This runs every time the component renders)
    const ongoingElections = elections.filter(election => !election.isClosed)
                                    .sort((a, b) => new Date(a.matchdate) - new Date(b.matchdate));
    // 2. The "Next Match" is the first one in this sorted array
    const nextMatchId = ongoingElections[0]?._id; 
    const closedElections = elections.filter(election => election.isClosed)
                                    .sort((a, b) => new Date(b.matchdate) - new Date(a.matchdate));

const getElections = async() => {
  setIsLoading(true)
  try {
      const savedToken = localStorage.getItem("token")
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/elections`,
              {withCredentials: true, headers:{Authorization: `Bearer ${savedToken}`}})
        const electionsData = await response.data

        setElections(electionsData)

        console.log("in elections", electionsData)
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
