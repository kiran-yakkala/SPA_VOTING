import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import {useDispatch} from "react-redux"
import { voteActions } from "../store/vote-slice";

const Login = () => {

  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    password: ""
  });

  const dispatch = useDispatch();

  const [error, setError] = useState("")
  const navigate = useNavigate()

  const loginVoter = async (e) =>{
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/voters/login`, userData)
      const newVoter = await response.data;
     
      // save new voter in localstorage and update in store
      localStorage.setItem("currentUser", JSON.stringify(newVoter))
      localStorage.setItem("token", newVoter.token)
      dispatch(voteActions.changeCurrentVoter(newVoter))
      navigate('/results')
    } catch(error){
      setError(error.response.data.message)
    }
  }

  // function to change input values in the form
  const changeIputHandler = (e) => {
    setUserData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  return (
    <section className="register">
      <Navbar />
      <div className="container register__container">
        <h1>Sign In</h1>
        <form onSubmit={loginVoter}>
          {error && <p className="form__error-message">{error}</p>}
                    
            <input type="email" name="email" placeholder="Enter your Email" onChange={changeIputHandler} autoComplete="true" autoFocus/>
         
            <input type="password" name="password" placeholder="Enter your Password" onChange={changeIputHandler} autoComplete="true"/>
                     
          <button className="btn primary" type="submit">Login</button>

          <p>Don't have an account? <Link to="/register">Sign Up</Link></p>
        </form>
      </div>
    </section>
  );
};

export default Login;