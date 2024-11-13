const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const UserGroup = sequelize.define("UserGroup", {
  userId: {
    type: Sequelize.INTEGER,
    references: {
      model: "Users",
      key: "id",
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
  groupId: {
    type: Sequelize.INTEGER,
    references: {
      model: "Groups",
      key: "id",
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
  role: {
    type: Sequelize.STRING,
    defaultValue: "member",
  },
});

module.exports = UserGroup;
