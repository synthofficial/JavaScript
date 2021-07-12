const {Collection, Client, Discord} = require('discord.js')
const fs = require('fs')
const client = new Client({
    disableEveryone: true
})
const config = require('./config.json')
const prefix = config.prefix
const token = config.token

const db = require('quick.db');
var bots = new db.table('bots');

global.ggez = bots;
let copyPasteCheck = new Set();

var statuses = ['Version 1.0.0', 'Prevents server raids...', 'I will protect you!', 'We hate bots.', 'Privacy is key.', 'Invite me to your server for protection!', `Protecting ${client.users.cache.size} servers!`, `What are shards?`];

client.commands = new Collection();
client.aliases = new Collection();
client.categories = fs.readdirSync("./commands/");
["command"].forEach(handler => {
    require(`./handlers/${handler}`)(client);
}); 
client.on('ready', () => {
    setInterval(function(){
        const randomIndex = Math.floor(Math.random() * (statuses.length - 1) + 1);
        const newActivity = statuses[randomIndex];

        client.user.setActivity(newActivity);
    }, 5000)
    console.log(`${client.user.username} ✅`)
})

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

client.on('guildMemberAdd', user => {
    let unverifiedRole = user.guild.roles.cache.find(role => role.name === 'Unverified');
    let verifiedRole = user.guild.roles.cache.find(role => role.name === 'Verified');
    db.set(`user_${user.id}.captchaCode`, makeid(5));

    user.roles.add(unverifiedRole);

    if(db.get(`user_${user.id}.isABot`) == true){ //If the user is a known bot, we kick them :) (maybe ban idk yet)
        user.kick();
        db.add(`guild_${user.guild.id}.botsAttemptedToJoin`, 1); //Stat track 4 lyfe! :)
    }else{
        user.roles.add(user.guild.roles.cache.find(role => role.name === "Unverified")) //Give them the unverified role
        user.createDM().then(() => { //Create DM then tell them their code
            user.send(`Hello ${user.user.username}!\n\nIn order to gain access to **${user.guild.name}**, you need to complete a captcha.\n\nYour captcha code is: ${db.get(`user_${user.id}.captchaCode`)}`).then(msg => {
                copyPasteCheck.add(user.id); //Copy and paste check
                setTimeout(function(){
                    copyPasteCheck.delete(user.id);
                    console.log(`${user.user.username} has not copy pasted!`)
                }, 3500) //Remove them from the copy paste check after 3.5 seconds.
                user.user.dmChannel.awaitMessages(m => m.author.id === user.id, { //Listen for the message
                    max: 1,
                    time: 30000,
                    error: ['time'],
                }).then(collected => {
                    console.log(collected.first().content)
                    if(collected.first().content === db.get(`user_${user.id}.captchaCode`)){ //If the message is their captcha code, verify them. If not, kick them.
                        if(copyPasteCheck.has(user.id)) return msg.edit(`Copy and paste is **NOT** allowed! You have been kicked from **${user.guild.name}** for security reasons.`).then(() => { user.kick() });
                        msg.edit(`You have **PASSED** the security test! Enjoy your time in **${user.guild.name}** :white_check_mark:`).then(() => { user.roles.add(verifiedRole) && user.roles.remove(unverifiedRole)});
                    }else return msg.edit(`That captcha was incorrect! Make sure it is **EXACTLY** like it says. You have been kicked for security reasons.`).then(() => { user.kick() });
                })
            })
        })
    }
})

client.on('message', async message =>{
    if(message.author.bot) return;
    if(!message.content.startsWith(prefix)) return;
    if(!message.guild) return;
    if(!message.member) message.member = await message.guild.fetchMember(message);
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    if(cmd.length == 0 ) return;
    let command = client.commands.get(cmd)
    if(!command) command = client.commands.get(client.aliases.get(cmd));
    if(command) command.run(client, message, args) 
})
client.login(token)
