const Discord = require('discord.js');
const client = new Discord.Client();
require('dotenv').config()
const express = require('express')
const app = express()
const port = 8000;

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

app.get('/', (req, res) => {
    res.send('Hello World!')
  })
  
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })

client.on('message', msg => {
  if (msg.content === '!clear') {
    msg.channel.send({ embed });
  }
});

client.login(process.env.token);