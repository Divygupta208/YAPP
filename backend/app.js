require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const sequelize = require("./util/database");
const app = express();
const server = http.createServer(app);
const User = require("./models/user");
const Message = require("./models/message");
const ForgotPasswordRequest = require("./models/forgot-password");
const userRoute = require("./routes/user");
const messageRoute = require("./routes/message");
const groupRoute = require("./routes/group");
const authenticateUser = require("./middlewares/authUser");
const Group = require("./models/group");
const UserGroup = require("./models/user-group");
const Invitation = require("./models/invitation");
const { Server } = require("socket.io");

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});
const onlineUsers = {};
const onlineUsersPerRoom = {};

app.use(cors());
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));

app.use("/api/user", userRoute);
app.use("/api/messages", authenticateUser, messageRoute);
app.use("/api/groups", authenticateUser, groupRoute);

User.belongsToMany(Group, { through: UserGroup, foreignKey: "userId" });
UserGroup.belongsTo(User, { foreignKey: "userId" });
Group.belongsToMany(User, { through: UserGroup, foreignKey: "groupId" });
UserGroup.belongsTo(Group, { foreignKey: "groupId" });

Group.hasMany(Message, { foreignKey: "groupId" });
Message.belongsTo(Group, { foreignKey: "groupId" });

User.hasMany(Message, { foreignKey: "userId" });
Message.belongsTo(User, { foreignKey: "userId" });

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("setUserId", (userId) => {
    onlineUsers[socket.id] = userId;
    const uniqueUserIds = [...new Set(Object.values(onlineUsers))];
    io.emit("onlineUsers", uniqueUserIds);
  });
  console.log("onlineUsers:", onlineUsers);

  socket.on("joinRoom", ({ roomId, userId, username }) => {
    socket.join(roomId);

    if (!onlineUsersPerRoom[roomId]) {
      onlineUsersPerRoom[roomId] = [];
    }

    if (!onlineUsersPerRoom[roomId].some((user) => user.userId === userId)) {
      onlineUsersPerRoom[roomId].push({ userId, username });
    }

    const onlineRoomUsers = onlineUsersPerRoom[roomId].filter((user) =>
      Object.values(onlineUsers).includes(user.userId)
    );

    io.to(roomId).emit("onlineRoomUsers", onlineRoomUsers);

    if (roomId.startsWith("group_")) {
      const joinMessage = `${username}`;
      io.to(roomId).emit("joinMessage", {
        message: joinMessage,
        system: true,
        userId: userId,
        onlineUsers: onlineUsersPerRoom[roomId],
      });
      console.log(`User ${username} joined room: ${roomId}`);
    }
  });

  socket.on("sendMessage", async (data) => {
    const { roomId, message } = data;

    if (!roomId || !message) {
      console.log("Invalid data:", data);
      return;
    }

    io.to(roomId).emit("receiveMessage", { message });
  });

  socket.on("disconnect", () => {
    const userId = onlineUsers[socket.id];
    delete onlineUsers[socket.id];

    const uniqueUserIds = Object.values(onlineUsers);
    io.emit("onlineUsers", uniqueUserIds);

    for (let roomId in onlineUsersPerRoom) {
      const roomUsers = onlineUsersPerRoom[roomId];
      const userIndex = roomUsers.findIndex((user) => user.userId === userId);

      if (userIndex !== -1) {
        const username = roomUsers[userIndex].username;
        roomUsers.splice(userIndex, 1);

        io.to(roomId).emit("onlineRoomUsers", roomUsers);

        if (roomId.startsWith("group_")) {
          io.to(roomId).emit("leaveMessage", {
            message: `${username} has left the group.`,
            system: true,
            userId: userId,
            onlineUsers: roomUsers,
          });
          console.log(`User ${username} left room: ${roomId}`);
        }
      }
    }

    console.log("A user disconnected:", socket.id);
  });
});

module.exports = io;

sequelize
  .sync()
  .then(() => {
    server.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((err) => {
    const dbErrorMessage = `${new Date().toISOString()} - Database Error: ${
      err.message
    }\n`;
    console.error(dbErrorMessage);
  });
