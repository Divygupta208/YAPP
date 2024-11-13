const { Sequelize } = require("sequelize");
const Message = require("../models/message");
const { Op } = require("sequelize");
const sequelize = require("../util/database");

exports.postMessage = async (req, res, next) => {
  const { content, receiverId, groupId } = req.body;
  const userId = req.user.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  if (!content || (!receiverId && !groupId)) {
    return res.status(400).json({ message: "Invalid message data" });
  }

  try {
    const message = await Message.create({
      content,
      username: req.user.username,
      userId: userId,
      receiverId: receiverId || null,
      groupId: groupId || null,
    });
    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

exports.getMessages = async (req, res, next) => {
  const { receiverId, groupId } = req.params;
  const userId = req.user.id;

  try {
    let messages;

    if (groupId) {
      // Fetch group messages
      messages = await Message.findAll({
        where: { groupId },
        order: [["createdAt", "ASC"]],
      });
    } else if (receiverId) {
      // Fetch one-to-one messages where the user is either the sender or the receiver
      messages = await Message.findAll({
        where: {
          [Sequelize.Op.or]: [
            { userId, receiverId }, // Current user is the sender
            { userId: receiverId, receiverId: userId }, // Current user is the receiver
          ],
        },
        order: [["createdAt", "ASC"]],
      });
    } else {
      return res.status(400).json({ message: "Invalid request parameters" });
    }

    res.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

// exports.getMessages = async (req, res, next) => {
//   try {
//     const lastMessageId = req.query.lastMessageId;
//     const firstMessageId = req.query.firstMessageId;

//     let messages;

//     if (lastMessageId) {
//       messages = await Message.findAll({
//         where: {
//           id: {
//             [Sequelize.Op.gt]: lastMessageId,
//           },
//         },
//         order: [["createdAt", "ASC"]],
//         limit: 10,
//       });
//     } else if (firstMessageId) {
//       messages = await Message.findAll({
//         where: {
//           id: {
//             [Sequelize.Op.lt]: firstMessageId,
//           },
//         },
//         order: [["createdAt", "DESC"]],
//         limit: 10,
//       });
//     } else {
//       messages = await Message.findAll({
//         order: [["createdAt", "ASC"]],
//       });
//     }

//     res.json(messages);
//   } catch (error) {
//     console.error("Error fetching messages:", error);
//     res.status(500).json({ message: "Server error while fetching messages." });
//   }
// };
