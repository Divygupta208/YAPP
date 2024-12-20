const express = require("express");

const router = express.Router();
const userController = require("../controllers/user");
const {
  upload,
  uploadToS3Middleware,
} = require("../middlewares/uploadMiddlerware");
const authenticateUser = require("../middlewares/authUser");

router.post("/signup", userController.postAddUser);
router.post("/login", userController.postLoginUser);
router.patch(
  "/update/:userId",
  upload.single("profilePicture"),
  uploadToS3Middleware,
  userController.updateUser
);
router.post("/forgotpassword", userController.postForgotPassword);
router.post("/resetpassword/:id", userController.postResetPassword);
router.get("/allusers", authenticateUser, userController.getAllUsers);
module.exports = router;
