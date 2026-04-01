import { useState } from "react";
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
    const [error, setError] = useState("")

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const today = new Date().toISOString().split('T')[0];

    // close add elction modal
    const closeModal = () => {
        dispatch(uiActions.closeElectionModal())
    }

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
                    <div>
                        <h6>Title:</h6>
                        <input type="text" value= {title} 
                            onChange={e => setTitle(e.target.value)} 
                            name="title"/>
                    </div>
                    <div>
                        <h6>Description:</h6>
                        <input type="text" value= {description} 
                            onChange={e => setDescription(e.target.value)} 
                            name="description"/>
                    </div>
                    <div className="form__group-row">
                        <div className="form__group">
                            <h6>Match Date:</h6>
                            <input 
                                type="date" 
                                value={matchdate} 
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
                    <div>
                        <h6>Thumbnail:</h6>
                        <input type="file" 
                            onChange={e => setThumbnail(e.target.files[0])} 
                            accept="png, jpg, jpeg, webp, avif" 
                            name="thumbnail"/>
                    </div>
                    <button type="submit" className="btn primary"> Add Match</button>
                </form>
            </div>
        </section>
    )
}

export default AddElectionModal;