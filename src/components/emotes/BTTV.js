const BTTV = ({ emoteId }) => {
  return (
    <img alt={emoteId} src={`https://cdn.betterttv.net/emote/${emoteId}/3x`} width="25" height="25" style={{ padding: '0 2px' }} />
  );
}

export default BTTV;
