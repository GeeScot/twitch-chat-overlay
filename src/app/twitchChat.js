import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import tmi from 'tmi.js';

export const twitchChatSocket = createApi({
  reducerPath: 'twitchChat',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  endpoints: (build) => ({
    getMessages: build.query({
      queryFn: ({ channelName, timeout }) => ({ data: [] }),
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheEntryRemoved, getState }
      ) {
        const interval = setInterval(() => {
          updateCachedData(draft => {
            draft.shift();
          });
        }, arg.timeout * 1000);

        const client = new tmi.Client({ channels: [arg.channelName] });
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
        client.close();
        clearInterval(interval);
      },
    }),
  }),
})

export default twitchChatSocket;

export const { useGetMessagesQuery } = twitchChatSocket;

//   const max = (options?.current?.messages ?? 30) - 1;
//   setMessages(messages => [...messages.slice(-max).map(m => {
//     return {
//       ...m,
//       cssClass: ''
//     }
//   }), newMessage]);

//   if (options?.current && options.current.timeout !== 0) {
//     setTimeout(() => onMessageExpired(userstate.id), (options.current.timeout ?? 30) * 1000);
//   }
// }

// const onMessageExpired = (messageId) => {
//   setMessages(messages => messages.map((message) => {
//     if (message.id === messageId) {
//       message.cssClass = 'animate__slideOutUp';
//     } else {
//       message.cssClass = '';
//     }
//     return message;
//   }));

//   setTimeout(() => {
//     setMessages(messages => [...messages.filter(m => m.id !== messageId)]);
//   }, 500);
// }
