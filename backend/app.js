const express = require("express");
const bodyParser = require("bodyparser");
const cors = require("cors");
const sequelize = require("./util/database");
const app = express();
const userRoute = require("./routes/user");
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/api/user", userRoute);

sequelize
  .sync()
  .then(() => {
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => {
    const dbErrorMessage = `${new Date().toISOString()} - Database Error: ${
      err.message
    }\n`;
    console.error(dbErrorMessage);
  });
