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

const Chat = () => {
  // Configuration Options
  const options = useRef({});
  const bottom = useRef(null);
  const channelBadges = useSelector(state => state.app.badges);
  const bttv = useSelector(state => state.emotes.bttv);
  const { messages } = useGetMessagesQuery({ username: options.current.username, timeout: options.current.timeout }, {
    selectFromResult: (result) => {
      const messageStacks = replaceSubscriberEmotes(result.data);
      const messages = replaceBttvEmotes(messageStacks, bttv);
      return { messages };
    }
  });
  const dispatch = useDispatch();

  useEffect(() => {
    const query = queryString.parse(window.location.search);
    const optionsString = Buffer.from(query.options, 'base64').toString();
    const opts = JSON.parse(optionsString);
    options.current = opts;

    // dispatch(setOptions(opts));

    dispatch(fetchChannelId(opts.username))
      .then(() => {
        dispatch(fetchChannelBadges({}));
        dispatch(fetchBttvEmotes({}));
      });
  }, [dispatch])

  useEffect(() => {
    // https://stackoverflow.com/questions/37620694/how-to-scroll-to-bottom-in-react
    setTimeout(() => bottom.current.scrollIntoView({ behaviour: 'smooth' }), 100);
  }, [messages])

  return (
    <ChatContainer>
      {messages && messages.map((message, index) => {
        return (
          <MessageContainer key={index} className={`${options?.current?.disableAnimations ? '' : 'animate__animated animate__faster'} ${message.cssClass}`}>
            <Username color={message.color}>
              {options?.current && options.current.timestamps && <Timestamp>{ format(parseISO(message.timestamp), 'HH:mm')  }</Timestamp>}
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
              <MessageBody key={message.id}>
                { message.content }
              </MessageBody>
            </Username>
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
  gap: 4px;

  padding: 10px 0;

  align-items: center;

  user-select: none;

  scrollbar-width: thin;
  scrollbar-color: #6969dd #e0e0e0;
`;

const MessageContainer = styled.div`
  /* width: 90%; */
  display: flex;
  flex-direction: column;

  justify-content: center;

  word-wrap: break-word;

  color: white;

  padding: 8px 12px;
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
  color: #ffffff;

  margin-left: 4px;
`;
