const fs = require("fs");

const getUserInfo = ($, name) => {
  if (!$) return false;
  const characterCard = $('#character-card');
  if (characterCard.length === 0) {
    return false;
  }
  const content = characterCard.find(".character-card-content");
  const characterImage = characterCard.find("#character-avatar").attr("src");
  const [world, level, jobs] = content.find(".character-card-summary > li.character-card-summary-item").map((i, elem) => {
    let text = $(elem).find("span").text();
    if (i === 1) text = text.slice(3);
    return text;
  });
  const popular = content.find(".character-card-popular");
  let popularity = '';
  let guild = '';
  const popularContent = popular.eq(0).contents();
  for (let i = 0; i < popularContent.length; i++) {
    const elem = popularContent[i]
    const text = $(elem).text().trim();
    if (text === '') continue;
    if (elem.type === 'text') {
      popularity = $(elem).text();
    } else if (elem.name === 'span') {
      guild = $(elem).text();
    }
  }
  const [worldRanking, allRanking] = popular.eq(1).find("span").map((_, elem) => $(elem).text());
  const [maxMuLung, muLungTime, union, unionLevel, maxTheSeed, theSeedTime] = content.find(".character-card-additional li").map((_, elem) => {
    return [$(elem).find('span').text(), $(elem).find('small').last().text()];
  });

  return {
    name, 
    characterImage,
    world,
    level,
    jobs,
    popularity,
    guild,
    worldRanking,
    allRanking,
    maxMuLung,
    muLungTime,
    union,
    unionLevel,
    maxTheSeed,
    theSeedTime,
  }
}

const createCharacterCard = (userInfo) => {
  return new Promise((res, rej) => {
    fs.readFile('modules/characterCard.html',{encoding: 'utf8'}, async (err, data) => {
      if (err) rej(err);
      let html = data;
      for (let key in userInfo) {
        if (key === 'allRanking' && userInfo[key] === undefined) {
          html = html.replace(`{{${key}}}`, '(없음)');
          continue;
        }
        html = html.replace(`{{${key}}}`, userInfo[key]);
      }
      res(html);
    });
  })
}
  

exports.createCharacterCard = createCharacterCard;
exports.getUserInfo = getUserInfo;