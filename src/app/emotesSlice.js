import { createSlice } from '@reduxjs/toolkit';
import { fetchBttvEmotes } from './thunks';

const emotesSlice = createSlice({
  name: 'emotes',
  initialState: {
    bttv: []
  },
  extraReducers: (builder) => {
    builder.addCase(fetchBttvEmotes.fulfilled, (state, { payload }) => {
      state.bttv = payload;
    })
  }
});

export default emotesSlice;
