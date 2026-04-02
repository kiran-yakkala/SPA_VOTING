import React from 'react';  
import ResultElection from '../components/ResultElection';
import { useEffect } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const Results = () => {

const [elections, setElections] = React.useState([]);
const navigate = useNavigate();

 const sortedElections = elections.filter(election => election)
                                    .sort((a, b) => new Date(b.matchdate) - new Date(a.matchdate));

const getElections = async() => {
  try{
    const savedToken = localStorage.getItem("token")
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/elections`,
          {withCredentials: true, headers:{Authorization: `Bearer ${savedToken}`}})
    const elections = await response.data;
    setElections(elections)
  } catch(error) {
    console.log(error)
  }
}

useEffect(() => {
  const token = localStorage.getItem("token");
  if(token){
    getElections()
  } else {
    navigate('/')
  }  
}, [])

  return (
    <section className = "results">
      <div className="container results__container">
        {
          sortedElections.map(election => <ResultElection key={election._id} {...election} />)
        }
      </div>
    </section>
  );
};

export default Results;