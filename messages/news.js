const Discord = require('discord.js');
const cheerio = require("cheerio");

const getHtml = require("../modules/getHtml");

const parseNewPage = ($) => {
  const board = $('.news_board, .update_board');
  const li = board.find("ul").children();
  const data = [];
  li.each((_, elem) => {
    const a = $(elem).find("a");
    const img = a.find("img");
    const title = a.find("span");
    const date = $(elem).find(".heart_date > dl > dd");
    data.push({
      url: 'https://maplestory.nexon.com/' + a.attr("href"),
      type: img.attr("alt"),
      title: title.text(),
      date: date.text(),
    })
  });
  return data;
}
const news = async (msg, type) => {
  const data = await getHtml(`https://maplestory.nexon.com/News/${type !== 'GMDiary' ? 'Notice/' : ''}` + type);
  const $ = cheerio.load(data.data, {decodeEntities: true});
  const parseData = parseNewPage($);

  const embed = new Discord.MessageEmbed();
  embed.setTitle("공지");
  embed.setDescription("!공지/!공지 공지/!공지 뉴스/!공지 GM");
  embed.fields = parseData.map((pd) => {
    return {
      name: `${pd.type} ${pd.title}`,
      value: `${pd.date}\n${pd.url}`,
      inline: false,
    }
  });
  msg.channel.send(embed);
}

const update = async (msg) => {
  const data = await getHtml('https://maplestory.nexon.com/News/Update');
  const $ = cheerio.load(data.data, {decodeEntities: true});
  const parseData = parseNewPage($);

  const embed = new Discord.MessageEmbed();
  embed.setTitle("업데이트");
  embed.fields = parseData.map((pd) => {
    return {
      name: `${pd.title}`,
      value: `${pd.date}\n${pd.url}`,
      inline: false,
    }
  });
  msg.channel.send(embed);
}

module.exports.news = news;
module.exports.update = update;