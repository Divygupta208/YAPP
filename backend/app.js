const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sequelize = require("./util/database");
const app = express();
const User = require("./models/user");
const Message = require("./models/message");
const ForgotPasswordRequest = require("./models/forgot-password");
const userRoute = require("./routes/user");
const messageRoute = require("./routes/message");
const authenticateUser = require("./middlewares/authUser");
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/api/user", userRoute);
app.use("/api/messages", authenticateUser, messageRoute);

User.hasMany(Message);
Message.belongsTo(User);

User.hasMany(ForgotPasswordRequest);
ForgotPasswordRequest.belongsTo(User);

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
