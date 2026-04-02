import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import {useDispatch, useSelector} from 'react-redux';
import {uiActions} from '../store/ui-slice';
import axios from 'axios';
import { useNavigate } from "react-router-dom";


const AddTeamModal = () => {

    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [image, setImage] = useState("")
    const [motto, setMotto] = useState("");
    const [error, setError] = useState("")

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const today = new Date().toISOString().split('T')[0];

    // close add elction modal
    const closeModal = () => {
        dispatch(uiActions.closeTeamModal())
    }

    const createTeam =  async(e) => {
        e.preventDefault();
        try {
            setError("")
            const teamData = new FormData()
            teamData.set('name', name)
            teamData.set('description', description)
            teamData.set('image', image)
            teamData.set('motto', motto);
               
            console.log("formdata entries:", [...teamData.entries()]);
            const savedToken = localStorage.getItem("token")
            console.log("savedToken", savedToken)
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/teams`,
                                teamData,
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
                    <h4> Create New Team</h4>
                    <button className="modal__close" onClick={closeModal}><IoMdClose/></button>
                </header>
                <form onSubmit={createTeam}>
                    {error && <p className="form__error-message">{error}</p>}
                    <div>
                        <h6>Name:</h6>
                        <input type="text" value= {name} 
                            onChange={e => setName(e.target.value)} 
                            name="name"/>
                    </div>
                    <div>
                        <h6>Description:</h6>
                        <input type="text" value= {description} 
                            onChange={e => setDescription(e.target.value)} 
                            name="description"/>
                    </div>
                    <div>
                        <h6>Motto:</h6>
                        <input type="text" value= {motto} 
                            onChange={e => setMotto(e.target.value)} 
                            name="motto"/>
                    </div>                         
                    <div>
                        <h6>Image:</h6>
                        <input type="file" 
                            onChange={e => setImage(e.target.files[0])} 
                            accept="png, jpg, jpeg, webp, avif" 
                            name="image"/>
                    </div>
                    <button type="submit" className="btn primary"> Add Team</button>
                </form>
            </div>
        </section>
    )
}

export default AddTeamModal;