import { useEffect, useState, useRef } from 'react';
import tmi from 'tmi.js';
import axios from 'axios';
import styled from 'styled-components';
import queryString from 'query-string';
import { Buffer } from 'buffer';
import { format } from 'date-fns';

// Components
import TwitchChannelBadge from '../components/TwitchChannelBadge';
import TwitchEmote from '../components/TwitchEmote';
import BTTV from '../components/emotes/BTTV';

// Data
import globalBadges from '../badges.json';

const Chat = () => {
  const channelName = window.location.pathname.substring(1).toLowerCase();

  // Configuration Options
  const options = useRef({});

  // Twitch Client
  const client = new tmi.Client({ channels: [channelName] });
  const [channelBadges, setChannelBadges] = useState(null);
  const [bttvEmotes, setBttvEmotes] = useState([]);
  const [messages, setMessages] = useState([]);
  const [displayMessages, setDisplayMessages] = useState([]);
  const bottom = useRef(null);

  useEffect(() => {
    const query = queryString.parse(window.location.search);
    const optionsObj = JSON.parse(Buffer.from(query.options, 'base64').toString());

    options.current = optionsObj;
  }, [])

  const onMessageReceived = (channel, userstate, message, self) => {
    if (self) {
      return;
    }
    
    // Replace Twitch Emotes in message
    let allEmotes = [];
    for (const emote in userstate.emotes) {
      const emotes = userstate.emotes[emote];
      const mappedEmotes = emotes.map((e) => {
        const [start, end] = e.split('-');
        return {
          emoteId: emote,
          start: parseInt(start),
          end: parseInt(end)
        }
      });

      allEmotes.push(...mappedEmotes);
    }

    allEmotes.sort((a, b) => b.start - a.start);

    const messageStack = [message];
    for (let i = 0; i < allEmotes.length; i++) {
      const { emoteId, start, end } = allEmotes[i];
      const m = messageStack.pop();
      const tailIndex = Math.min(m.length, parseInt(end)+1);
      messageStack.push(m.substring(tailIndex));
      messageStack.push(<TwitchEmote key={`${emoteId}${i}`} emoteId={emoteId} />);
      messageStack.push(m.substring(0, parseInt(start)));
    }

    // Push Message on to the stack
    const messageElements = messageStack.reverse();
    const newMessage = {
      id: userstate.id,
      username: userstate['display-name'],
      content: messageElements,
      color: userstate.color,
      badges: userstate.badges,
      timestamp: new Date(parseInt(userstate['tmi-sent-ts'])),
      cssClass: 'animate__slideInUp'
    };
    
    const max = (options?.current?.messages ?? 30) - 1;
    setMessages(messages => [...messages.slice(-max).map(m => {
      return {
        ...m,
        cssClass: ''
      }
    }), newMessage]);

    if (options?.current && options.current.timeout !== 0) {
      setTimeout(() => onMessageExpired(userstate.id), (options.current.timeout ?? 30) * 1000);
    }
  }

  const onMessageDeleted = (channel, username, deletedMessage, userstate) => {
    setMessages(messages => [...messages.filter(m => m.id !== userstate['target-msg-id'])]);
  }

  const onMessageExpired = (messageId) => {
    setMessages(messages => messages.map((message) => {
      if (message.id === messageId) {
        message.cssClass = 'animate__slideOutUp';
      } else {
        message.cssClass = '';
      }
      return message;
    }));

    setTimeout(() => {
      setMessages(messages => [...messages.filter(m => m.id !== messageId)]);
    }, 500);
  }

  const onClearChat = () => {
    setMessages(messages => []);
    setDisplayMessages(displayMessages => []);
  }

  useEffect(() => {
    const fetchChannelInformation = async () => {
      const { data: channelId } = await axios.get(`https://decapi.me/twitch/id/${channelName}`);

      const { data: channelBadges } = await axios.get(`https://badges.twitch.tv/v1/badges/channels/${channelId}/display`);
      setChannelBadges(channelBadges);

      const { data: globalBttvEmotes } = await axios.get('https://api.betterttv.net/3/cached/emotes/global');
      const { data: channelBttvProfile } = await axios.get(`https://api.betterttv.net/3/cached/users/twitch/${channelId}`);

      const allBttvEmotes = [...globalBttvEmotes, ...channelBttvProfile.channelEmotes, ...channelBttvProfile.sharedEmotes];
      allBttvEmotes.sort((a, b) => a.code > b.code ? 1 : -1);
      setBttvEmotes(allBttvEmotes);
    }

    fetchChannelInformation();

    client.connect();

    client.on('message', onMessageReceived);
    client.on('messagedeleted', onMessageDeleted);
    client.on('clearchat', onClearChat);
  
    return () => {
      client.disconnect();
    }
    // eslint-disable-next-line
  }, [])
  
  useEffect(() => {
    const processed = messages.map(((message) => {
      const existingMessageStack = [...message.content].reverse();

      const messageStack = [];
      for (const m of existingMessageStack) {
        if (typeof m !== 'string') {
          messageStack.push(m);
          continue;
        }

        const fragment = [];
        const tokens = m.split(' ').reverse() ?? [m];
        for (const token of tokens) {
          const bttvEmote = bttvEmotes.find(x => x.code === token);
          if (bttvEmote) {
            const randomId = Math.floor(Math.random() * 1000);
            fragment.push(<BTTV key={randomId} emoteId={bttvEmote.id} />);
          } else {
            fragment.push(token);
            fragment.push(' ');
          }
        }

        messageStack.push(...fragment);
      }

      const forwardMessageStack = messageStack.reverse();
      return {
        ...message,
        content: forwardMessageStack
      };
    }));

    setDisplayMessages(processed);

    if (options?.current?.autoScroll === true) {
      // https://stackoverflow.com/questions/37620694/how-to-scroll-to-bottom-in-react
      setTimeout(() => bottom.current.scrollIntoView({ behaviour: 'smooth' }), 100);
    }
    // eslint-disable-next-line
  }, [messages])

  return (
    <ChatContainer>
      {displayMessages && displayMessages.map((message, index) => {
        return (
          <MessageContainer key={index} className={`${options?.current?.disableAnimations ? '' : 'animate__animated animate__faster'} ${message.cssClass}`}>
            <Username color={message.color}>
              {options?.current?.showTimestamps && <Timestamp>{ format(message.timestamp, 'HH:mm')  }</Timestamp>}
              {channelBadges && message.badges && Object.entries(message.badges).map(([badge, version]) => {
                const badgeVersion = (channelBadges.badge_sets[badge] || globalBadges.badge_sets[badge])?.versions[version];
                if (!badgeVersion) {
                  return <span key={badge}></span>;
                }

                return (
                  <TwitchChannelBadge key={badge} alt={badge} badgeVersion={badgeVersion} />
                )
              })}
              <UsernameText>{message.username}</UsernameText>
            </Username>
            <MessageBody>
              { message.content }
            </MessageBody>
          </MessageContainer>
        )
      })}
      <div>
        <BottomAnchor ref={bottom}></BottomAnchor>
      </div>
    </ChatContainer>
  );
}

export default Chat;

const BottomAnchor = styled.div`
  float: left;
  clear: both;

  width: 100%;
  padding: 10px 0;

  color: #ffffff;

  font-size: 24px;
  text-align: center;
`;

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  padding: 10px 0;

  align-items: center;

  user-select: none;

  scrollbar-width: thin;
  scrollbar-color: #6969dd #e0e0e0;
`;

const MessageContainer = styled.div`
  width: 90%;

  word-wrap: break-word;

  color: white;
  background-color: rgba(0, 0, 0, 0.97);

  padding: 8px 12px;

  border-radius: 6px;
  box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
`;

const Timestamp = styled.div`
  font-size: 12px;

  padding-right: 1px;

  color: #ffffff;
`;

const Username = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2px;

  color: ${p => p.color};

  margin-bottom: 4px;

  align-items: center;
`;

const UsernameText = styled.div`
  font-size: 15px;
  font-weight: bold;

  padding-left: 1px;
`;

const MessageBody = styled.div`
  font-size: 16px;
`;
