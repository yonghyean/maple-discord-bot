const Discord = require('discord.js');
const client = new Discord.Client();
const data = require("./data.json");
const hunting = require("./hunting.json");
const axios = require("axios");
const cheerio = require("cheerio");
const nodeHtmlToImage = require('node-html-to-image')

const maple_gg_user = 'https://maple.gg/u/';
const getHtml = async (url) => {
  try {
    return await axios.get(url);
  } catch (error) {
    console.error(error);
  }
};

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async (msg) => {
  if (msg.content[0] !== '!') return;
  const [message, info] = msg.content.slice(1).split(' ');
  switch (message) {
    case 'help':
    case '도움말':
      const embed = new Discord.MessageEmbed();
      embed.setTitle("도움말 입니다.");
      embed.setDescription("상우봇은 메이플스토리 리부트 서버 위주로 알려줍니다.");
      embed.fields = [
        { name: "!도움말/!help", value: "도움말을 알려줍니다.", inline: false},
        { name: "!정보 (캐릭터 이름)", value: "캐릭터 정보를 알려줍니다.", inline: false},
        { name: "!사냥터", value: "사냥터 정보를 알려줍니다.", inline: false},
      ]
      msg.channel.send(embed);
      break;
    case '정보':
      if (!info) {
        msg.channel.send(`
        > 닉네임을 입력해주세요.
      `);
        return;
      }
      const html = await getHtml(maple_gg_user + encodeURI(info));
      const $ = cheerio.load(html.data); 
        const h3 = $("section.container > h3");
        if (h3 && h3.text().indexOf('검색결과가 없습니다.') !== -1) {
          msg.reply(`
          > 검색결과가 없습니다.
          `);
        } else {
          // TODO 캐릭터 정보 꾸미기
          const characterCardHtml = $('#character-card').html();
          const image = await nodeHtmlToImage({
            html: characterCardHtml
          });
          const discordSendImage = new Discord.MessageAttachment(image);
          msg.channel.send(discordSendImage);
        }
      break; 
    case "사냥터": {
      const huntingData = hunting.data;
      const fields = huntingData.map((d) => ({ name: d.level, value: d.desc, inline: false}));
      const embed = new Discord.MessageEmbed();
      embed.fields = fields
      msg.channel.send(embed);
      break;
    }
  }
});

client.login(data.token);