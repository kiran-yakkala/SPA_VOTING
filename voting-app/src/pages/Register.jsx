import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

const Register = () => {

  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    password: "",
    password2: ""
  });

  const [error, setError] = useState("")
  const navigate = useNavigate()

  // function to change input values in the form
  const changeIputHandler = (e) => {
    setUserData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const registerVoter = async (e) =>{
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/voters/register`,userData)
      navigate('/')
    } catch(error){
      setError(error.response.data.message)
    }
  }

  console.log(userData);

  return (
    <section className="register">
      <Navbar />
      <div className="container register__container">
        <h1>Sign Up</h1>
        <form onSubmit={registerVoter}>
          {error && <p className="form__error-message">{error}</p>}
          <p className="form__info">Please fill in the form to create an account.</p>
          
            <input type="text" name="fullName" placeholder="Enter your Name" onChange={changeIputHandler} autoComplete="true" autoFocus/>
          
            <input type="email" name="email" placeholder="Enter your Email" onChange={changeIputHandler} autoComplete="true"/>
         
            <input type="password" name="password" placeholder="Enter your Password" onChange={changeIputHandler} autoComplete="true"/>
            
            <input type="password" name="password2" placeholder="Confirm your Password" onChange={changeIputHandler} autoComplete="true"/>
          
          <button className="btn primary" type="submit">Register</button>

          <p>Already have an account? <Link to="/">Sign In</Link></p>
        </form>
      </div>
    </section>
  );
};

export default Register;