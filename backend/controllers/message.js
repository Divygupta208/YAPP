const { Sequelize } = require("sequelize");
const Message = require("../models/message");
const { Op } = require("sequelize");
const sequelize = require("../util/database");
const AWS = require("aws-sdk");
const FileType = require("file-type");
const cron = require("cron");
const ArchivedMessages = require("archived-messages");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "ap-south-1",
});

const uploadToS3 = async (base64Data, filename) => {
  // Decode base64 data

  // Decode base64 data to a buffer
  const buffer = Buffer.from(base64Data.split(",")[1], "base64");

  // Detect the file type from the buffer
  const fileTypeResult = await FileType.fromBuffer(buffer);

  // Set default ContentType if file type cannot be determined
  const contentType = fileTypeResult?.mime || "application/octet-stream";

  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: filename, // Use the file name or generate a unique one
    Body: buffer,
    ACL: "public-read",
    ContentType: contentType, // Dynamically detected file type
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) {
        console.error("Error uploading to S3:", err);
        reject(err);
      } else {
        console.log("File uploaded successfully:", data.Location);
        resolve(data.Location); // Return the S3 file URL
      }
    });
  });
};
// Adjust the path if necessary

const archiveOldMessages = async () => {
  const transaction = await sequelize.transaction();

  try {
    // Get the timestamp for 1 day ago
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    console.log("Archiving messages older than:", oneDayAgo);

    // Step 1: Fetch messages older than 1 day
    const messagesToArchive = await Message.findAll({
      where: { createdAt: { [Op.lt]: oneDayAgo } },
    });

    if (!messagesToArchive.length) {
      console.log("No messages to archive.");
      await transaction.commit();
      return;
    }

    // Step 2: Prepare data for ArchivedChat
    const archivedMessages = messagesToArchive.map((message) => ({
      id: message.id, // Retain original ID
      content: message.content,
      username: message.username,
      groupId: message.groupId,
      userId: message.userId,
      receiverId: message.receiverId,
      attachment: message.attachment,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt, // Original creation time
      archivedAt: new Date(), // Time when archived
    }));

    // Step 3: Insert messages into ArchivedChat
    await ArchivedMessages.bulkCreate(archivedMessages, { transaction });

    // Step 4: Delete messages older than 1 day directly using createdAt
    await Message.destroy({
      where: { createdAt: { [Op.lt]: oneDayAgo } },
      transaction,
    });

    // Step 5: Commit the transaction
    await transaction.commit();
    console.log(
      `${archivedMessages.length} messages archived and deleted successfully.`
    );
  } catch (error) {
    // Roll back in case of an error
    await transaction.rollback();
    console.error("Failed to archive and delete messages:", error);
  }
};

// Cron job setup
const job = new cron.CronJob(
  "0 0 * * *", // Run daily at midnight
  archiveOldMessages, // Function to run
  null, // onComplete
  true, // Start the job immediately
  "Asia/Kolkata" // Time zone
);

exports.postMessage = async (req, res) => {
  const { content, receiverId, groupId, attachment } = req.body;
  const userId = req.user.id;

  // Validate user and content
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  if (!content || (!receiverId && !groupId)) {
    return res.status(400).json({ message: "Invalid message data" });
  }

  try {
    // Check if there's an attachment and upload it to S3
    let attachmentUrl = null;

    if (attachment) {
      // const getFileExtension = (attachment) => {
      //   const base64Match = attachment.match(
      //     /data:(image|application)\/(png|jpeg|jpg|gif|webp|pdf|msword|vnd.openxmlformats-officedocument.wordprocessingml.document);base64,/i
      //   );
      //   const urlMatch = attachment.match(/.*\.(\w+)$/i);
      //   if (base64Match) {
      //     return base64Match[2]; // Match MIME type for Base64 (e.g., pdf, png, etc.)
      //   } else if (urlMatch) {
      //     return urlMatch[1]; // Match file extension in URL
      //   }
      //   return "unknown"; // Fallback if no extension found
      // };

      // const extension = getFileExtension(attachment);

      // console.log("Extension: " + extension);

      const filename = `attachments-${Date.now()}_${userId}`; // Unique filename for S3
      attachmentUrl = await uploadToS3(attachment, filename);
    }

    // Create message entry in the database with or without attachment
    const message = await Message.create({
      content,
      username: req.user.username,
      userId: userId,
      receiverId: receiverId || null,
      groupId: groupId || null,
      attachment: attachmentUrl, // Save the S3 URL if there's an attachment
    });

    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

exports.getMessages = async (req, res, next) => {
  const { receiverId, groupId } = req.params;
  const userId = req.user.id;

  try {
    let messages;

    if (groupId) {
      // Fetch group messages
      messages = await Message.findAll({
        where: { groupId },
        order: [["createdAt", "ASC"]],
      });
    } else if (receiverId) {
      // Fetch one-to-one messages where the user is either the sender or the receiver
      messages = await Message.findAll({
        where: {
          [Sequelize.Op.or]: [
            { userId, receiverId }, // Current user is the sender
            { userId: receiverId, receiverId: userId }, // Current user is the receiver
          ],
        },
        order: [["createdAt", "ASC"]],
      });
    } else {
      return res.status(400).json({ message: "Invalid request parameters" });
    }

    res.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

// exports.getMessages = async (req, res, next) => {
//   try {
//     const lastMessageId = req.query.lastMessageId;
//     const firstMessageId = req.query.firstMessageId;

//     let messages;

//     if (lastMessageId) {
//       messages = await Message.findAll({
//         where: {
//           id: {
//             [Sequelize.Op.gt]: lastMessageId,
//           },
//         },
//         order: [["createdAt", "ASC"]],
//         limit: 10,
//       });
//     } else if (firstMessageId) {
//       messages = await Message.findAll({
//         where: {
//           id: {
//             [Sequelize.Op.lt]: firstMessageId,
//           },
//         },
//         order: [["createdAt", "DESC"]],
//         limit: 10,
//       });
//     } else {
//       messages = await Message.findAll({
//         order: [["createdAt", "ASC"]],
//       });
//     }

//     res.json(messages);
//   } catch (error) {
//     console.error("Error fetching messages:", error);
//     res.status(500).json({ message: "Server error while fetching messages." });
//   }
// };
