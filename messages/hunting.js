const Discord = require('discord.js');
const huntingJson = require("../hunting.json");

const hunting = (msg) => {
  const huntingData = huntingJson.data;
  const fields = huntingData.map((d) => ({ name: d.level, value: d.desc, inline: false}));
  const embed = new Discord.MessageEmbed();
  embed.fields = fields
  msg.channel.send(embed);
}

module.exports = hunting;