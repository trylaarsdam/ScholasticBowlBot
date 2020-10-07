const Discord = require('discord.js');
const client = new Discord.Client();
require('dotenv').config()
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
});

var setting = 0;
var buzzOrder = [];

const embed = {
    "title": "Are you sure you want to do this?",
    "description": "React yes (✅) or no (❌)",
    "color": 62463,
    "timestamp": "2020-10-06T21:23:50.909Z",
    "footer": {
        "text": "Scholastic Bowl Bot"
    }
};

const resetEmbed = {
    "title": "Are you sure you want to reset the queue?",
    "description": "React yes (✅) or no (❌)",
    "color": 62463,
    "timestamp": "2020-10-06T21:23:50.909Z",
    "footer": {
      "text": "Scholastic Bowl Bot"
    }
};

const buzzListTemplate = {
    "title": "Buzz List",
    "description": "Shows the order in which players used the !buzz command for this question.",
    "color": 6748568,
    "timestamp": "2020-10-07T03:10:08.360Z",
    "footer": {
      "text": "Scholastic Bowl Bot"
    },
    "fields": [
        {
            "name": "1",
            "value": "User"
        }
    ]
};

async function clear100(original, sent) {
    sent.channel.fetchMessages()
        .then(function (list) {
            sent.channel.bulkDelete(list);
        },
            function (err) {
                message.channel.send("Error deleting messages. Please check my permissions!")
            }
        )
}

function clear(original, sent) {
    original.delete();
    sent.delete();
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

let lastMessage;
let sentMessage;
let resetLastMessage;
let resetSentMessage;
let muteChannel;
var buzzActive = false;
var resetEmojiRecieved = "none";

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
        });
    }
    else if (msg.content === '!mutechannel') {
        if (msg.member.hasPermission('MUTE_MEMBERS')) {
            msg.reply("Muted everyone in channel");
            let channel = msg.member.voice.channel;
            channel.members.forEach((member) => {
                if(!member.roles.cache.find(r => r.name === 'Mute Exempt')){
                    //console.log(member.id);
                    member.voice.setMute(true, "Channel muted by moderator");
                }
            })
        }
        else {
            msg.reply("You need `MUTE_MEMBERS` permissions to run that command");
        }
    }
    else if (msg.content === '!unmutechannel') {
        if (msg.member.hasPermission('MUTE_MEMBERS')) {
            msg.reply("Channel has been unmuted");
            let channel = msg.member.voice.channel;
            channel.members.forEach((member) => {
                member.voice.setMute(false, "Channel unmuted by moderator");
            })
        }
        else {
            msg.reply("You need `MUTE_MEMBERS` permissions to run that command");
        }
    }
    else if (msg.content === '!buzz'){
        if(!buzzActive){
            buzzActive = true;
            buzzOrder.push(msg.member.name);
            msg.channel.send(msg.member.name + " has buzzed");
            msg.delete();
            msg.member.voice.setMute(false, "Buzzed");
        }
        else{
            buzzOrder.push(msg.member.name);
        }
    }
    else if(msg.content === '!buzzlist'){
        if(!buzzActive){
            msg.reply("Nobody has buzzed yet.");
        }
        else{
            var buzzList = buzzListTemplate;
            buzzList.fields[0].value = buzzOrder[0];
            buzzOrder.forEach(function() {
                var inc = 1;
                buzzList.fields.push({
                    "name": inc.toString(),
                    "value": buzzOrder[inc]
                })
                inc = inc + 1;
            })
            msg.channel.send({buzzList})
        }
    }
    else if (msg.content === '!reset'){
        let resetsent;
        msg.channel.send({ embed }).then(sentmsg => {
            console.log('sending message');
            resetsent = sentmsg;
            resetsent.react('✅')
                .then(() => resetsent.react('❌'))
                .catch(() => console.log("Failed to react"));
            resetLastMessage = msg;
            resetSentMessage = resetsent;
            resetReactionsWait();
        });
    }
});
var emojiRecieved = "none";
const filter = (reaction, user) => {
    console.log("reacted");
    if ((reaction.emoji.name == '✅' || reaction.emoji.name == '❌') && user.id == lastMessage.author.id) {
        if (reaction.emoji.name == '✅') {
            emojiRecieved = "check";
        }
        else if (reaction.emoji.name == '❌') {
            emojiRecieved = "cancel";
        }
        return true;
    }
    else {
        emojiRecieved = "none";
        return false;
    }
};
const resetFilter = (reaction, user) => {
    console.log("reset reacted");
    if ((reaction.emoji.name == '✅' || reaction.emoji.name == '❌') && user.id == resetLastMessage.author.id) {
        if (reaction.emoji.name == '✅') {
            resetEmojiRecieved = "check";
        }
        else if (reaction.emoji.name == '❌') {
            resetEmojiRecieved = "cancel";
        }
        return true;
    }
    else {
        resetEmojiRecieved = "none";
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

function reactionsWait() {
    console.log('waiting');
    let collector = sentMessage.createReactionCollector(filter, { time: 15000 });
    collector.on('collect', (reaction, collector) => {
        console.log('got a reaction');
        lastMessage.channel.fetch()
            .then(function (list) {
                if (emojiRecieved == "check") {
                    console.log("check");
                    lastMessage.channel.bulkDelete(100);
                    emojiRecieved = "none";
                }
                else if (emojiRecieved == "cancel") {
                    lastMessage.delete();
                    sentMessage.delete();
                    emojiRecieved == "none";
                }
            },
                function (err) {
                    lastMessage.channel.send("Error deleting messages. Check my permissions!")
                    emojiRecieved = "none";
                })
    });
    collector.on('end', collected => {
        console.log(`collected ${collected.size} reactions`);
    });
}

function resetReactionsWait() {
    console.log('waiting');
    let collector = resetSentMessage.createReactionCollector(resetFilter, { time: 15000 });
    collector.on('collect', (reaction, collector) => {
        console.log('got a reaction');
        resetLastMessage.channel.fetch()
            .then(function (list) {
                if (resetEmojiRecieved == "check") {
                    resetLastMessage.delete();
                    resetSentMessage.delete();
                    buzzActive = false;
                    buzzOrder = [];
                    resetEmojiRecieved = "none";
                }
                else if (resetEmojiRecieved == "cancel") {
                    resetLastMessage.delete();
                    resetSentMessage.delete();
                    resetEmojiRecieved == "none";
                }
            },
                function (err) {
                    resetLastMessage.channel.send("Error deleting messages. Check my permissions!")
                    resetEmojiRecieved = "none";
                })
    });
    collector.on('end', collected => {
        console.log(`collected ${collected.size} reactions`);
    });
}

client.login(process.env.token);