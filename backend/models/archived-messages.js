const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const ArchivedMessages = sequelize.define("archived", {
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
  attachment: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  archivedAt: {
    type: Sequelize.DATE,
    allowNull: true,
  },
});

module.exports = ArchivedMessages;
