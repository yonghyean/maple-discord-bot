const Discord = require('discord.js');

const help = (msg) => {
  const embed = new Discord.MessageEmbed();
  embed.setTitle("도움말 입니다.");
  embed.setDescription("상우봇은 메이플스토리 리부트 서버 위주로 알려줍니다.");
  embed.fields = [
    { name: "!도움말/!help", value: "도움말을 알려줍니다.", inline: false},
    { name: "!정보 (캐릭터 이름)", value: "캐릭터 정보를 알려줍니다.", inline: false},
    { name: "!사냥터", value: "사냥터 정보를 알려줍니다.", inline: false},
  ]
  msg.channel.send(embed);
}

module.exports = help;