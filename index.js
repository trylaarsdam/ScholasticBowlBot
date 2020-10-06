const Discord = require('discord.js');
const client = new Discord.Client();
require('dotenv').config()
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`App is running on port ${ PORT }`);
});

const embed = {
    "title": "Are you sure you want to clear the channel?",
    "description": "React yes (✅) or no (❌)",
    "color": 62463,
    "timestamp": "2020-10-06T21:23:50.909Z",
    "footer": {
      "icon_url": "https://cdn.discordapp.com/embed/avatars/0.png",
      "text": "Scholastic Bowl Bot"
    }
};

async function clear100(original, sent){
    const fetched = await original.channel.fetchMessages({limit: 99});
    original.channel.bulkDelete(fetched);
}

function clear(original, sent){
    original.delete();
    sent.delete();
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

let lastMessage;
let sentMessage;

client.on('message', msg => {
  if (msg.content === '!clear') {
    let sent;
    msg.channel.send({ embed }).then(sentmsg => {
        console.log('sending message');
        sent = sentmsg;
        sent.react('✅')
            .then(() => sent.react('❌'))
            .catch(() => console.log("Failed to react"));
        lastMessage = msg;
        sentMessage = sent;
        reactionsWait();
        /*const collector = msg.createReactionCollector(filter, { time: 15000 });
        collector.on('collect', (reaction, user) => {
            console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
            if(reaction.emoji.name === '✅'){
                clear100(msg, sent);
            }
            else{
                clear(msg, sent);
            }
        });
        collector.on('end', collected => {
            console.log(`Collected ${collected.size} items`);
            msg.delete();
            sent.delete();
        });*/
    });
  }
});

const filter = (reaction, user) => {
    console.log("reacted");
    return ['❌', '✅'].includes(reaction.emoji.name) && user.id === message.author.id;
};

async function reactionsWait(){
    console.log('waiting');
    lastMessage.awaitReactions(filter, { max:1, time:15000, errors: ['time'] })
        .then(collected => {
            const reaction = collected.first();
            console.log(collected);
            if(reaction.emoji.name === '✅'){
                clear100(lastMessage, sentMessage);
            }
            else{
                clear(lastMessage, sentMessage);
            }
        })
        .catch(collected => {
            lastMessage.reply('You reacted with something other than ✅ or ❌, or did not react');
            lastMessage.delete();
            sentMessage.delete();
        })
}

client.login(process.env.token);