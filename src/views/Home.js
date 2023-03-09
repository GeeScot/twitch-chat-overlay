import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Buffer } from 'buffer';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessage, faPaste } from '@fortawesome/free-regular-svg-icons';

import useWindowHeight from '../hooks/useWindowHeight';

const Home = () => {
  const navigate = useNavigate();
  const height = useWindowHeight();

  const [username, setUsername] = useState('');
  const [messageCount, setMessageCount] = useState(20);
  const [messageTimeout, setMessageTimeout] = useState(30);
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [disableAnimations, setDisableAnimations] = useState(false);

  useEffect(() => {
    const b64 = localStorage.getItem('twitch-chat-options');
    if (!b64) {
      return;
    }

    const decodedString = Buffer.from(b64, 'base64').toString();
    const options = JSON.parse(decodedString);

    setUsername(options.username);

    setMessageCount(options.messages);
    setMessageTimeout(options.timeout);
    
    setShowTimestamps(options.showTimestamps);
    setAutoScroll(options.autoScroll);
    setDisableAnimations(options.disableAnimations);
  }, [])

  const onSaveOptions = () => {
    const options = {
      username,
      autoScroll,
      disableAnimations,
      showTimestamps,
      messages: parseInt(messageCount),
      timeout: parseInt(messageTimeout),
    }

    const optionsString = JSON.stringify(options);
    const b64 = Buffer.from(optionsString).toString('base64');

    localStorage.setItem('twitch-chat-options', b64);
  }

  const onCopyUrl = async () => {
    onSaveOptions();

    const targetUrl = `${window.location.origin}/${getTargetPath()}`;
    await navigator.clipboard.writeText(targetUrl)
  }

  const onConfirm = () => {
    onSaveOptions();

    navigate(getTargetPath());
  }

  const getTargetPath = () => {
    const options = {
      username,
      autoScroll,
      disableAnimations,
      showTimestamps,
      messages: parseInt(messageCount),
      timeout: parseInt(messageTimeout),
    }

    const optionsString = JSON.stringify(options);
    const b64 = Buffer.from(optionsString).toString('base64');

    return `${username.toLowerCase()}?options=${b64}`;
  }

  return (
    <Container style={{ height }}>
      <OptionsContainer>
        <Label htmlFor="username">Twitch Channel</Label>
        <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />

        <Label htmlFor="messageCount">Display {messageCount} Messages</Label>
        <RangeInput id="messageCount" type="range" value={messageCount} onChange={(e) => setMessageCount(e.target.value)} min="10" max="200" step={10} />
        
        <Label htmlFor="messageTimeout">Message Timeout ({parseInt(messageTimeout) === 0 ? 'off' : `${messageTimeout} seconds`})</Label>
        <RangeInput id="messageTimeout" type="range" value={messageTimeout} onChange={(e) => setMessageTimeout(e.target.value)} min="0" max="300" step={10} />
        
        <Label htmlFor="showTimestamps">Show Timestamps?</Label>
        <Checkbox id="showTimestamps" type="checkbox" checked={showTimestamps} value={showTimestamps} onChange={(e) => setShowTimestamps(!showTimestamps)} max={500} />
        
        <Label htmlFor="autoScroll">Auto Scroll?</Label>
        <Checkbox id="autoScroll" type="checkbox" checked={autoScroll} value={autoScroll} onChange={(e) => setAutoScroll(!autoScroll)} max={500} />
        
        <Label htmlFor="disableAnimations">Disable Animations?</Label>
        <Checkbox id="disableAnimations" type="checkbox" checked={disableAnimations} value={disableAnimations} onChange={(e) => setDisableAnimations(!disableAnimations)} max={500} />
        
        <TargetUrl type="text" value={`${window.location.origin}/${getTargetPath()}`} disabled />

        <ButtonContainer>
          <CopyButton onClick={onCopyUrl}><FontAwesomeIcon icon={faPaste} />&nbsp;Copy URL</CopyButton>
          <OpenButton onClick={onConfirm}><FontAwesomeIcon icon={faMessage} />&nbsp;Open</OpenButton>
        </ButtonContainer>
      </OptionsContainer>
    </Container>
  )
}

export default Home;

const Container = styled.div``;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;

  height: 100%;

  color: #ffffff;

  justify-content: center;
  align-items: center;
`;

const Label = styled.label`
  text-align: left;
  padding-top: 10px;
`;

const Input = styled.input`
  width: 90%;

  padding: 6px 10px;

  border: 1px solid #808080;
  border-radius: 6px;

  font-family: 'Poppins', sans-serif;
  font-weight: bold;

  @media (min-width: 900px) {
    width: 250px;
  }
`;

const RangeInput = styled(Input)`
  padding: 0;
`;

const Checkbox = styled.input`
  transform: scale(1.5);

  padding: 6px 10px;

  border: 1px solid #808080;
  border-radius: 6px;
`;

const Button = styled.button`
  width: 150px;

  margin-top: 10px;
  padding: 6px 0;

  font-family: 'Poppins', sans-serif;
  font-weight: bold;

  border: 1px solid #303030;
  border-radius: 6px;

  box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;

  color: #000000;

  cursor: pointer;

  & > * {
    vertical-align: middle;
    font-size: 16px;
  }
`;

const CopyButton = styled(Button)`
  background-color: #008cff;
`;

const OpenButton = styled(Button)`
  background-color: hotpink;
`;

const TargetUrl = styled.input`
  width: 90%;

  padding: 6px 10px;
  margin-top: 10px;

  border: 1px solid #808080;
  border-radius: 6px;

  font-family: 'Poppins', sans-serif;
  font-weight: bold;
  font-size: 14px;

  color: #ffffff;

  overflow: hidden;

  @media (min-width: 900px) {
    width: 400px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 15px;

  justify-content: center;
  align-items: center;

  width: 100%;
`;
