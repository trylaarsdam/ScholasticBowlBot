const Discord = require('discord.js');
const client = new Discord.Client();
require('dotenv').config()
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
});

app.get('/invite', function (req, res) {
    res.redirect('https://discord.com/oauth2/authorize?client_id=763147263387500573&scope=bot&permissions=8');
    return;
})

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/web/index.html");
})

app.get('/web/css', function(req, res) {
    res.sendFile(__dirname + "/web/style.css")
})

app.get('/web/js', function(req, res) {
    res.sendFile(__dirname + "/web/script.js")
})

var setting = 0;
var buzzOrder = [];
var channelMuted = false;

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
var buzzActive = false;
var resetEmojiRecieved = "none";

client.on('message', msg => {
    if (msg.content === '!clear') {
        if(msg.member.hasPermission('MANAGE_MESSAGES')){
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
        else{
            msg.reply('You need `MANAGE_MESSAGES` permissions to run that command');
            msg.delete();
        }
    }
    else if (msg.content === '!mutechannel') {
        if (msg.member.hasPermission('MUTE_MEMBERS')) {
            channelMuted = true;
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
            msg.delete();
        }
    }
    else if (msg.content === '!unmutechannel') {
        if (msg.member.hasPermission('MUTE_MEMBERS')) {
            channelMuted = false;
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
        if(msg.member.roles.cache.find(r => r.name === "Team 2") || msg.member.roles.cache.find(r => r.name === "Team 1")){
            if(!buzzActive){
                buzzActive = true;
                buzzOrder.push(msg.member.user.username);
                msg.channel.send(msg.member.user.username + " has buzzed");
                msg.delete();
                msg.member.voice.setMute(false, "Buzzed");
            }
            else{
                buzzOrder.push(msg.member.user.username);
                msg.channel.send(msg.member.user.username + " has also buzzed");
                msg.delete();
            }
        }
        else{
            msg.reply("You need to be on a team to buzz!");
            msg.delete();
        }
        
    }
    else if (msg.content.includes('rink') || msg.content.includes('Rink')){
        msg.member.send("CARLTON");
    }
    else if(msg.content === '!buzzlist'){
        if(!buzzActive){
            msg.reply("Nobody has buzzed yet.");
            msg.delete();
        }
        else{
            var buzzList = {
                "title": "Buzz List",
                "description": "Shows the order in which players used the !buzz command for this question.",
                "color": 6748568,
                "timestamp": "2020-10-07T03:10:08.360Z",
                "footer": {
                  "text": "Scholastic Bowl Bot"
                },
                "fields": [
                ]
            };
            var inc = 0;
            buzzOrder.forEach(function() {
                buzzList.fields.push({
                    "name": (inc+1).toString(),
                    "value": buzzOrder[inc]
                })
                inc = inc + 1;
            })
            msg.channel.send({embed: buzzList})
            msg.delete();
            buzzlist = {};
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
    else if (msg.content.startsWith("!team")){
        var content = [];
        let team1 = msg.guild.roles.cache.find(r => r.name === "Team 1");
        let team2 = msg.guild.roles.cache.find(r => r.name === "Team 2");
        content = msg.content.split(" ");
        if(content[1] == '1'){
            msg.member.roles.add(team1);
            if(msg.member.roles.cache.find(r => r.name === "Team 2")){
                msg.member.roles.remove(team2);
            }
            msg.delete();
        }
        else if(content[1] == '2'){
            msg.member.roles.add(team2);
            if(msg.member.roles.cache.find(r => r.name === "Team 1")){
                msg.member.roles.remove(team1);
            }
            msg.delete();
        }
        else if(content[1] == 'leave'){
            if(msg.member.roles.cache.find(r => r.name === "Team 1")){
                msg.member.roles.remove(team1);
            }
            if(msg.member.roles.cache.find(r => r.name === "Team 2")){
                msg.member.roles.remove(team2);
            }
            msg.delete();
        }
        else{
            msg.reply("You need to specify either team `1`, `2`, or `leave`");
            msg.delete();
        }
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
    console.log('reset waiting');
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
                    channelMuted = true;
                    resetLastMessage.reply("Muted everyone in channel");
                    let channel = resetLastMessage.member.voice.channel;
                    channel.members.forEach((member) => {
                        if(!member.roles.cache.find(r => r.name === 'Mute Exempt')){
                            //console.log(member.id);
                            if(channelMuted){
                                member.voice.setMute(true, "Channel muted by moderator");
                            }
                        }
                    })
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