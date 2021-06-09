const Discord = require('discord.js');
const client = new Discord.Client();
const axios = require("axios");
const cheerio = require("cheerio");
const { Cluster } = require("puppeteer-cluster");

const hunting = require("./hunting.json");
const data = require("./data.json");
const {getUserInfo, createCharacterCard} = require("./modules/getUserInfo");

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

(async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 6,
    puppeteerOptions: {
      executablePath: "chromium-browser", 
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    }
  });

  await cluster.task(async ({ page, data: html, worker }) => {
    console.time("setContent:" + worker.id);
    await page.setContent(html);
    console.timeEnd("setContent:" + worker.id);
    const body = await page.$("body");
    const screen = await body.screenshot({
      quality: 100,
      type: 'jpeg',
      encoding: 'buffer',
    });
    return screen;
  });

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
        embed.setImage("./tempCharacterCard.svg")
        msg.channel.send(embed);
        break;
      case '정보':
        if (!info) {
          msg.channel.send(`
           > 닉네임을 입력해주세요.
          `);
          return;
        }
        const data = await getHtml(maple_gg_user + encodeURI(info));
        const $ = cheerio.load(data.data, {decodeEntities: true});
        const userInfo = getUserInfo($, info);
        if (!userInfo) {
          msg.channel.send(`
           > 검색결과가 없습니다.
          `);
        }
        try {
          const html = await createCharacterCard(userInfo);
          const screen = await cluster.execute(html);
          const discordSendImage = new Discord.MessageAttachment(screen);
          msg.channel.send(discordSendImage);
        } catch(e) {
          console.error(e)
          msg.channel.send(`
           > 정보를 불러오는데 실패했습니다.
          `);
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
  
})();
