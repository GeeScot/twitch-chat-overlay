const TwitchEmote = ({ emoteId }) => {
  return (
    <img
      alt={emoteId}
      src={`https://static-cdn.jtvnw.net/emoticons/v2/${emoteId}/default/dark/2.0`}
      width="25"
      height="25"
      style={{ objectFit: 'scale-down' }} />
  )
}

export default TwitchEmote;
