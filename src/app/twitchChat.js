import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import tmi from 'tmi.js';

export const twitchChatSocket = createApi({
  reducerPath: 'twitchChat',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  endpoints: (build) => ({
    getMessages: build.query({
      queryFn: () => ({ data: [] }),
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheEntryRemoved, getState }
      ) {
        const client = new tmi.Client({ channels: ['hekimae'] });
        try { 
          // await cacheDataLoaded
          client.connect();

          const onMessageReceived = (channel, userstate, message, self) => {
            const data = {
              id: userstate.id,
              username: userstate['display-name'],
              emotes: userstate.emotes,
              content: message,
              color: userstate.color,
              badges: userstate.badges,
              timestamp: new Date(parseInt(userstate['tmi-sent-ts'])).toISOString()
            };
            updateCachedData((draft) => {
              const state = getState();
              if (draft.length === state.info.limit) {
                draft.shift();
              }

              draft.push(data);
            });
          }

          const onMessageDeleted = (channel, username, deletedMessage, userstate) => {
            updateCachedData((draft) => {
              draft = draft.filter(m => m.id !== userstate['target-msg-id']);
            });
          }

          const onClearChat = () => {
            updateCachedData((draft) => {
              draft = [];
            });
          }

          client.on('message', onMessageReceived);
          client.on('messagedeleted', onMessageDeleted);
          client.on('clearchat', onClearChat);
        } catch {}
        await cacheEntryRemoved
        client.close()
      },
    }),
  }),
})

export default twitchChatSocket;

export const { useGetMessagesQuery } = twitchChatSocket;
