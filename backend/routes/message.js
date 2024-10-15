const express = require("express");

const router = express.Router();
const messageController = require("../controllers/message");

router.post("/send", messageController.postMessage);
router.get("/received", messageController.getMessages);

module.exports = router;
