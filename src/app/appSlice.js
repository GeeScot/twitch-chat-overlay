import { createSlice } from '@reduxjs/toolkit';
import { fetchChannelId, fetchChannelBadges } from './thunks';

const appSlice = createSlice({
  name: 'app',
  initialState: {
    channelId: '',
    badges: [],
    limit: 10
  },
  reduers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchChannelId.fulfilled, (state, { payload }) => {
        state.channelId = payload;
      })
      .addCase(fetchChannelBadges.fulfilled, (state, { payload }) => {
        state.badges = payload;
      })
  }
});

export default appSlice;
