import React, { useEffect } from 'react';  

import Team from '../components/Team';
import {useDispatch, useSelector} from 'react-redux';
import {uiActions} from '../store/ui-slice';
import axios from 'axios';
import Loader from '../components/Loader';
import { useNavigate } from 'react-router-dom';
import AddTeamModal from '../components/AddTeamModal';
import UpdateTeamModal from '../components/UpdateTeamModal';

const Teams = () => {

const [teams, setTeams] = React.useState([]);
const [isLoading, setIsLoading] = React.useState(false);
const [isAdmin, setIsAdmin] = React.useState([]);

// Sort teams by ranking (1 at the top, higher numbers below)
const rankedTeams = teams.sort((a, b) => (a.ranking || Infinity) - (b.ranking || Infinity));

const dispatch = useDispatch();
const navigate = useNavigate();

// open election modal
const openModal = () => {
  dispatch(uiActions.openTeamModal())
}

const teamModalShowing = useSelector(state => state.ui.teamModalShowing);
const updateTeamModalShowing = useSelector(state => state.ui.updateTeamModalShowing);

const getTeams = async() => {
  setIsLoading(true)
  try {
      const savedToken = localStorage.getItem("token")
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/teams`,
              {withCredentials: true, headers:{Authorization: `Bearer ${savedToken}`}})
        const teamsData = await response.data
        setTeams(teamsData)
        console.log("Teams.....", teamsData)
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
      getTeams()
    } else {
      navigate('/')
    }
},[])

  return (
   <>
      <section className='elections'>
      <div className='container elections__container'>
        <header className='elections__header'>
          <h1>Teams</h1>
          {isAdmin && <button className='btn primary' 
                              onClick={openModal}>Add Team</button>}
        </header>
        {isLoading && <Loader/>}
        {/* <menu className='elections__menu'>
          {
            rankedTeams.map(team => 
            <Team key={team._id} team = {team} />)
          }
        </menu> */}
      </div>
      
<div className="table-container">
    <table className="points-table">
        <thead>
            <tr>
                <th>Rank</th>
                <th>Team</th>
                <th>P</th>
                <th>W</th>
                <th>L</th>
                <th>N/R</th>
                <th>Pts</th>
                <th>Form</th>
            </tr>
        </thead>
        <tbody>
           {rankedTeams.map(team => 
            <tr className="table-row">
                <td className="rank-cell">#{team.ranking}</td>
                <td className="team-cell">
                    <img src={team.image} alt={team.name} className="team-logo" />
                    <span className="team-name">{team.name}</span>
                </td>
                <td>{team.played}</td>
                <td>{team.won}</td>
                <td>{team.lost}</td>
                {/* Your NR calculation */}
                <td className="nr-cell">{team.played - (team.won + team.lost)}</td>
                <td className="points-cell">{team.points}</td>
                <td className="form-cell">
                    {team.lastfive.split('-').map((res, index) => (
                        <span key={index} className={`form-dot ${res}`}>
                            {res}
                        </span>
                    ))}
                </td>
            </tr>
)}</tbody>
    </table>
</div>


    </section>

    {teamModalShowing && <AddTeamModal/>}
    {updateTeamModalShowing && <UpdateTeamModal />}
   </>
  );
};

export default Teams;