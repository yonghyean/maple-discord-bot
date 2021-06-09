const Discord = require('discord.js');
const cheerio = require("cheerio");
const axios = require("axios");

const {getUserInfo, createCharacterCard} = require("../modules/getUserInfo");

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

const info = async (msg, cluster, userName) => {
  if (!userName) {
    msg.channel.send(`
      > 닉네임을 입력해주세요.
    `);
    return;
  }
  const data = await getHtml(maple_gg_user + encodeURI(userName));
  const $ = cheerio.load(data.data, {decodeEntities: true});
  const userInfo = getUserInfo($, userName);
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
}
module.exports = info;