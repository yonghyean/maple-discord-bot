const Discord = require('discord.js');
const cheerio = require("cheerio");

const getHtml = require("../modules/getHtml");

const parseEventPage = ($) => {
  const board = $('.event_board, .cash_board');
  const li = board.find("ul").children();
  const data = [];
  li.each((_, elem) => {
    const a = $(elem).find(".data a");
    const date = $(elem).find(".date p");
    data.push({
      url: 'https://maplestory.nexon.com/' + a.attr("href"),
      title: a.text(),
      date: date.text(),
    })
  });
  return data;
}
const eventAndCash = async (msg, type) => {
  const data = await getHtml(`https://maplestory.nexon.com/News/${type}`);
  const $ = cheerio.load(data.data, {decodeEntities: true});
  const parseData = parseEventPage($);
  console.log()
  const embed = new Discord.MessageEmbed();
  embed.setTitle("!이벤트/!캐시");
  embed.fields = parseData.map((pd) => {
    return {
      name: `${pd.title}`,
      value: `${pd.date}\n${pd.url}`,
      inline: false,
    }
  });
  msg.channel.send(embed);
}

module.exports = eventAndCash;