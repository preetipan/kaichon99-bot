// index.js
const express = require("express");
const line = require("@line/bot-sdk");
const { channelSecret, channelAccessToken } = require("./config");
const { getSortedUserDetails } = require("./controllers/userController");
const { getBankAccountDetails } = require("./controllers/bankAccountController");

const app = express();

// Create LINE SDK client
const client = new line.Client({
  channelAccessToken: channelAccessToken,
});

app.post("/callback", line.middleware({ channelSecret }), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

function handleEvent(event) {
  if (event.source.type === "group" || event.source.type === "room") {
    if (event.type !== "message" || event.message.type !== "text") {
      return Promise.resolve(null);
    }

    const userMessage = event.message.text.trim();

    if (userMessage.toLowerCase() === "บช") {
      const bankAccountMessage = getBankAccountDetails();
      return client.replyMessage(event.replyToken, [bankAccountMessage]);
    }

    if (userMessage.toLowerCase() === "cd") {
      const userDetailsMessage = getSortedUserDetails();
      return client.replyMessage(event.replyToken, userDetailsMessage);
    }
  }
  return Promise.resolve(null);
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
