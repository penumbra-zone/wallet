import { createSlice } from '@reduxjs/toolkit';
import { AccountsState } from '../../../accounts/rootReducer';

type Init = {
  messages: any[];
  unapprovedMessages: any[];
};

const init: Init = {
  messages: [],
  unapprovedMessages: [],
};

const messageNotification = createSlice({
  name: 'messageNotification',
  initialState: init,
  reducers: {
    setMessages: (state, action) => ({
      ...state,
      ...action.payload
    }),
  },
});

export const messageNotificationActions = messageNotification.actions;

export default messageNotification.reducer;


export const selectMessages = (state: AccountsState) =>state.messageNotification;
