const db = require('quick.db');
const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'warn',
    aliases: ['w'],
    description: 'Warn a user in the discord.',

    run : async(client, message, args) => {
        if(!message.member.roles.cache.get(role => role.name === 'admin'));
        let reason = args.slice(1).join(" ");
        if(!args[0]) return message.channel.send(`**${message.author.tag}** Please specify a user.`);
        if(!reason) return message.channel.send(`**${message.author.tag}** Please specify a reason`);
        let user = message.mentions.members.first().user || client.users.cache.get(args[0]);
        const embed = new MessageEmbed()
        .setTitle(`${user.tag} has been warned!`)
        .setColor('#00ff00')
        .setDescription(`${user.tag} has just been warned for: \`${reason}\``)
        .setFooter(`Exotic's Moderation`)
        .setThumbnail(user.displayAvatarURL())
        message.channel.send(embed).then(() => {
            db.push(`user_${user.id}.warns`, reason);
        })
    }
}