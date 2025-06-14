const express = require("express");
const app = express();

const botAlert = require("./routes/botAlert");

app.use("/kaichon99/webhook/img", express.static('./Img'));

app.use("/kaichon99/webhook/botAlert", botAlert);

const port = process.env.PORT || 1699;
app.listen(port, '0.0.0.0', () => {
  console.log(`Listening on port ${port}`);
});
