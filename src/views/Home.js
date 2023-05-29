import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Buffer } from 'buffer';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMessage, faPaste } from '@fortawesome/free-regular-svg-icons';

import useWindowHeight from '../hooks/useWindowHeight';
import { useDispatch } from 'react-redux';
import { setOptions } from '../app/appSlice';

const Home = () => {
  const navigate = useNavigate();
  const height = useWindowHeight();

  const [username, setUsername] = useState('');
  const [limit, setLimit] = useState(20);
  const [timeout, setTimeout] = useState(30);
  const [timestamps, setTimestamps] = useState(false);
  const [animations, setAnimations] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    const b64 = localStorage.getItem('twitch-chat-options');
    if (!b64) {
      return;
    }

    const decodedString = Buffer.from(b64, 'base64').toString();
    const options = JSON.parse(decodedString);

    setUsername(options.username);

    setLimit(options.limit);
    setTimeout(options.timeout);
    
    setTimestamps(options.timestamps);
    setAnimations(options.animations);
  }, [])

  const getOptions = () => {
    const options = {
      username: username.toLowerCase(),
      limit: parseInt(limit),
      timeout: parseInt(timeout),
      timestamps,
      animations
    }

    return options;
  }

  const encodeOptions = (options) => {
    const optionsString = JSON.stringify(options);
    const b64 = Buffer.from(optionsString).toString('base64');

    return b64;
  }

  const saveOptions = () => {
    const options = getOptions();
    const b64 = encodeOptions(options);

    localStorage.setItem('twitch-chat-options', b64);
    // dispatch(setOptions(options));
  }

  const getTargetPath = () => {
    const options = getOptions();
    const b64 = encodeOptions(options);

    return `${username.toLowerCase()}?options=${b64}`;
  }

  const onCopyUrl = async () => {
    saveOptions();

    const targetUrl = `${window.location.origin}/${getTargetPath()}`;
    await navigator.clipboard.writeText(targetUrl)
  }

  const onConfirm = () => {
    saveOptions();

    navigate(getTargetPath());
  }

  return (
    <Container style={{ height }}>
      <OptionsContainer>
        <Label htmlFor="username">Twitch Channel</Label>
        <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />

        <Label htmlFor="limit">Display {limit} Messages</Label>
        <RangeInput id="limit" type="range" value={limit} onChange={(e) => setLimit(e.target.value)} min="10" max="200" step={10} />
        
        <Label htmlFor="timeout">Message Timeout ({parseInt(timeout) === 0 ? 'off' : `${timeout} seconds`})</Label>
        <RangeInput id="timeout" type="range" value={timeout} onChange={(e) => setTimeout(e.target.value)} min="0" max="300" step={10} />
        
        <Label htmlFor="timestamps">Show Timestamps?</Label>
        <Checkbox id="timestamps" type="checkbox" checked={timestamps} value={timestamps} onChange={(e) => setTimestamps(!timestamps)} />
        
        <Label htmlFor="animations">Enable Animations?</Label>
        <Checkbox id="animations" type="checkbox" checked={animations} value={animations} onChange={(e) => setAnimations(!animations)} />
        
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
