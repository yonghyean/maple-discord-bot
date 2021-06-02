const Discord = require('discord.js');
const client = new Discord.Client();
const data = require("./data.json");
const hunting = require("./hunting.json");
const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

const maple_gg_user = 'https://maple.gg/u/';
const getHtml = async (url) => {
  try {
    return await axios.get(url, {
        responseEncoding : 'binary',
        responseType : 'arraybuffer'
      }
    );
  } catch (error) {
    console.error(error);
  }
};

let browser = null;
let page = null;
(async () => {
  browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath: "chromium-browser"
  });
  page = await browser.newPage();
})();

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

      await page.goto(maple_gg_user + encodeURI(info));          // go to site
      await page.waitForSelector('button[data-target="#exampleModal"]', {
        visible: true,
      });
      const profileImageSaveButton = await page.$('button[data-target="#exampleModal"]');
      if (!profileImageSaveButton) {
        msg.reply('> 검색결과가 없습니다.');
        return;
      }
      await page.click('button[data-target="#exampleModal"]');
      await page.waitForSelector('#character-card',{
        visible: true,
      });
      const elem = await page.$('#character-card');
      const base64Image = await elem.screenshot({
        encoding: 'base64',
        clip: {
          y: 0,
        }
      });
      const buffer = await Buffer.from(base64Image, 'base64');
      const discordSendImage = new Discord.MessageAttachment(buffer);
      msg.channel.send(discordSendImage);
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