import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import {useDispatch, useSelector} from 'react-redux';
import {uiActions} from '../store/ui-slice';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const AddCandidateModal = () => {

    const [fullName, setFullName] = useState("")
    const [motto, setMotto] = useState("")
    const [image, setImage] = useState("")
    const [error, setError] = useState("")

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const electionId = useSelector(state => state?.vote?.addCandidateElectionId)

    // close add elction modal
    const closeModal = () => {
        dispatch(uiActions.closeAddCandidateModal())
    }
    
    const addCandidate =  async(e) => {
        e.preventDefault();
        try {
            const candidateInfo = new FormData()
            candidateInfo.set('fullName', fullName)
            candidateInfo.set('motto', motto)
            candidateInfo.set('image', image)
            candidateInfo.set('currentElection', electionId)
               
            console.log("formdata entries:", [...candidateInfo.entries()]);
            const savedToken = localStorage.getItem("token")
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/candidates`,
                                candidateInfo,
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
                    <h4> Add Candidate</h4>
                    <button className="modal__close" onClick={closeModal}><IoMdClose/></button>
                </header>
                <form onSubmit={addCandidate}>
                    <div>
                        <h6>Candidate Name:</h6>
                        <input type="text" value= {fullName} 
                            onChange={e => setFullName(e.target.value)} 
                            name="fullName"/>
                    </div>
                    <div>
                        <h6>Candidate Motto:</h6>
                        <input type="text" value= {motto} 
                            onChange={e => setMotto(e.target.value)} 
                            name="motto"/>
                    </div>
                    <div>
                        <h6>Candidate Image:</h6>
                        <input type="file" 
                            onChange={e => setImage(e.target.files[0])} 
                            accept="png, jpg, jpeg, webp, avif" 
                            name="image"/>
                    </div>
                    <button type="submit" className="btn primary"> Add Candidate</button>
                </form>
            </div>
        </section>
    )
}

export default AddCandidateModal;