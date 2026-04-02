import { createSlice } from '@reduxjs/toolkit';

const currentVoter = JSON.parse(localStorage.getItem("currentuser"))

const initialState = {
  selectedVoteCandidate: "",
  currentVoter,
  selectedElection: "",
  idOfElectionToUpdate: "",
  addCandidateElectionId: "",
  idOfTeamToUpdate: ""
};

const voteSlice = createSlice({
  name: 'vote',
  initialState,
  reducers: {
    changeSelectedVoteCandidate: (state, action) => {
      state.selectedVoteCandidate = action.payload;
    },
    changeCurrentVoter: (state, action) => {
      state.currentVoter = action.payload;
    },
    changeSelectedElection: (state, action) => {
      state.selectedElection = action.payload;
    },
    changeIdOfElectionToUpdate: (state, action) => {
      state.idOfElectionToUpdate = action.payload;
    },
    changeAddCandidateElectionId: (state, action) => {
      state.addCandidateElectionId = action.payload;
    },
    changeIdOfTeamToUpdate: (state, action) => {
      state.idOfTeamToUpdate = action.payload;
    },
  },
});

export const voteActions = voteSlice.actions;
export default voteSlice;