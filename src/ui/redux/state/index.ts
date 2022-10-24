import { createSlice } from '@reduxjs/toolkit';
import { AccountsState } from '../../../accounts/rootReducer';

type Init = null | {
  initialized: boolean | undefined;
  locked: boolean;
};

const init: Init = null;

const state = createSlice({
  name: 'localState',
  initialState: init,
  reducers: {
    setAppState: (state, action) => ({
      ...state,
      ...action.payload,
    }),
  },
});

export const stateActions = state.actions;

export default state.reducer;
const {} = stateActions;

// export const updateAppState =
//   (initialized: boolean, locked: boolean) =>
//   (dispatch: AccountsStore['dispatch']) => {
//     dispatch(setAppState({ initialized, locked }));
//   };

export const selectState = (s: AccountsState) => s.state;
