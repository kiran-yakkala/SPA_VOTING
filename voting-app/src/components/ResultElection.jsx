import React from 'react';
import CandidateRating from './CandidateRating';
import '../index.css';
import { useEffect } from "react";
import axios from 'axios';
import Loader from './Loader';
import {getOrdinalDate} from '../components/util';

const ResultElection = ({_id : id, thumbnail, title, isClosed, noresult, matchdate, matchtimeslot}) => {

const [isLoading, setIsLoading] = React.useState(false)
const [totalVotes, setTotalVotes] = React.useState(0);

const [electionCandidates, setElectionCandidates] = React.useState([]);
const [electionVotes, setElectionVotes] = React.useState([]);

const getCandidates = async() => {

  try{
    setIsLoading(true)
    const savedToken = localStorage.getItem("token")
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/elections/${id}/candidates`,
            {withCredentials: true, headers:{Authorization: `Bearer ${savedToken}`}})
           
    const candidates = await response.data;
   
    let voteCount = 0
    // calculate total votes in each election
    for(let i = 0; i < candidates.length; i++) {
      voteCount = voteCount + candidates[i].voteCount
    }
    setTotalVotes(voteCount)
    
    setElectionCandidates(candidates)
    
  } catch(error) {
    console.log(error)
  }
  setIsLoading(false)
}

useEffect(() => {
  getCandidates()
  getVotes()
}, [])

const getVotes = async() => {

  try{
    setIsLoading(true)
    const savedToken = localStorage.getItem("token")
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/votes/election/${id}`,
            {withCredentials: true, headers:{Authorization: `Bearer ${savedToken}`}})
           
    const votes = await response.data;
    setElectionVotes(votes)

    console.log("elcetin votes in result... ", votes)

   
    
  } catch(error) {
    console.log(error)
  }
  setIsLoading(false)
}

useEffect(() => {
  getCandidates()
}, [])

  return (
    <>
        {isLoading && <Loader/>}
        <article className={`result ${isClosed ? 'closed' : noresult ? 'noresult' : ''}`}>
            <header className={`result__header ${isClosed ? 'closed' :''}`}>
                <h4>{title}</h4>
                <h4>{getOrdinalDate(matchdate)}</h4>
                <h4>{matchtimeslot}</h4>
                <div className="result__header-image">
                    <img src={thumbnail} alt={title} />
                </div>
            </header>
            <ul className="result__list">
                {
                    electionCandidates.map(candidate => {
                      // 1. Filter the global voterMap for THIS specific candidate
                      let votersForThisCandidate = electionVotes.filter(
                          vote => String(vote.candidate._id) === String(candidate._id)
                      );
                      return (
                <       CandidateRating 
                          key={candidate._id} 
                          {...candidate} 
                          totalVotes={totalVotes} 
                          voters={votersForThisCandidate} />
                        );
                      // <CandidateRating key={candidate._id} {...candidate} totalVotes={totalVotes} voters={votersForThisCandidate} />
                    })
                }
            </ul>
            {/* <a href={`/elections/${id}/candidates`} className="btn primary full">Enter Election</a> */}
        </article>
    </>
        
  );
};

export default ResultElection;