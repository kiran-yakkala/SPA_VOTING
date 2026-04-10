import React from 'react';
import { IoMdThumbsUp } from 'react-icons/io';
import { Link } from 'react-router-dom';

const CandidateRating = ({fullName , image, voteCount, totalVotes, voters, isWinner}) => {
  const percentage = voteCount > 0 ? (voteCount / totalVotes) * 100 : 0;

  return (
    <li className={`result__candidate ${isWinner ? 'is-winner' : 'loser'}`}>
        <div className="result__candidate-image">
            <img src={image} alt={fullName} />
        </div>
        <div className="result__candidate-info">
            <div>
                <h5>{fullName} {isWinner && <span className={"winner-label"}> - Winner</span>}</h5>
                <small>
                    {`${voteCount} ${voteCount === 1 ? "vote" : "votes"}`}    
                    -
                    {voters.length > 0 
                        ? voters.map(v => v.voter.fullName).join(", ") 
                        : "No voters yet"
                    }   
                </small>

            </div>
            <div className="result__candidate-rating">
                <div className="result__candidate-loader">
                    <span style={{width: `${percentage}%`}}></span>
                </div>
                <small>{percentage.toFixed(2)}% </small>
            </div>
        </div>
    </li>
  )
}

export default CandidateRating;