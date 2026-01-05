const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("This is Aman’s first Railway backend");
});
app.get("/about", (req, res) => {
  res.send("This is Aman’s first Railway backend");
});

res.send(`Hello Aman 🚀 Welcome to ${process.env.APP_NAME}`);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
