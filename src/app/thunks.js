import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchChannelId = createAsyncThunk('ChannelId', async (channelName) => {
  const { data: channelId } = await axios.get(`https://decapi.me/twitch/id/${channelName}`);

  return channelId;
});

export const fetchChannelBadges = createAsyncThunk('ChannelBadges', async (_, thunkAPI) => {
  const state = thunkAPI.getState();
  const { data: channelBadges } = await axios.get(`https://badges.twitch.tv/v1/badges/channels/${state.info.channelId}/display`);

  return channelBadges;
})

export const fetchBttvEmotes = createAsyncThunk('BTTVemotes', async (_, thunkAPI) => {
  const state = thunkAPI.getState();
  const { data: global } = await axios.get('https://api.betterttv.net/3/cached/emotes/global');
  const { data: channelProfile } = await axios.get(`https://api.betterttv.net/3/cached/users/twitch/${state.info.channelId}`);

  return [...global, ...channelProfile.channelEmotes, ...channelProfile.sharedEmotes];
});
