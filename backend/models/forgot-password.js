const Sequelize = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const sequelize = require("../util/database");

const ForgotPasswordRequest = sequelize.define("forgotpasswordrequest", {
  id: {
    type: Sequelize.UUID,
    defaultValue: () => uuidv4(),
    allowNull: false,
    primaryKey: true,
  },

  isActive: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
  },
  expiresAt: {
    type: Sequelize.DATE,
    allowNull: false,
  },
});

module.exports = ForgotPasswordRequest;
