import { createSlice } from '@reduxjs/toolkit';
import { fetchChannelId, fetchChannelBadges } from './thunks';

const appSlice = createSlice({
  name: 'app',
  initialState: {
    channelId: '',
    badges: [],
    options: {
      username: '',
      limit: 10,
      timeout: 30,
      timestamps: false,
      animations: false
    }
  },
  reduers: {
    setOptions: (state, { payload }) => {
      state.options = payload;
    }
  },
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

export const { setOptions } = appSlice.actions;

export default appSlice;
