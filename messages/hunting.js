const Discord = require('discord.js');
const huntingJson = require("../hunting.json");
const cheerio = require("cheerio");
const getHtml = require("../modules/getHtml");

const hunting = async (msg) => {
  const { data } = await getHtml('https://maple.gg/info/dungeon/reboot');
  const $ = cheerio.load(data);
  const $container = $("section.container.mt-3");
  const levels = $container.find('.py-2.font-weight-bold');
  
  const fields = levels.toArray().map((el) => {
    const fieldNames = $(el).siblings('div').find('.collapse ul > li b').toArray();
    const fieldStr = fieldNames.reduce((acc, cur, i) => {
      return acc + (i !== 0 ? '\n' : '') + $(cur).text();
    },'');
    
    return ({
      value: fieldStr || '사냥터 없음',
      name: $(el).text(),
    })
  });

  const embed = new Discord.MessageEmbed();
  embed.fields = fields;

  msg.channel.send(embed);
}

module.exports = hunting;