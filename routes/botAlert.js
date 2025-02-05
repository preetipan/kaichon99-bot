const express = require("express");
const line = require("@line/bot-sdk");
const { handleEvent } = require("../controllers/funcController");
const { channelSecret } = require("../config");
const router = express.Router();

const requestQueue = [];

const processQueue = async () => {
  while (requestQueue.length > 0) {
    const event = requestQueue.shift();
    await handleEvent(event);
  }
};


// รับคำขอจาก LINE
router.post("/", line.middleware({ channelSecret }), async (req, res) => {
  try {
    req.body.events.forEach((event) => {
      requestQueue.push(event);
    });
    await processQueue();

    res.json({ status: "success" });
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

module.exports = router;
