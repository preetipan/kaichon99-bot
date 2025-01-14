// const express = require("express");
// const app = express();

// const botAlert = require("./routes/botAlert");
// const botFucn = require("./routes/botFucn");

// app.use("/botAlert", botAlert);
// app.use("/botFucn", botFucn);
// app.use('/Img', express.static('./Img'));
// const port = process.env.PORT || 3000;
// app.listen(port, '0.0.0.0', () => {
//   console.log(`Listening on port ${port}`);
// });


const express = require("express");
const app = express();

const botAlert = require("./routes/botAlert");
const botFucn = require("./routes/botFucn");

app.use("/webhook/img", express.static('./Img'));

app.use("/webhook/botAlert", botAlert);
app.use("/webhook/botFucn", botFucn);

const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Listening on port ${port}`);
});
