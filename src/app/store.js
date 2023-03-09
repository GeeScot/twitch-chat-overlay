import { configureStore } from '@reduxjs/toolkit';
import infoSlice from './infoSlice';
import emotesSlice from './emotesSlice';
import twitchChatSocket from './twitchChat';

const store = configureStore({
  reducer: {
    [infoSlice.name]: infoSlice.reducer,
    [emotesSlice.name]: emotesSlice.reducer,
    [twitchChatSocket.reducerPath]: twitchChatSocket.reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(twitchChatSocket.middleware)
});

export default store;
