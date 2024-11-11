const express = require("express");
const line = require("@line/bot-sdk");
require("dotenv").config();

const config = {
  channelSecret: process.env.CHANNEL_SECRET,
};

// Create LINE SDK client
const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
});

const app = express();

// Endpoint for LINE webhook
app.post("/callback", line.middleware(config), (req, res) => {
  // Process incoming events
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// Handle incoming events from LINE platform
function handleEvent(event) {
  // Check if the event is from a group or room
  if (event.source.type === "group" || event.source.type === "room") {
    // If the message is not a text message, do nothing
    if (event.type !== "message" || event.message.type !== "text") {
      return Promise.resolve(null);
    }

    const userMessage = event.message.text.trim();

    //เลขบัญชี
    if (userMessage === "บช") {

      const carouselMessage = {
        type: "flex",
        altText: "บัญชีธนาคาร",
        contents: {
          type: "bubble",
          direction: "ltr",
          header: {
            type: "box",
            layout: "horizontal",
            backgroundColor: "#2D0287FF",
            borderColor: "#FFFFFF02",
            contents: [
              {
                type: "text",
                text: "กลุ่มไก่ชน DTG",
                weight: "bold",
                size: "xl",
                color: "#FFFFFFFF",
                align: "center",
                gravity: "center",
                margin: "none",
              },
            ],
          },
          hero: {
            type: "image",
            url: "https://s.isanook.com/mn/0/ud/92/460465/761984-01.jpg?ip/crop/w1200h700/q80/webp",
            size: "full",
            aspectRatio: "20:13",
            aspectMode: "cover",
            action: {
              type: "uri",
              label: "Action",
              uri: "https://linecorp.com/",
            },
          },
          body: {
            type: "box",
            layout: "vertical",
            spacing: "md",
            contents: [
              {
                type: "box",
                layout: "vertical",
                flex: 1,
                contents: [
                  {
                    type: "text",
                    text: "เลขบัญชี",
                    size: "lg",
                    color: "#444444FF",
                  },
                  {
                    type: "text",
                    text: "9922120029",
                    weight: "bold",
                    size: "xxl",
                    color: "#FF0A0AFF",
                    align: "center",
                    gravity: "center",
                    margin: "md",
                  },
                ],
              },
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: "ชื่อบัญชี",
                    size: "lg",
                    color: "#444444FF",
                    gravity: "center",
                    margin: "sm",
                  },
                  {
                    type: "text",
                    text: "ปรีติพันธ์ สุทธิพันธ์",
                    weight: "bold",
                    size: "xl",
                    color: "#444444FF",
                    align: "center",
                    margin: "md",
                  },
                ],
              },
              {
                type: "button",
                action: {
                  type: "message",
                  label: "คัดลอก",
                  text: "9922120029",
                },
                color: "#625C5CFF",
                height: "md",
                style: "primary",
                gravity: "center",
              },
            ],
          },
          footer: {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: "ชื่อตรงกับบัญชีนี้บัญชีเดียวเท่านั้น",
                weight: "bold",
                size: "xs",
                color: "#FF0000FF",
                align: "center",
                gravity: "center",
              },
            ],
          },
        },
      };

      return client.replyMessage({
        replyToken: event.replyToken,
        messages: [carouselMessage],
      });
    }
  }
  return Promise.resolve(null);
}


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening on ${port}`);
});
