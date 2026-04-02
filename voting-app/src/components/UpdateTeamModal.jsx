import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import {useDispatch, useSelector} from 'react-redux';
import {uiActions} from '../store/ui-slice';
import axios from 'axios';
import { useNavigate } from "react-router-dom";


const UpdateTeamModal = () => {


    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [image, setImage] = useState("")
    const [motto, setMotto] = useState("")
    const idOfTeamToUpdate = useSelector(state => state?.vote?.idOfTeamToUpdate)
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // close update elction modal
    const closeModal = () => {
        dispatch(uiActions.closeUpdateTeamModal())
    }

    useEffect(() =>{
        fetchTeam()
    },[])

    const fetchTeam =  async() => {
        try {            
            const savedToken = localStorage.getItem("token")
            console.log("savedToken in update electionmodel", savedToken)
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/teams/${idOfTeamToUpdate}`,
                                {withCredentials: true, 
                                    headers: {
                                        'Authorization': `Bearer ${savedToken}` // Required for FormData
                                    }
                                })
            const teamData = await response.data
            setName(teamData.name)
            setDescription(teamData.description)
            setMotto(teamData.motto)

        } catch(error){
            console.log(error)
        }
    }

    const updateTeam =  async(e) => {
        e.preventDefault();
        try {
            const teamData = new FormData()
            teamData.set('name', name)
            teamData.set('description', description)
            teamData.set('motto', motto)
            if(image){
                 teamData.set('image', image)     
            }           
                
            console.log("formdata entries:", [...teamData.entries()]);
            const savedToken = localStorage.getItem("token")
            console.log("savedToken", savedToken)
            const response = await axios.patch(`${process.env.REACT_APP_API_URL}/teams/${idOfTeamToUpdate}`,
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
        }
    
    }

    return (
        <section className= "modal">
            <div className = "modal__content">
                <header className = "modal__header">
                    <h4> Edit Team</h4>
                    <button className="modal__close" onClick={closeModal}><IoMdClose/></button>
                </header>
                <form onSubmit={updateTeam}>
                    <div>
                        <h6>Name : </h6>
                        <input type="text" value= {name} 
                            onChange={e => setName(e.target.value)} 
                            name="name"/>
                    </div>
                    <div>
                        <h6>Description : </h6>
                        <input type="text" value= {description} 
                            onChange={e => setDescription(e.target.value)} 
                            name="description"/>
                    </div>
                    <div>
                        <h6>Motto : </h6>
                        <input type="text" value= {motto} 
                            onChange={e => setMotto(e.target.value)} 
                            name="motto"/>
                    </div>
                    <div>
                        <h6>Thumbnail(Optional) : </h6>
                        <input type="file" 
                            onChange={e => setImage(e.target.files[0])} 
                            accept=".png, .jpg, .jpeg, .webp, .avif" 
                            name="image"/>
                    </div>

                    <button type="submit" className="btn primary"> Update Team</button>
                </form>
            </div>
        </section>
    )
}

export default UpdateTeamModal;