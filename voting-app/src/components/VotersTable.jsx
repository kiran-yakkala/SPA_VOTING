import React, { useEffect, useState } from 'react'; 
import {getOrdinalDateTime} from '../components/util';
import {useNavigate, useParams} from 'react-router-dom';
import axios from 'axios';

const VotersTable = () => {

    const [electionVotes, setElectionVotes] = React.useState([]);
    const {id} = useParams()
    const [isAdmin, setIsAdmin] = React.useState([]);
    const navigate = useNavigate();
    const [currentElection, setCurrentElection] = useState([]);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("currentUser")); // Convert string to Object
          const { token, isAdmin } = user; 
        if(token){
          setIsAdmin(isAdmin)
          getElection();
          getVotes()
        } else {
          navigate('/')
        }
      }, [])

    const getVotes = async() => {    
      try{
        const savedToken = localStorage.getItem("token")
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/votes/election/${id}`,
                {withCredentials: true, headers:{Authorization: `Bearer ${savedToken}`}})               
        const votes = await response.data;
        setElectionVotes(votes)  
      } catch(error) {
        console.log(error)
      }
    }

      const getElection = async() => {
        try {
           const savedToken = localStorage.getItem("token")
           const response = await axios.get(`${process.env.REACT_APP_API_URL}/elections/${id}`,
                                    {withCredentials: true, 
                                        headers: {
                                            'Authorization': `Bearer ${savedToken}` // Required for FormData
                                        }
                                    })
            const election = await response.data;
            setCurrentElection(election)
        } catch(error) {
          console.log(error)
        }
      }
    

    return(
        <section className="electionDetails">
            <div className='container electionDetails__container'>
                <menu className='voters'>
                    <h2>Voters</h2>
                    <table className='voters__table'>
                    <thead>
                        <tr>
                        <th>Full Name</th>
                            <th>Result</th> 
                        <th>Voted to</th>
                        <th>Time</th>                          
                        </tr>
                    </thead>
                    <tbody>
                        {
                        electionVotes.map(vote => {
                        const isWinningVote = vote.candidate.isWinner;
                        return(
                        <tr key={vote.id} className={isWinningVote ? 'row-won' : 'row-lost'}>
                            <td><h5>{vote.voter.fullName} <small className="mobile-only-info">
                                                        Voted for: {vote.candidate.fullName}
                                                    </small></h5></td>
                            <td>
                            <span className={
                                currentElection.isClosed 
                                        ? `status-badge ${isWinningVote ? 'badge-win' : 'badge-loss'}` 
                                        : 'status-badge neutral' // Neutral class when ongoing
                            }>
                                {currentElection.isClosed ? isWinningVote ? '🏆 Won' : ( currentElection.noresult ? 'No Result' : 'Lost') : 'Pending'}
                            </span>
                            </td>
                            <td><h5>{vote.candidate.fullName}</h5></td>
                            <td><h5>{getOrdinalDateTime(vote.createdAt)}</h5></td>
                        </tr>)
                        })
                        }
                    </tbody>
                    </table>
                </menu>
            </div>
        </section>
    );
};

export default VotersTable;