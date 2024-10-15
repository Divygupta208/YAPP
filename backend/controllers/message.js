const Message = require("../models/message");
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
    const messages = await Message.findAll({
      order: [["createdAt", "ASC"]],
    });

    return res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
