const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const FileType = require("file-type");

const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const upload = multer({
  storage: multer.memoryStorage(), // Using memoryStorage for direct S3 upload
});

const uploadToS3Middleware = async (req, res, next) => {
  const file = req.file;
  const fileExtension = file.originalname.split(".").pop();
  const fileName = `${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}.${fileExtension}`;

  try {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `profile-pictures/${fileName}`,
      Body: file.buffer,
      ACL: "public-read",
      ContentType: file.mimetype,
    });
    await s3Client.send(command);
    req.fileKey = fileName;
    next();
  } catch (error) {
    console.error("Error uploading to S3:", error);
    res.status(500).send("Error uploading file to S3");
  }
};

module.exports = { uploadToS3Middleware, upload };
