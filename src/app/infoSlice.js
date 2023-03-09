import { createSlice } from '@reduxjs/toolkit';
import { fetchChannelId, fetchChannelBadges } from './thunks';

const infoSlice = createSlice({
  name: 'info',
  initialState: {
    channelId: '',
    badges: [],
    limit: 10
  },
  reducers: {},
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

export default infoSlice;
