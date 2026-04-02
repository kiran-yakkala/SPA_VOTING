import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  addCandidateModalShowing: false,
  voteCandidateModalShowing: false,
  electionModalShowing: false,
  updateElectionModalShowing: false,
  closeElectionModalShowing:false,
  teamModalShowing: false,
  updateTeamModalShowing: false
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openAddCandidateModal(state) {
      state.addCandidateModalShowing = true;
    },
    closeAddCandidateModal(state) {
      state.addCandidateModalShowing = false;
    },
    openVoteCandidateModal(state) {
      state.voteCandidateModalShowing = true;
    },
    closeVoteCandidateModal(state) {
      state.voteCandidateModalShowing = false;
    },
    openElectionModal(state) {
      state.electionModalShowing = true;
    },
    closeElectionModal(state) {
      state.electionModalShowing = false;
    },
    openUpdateElectionModal(state) {
      state.updateElectionModalShowing = true;
    },
    closeUpdateElectionModal(state) {
      state.updateElectionModalShowing = false;
    },
    openElectionCloseModal(state) {
      state.closeElectionModalShowing = true;
    },
    closeElectionCloseModal(state) {
      state.closeElectionModalShowing = false;
    },
    openTeamModal(state) {
      state.teamModalShowing = true;
    },
    closeTeamModal(state) {
      state.teamModalShowing = false;
    },
    openUpdateTeamModal(state) {
      state.updateTeamModalShowing = true;
    },
    closeUpdateTeamModal(state) {
      state.updateTeamModalShowing = false;
    },
  }
});

export const uiActions = uiSlice.actions;

export default uiSlice;