const { Sequelize } = require("sequelize");
const Message = require("../models/message");
const { Op } = require("sequelize");
const sequelize = require("../util/database");

exports.postMessage = async (req, res, next) => {
  const { content } = req.body;
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: "unauthorized access" });
  }

  try {
    const message = await user.createMessage({
      content,
      username: user.username,
    });
    res.status(201).json({ success: true, message });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Message could not be sent", err });
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const lastMessageId = req.query.lastMessageId;
    const firstMessageId = req.query.firstMessageId;

    let messages;

    if (lastMessageId) {
      messages = await Message.findAll({
        where: {
          id: {
            [Sequelize.Op.gt]: lastMessageId,
          },
        },
        order: [["createdAt", "ASC"]],
        limit: 10,
      });
    } else if (firstMessageId) {
      messages = await Message.findAll({
        where: {
          id: {
            [Sequelize.Op.lt]: firstMessageId,
          },
        },
        order: [["createdAt", "DESC"]],
        limit: 10,
      });
    } else {
      messages = await Message.findAll({
        order: [["createdAt", "ASC"]],
      });
    }

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server error while fetching messages." });
  }
};
