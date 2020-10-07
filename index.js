const Discord = require('discord.js');
const client = new Discord.Client();
require('dotenv').config()
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`App is running on port ${ PORT }`);
});

var setting = 0;

const embed = {
    "title": "Are you sure you want to clear the channel?",
    "description": "React yes (✅) or no (❌)",
    "color": 62463,
    "timestamp": "2020-10-06T21:23:50.909Z",
    "footer": {
      "text": "Scholastic Bowl Bot"
    }
};

async function clear100(original, sent){
    sent.channel.fetchMessages()
        .then(function(list){
            sent.channel.bulkDelete(list);
        },
        function(err){
            message.channel.send("Error deleting messages. Please check my permissions!")
        }
    )
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
        //reactionsWait();
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
  else if (msg.content === '!mutechannel'){
      if(msg.author.hasPermission('ADMINISTRATOR')){
          msg.reply("You have permission");
      }
      else{
          msg.reply("You need `ADMINISTRATOR` permissions to run that command");
      }
  }
});
var emojiRecieved = "none";
const filter = (reaction, user) => {
    console.log("reacted");
    if((reaction.emoji.name == '✅' || reaction.emoji.name == '❌') && user.id == lastMessage.author.id){
        if(reaction.emoji.name == '✅'){
            emojiRecieved = "check";
        }
        else if(reaction.emoji.name == '❌'){
            emojiRecieved = "cancel";
        }
        return true;
    }
    else{
        emojiRecieved = "none";
        return false;
    }
};

/*client.on('messageReactionAdd', (reaction, user) => {
    if(setting){
        let message = reaction.message, emoji = reaction.emoji;
        if(emoji.name == '✅' && message.id == sentMessage.id){
            clear100(lastMessage, sentMessage);
            setting = 0;
        }
        else if(emoji.name == '❌' && message.id == sentMessage.id){
            clear(lastMessage, sentMessage);
            setting = 0;
        }
    }
})*/

function reactionsWait(){
    console.log('waiting');
    /*lastMessage.awaitReactions(filter, { max:2, time:15000, errors: ['time'] })
        .then(collected => {
            console.log("Reacted!");
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
        })*/
    let collector = sentMessage.createReactionCollector(filter, { time: 15000 });
    collector.on('collect', (reaction, collector) => {
        console.log('got a reaction');
        lastMessage.channel.fetch()
            .then(function(list){
                if(emojiRecieved == "check"){
                    lastMessage.channel.bulkDelete(100);
                    emojiRecieved = "none";
                }
                else if(emojiRecieved == "cancel"){
                    lastMessage.delete();
                    sentMessage.delete();
                    emojiRecieved == "none";
                }
            },
            function(err){
                lastMessage.channel.send("Error deleting messages. Check my permissions!")
                emojiRecieved = "none";
            })
    });
    collector.on('end', collected => {
        console.log(`collected ${collected.size} reactions`);
    });
}

client.login(process.env.token);