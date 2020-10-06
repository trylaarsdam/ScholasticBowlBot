const Discord = require('discord.js');
const client = new Discord.Client();

const embed = {
    "title": "Are you sure you want to clear the channel?",
    "description": "React yes (check) or no (x)",
    "color": 62463,
    "timestamp": "2020-10-06T21:23:50.909Z",
    "footer": {
      "icon_url": "https://cdn.discordapp.com/embed/avatars/0.png",
      "text": "Scholastic Bowl Bot"
    },
    "author": {
      "name": "Action Confirmation",
      "url": "https://toddr.org",
      "icon_url": "https://toddr.org/assets/images/t-transparent-114x108.png"
    }
};


client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content === '!clear') {
    channel.send({ embed });
  }
});

client.login('token');