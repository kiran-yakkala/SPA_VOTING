import { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import {useDispatch, useSelector} from 'react-redux';
import {uiActions} from '../store/ui-slice';
import axios from 'axios';
import { useNavigate } from "react-router-dom";


const AddElectionModal = () => {

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [thumbnail, setThumbnail] = useState("")
    const [matchdate, setMatchdate] = useState('');
    const [matchtimeslot, setMatchtimeslot] = useState('');
    const [candidates, setCandidates] = useState([])
    const [team1, setTeam1] = useState("");
    const [team2, setTeam2] = useState("");
    const [teams, setTeams] = useState([]);
    const [error, setError] = useState("")

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const today = new Date().toISOString().split('T')[0];

    // close add elction modal
    const closeModal = () => {
        dispatch(uiActions.closeElectionModal())
    }

     const getTeams = async() => {
        
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
        
    }

      useEffect(() => {
        const user = JSON.parse(localStorage.getItem("currentUser")); // Convert string to Object
          const { token, isAdmin } = user; 
       getTeams();
      }, [])

    const createElection =  async(e) => {
        e.preventDefault();
        try {
            setError("")
            const electionData = new FormData()
            electionData.set('title', title)
            electionData.set('description', description)
            electionData.set('thumbnail', thumbnail)
            electionData.set('matchdate', matchdate);
            electionData.set('matchtimeslot', matchtimeslot);
            electionData.append('teams', JSON.stringify([team1, team2])); 
               
            console.log("formdata entries:", [...electionData.entries()]);
            const savedToken = localStorage.getItem("token")
            console.log("savedToken", savedToken)
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/elections`,
                                electionData,
                                {withCredentials: true, 
                                    headers: {
                                        'Authorization': `Bearer ${savedToken}`,
                                        'Content-Type': 'multipart/form-data' // Required for FormData
                                    }
                                })
            closeModal()
            navigate(0)

        } catch(error){
            console.log(error)
            setError(error.response.data.message)
        }

    }

    return (
        <section className= "modal">
            <div className = "modal__content">
                <header className = "modal__header">
                    <h4> Create New Match</h4>
                    <button className="modal__close" onClick={closeModal}><IoMdClose/></button>
                </header>
                <form onSubmit={createElection}>
                    {error && <p className="form__error-message">{error}</p>}
                    <div className="form__group-inline">
                        <h6>Title:</h6>
                        <input type="text" value= {title} 
                            onChange={e => setTitle(e.target.value)} 
                            name="title"/>
                    </div>
                    <div className="form__group-inline">
                        <h6>Description:</h6>
                        <input type="text" value= {description} 
                            onChange={e => setDescription(e.target.value)} 
                            name="description"/>
                    </div>
                    
                        <div className="form__group-inline">
                            <h6>Match Date:</h6>
                            <input 
                                type="date" 
                                value={matchdate} 
                                onChange={e => setMatchdate(e.target.value)} 
                                name="matchdate"
                                min={today}
                                required />
                        </div>

                        <div className="form__group-inline">
                            <h6>Select Time Slot:</h6>
                            <select 
                                value={matchtimeslot} 
                                onChange={e => setMatchtimeslot(e.target.value)} 
                                name="slot" 
                                disabled={!matchdate} // Disable until Team 1 is picked
                                required >
                                <option value="">-- Choose Slot --</option>
                                <option value="Afternoon (03:30 AM)">Afternoon (03:30 AM)</option>
                                <option value="Evening (07:30 PM)">Evening (07:30 PM)</option>
                            </select>
                        </div>
                                           
                    <div className="form__group-inline">
                        <h6>Thumbnail:</h6>
                        <input type="file" 
                            onChange={e => setThumbnail(e.target.files[0])} 
                            accept="png, jpg, jpeg, webp, avif" 
                            name="thumbnail"/>
                    </div>
                    <div className="form__group-inline">
                        <h6>Team 1:</h6>
                        <select 
                            value={team1} 
                            onChange={e => setTeam1(e.target.value)} 
                            name="team1" 
                            required 
                        >
                            <option value="">-- Select Team 1 --</option>
                            {teams.map(team => (
                                <option key={team._id} value={team._id}>
                                    {team.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form__group-inline">
                        <h6>Team 2:</h6>
                        <select 
                            value={team2} 
                            onChange={e => setTeam2(e.target.value)} 
                            name="team2" 
                            disabled={!team1} // Disable until Team 1 is picked
                            required 
                        >
                            <option value="">-- Select Team 2 --</option>
                            {teams
                                .filter(team => team._id !== team1) // Don't show the team selected in Team 1
                                .map(team => (
                                    <option key={team._id} value={team._id}>
                                        {team.name}
                                    </option>
                                ))
                            }
                        </select>
                    </div>
                    <button type="submit" className="btn primary"> Add Match</button>
                </form>
            </div>
        </section>
    )
}

export default AddElectionModal;