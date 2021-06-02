const Discord = require('discord.js');
const client = new Discord.Client();
// const data = require("./data.json");
const hunting = require("./hunting.json");
const axios = require("axios");
const cheerio = require("cheerio");
const nodeHtmlToImage = require('node-html-to-image')
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
      const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        executablePath: "chromium-browser"
        
      });       // run browser
      const page = await browser.newPage();           // open new tab
      await page.goto(maple_gg_user + encodeURI(info));          // go to site
      await page.waitForSelector('button[data-target="#exampleModal"]', {
        visible: true,
      });
      await page.click('button[data-target="#exampleModal"]');
      await page.waitForSelector('#character-card',{
        visible: true,
      });          // wait for the selector to load
      const elem = await page.$('#character-card');
      const bounding_box = await elem.boundingBox(); 
      const base64Image = await elem.screenshot({
        encoding: 'base64',
        clip: {
          width: bounding_box.width,
          height: bounding_box.height,
          x: bounding_box.x,
          y: 0,
        }
      })  
      const discordSendImage = new Discord.MessageAttachment(base64Image);
      msg.channel.send(discordSendImage);
      await browser.close();   
      // const data = await getHtml(maple_gg_user + encodeURI(info));
      // const $ = cheerio.load(data.data, {decodeEntities: true});
      // const h3 = $("section.container > h3");
      //   if (h3 && h3.text().indexOf('검색결과가 없습니다.') !== -1) {
      //     msg.reply(`
      //     > 검색결과가 없습니다.
      //     `);
      //   } else {
      //     // TODO 캐릭터 정보 꾸미기
      // const characterCardHtml = $('#character-card').html();
      // const image = await nodeHtmlToImage({
      //   html: characterCardHtml,
      //   puppeteerArgs: {executablePath: "chromium-browser", args: ["--no-sandbox", "--disable-setuid-sandbox"]},
      // });
      // const discordSendImage = new Discord.MessageAttachment(image);
      // msg.channel.send(discordSendImage);
        // }
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