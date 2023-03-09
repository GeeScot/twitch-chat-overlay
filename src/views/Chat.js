import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import queryString from 'query-string';
import { Buffer } from 'buffer';
import { format, parseISO } from 'date-fns';

// Components
import TwitchChannelBadge from '../components/TwitchChannelBadge';

// Data
import globalBadges from '../badges.json';
import { useGetMessagesQuery } from '../app/twitchChat';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBttvEmotes, fetchChannelBadges, fetchChannelId } from '../app/thunks';
import { replaceBttvEmotes, replaceSubscriberEmotes } from '../utilities/emoteParser';
import getUsernameColor from '../utilities/contrastRatio';

const Chat = () => {
  // Configuration Options
  const options = useRef({});
  const bottom = useRef(null);
  const channelName = window.location.pathname.substring(1).toLowerCase();
  const channelBadges = useSelector(state => state.info.badges);
  const bttv = useSelector(state => state.emotes.bttv);
  const { messages } = useGetMessagesQuery({ channelName, timeout: options.current.timeout }, {
    selectFromResult: (result) => {
      const messageStacks = replaceSubscriberEmotes(result.data);
      const messages = replaceBttvEmotes(messageStacks, bttv);
      return { messages };
    }
  });
  const dispatch = useDispatch();

  useEffect(() => {
    const query = queryString.parse(window.location.search);
    const optionsObj = JSON.parse(Buffer.from(query.options, 'base64').toString());
    options.current = optionsObj;

    dispatch(fetchChannelId(channelName))
      .then(() => {
        dispatch(fetchChannelBadges({}));
        dispatch(fetchBttvEmotes({}));
      });
  }, [channelName, dispatch])

  useEffect(() => {
    if (options?.current?.autoScroll === true) {
      // https://stackoverflow.com/questions/37620694/how-to-scroll-to-bottom-in-react
      setTimeout(() => bottom.current.scrollIntoView({ behaviour: 'smooth' }), 100);
    }
    // eslint-disable-next-line
  }, [messages])

  return (
    <ChatContainer>
      {messages && messages.map((message, index) => {
        return (
          <MessageContainer key={index} className={`${options?.current?.disableAnimations ? '' : 'animate__animated animate__faster'} ${message.cssClass}`}>
            <Username color={getUsernameColor(message.color)}>
              {options?.current?.showTimestamps && <Timestamp>{ format(parseISO(message.timestamp), 'HH:mm')  }</Timestamp>}
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
            <MessageBody key={message.id}>
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
