import { configureStore } from '@reduxjs/toolkit';
import appSlice from './appSlice';
import emotesSlice from './emotesSlice';
import twitchChatSocket from './twitchChat';

const store = configureStore({
  reducer: {
    [appSlice.name]: appSlice.reducer,
    [emotesSlice.name]: emotesSlice.reducer,
    [twitchChatSocket.reducerPath]: twitchChatSocket.reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(twitchChatSocket.middleware)
});

export default store;
