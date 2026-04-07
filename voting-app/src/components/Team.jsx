import React, { useEffect } from 'react';  
import { Link } from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {uiActions} from '../store/ui-slice';
import {voteActions} from '../store/vote-slice';
import axios from 'axios';
import CloseElectionModal from './CloseElectionModal';


const Team = ({ team }) => {
    const { _id: id, name, description, image, motto, lastfive, played, won, lost, ranking, points } = team;
    const dispatch = useDispatch();
    const [isAdmin, setIsAdmin] = React.useState([]);
    // Open update election modal
    const openModal = () => {
        dispatch(uiActions.openUpdateTeamModal())
        dispatch(voteActions.changeIdOfTeamToUpdate(id))
    }

    useEffect(() =>{
        const user = JSON.parse(localStorage.getItem("currentUser")); // Convert string to Object
        const { isAdmin } = user; 
        setIsAdmin(isAdmin)
    },[])

  return (
    <>
        <article className={`election`}>
            <div className='election__image'>
                <img src={image} alt={name}/>
            </div>
        
            <div className='election__info'>
                <h4>{name}</h4>
                <p>{description?.length > 255 ? description?.substring(0, 255) + '...' : description}</p>
                <p>{motto?.length > 255 ? motto?.substring(0, 255) + '...' : motto}</p>
                <p>{lastfive} (Most recent first)</p>
                <p>Played : {played} </p>
                <p>Won : {won} </p>
                <p>Lost : {lost} </p>
                <p>N/R : {played-(won+lost)} </p>
                <p>Points : {points} </p>
                <p>Ranking : {ranking} </p>
                <div className='election__cta'>                               
                    {isAdmin && <button className='btn sm primary' onClick={openModal}>Edit</button>}                               
                 </div>                
            </div>
        </article>  
       
    </>
    
    )
}

export default Team;
