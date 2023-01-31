import { createSlice } from '@reduxjs/toolkit';
import { AccountsState } from '../../../accounts/rootReducer';

type Init = {
  idleInterval: number;
};

const init: Init = {
  idleInterval: 0,
};

const state = createSlice({
  name: 'settings',
  initialState: init,
  reducers: {
    setIdleInterval: (state, action) => ({
      ...state,
      idleInterval: action.payload,
    }),
  },
});

export const settingsActions = state.actions;

export default state.reducer;
const {} = settingsActions;

export const selectIdleInterval = (s: AccountsState) => s.settings.idleInterval;
