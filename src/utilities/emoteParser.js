import TwitchEmote from "../components/TwitchEmote";
import BTTV from "../components/emotes/BTTV";

const replaceSubscriberEmotes = (messages) => {
  if (!messages) {
    return messages;
  }

  return messages.map(mapSubscriberEmotes);
};

const mapSubscriberEmotes = (message) => {
  let allEmotes = [];
  for (const emote in message.emotes) {
    const emotes = message.emotes[emote];
    const mapped = emotes.map((e) => {
      const [start, end] = e.split("-");
      return {
        emoteId: emote,
        start: parseInt(start),
        end: parseInt(end),
      };
    });

    allEmotes.push(...mapped);
  }

  allEmotes.sort((a, b) => b.start - a.start);

  const messageStack = [message.content];
  for (let i = 0; i < allEmotes.length; i++) {
    const { emoteId, start, end } = allEmotes[i];
    const m = messageStack.pop();
    const tailIndex = Math.min(m.length, parseInt(end) + 1);
    messageStack.push(m.substring(tailIndex));
    messageStack.push(<TwitchEmote key={`${message.id}${emoteId}${i}`} emoteId={emoteId} />);
    messageStack.push(m.substring(0, parseInt(start)));
  }

  return {
    ...message,
    content: messageStack
  };
}

const replaceBttvEmotes = (messages, bttvEmotes) => {
  if (!messages) {
    return messages;
  }

  return messages.map(message => mapBttvEmotes(message, bttvEmotes));
};

const mapBttvEmotes = (message, bttvEmotes) => {
  const reversed = [...message.content];
  const bttvStack = [];
  for (const m of reversed) {
    if (typeof m !== 'string') {
      bttvStack.push(m);
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

    bttvStack.push(...fragment);
  }

  return {
    ...message,
    content: bttvStack.reverse()
  };
}

export { replaceSubscriberEmotes, replaceBttvEmotes };
