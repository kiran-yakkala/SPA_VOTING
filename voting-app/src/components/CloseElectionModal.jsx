import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import {useDispatch, useSelector} from 'react-redux';
import {uiActions} from '../store/ui-slice';
import axios from 'axios';
import { useNavigate } from "react-router-dom";


const CloseElectionModal = () => {
    const [electionCandidates, setElectionCandidates] = useState([])
    const [winnerId, setWinnerId] = useState("")
    const idOfElectionToUpdate = useSelector(state => state?.vote?.idOfElectionToUpdate)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // close update elction modal
    const closeModal = () => {
        dispatch(uiActions.closeElectionCloseModal())
    }

     const fetchElection =  async() => {
        try {
            
            const savedToken = localStorage.getItem("token")
            console.log("savedToken", savedToken)
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/elections/${idOfElectionToUpdate}`,
                                {withCredentials: true, 
                                    headers: {
                                        'Authorization': `Bearer ${savedToken}` // Required for FormData
                                    }
                                })
            const electionData = await response.data
            setTitle(electionData.title)
            setDescription(electionData.description)

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

    const closeElection =  async(e) => {
        e.preventDefault();
        try {
            const savedToken = localStorage.getItem("token")
           
            await axios.patch(`${process.env.REACT_APP_API_URL}/elections/${idOfElectionToUpdate}/close`,
                                {winnerId},
                                {withCredentials: true,                                   
                                    headers: {
                                        'Authorization': `Bearer ${savedToken}`// Required for FormData
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
                    <h4> Close Match</h4>
                    <button className="modal__close" onClick={closeModal}><IoMdClose/></button>
                </header>
                <div className="modal__content-body">
                    <div className="modal__info-item">
                        <h6 className="modal__value">Title:</h6>
                        <span className="modal__value">{title}</span>
                    </div>
                    <div className="modal__info-item">
                        <h6 className="modal__value">Description:</h6>
                        <span className="modal__value">{description}</span>
                    </div>
                    <div className="modal__selection">
                        <h6 className="modal__value">Select Candidate: </h6>
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
                        </select>
                    </div>
                </div>
                        
                <button type="submit" className="btn primary modal__submit-btn" onClick={closeElection}> Submit </button>
                
            </div>
        </section>
    )
}

export default CloseElectionModal;