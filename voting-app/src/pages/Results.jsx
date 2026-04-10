import React from 'react';  
import ResultElection from '../components/ResultElection';
import { useEffect } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const Results = () => {

const [elections, setElections] = React.useState([]);
const navigate = useNavigate();

// Helper to create a comparable timestamp from date and timeslot
const getSortableDate = (match) => {
    if (!match.matchdate || !match.matchtimeslot) return 0;

    // 1. Get ONLY the date part: "2026-04-03"
    const datePart = match.matchdate.split('T')[0];
    console.log("match date..", datePart)

    // 2. Extract time from: "Evening (07:30 PM)" -> "07:30 PM"
    const timeMatch = match.matchtimeslot.match(/\((.*?)\)/);
    const timePart = timeMatch ? timeMatch[1] : "00:00 AM";

    // 3. Combine: "2026-04-03 07:30 PM"
    const timestamp = new Date(`${datePart} ${timePart}`).getTime();

    return isNaN(timestamp) ? 0 : timestamp;
};


 const sortedElections = elections.filter(election => election)
                                    .sort((a, b) => getSortableDate(b) - getSortableDate(a));

const getElections = async() => {
  try{
    const savedToken = localStorage.getItem("token")
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/elections`,
          {withCredentials: true, headers:{Authorization: `Bearer ${savedToken}`}})
    const elections = await response.data;
    setElections(elections)
    console.log("...elections...", elections)
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