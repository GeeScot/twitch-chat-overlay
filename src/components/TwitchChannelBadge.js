import styled from 'styled-components';

const TwitchChannelBadge = ({ alt, badgeVersion }) => {
  const badgeSrcUrl = badgeVersion?.image_url_4x ?? badgeVersion?.image_url_2x ?? badgeVersion?.image_url_1x;

  return (
    <ChannelBadge alt={alt} src={badgeSrcUrl} />
  )
}

export default TwitchChannelBadge;

const ChannelBadge = styled.img`
  width: 18px;
  height: 18px;
  padding: 0 1px;

  object-fit: scale-down;
`;
