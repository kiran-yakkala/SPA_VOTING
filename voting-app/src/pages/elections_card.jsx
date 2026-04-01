

import React, { useEffect, useRef, useState } from 'react';  

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

const scrollRef = useRef(null);

// logic for scrolling - start
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
      setIsDragging(true);
      // Calculate starting X position and current scroll position
      setStartX(e.pageX - scrollRef.current.offsetLeft);
      setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
      setIsDragging(false);
  };

  const handleMouseMove = (e) => {
      if (!isDragging) return; // Only run if mouse is clicked
      e.preventDefault();
      const x = e.pageX - scrollRef.current.offsetLeft;
      const walk = (x - startX) * 2; // The '2' determines scroll speed
      scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // // logic for scrolling - end

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
        <menu 
                    className={`elections-card__menu ${isDragging ? 'active' : ''}`}
                    ref={scrollRef}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeaveOrUp}
                    onMouseUp={handleMouseLeaveOrUp}
                    onMouseMove={handleMouseMove}
                >
          {
            elections.map(election => 
            <Election key={election._id} election = {election} />)
          }
        </menu>
      </div>
    </section>

    {electionModalShowing && <AddElectionModal/>}
    {updateElectionModalShowing && <UpdateElectionModal />}
   </>
  );
};

export default Elections;