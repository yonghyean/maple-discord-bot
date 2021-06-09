const Discord = require('discord.js');
const client = new Discord.Client();
const { Cluster } = require("puppeteer-cluster");

const {
  help,
  info,
  hunting
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
    }
  });
  
  client.login(secret.token);
})();