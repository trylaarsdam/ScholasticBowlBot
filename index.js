const Discord = require('discord.js');
const client = new Discord.Client();
require('dotenv').config()
const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
});

app.get('/invite', function (req, res) {
    res.redirect('https://discord.com/oauth2/authorize?client_id=763147263387500573&scope=bot&permissions=8');
    return;
})

app.get('/', function (req, res) {
    res.redirect('index.html');
})

app.get('/setup', function(req, res) {
    res.redirect('setup.html');
})

app.get('/docs', function (req, res) {
    res.redirect('documentation.html');
})

app.use(express.static(path.join(__dirname, 'web/docs')));

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

/*const buzzListTemplate = {
    "title": "Buzz List",
    "description": "Shows the order in which players used the !buzz command for this question.",
    "color": 6748568,
    "timestamp": "2020-10-07T03:10:08.360Z",
    "footer": {
      "text": "Scholastic Bowl Bot"
    },
    "fields": [
    ]
};*/

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
    client.user.setPresence({
        status: 'online',
        activity: {
            name: 'physics edpuzzles'
        }
    });
});

let lastMessage;
let sentMessage;
let resetLastMessage;
let resetSentMessage;
var buzzActive = false;
var resetEmojiRecieved = "none";
var unmutedBuzzer = 0;
var suspendedTeam = 0;
const team1 = "Team 1";
const team2 = "Team 2";

