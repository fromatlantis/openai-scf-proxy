// Import packages
const express = require("express");
//const home = require("./routes/home");

// Middlewares
const app = express();


// Routes
//app.use("/home", home);

app.get('/', (req, res) => {
  res.send('欢迎来到我的网站！');
});

// connection
const port = process.env.PORT || 9001;
app.listen(port, () => console.log(`Listening to port ${port}`));
