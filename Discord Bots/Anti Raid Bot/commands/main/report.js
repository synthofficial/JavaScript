const { MessageEmbed } = require('discord.js');
const db = require('quick.db');
const index = require('../../index')

module.exports = {
    name: 'report',
    description: 'Report a bot.',

    run : async(client, message, args) => {
        if(!message.member.hasPermission(`KICK_MEMBERS`)) return;
        if(!db.get(`reports`)) return db.set(`reports`, 1);
        let reportNumber = db.get(`reports`);
        let user = message.mentions.members.first().user || client.users.cache.get(args[0]);
        let reason = args.slice(1).join(" ")
        if(!user) return message.channel.send(`**${message.author.tag}** Please specify a user.`);
        if(!reason) return message.channel.send(`**${message.author.tag}** Please specify a reason.`);
        message.author.send(`**${message.author.tag}** Your report has been sent to a moderator. Thank you for making Discord a safer place!\n\nIf your report is declined and you believe is false, please join the support server for help!`);
        db.add(`reports`, 1);
        const embed = new MessageEmbed()
        .setTitle(`Report ${reportNumber}`)
        .setDescription(`**${message.author.tag}** has reported ${user} for: \`${reason}\``)
        .setColor(`#00ff00`)
        .setThumbnail(message.author.displayAvatarURL())
        
        const filter = (reaction, user) => {
            return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
        };

        client.users.cache.get(`838417221758877707`).send(embed).then(msg => {
            msg.react('✅')
            msg.react('❌')
            msg.awaitReactions(filter, { max: 1 }).then(collected => {
                const reaction = collected.first();
                if(reaction.emoji.name === '✅'){
                    db.set(`user_${user.id}.isABot`, true);
                    message.author.send(`**${message.author.tag}** Your report was approved! Thank you for helping us make Discord a safe place!`)
                }else{
                    db.set(`user_${user.id}.isABot`, false);
                    message.author.send(`**${message.author.tag}** Your report was denied!\n\nBelieve this is false? Join the support server to appeal!`)
                }
            })
        })
    }
}