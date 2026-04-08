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
                <h4>{name} - #{ranking}</h4>
                <p>{description?.length > 255 ? description?.substring(0, 255) + '...' : description}</p>
               <br></br>

                <table class="stats-table">
                    <thead>
                        <tr>
                            <th>
                                <span className="full-text">Played</span>
                                <span className="short-text">P</span>
                            </th>
                            <th>
                                <span className="full-text">Won</span>
                                <span className="short-text">W</span>
                            </th>
                            <th>
                                <span className="full-text">Lost</span>
                                <span className="short-text">L</span>
                            </th>
                            <th>N/R</th>
                            <th>
                                <span className="full-text">Points</span>
                                <span className="short-text">Pts</span>
                            </th>
                            <th className="desktop-only">Series Form (Most recent first)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{played}</td>
                            <td>{won}</td>
                            <td>{lost}</td>
                            <td>{played - (won + lost)}</td>
                            <td>{points}</td>
                            <td className="desktop-only">{lastfive}</td>
                        </tr>
                    </tbody>
                </table>    


                <div className='election__cta'>                               
                    {isAdmin && <button className='btn sm primary' onClick={openModal}>Edit</button>}                               
                 </div>                
            </div>
        </article>  
       
    </>
    
    )
}

export default Team;
