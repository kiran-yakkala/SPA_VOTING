import React, { useEffect, useState } from 'react'; 
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {getOrdinalDateTime} from '../components/util'

const Profile = () => {
     const[showNav, setShowNav] = useState(window.innerWidth < 600 ? false : true);
     const currentVoter = useSelector(state => state?.vote?.currentVoter)
     const [votedElections, setVotedElections] = useState([]);

     // check if voter has already voted
  const getVotedElections = async() => {
    try {
      const user = JSON.parse(localStorage.getItem("currentUser")); // Convert string to Object
      const { token, id } = user;  
      console.log("vote id...", id)

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/votes/${id}`,
              {withCredentials: true, headers:{Authorization: `Bearer ${token}`}})
      const votedElections = await response.data;
      setVotedElections(votedElections);
      console.log("votedElections...", votedElections)
    } catch(error){
      console.log(error)
    }
  }

  useEffect(() => {
    getVotedElections();
  },[])
 
     return (
        <section className="profile">
            <div className="container profile__container">
            <header className="profile__header">
                <h1>Voter Profile</h1>
            </header>
            <div className="profile__card">
                <div className="profile__details">
                <div className="profile__item">
                    <span className="profile__label">Full Name:</span>
                    <span className="profile__value">{currentVoter.fullName}</span>
                </div>
                <div className="profile__item">
                    <span className="profile__label">Email Address:</span>
                    <span className="profile__value">{currentVoter.email}</span>
                </div>
                <div className="profile__item">
                    <span className="profile__label">Account Type:</span>
                    <span className={`profile__badge ${currentVoter.isAdmin ? 'admin' : 'voter'}`}>
                        {currentVoter.isAdmin ? "Administrator" : "Standard Voter"}
                    </span>
                </div>
            </div>
            <hr className="profile__divider" />
            <div className="profile__history-header">
                <h3>My Voting History</h3>
                {votedElections.length > 0 ? (
                    <div className="election-list">
                        <menu className='voters'>
                            <table className='voters__table'>
                                <thead>
                                <tr>
                                    <th>Election</th>
                                    <th>Results</th>
                                    <th>Vote casted to</th>
                                    <th>Vote casted at</th>                                    
                                </tr>
                                </thead>
                                <tbody>
                                {
                                votedElections.map(vote => 
                                    <tr key={vote.id} className={vote.election.winner && vote.candidate._id === vote.election.winner ?'row-won' : 'row-lost'}>
                                        <td><h5>{vote.election.title} </h5>
                                        </td>
                                        <td>
                                            <Link to={`/elections/${vote.election._id}`} className="btn-results">
                                                {vote.election.winner ? (
                                                    /* Using a fragment to wrap both spans */
                                                    <>
                                                        {vote.candidate._id === vote.election.winner ? (
                                                            <span className="vote-status status-won">WON</span>
                                                        ) : (
                                                            <span className="vote-status status-lost">LOST</span>
                                                        )}
                                                        <span className="view-results-text"> (View Results)</span>
                                                    </>
                                                ) : (
                                                    /* If no winner is declared yet */
                                                    <>
                                                    <span className="vote-status status-pending">PENDING</span>
                                                    <span className="view-results-text"> (View Results)</span>
                                                    </>                                                    
                                                )}
                                            </Link>
                                            <small className="mobile-only-info">
                                                Voted for: {vote.candidate.fullName}
                                            </small>
                                        </td>
                                        <td><h5>{vote.candidate.fullName}</h5></td>
                                        <td><h5>{getOrdinalDateTime(vote.createdAt)}</h5></td>                                        
                                    </tr>
                                )
                                }
                                </tbody>
                            </table>
                        </menu>
                           
                    </div>
                ) : (
                    <p>You haven't voted in any elections yet.</p>
                )}
            </div>
          </div>
        </div>      
    </section>
     )
};

export default Profile;