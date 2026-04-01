import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import {useDispatch, useSelector} from 'react-redux';
import {uiActions} from '../store/ui-slice';
import axios from 'axios';
import { useNavigate } from "react-router-dom";


const UpdateElectionModal = () => {

    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [thumbnail, setThumbnail] = useState("")
    const [winnerId, setWinnerId] = useState("")
    const [matchdate, setMatchdate] = useState("")
    const [matchtimeslot, setMatchtimeslot] = useState("")
    const [electionCandidates, setElectionCandidates] = useState([])
    const idOfElectionToUpdate = useSelector(state => state?.vote?.idOfElectionToUpdate)
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isClosed, setIsClosed] = useState("")
    const today = new Date().toISOString().split('T')[0];

    // close update elction modal
    const closeModal = () => {
        dispatch(uiActions.closeUpdateElectionModal())
    }

    const fetchElection =  async() => {
        try {
            
            const savedToken = localStorage.getItem("token")
            console.log("savedToken in update electionmodel", savedToken)
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/elections/${idOfElectionToUpdate}`,
                                {withCredentials: true, 
                                    headers: {
                                        'Authorization': `Bearer ${savedToken}` // Required for FormData
                                    }
                                })
            const electionData = await response.data
            setTitle(electionData.title)
            setDescription(electionData.description)
            setIsClosed(electionData.isClosed)
            setMatchdate(electionData.matchdate)
            setMatchtimeslot(electionData.matchtimeslot)
console.log("electionData in update electionmodel", electionData)
             console.log("isClosed in update electionmodel", isClosed)

        } catch(error){
            console.log(error)
        }
    }

    const getCandidates = async() => {
    
        try {
            console.log("id...", idOfElectionToUpdate)
            const savedToken = localStorage.getItem("token")
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/elections/${idOfElectionToUpdate}/candidates`,
                                        {withCredentials: true, 
                                            headers: {
                                                'Authorization': `Bearer ${savedToken}` // Required for FormData
                                            }
                                        })
            const electionCandidateData = await response.data
           setElectionCandidates(electionCandidateData)
        } catch(error) {
            console.log(error)
        }
    
    }

    const updateElection =  async(e) => {
        e.preventDefault();
        try {
            const electionData = new FormData()
            electionData.set('title', title)
            electionData.set('description', description)
            electionData.set('matchdate', matchdate)
            electionData.set('matchtimeslot', matchtimeslot)
            if(thumbnail){
                 electionData.set('thumbnail', thumbnail)     
            }
            if(winnerId){
                 electionData.set('winnerId', winnerId)     
            }
           
                
            console.log("formdata entries:", [...electionData.entries()]);
            const savedToken = localStorage.getItem("token")
            console.log("savedToken", savedToken)
            const response = await axios.patch(`${process.env.REACT_APP_API_URL}/elections/${idOfElectionToUpdate}`,
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
        }
    
    }

    useEffect(() =>{
        fetchElection()
        getCandidates()
    },[])

    return (
        <section className= "modal">
            <div className = "modal__content">
                <header className = "modal__header">
                    <h4> Edit Match</h4>
                    <button className="modal__close" onClick={closeModal}><IoMdClose/></button>
                </header>
                <form onSubmit={updateElection}>
                    <div>
                        <h6>Title : </h6>
                        <input type="text" value= {title} 
                            onChange={e => setTitle(e.target.value)} 
                            name="title"/>
                    </div>
                    <div>
                        <h6>Description : </h6>
                        <input type="text" value= {description} 
                            onChange={e => setDescription(e.target.value)} 
                            name="description"/>
                    </div>
                    <div>
                        <h6>Thumbnail(Optional) : </h6>
                        <input type="file" 
                            onChange={e => setThumbnail(e.target.files[0])} 
                            accept=".png, .jpg, .jpeg, .webp, .avif" 
                            name="thumbnail"/>
                    </div>
                    <div className="form__group-row">
                        <div className="form__group">
                            <h6>Match Date:</h6>
                            <input 
                                type="date" 
                                value={matchdate ? matchdate.split('T')[0] : ""} 
                                onChange={e => setMatchdate(e.target.value)} 
                                name="matchdate"
                                min={today}
                                required />
                        </div>

                        <div className="form__group">
                            <h6>Select Time Slot:</h6>
                            <select 
                                value={matchtimeslot} 
                                onChange={e => setMatchtimeslot(e.target.value)} 
                                name="slot" 
                                required >
                                <option value="">-- Choose Slot --</option>
                                <option value="Afternoon (03:30 AM)">Afternoon (03:30 AM)</option>
                                <option value="Evening (07:30 PM)">Evening (07:30 PM)</option>
                            </select>
                        </div>
                    </div> 
                    {electionCandidates.length > 0 && <div>
                        <h6>Winner(Optional) : </h6>
                        <select 
                            value={winnerId} 
                            onChange={(e) => {
                                setWinnerId(e.target.value)
                            }}
                            className="winner-dropdown">
                            <option value="">-- Select Winner --</option>
                            {electionCandidates.map(candidate => (
                                <option key={candidate._id} value={candidate._id}>
                                    {candidate.fullName}
                                </option>
                            ))}
                            <option value="NR">🚫 No Result (Abandoned/Tie)</option>
                        </select>
                    </div>}
                    <button type="submit" className="btn primary"> Update Match</button>
                </form>
            </div>
        </section>
    )
}

export default UpdateElectionModal;