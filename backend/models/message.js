const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const Message = sequelize.define("message", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  content: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  receiverId: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: { model: "Users", key: "id" },
  },
});

module.exports = Message;
