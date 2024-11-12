const { Client } = require("@line/bot-sdk");
const { channelAccessToken } = require("../config");
const { getSortedUserDetails } = require("../controllers/component/userController");
const { getBankAccountDetails } = require("../controllers/component/bankAccountController");

const client = new Client({ channelAccessToken });

async function handleEvent(event) {
  console.log('log : '+ JSON.stringify(event));

  if (event.source.type === "group" || event.source.type === "room") {
    if (event.type !== "message" || event.message.type !== "text") {
      return null;
    }

    const userMessage = event.message.text.trim();

    if (userMessage.toLowerCase() === "บช") {
      const bankAccountMessage = getBankAccountDetails();
      return client.replyMessage(event.replyToken, [bankAccountMessage]);
    }

    if (userMessage.toLowerCase() === "cdd") {
      const userDetailsMessage = getSortedUserDetails();
      return client.replyMessage(event.replyToken, userDetailsMessage);
    }
  }
  return null;
}

module.exports = { handleEvent };
