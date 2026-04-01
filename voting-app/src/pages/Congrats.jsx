import React, {useEffect} from 'react';  
import Navbar from '../components/Navbar';
import { Link, useNavigate } from 'react-router-dom';

const Congrats = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
    // access cnotrol
    useEffect(() => {
      if(!token){
        navigate('/')
      }
    },[])
  return (
   <section className="congrats">
      
      <div className="container congrats__container ">
        <h2>Thanks for your vote!</h2>
        <p>Your vote has been recorded successfully and added to your Candidates vote count.     
          You will be redirected to the new results page in a few seconds.
        </p>
        <Link to="/results" className="btn sm primary">Go to Results</Link>
      </div>
    </section>
  );
};

export default Congrats;