// index.js
const express = require("express");
const { Client, middleware } = require("@line/bot-sdk");
require("dotenv").config();

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};


const app = express();
const client = new Client(config);

// ตั้งค่า middleware เพื่อให้ LINE webhook ทำงาน
app.use(middleware(config));

// Route สำหรับรับ webhook event
app.post("/webhook", (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// ฟังก์ชันจัดการเหตุการณ์ต่าง ๆ
async function handleEvent(event) {
  if (event.type === "message" && event.message.type === "text") {
    const messageText = event.message.text;
    const replyToken = event.replyToken;

    // ตัวอย่างการตอบกลับข้อความ
    if (messageText === "สวัสดี") {
      return client.replyMessage(replyToken, {
        type: "text",
        text: "สวัสดีครับ! ยินดีที่ได้รู้จัก",
      });
    }
  }

  return Promise.resolve(null);
}

// เริ่มต้นเซิร์ฟเวอร์
app.listen(3000, () => {
  console.log("LINE bot server is running on port 3000");
});
