const db = require('quick.db');
const { MessageEmbed } = require('discord.js');

module.exports = {

    name: 'kick',
    aliases: ['k'],
    description: 'Kick a user from the server.',

    run : async(client, message, args) => {

        if(!message.member.roles.cache.find(role => role.name === 'admin')) return;
        let reason = args.slice(1).join(" ");
        if(!args[0]) return message.channel.send(`**${message.author.tag}** Please tag a user for me to kick.`);
        let user = message.mentions.members.first().user || client.users.cache.get(args[0]);
        if(!reason) return message.channel.send(`**${message.author.tag}** Please specify a reason.`);
        let memb = message.guild.member(user);
        const embed = new MessageEmbed()
        .setTitle(`${user.tag} has been kicked!`)
        .setColor('#00ff00')
        .setDescription(`${user.tag} has just been kicked for: \`${reason}\``)
        .setFooter(`Exotic's Moderation`)
        .setThumbnail(user.displayAvatarURL())
        message.channel.send(embed).then(() => { 
            memb.kick() 
            db.set(`user_${memb.id}.kickedFor`, reason);
        });
    }
}