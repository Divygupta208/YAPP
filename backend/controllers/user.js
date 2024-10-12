const bcrypt = require("bcrypt");
const User = require("../models/user");
const sequelize = require("../util/database");

exports.postAddUser = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { name, email, phoneno, password } = req.body;

    const existingUser = await User.findOne(
      {
        where: {
          email: email,
        },
      },
      { transaction: t }
    );

    if (existingUser) {
      t.rollback();
      return res.status(403).json({
        message: "User already exists",
      });
    }

    if (!name || !email || !password || phoneno) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create(
      { name, email, phoneno, password: hashedPassword },
      { transaction: t }
    );

    await t.commit();
    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (err) {
    await t.rollback();
    console.error("Error creating User:", err);

    res.status(500).json({
      message: "An error occurred while creating the user",
      error: err.message,
    });
    next(err);
  }
};
