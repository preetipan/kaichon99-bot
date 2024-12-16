// const express = require("express");
// const line = require("@line/bot-sdk");
// const { handleEvent } = require("../controllers/funcController");
// const { channelSecret } = require("../config");

// const router = express.Router();

// router.post("/", line.middleware({ channelSecret }), (req, res) => {
//   Promise.all(req.body.events.map(handleEvent))
//     .then((result) => res.json(result))
//     .catch((err) => {
//       console.error(err);
//       res.status(500).end();
//     });
// });

// module.exports = router;

const express = require("express");
const line = require("@line/bot-sdk");
const { handleEvent } = require("../controllers/funcController");
const { channelSecret } = require("../config");

const router = express.Router();

// สร้างคิว (Queue) ที่ใช้ในการจัดการคำขอ FIFO
const requestQueue = [];

// ฟังก์ชันประมวลผลคำขอในคิวทีละคำขอ
const processQueue = async () => {
  while (requestQueue.length > 0) {
    const event = requestQueue.shift(); // เอาคำขอแรกจากคิว
    await handleEvent(event);           // ประมวลผลคำขอ
  }
};

router.post("/", line.middleware({ channelSecret }), (req, res) => {
  // เพิ่มคำขอลงในคิว (แต่ละคำขอจะเพิ่มเข้าไปในคิวตามลำดับที่เข้ามา)
  req.body.events.forEach((event) => {
    requestQueue.push(event); 
  });

  // เรียกใช้ฟังก์ชันที่ทำงานในคิวเพื่อประมวลผลคำขอในลำดับ FIFO
  processQueue()
    .then(() => {
      res.json({ status: "success" });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

module.exports = router;

