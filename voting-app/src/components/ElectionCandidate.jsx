import React, { useEffect } from 'react';  
import {IoMdThumbsUp, IoMdTrash} from 'react-icons/io';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ElectionCandidate = ({hasVotes, isClosed, ...candidate}) => {

    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = React.useState([]);
    const deleteCandidate = async() => {
    try {
       const savedToken = localStorage.getItem("token")
       await axios.delete(`${process.env.REACT_APP_API_URL}/candidates/${candidate._id}`,
                                {withCredentials: true, 
                                    headers: {
                                        'Authorization': `Bearer ${savedToken}` // Required for FormData
                                    }
                                })
        navigate(0)
    } catch(error) {
      console.log(error)
    }
  }

    useEffect(() =>{
        const user = JSON.parse(localStorage.getItem("currentUser")); // Convert string to Object
        const { isAdmin } = user; 
        setIsAdmin(isAdmin)
    },[])


    return (
        <li className={`electionCandidate ${candidate.isWinner ? 'winner-card' : ''}`} key={candidate._id}>
            {candidate.isWinner && <div className="winner-badge"><span className="winner-icon"><IoMdThumbsUp size="3em"/></span> </div>}
            <div className="electionCandidate__image">
                <img src ={candidate.image} alt={candidate.fullName} />
            </div>
            <div>
                <h3>{candidate.fullName}</h3>
                <small>{candidate.motto?.length > 70 ? candidate.motto.substring(0, 70) + "..." : candidate.motto}</small>
                {isAdmin && !hasVotes && <button className = "electionCandidate__btn"
                        onClick={deleteCandidate}><IoMdTrash/></button> }
            </div>
        </li>
    )
}

export default ElectionCandidate;