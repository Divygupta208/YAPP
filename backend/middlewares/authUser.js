const User = require("../models/user");
const jwt = require("jsonwebtoken");

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(
      token,
      "b2a76f7c3e5f8d1a9c3b2e5d7f6a8c9b1e2d3f4a6b7c9e8d7f6b9c1a3e5d7f6b"
    );

    const user = await User.findByPk(decodedToken.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Authentication failed" });
  }
};

module.exports = authenticateUser;
