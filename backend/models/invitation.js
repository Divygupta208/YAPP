// const Sequelize = require("sequelize");

// const sequelize = require("../util/database");

// const Invitation = sequelize.define("Invitation", {
//   id: {
//     type: Sequelize.UUID,
//     defaultValue: Sequelize.UUIDV4,
//     primaryKey: true,
//   },
//   groupId: {
//     type: Sequelize.INTEGER,
//     allowNull: false,
//     references: {
//       model: "Group",
//       key: "id",
//     },
//     onDelete: "CASCADE",
//   },
//   invitedUserId: {
//     type: Sequelize.INTEGER,
//     allowNull: false,
//     references: {
//       model: "User",
//       key: "id",
//     },
//     onDelete: "CASCADE",
//   },

//   invitedBy: {
//     type: Sequelize.INTEGER,
//     allowNull: false,
//     references: {
//       model: "User",
//       key: "id",
//     },
//   },

//   status: {
//     type: Sequelize.ENUM("pending", "accepted", "rejected"),
//     defaultValue: "pending",
//     allowNull: false,
//   },
// });

// module.exports = Invitation;
