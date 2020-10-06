const Discord = require('discord.js');
const client = new Discord.Client();
require('dotenv').config()

const embed = {
    "title": "Are you sure you want to clear the channel?",
    "description": "React yes (check) or no (x)",
    "color": 62463,
    "timestamp": "2020-10-06T21:23:50.909Z",
    "footer": {
      "icon_url": "https://cdn.discordapp.com/embed/avatars/0.png",
      "text": "Scholastic Bowl Bot"
    }
};

async function clear() {
    msg.delete();
    const fetched = await msg.channel.fetchMessages({limit: 99});
    msg.channel.bulkDelete(fetched);
    sent.delete();
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

const filter = (reaction, user) => {
	return (reaction.emoji.name === '✅' && user.id === msg.author.id) || (reaction.emoji.name === '❌' && user.id === msg.author.id);
};

client.on('message', msg => {
  if (msg.content === '!clear') {
    let id = "";
    let sent;
    msg.reply({ embed }).then(sent => {
        id = sent.id;
        console.log(id);
    });
    sent = msg.channel.messages.fetch(id);
    sent.react('✅');
    sent.react('❌');
    const collector = msg.createReactionCollector(filter, { time: 15000 });
    collector.on('collect', (reaction, user) => {
        console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
        if(reaction.emoji.name === '✅'){
            clear();
        }
        else{
            msg.delete();
            sent.delete();
        }
    });
    collector.on('end', collected => {
        console.log(`Collected ${collected.size} items`);
        msg.delete();
        sent.delete();
    });
  }
});


client.login(process.env.token);