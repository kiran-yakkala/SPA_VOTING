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
        <h5>{candidate.fullName?.length > 20 ? candidate.fullName.substring(0, 20) + '...' : candidate.fullName}</h5>
        <small>{candidate.motto?.length > 25 ? candidate.motto.substring(0, 25) + '...' : candidate.motto}</small>
        <button className="btn primary" onClick={openCandidateModal}>Vote</button>
      </div>
    </article>
  );
};

export default Candidate;