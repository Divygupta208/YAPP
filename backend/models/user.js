const Sequelize = require("sequelize");

const sequelize = require("../util/database");

const User = sequelize.define("user", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  phoneno: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  profilePicture: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  bio: {
    type: Sequelize.STRING,
    allowNull: true,
  },
});

module.exports = User;
