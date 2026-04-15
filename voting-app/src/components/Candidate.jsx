import React from 'react';
import { useDispatch } from 'react-redux';
import { uiActions } from '../store/ui-slice';
import { voteActions } from '../store/vote-slice';

const Candidate = (candidate) => {

    const dispatch = useDispatch();

    const openCandidateModal = () => {
        // dispatch action to open modal
        dispatch(uiActions.openVoteCandidateModal());
        dispatch(voteActions.changeSelectedVoteCandidate(candidate._id));
    }

  return (
    <article className="candidate">
      <div className="candidate__image">
        <img src={candidate.image} alt={candidate.fullName} />
      </div>
      <div>
        <div>
            <h5>{candidate.fullName?.length > 20 ? candidate.fullName.substring(0, 20) + '...' : candidate.fullName}</h5>
            <span className="stat-value highlight">#{candidate.team?.ranking || 'N/A'}</span>
        </div>
        
        {/* <small>{candidate.motto?.length > 25 ? candidate.motto.substring(0, 25) + '...' : candidate.motto}</small> */}

         {/* --- TEAM STATS SECTION --- */}
        {/* <div className="candidate__stats">
            <span className="stat-rank">Rank: #{candidate.team?.ranking || 'N/A'}</span>
            <div className="stat-group">
                <span>P:{candidate.team?.played || 0} </span>
                <span>W:{candidate.team?.won || 0} </span>
                <span>L:{candidate.team?.lost || 0}</span>
            </div>
        </div> */}

        <div className="candidate__stats-list">
          <div className="stat-row">
              <span className="stat-label">Points</span>
              <span className="stat-value highlight">{candidate.team?.points || 0}</span>
          </div>
          <div className="stat-row">
              <span className="stat-label">Matches Played</span>
              <span className="stat-value">{candidate.team?.played || 0}</span>
          </div>
          <div className="stat-row">
              <span className="stat-label">Matches Won</span>
              <span className="stat-value">{candidate.team?.won || 0}</span>
          </div>
    
      </div>

        <button className="btn primary" onClick={openCandidateModal}>Vote</button>
      </div>
    </article>
  );
};

export default Candidate;