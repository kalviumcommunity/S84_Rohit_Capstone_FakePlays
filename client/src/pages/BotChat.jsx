import { useParams } from 'react-router-dom';

const BotChat = () => {
  const { botPath } = useParams();
  const allBots = JSON.parse(localStorage.getItem("customBots")) || [];
  const bot = allBots.find(b => b.path === botPath);

  if (!bot) {
    return <div>Bot not found!</div>; // Handle bot not found scenario
  }

  return (
    <div>
      <h1>{bot.name}</h1>
      <img src={bot.img} alt={bot.name} />
      <p>{bot.desc}</p>
      {/* Add chat interface here */}
    </div>
  );
};

export default BotChat;
