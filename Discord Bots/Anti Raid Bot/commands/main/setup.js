const db = require('quick.db');
const {MessageCollector, MessageEmbed} = require('discord.js');

module.exports = {
    name: 'setup',
    description: 'Setup the anti raid modules.',

    run : async(client, message, args) => {
        if(!message.member.hasPermission('ADMINISTRATOR')) return;
        //if(db.get(`guild_${message.guild.id}.setup`) != null) return message.channel.send(`**You have already set me up!**`)
        
        function createRole(guild){
            guild.roles.create({
                data: {
                    name: 'Unverified',
                    color: 'RED',
                },
            });
            guild.roles.create({
                data: {
                    name: 'Verified',
                    color: 'GREEN',
                },
            });
        }
        
        function createChannel(guild){
            let role = message.guild.roles.cache.find((role) => role.name === "Unverified")
            guild.channels.create('unverified', {
                type: 'text',
                permissionOverwrites: [
                    {
                        id: role.id,
                        deny: ['SEND_MESSAGES'],
                        allow: ['READ_MESSAGE_HISTORY']
                    }
                ]
            });
        }

        const embed = new MessageEmbed()
        .setTitle(`Setting up...`)
        .setDescription(`Please wait while I enable all my modules and create everything.`)
        .setColor('#ffff00')
        .setFooter(`Anti Raid Bot`)
        .setThumbnail(message.author.displayAvatarURL())
        message.channel.send(embed).then(msg => {
            createRole(message.guild);
            createChannel(message.guild);
            const embed2 = new MessageEmbed(embed).setDescription('Your server is now secure! I am just creating some stats for your server so you can check it every now and again! :)');
            msg.edit(embed2);
            db.set(`guild_${message.guild.id}.botsBanned`, 0); //Recording how many bots the module has banned from the server :D
            db.set(`guild_${message.guild.id}.botsAttemptedToJoin`, 0); //Recording how many bots has attempted to join the server :D
        })
    }
}