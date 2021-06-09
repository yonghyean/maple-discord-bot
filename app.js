const Discord = require('discord.js');
const client = new Discord.Client();
const { Cluster } = require("puppeteer-cluster");

const {
  help,
  info,
  hunting,
  news,
  eventAndCash
} = require("./messages");

const secret = require("./data.json");

const puppeteerOptions = process.platform === 'win32' ? undefined : {
  executablePath: "chromium-browser", 
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
};

(async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_CONTEXT,
    maxConcurrency: 6,
    puppeteerOptions,
  });

  await cluster.task(async ({ page, data: html, worker }) => {
    console.time("screenshot" + worker.id);
    await page.setContent(html);
    const body = await page.$("body");
    const screen = await body.screenshot({
      quality: 100,
      type: 'jpeg',
      encoding: 'buffer',
    });
    console.timeEnd("screenshot" + worker.id);
    return screen;
  });

  client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity('!help, 뭘봐', { type: 'WATCHING' })
  });
  
  client.on('message', async (msg) => {
    if (msg.content[0] !== '!') return;
    const [message, data] = msg.content.slice(1).split(' ');
    switch (message) {
      case 'help':
      case '도움말':
        help(msg);
        break;
      case '정보':
        await info(msg, cluster, data);
        break; 
      case "사냥터": {
        hunting(msg);
        break;
      }
      case "공지": {
        const type = data === '공지' ? 'Notice' : data === '점검' ? 'Inspection' : data === 'GM' ? 'GMDiary' : 'All';
        await news.news(msg, type);
        break;
      }
      case "업데이트": {
        await news.update(msg);
        break;
      }
      case "이벤트": 
      case "캐시": {
        const type = message === '이벤트' ? 'Event' : 'CashShop'; 
        await eventAndCash(msg, type);
        break;
      }
      
    }
  });
  
  client.login(secret.token);
})();