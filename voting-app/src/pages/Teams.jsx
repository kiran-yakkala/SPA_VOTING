import React, { useEffect } from 'react';  

import Election from '../components/Election';
import AddElectionModal from '../components/AddElectionModal';
import {useDispatch, useSelector} from 'react-redux';
import {uiActions} from '../store/ui-slice';
import UpdateElectionModal from '../components/UpdateElectionModal';
import axios from 'axios';
import Loader from '../components/Loader';
import { useNavigate } from 'react-router-dom';

const Teams = () => {

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

const getElections = async() => {
  setIsLoading(true)
  try {
      const savedToken = localStorage.getItem("token")
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/elections`,
              {withCredentials: true, headers:{Authorization: `Bearer ${savedToken}`}})
        setElections(await response.data)
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
          <h1>Ongoing Elections</h1>
          {isAdmin && <button className='btn primary' 
                              onClick={openModal}>Create New Election</button>}
        </header>
        {isLoading && <Loader/>}
        <menu className='elections__menu'>
          {
            elections.map(election => 
            <Election key={election._id} {...election} />)
          }
        </menu>
      </div>
    </section>

    {electionModalShowing && <AddElectionModal/>}
    {updateElectionModalShowing && <UpdateElectionModal />}
   </>
  );
};

export default Teams;