client.on('message', msg => {
    if (msg.content === '!clear') {
        if (msg.member.hasPermission('MANAGE_MESSAGES') || msg.member.roles.cache.find(r => r.name === 'Bot Master')) {
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
        else {
            msg.reply('You need `MANAGE_MESSAGES` permissions to run that command');
            msg.delete();
        }
    }
    else if (msg.content === '!mutechannel') {
        if (msg.member.hasPermission('MUTE_MEMBERS') || msg.member.roles.cache.find(r => r.name === 'Bot Master')) {
            if (msg.member.voice.channel) {
                channelMuted = true;
                msg.reply("Muted everyone in channel");
                let channel = msg.member.voice.channel;
                channel.members.forEach((member) => {
                    if (!member.roles.cache.find(r => r.name === 'Mute Exempt')) {
                        //console.log(member.id);
                        member.voice.setMute(true, "Channel muted by moderator");
                    }
                })
                msg.delete();
            }
            else {
                msg.reply("You need to be in a voice channel to run this command");
                msg.delete();
            }
        }
        else {
            msg.reply("You need `MUTE_MEMBERS` permissions to run that command");
            msg.delete();
        }
    }
    else if(msg.content === '!sendinfomessage'){
        if(msg.member.hasPermission('ADMINISTRATOR')){
            msg.channel.send({embed: {
                "content": "Welcome to the TCHS scholastic bowl discord server. Here are a few things you should know:",
                "title": "Using the Bot",
                "description": "*It is very important for you to stay unmuted while in a game. Otherwise when the bot unmutes you you will still be muted.*\n\n**__Commands for players__**\n**!buzz** - Acts like your buzzer that you would have in person. It is recommended you pre-type `!buzz`, so you only have to hit enter when you want to buzz.\n\n**!team** *[1,2,leave]* - This will add you to either team 1, team 2, or remove you from a team. Being on a team lets you buzz and access private team channels for deliberation.\n\n**__Commands for moderators__**\n**!buzzlist** - shows who buzzed in what order, and what team they were on. This list will be accurate even if the messages sent by the bot acknowledging buzzes are not.\n\n**!incorrect** - Marks the currently \"buzzing\" player as incorrect, and resets the buzz list. The other team can then buzz, but the team the player who just buzzed was on cannot. \n\n**!reset** - Resets the buzzlist, remutes everyone who was unmuted (except those immune), and allows everyone to buzz again. (Should be used for going to a new question).\n\n**!mutechannel** - Mutes everyone in the channel you are currently in. Anyone with the `Mute Exempt` role will not be muted.\n\n**!unmutechannel** - Unmutes everyone in the channel you are currently in. *Do this at the end of games, otherwise everyone will stay muted when they rejoin VCs at a later date*.\n\n**!next** - Will mute the person who was speaking that buzzed, and unmutes the person next on the buzzlist. ",
                "url": "https://scholastic.toddr.org/docs",
                "color": 12789,
                "username": "Info",
                "avatar_url": "https://toddr.org/assets/images/t-transparent-114x108.png"
            }});
            msg.channel.send({embed: {
                "title": "Roles",
                "description": "**Coach** - Coaches have permissions to run moderator commands (aka run a game)\n\n**Team 1** - Members of team 1\n\n**Team 2** - Members of team 2\n\n**Mute Exempt** - This user will not be muted when `!mutechannel` is run. This should be given to any user reading questions/running the game.\n\n**Bot Master** - Can run any command in the bot.",
                "color": 7506394,
                "username": "Info",
                "avatar_url": "https://toddr.org/assets/images/t-transparent-114x108.png"
            }});
            msg.channel.send({embed: {
                "title": "Other info",
                "description": "Extra documentation and commands not listed in this message can be found here - https://scholastic.toddr.org/docs\nTo invite the bot to another server - https://scholastic.toddr.org/invite",
                "url": "https://scholastic.toddr.org",
                "color": 16770790,
                "footer": {
                    "text": "Scholastic Bowl Bot",
                    "icon_url": "https://toddr.org/assets/images/t-transparent-114x108.png"
                },
                "username": "Info",
                "avatar_url": "https://toddr.org/assets/images/t-transparent-114x108.png"
            }});
            msg.delete();
        }
        else{
            msg.reply("You need `ADMINISTRATOR` permissions to run that command");
        }
    }
    else if (msg.content === '!unmutechannel') {
        if (msg.member.hasPermission('MUTE_MEMBERS') || msg.member.roles.cache.find(r => r.name === 'Bot Master')) {
            if (msg.member.voice.channel) {
                channelMuted = false;
                msg.reply("Channel has been unmuted");
                let channel = msg.member.voice.channel;
                channel.members.forEach((member) => {
                    member.voice.setMute(false, "Channel unmuted by moderator");
                })
                msg.delete();
            }
            else {
                msg.reply("You need to be in a voice channel to run this command");
                msg.delete();
            }
        }
        else {
            msg.reply("You need `MUTE_MEMBERS` permissions to run that command");
        }
    }
    else if (msg.content === '!next') {
        if (msg.member.hasPermission('ADMINISTRATOR') || msg.member.roles.cache.find(r => r.name === 'Bot Master')) {
            if (buzzOrder[unmutedBuzzer] && buzzOrder[unmutedBuzzer + 1]) {
                buzzOrder[unmutedBuzzer].voice.setMute(true, "Next Buzzer");
                unmutedBuzzer++;
                buzzOrder[unmutedBuzzer].voice.setMute(false, "Next Buzzer");
                msg.channel.send(msg.member.displayName + " has been unmuted.");
                msg.delete();
            }
            else {
                msg.reply("There are no more users that have buzzed to move to.");
                msg.delete();
            }
        }
        else {
            msg.reply('You need `ADMINISTRATOR` permissions to use this command');
            msg.delete();
        }
    }
    else if (msg.content === '!buzz') {
        if (msg.member.roles.cache.find(r => r.name === "Team 2") || msg.member.roles.cache.find(r => r.name === "Team 1")) {
            if (!buzzActive && !buzzOrder.includes(msg.member)) {
                if (((msg.member.roles.cache.find(r => r.name === "Team 1")) && suspendedTeam == 1) || ((msg.member.roles.cache.find(r => r.name === "Team 2")) && suspendedTeam == 2)) {
                    msg.reply("Your team has already buzzed");
                    msg.delete();
                }
                else {
                    unmutedBuzzer = 0;
                    buzzActive = true;
                    buzzOrder.push(msg.member);
                    msg.channel.send(msg.member.displayName + " has buzzed");
                    msg.delete();
                    msg.member.voice.setMute(false, "Buzzed");
                }
            }
            else if (buzzOrder.includes(msg.member)) {
                msg.reply("You have already buzzed this round");
                msg.delete();
            }
            else {
                buzzOrder.push(msg.member);
                msg.channel.send(msg.member.displayName + " has also buzzed");
                msg.delete();
            }
        }
        else {
            msg.reply("You need to be on a team to buzz!");
            msg.delete();
        }

    }
    else if (msg.content.includes('rink') || msg.content.includes('Rink')) {
        msg.member.send("CARLTON");
    }
    else if (msg.content === '!buzzlist') {
        if (!buzzActive) {
            msg.reply("Nobody has buzzed yet.");
            msg.delete();
        }
        else {
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
            var teamString = "";

            buzzOrder.forEach(function () {
                if (buzzOrder[inc].roles.cache.find(r => r.name === 'Team 1') && !buzzOrder[inc].roles.cache.find(r => r.name === 'Team 2')) {
                    teamString = "Team 1";
                }
                else if (buzzOrder[inc].roles.cache.find(r => r.name === 'Team 2') && !buzzOrder[inc].roles.cache.find(r => r.name === 'Team 1')) {
                    teamString = "Team 2";
                }
                else {
                    teamString = "Both?";
                }
                buzzList.fields.push({
                    "name": (inc + 1).toString(),
                    "value": buzzOrder[inc].displayName + " - " + teamString
                })
                inc = inc + 1;
            })
            msg.channel.send({ embed: buzzList })
            msg.delete();
            buzzlist = {};
        }
    }
    else if (msg.content === '!incorrect') {
        if (msg.member.hasPermission('ADMINISTRATOR') || msg.member.roles.cache.find(r => r.name === 'Bot Master')) {
            if (buzzOrder[unmutedBuzzer]) {
                if (buzzOrder[unmutedBuzzer].roles.cache.find(r => r.name === 'Team 1')) {
                    console.log("Team 1 buzzed wrong");
                    suspendedTeam = 1;
                    msg.channel.send("Team 1 can no longer buzz.");
                    buzzOrder[unmutedBuzzer].voice.setMute(true, "Got it wrong");
                    buzzOrder = [];
                    buzzActive = false;
                }
                else if (buzzOrder[unmutedBuzzer].roles.cache.find(r => r.name === 'Team 2')) {
                    console.log("Team 2 buzzed wrong");
                    suspendedTeam = 2;
                    msg.channel.send("Team 2 can no longer buzz.");
                    buzzOrder[unmutedBuzzer].voice.setMute(true, "Got it wrong");
                    buzzOrder = [];
                    buzzActive = false;
                }
                else {
                    msg.channel.send("Error - `currently selected player has no team assignment`. Please !reset");
                    msg.delete();
                }
            }
            else {
                msg.reply("Someone needs to buzz before they can be marked incorrect");
                msg.delete();
            }
        }
        else {
            msg.reply("You need `ADMINISTRATOR` permissions to run this command");
            msg.delete();
        }
    }
    else if (msg.content === '!reset') {
        if (msg.member.hasPermission('ADMINISTRATOR') || msg.member.roles.cache.find(r => r.name === 'Bot Master')) {
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
        else {
            msg.reply("You need `ADMINISTRATOR` permissions to run this command");
            msg.delete();
        }
    }
    else if (msg.content === '!help') {
        msg.reply("Help/commands can be found at https://scholastic.toddr.org/docs")
    }
    else if (msg.content.startsWith("!team")) {
        var content = [];
        let team1 = msg.guild.roles.cache.find(r => r.name === "Team 1");
        let team2 = msg.guild.roles.cache.find(r => r.name === "Team 2");
        content = msg.content.split(" ");
        if (content[1] == '1') {
            msg.member.roles.add(team1);
            if (msg.member.roles.cache.find(r => r.name === "Team 2")) {
                msg.member.roles.remove(team2);
            }
            msg.delete();
        }
        else if (content[1] == '2') {
            msg.member.roles.add(team2);
            if (msg.member.roles.cache.find(r => r.name === "Team 1")) {
                msg.member.roles.remove(team1);
            }
            msg.delete();
        }
        else if (content[1] == 'leave') {
            if (msg.member.roles.cache.find(r => r.name === "Team 1")) {
                msg.member.roles.remove(team1);
            }
            if (msg.member.roles.cache.find(r => r.name === "Team 2")) {
                msg.member.roles.remove(team2);
            }
            msg.delete();
        }
        else {
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
                    let channel = resetLastMessage.member.voice.channel;
                    resetLastMessage.delete();
                    resetSentMessage.delete();
                    buzzActive = false;
                    buzzOrder = [];
                    resetEmojiRecieved = "none";
                    channelMuted = true;
                    suspendedTeam = 0;
                    resetLastMessage.reply("Reset buzzes + muted the channel");
                    channel.members.forEach((member) => {
                        if (!member.roles.cache.find(r => r.name === 'Mute Exempt')) {
                            //console.log(member.id);
                            if (channelMuted) {
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
