const express = require("express");
const line = require("@line/bot-sdk");
const { handleEvent } = require("../controllers/lineController");
const { channelSecret } = require("../config");

const router = express.Router();

router.post("/", line.middleware({ channelSecret }), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

module.exports = router;
