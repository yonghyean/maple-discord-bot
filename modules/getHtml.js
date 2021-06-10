const axios = require("axios");

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

module.exports = getHtml;