const express = require("express");

const router = express.Router();
const messageController = require("../controllers/message");

router.post("/send", messageController.postMessage);
router.get("/user/:receiverId", messageController.getMessages);
router.get("/group/:groupId", messageController.getMessages);

module.exports = router;
