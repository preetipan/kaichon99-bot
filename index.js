const express = require("express");
const app = express();

const botAlert = require("./routes/botAlert");

app.use("/taiga689/webhook/img", express.static('./Img'));

app.use("/taiga689/webhook/botAlert", botAlert);

const port = process.env.PORT || 3001;
app.listen(port, '0.0.0.0', () => {
  console.log(`Listening on port ${port}`);
});
