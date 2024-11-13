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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

// Group.hasMany(Invitation, { foreignKey: "groupId" });
// Invitation.belongsTo(Group, { foreignKey: "groupId" });

// User.hasMany(Invitation, { foreignKey: "invitedUserId" });
// Invitation.belongsTo(User, { foreignKey: "invitedUserId" });

// User.hasMany(ForgotPasswordRequest);
// ForgotPasswordRequest.belongsTo(User);

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("setUserId", (userId) => {
    onlineUsers[socket.id] = userId;
    const uniqueUserIds = [...new Set(Object.values(onlineUsers))];
    io.emit("onlineUsers", uniqueUserIds);
  });

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

    // socket.emit("onlineRoomUsers", onlineRoomUsers);
    console.log("onlineRoomUsers", onlineRoomUsers);
    io.to(roomId).emit("onlineRoomUsers", onlineRoomUsers);
    // Broadcast join message to the group
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

  // Listen for sending messages
  socket.on("sendMessage", (data) => {
    const { roomId, message } = data;

    if (!roomId || !message) {
      console.log("Invalid data:", data);
      return;
    }
    // Emit message to the appropriate room (group or private)
    io.to(roomId).emit("receiveMessage", { message });
    console.log(`Message sent to room: ${roomId}`);
  });

  // Handle disconnection
  // socket.on("disconnect", () => {
  //   const userId = onlineUsers[socket.id];
  //   delete onlineUsers[socket.id]; // Remove user from online users list
  //   io.emit("onlineUsers", Object.values(onlineUsers)); // Update online users for all clients
  //   console.log("A user disconnected:", socket.id);
  // });

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
        roomUsers.splice(userIndex, 1); // Remove the user from the room's online users list

        // Update online users in the room for all clients
        io.to(roomId).emit("onlineRoomUsers", roomUsers);

        // Send a leave message if it's a group room
        if (roomId.startsWith("group_")) {
          io.to(roomId).emit("leaveMessage", {
            message: `${username} has left the group.`,
            system: true,
            userId: userId,
            onlineUsers: roomUsers, // Send the updated room users
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
