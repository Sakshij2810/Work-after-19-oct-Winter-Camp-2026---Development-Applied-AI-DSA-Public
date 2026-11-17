//step 1: setup
import express from "express";
import cors from "cors";
import crypto from "crypto";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import morgan from "morgan";

const app = express();
app.use(express.json());

app.use(cors());

// Log every incoming HTTP request
app.use(morgan("dev"));

// step 2: Allows frontend → backend communication during development.
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// Step 3: env
/* 
 r2:
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_ACCESS_SECRET_KEY = process.env.R2_ACCESS_SECRET_KEY;
const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_BUCKET = process.env.R2_BUCKET;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;
*/
const PORT = process.env.PORT || 8000;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION;
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;

if (
  !AWS_ACCESS_KEY_ID ||
  !AWS_SECRET_ACCESS_KEY ||
  !AWS_REGION ||
  !AWS_BUCKET_NAME
) {
  throw new Error("Missing required s3 env vars");
}

// Step 4: Create R2 (S3) Client
/*
 r2:
const s3Client = new S3Client({
  region: AWS_REGION,
  endpoint: AWS_BUCKET_NAME,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});
 */
const s3Client = new S3Client({
  region: AWS_REGION,

  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

// Step 5: File Extension Helper
function getFileExtension(fileName: string) {
  const parts = fileName.split(".");
  const extension = parts[parts.length - 1];

  return (extension ?? extension !== fileName) ? extension : "bin";
}

// Step 6: POST /presign
app.post("/presign", async (req, res) => {
  const { fileName, fileType } = req.body ?? {};

  if (!fileName || !fileType) {
    return res
      .status(400)
      .json({ error: "fileName and fileType are required" });
  }

  if (!fileType.startsWith("image/")) {
    return res.status(400).json({ error: "Only image uploads allowed" });
  }

  const extension = getFileExtension(fileName);
  const key = `uploads/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  try {
    const command = new PutObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: key,
      ContentType: fileType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 60, //sec
    });

    /*Why did we remove publicUrl? 
    Your R2 code used an r2.dev public URL. -> 
    For AWS S3, we'll initially keep the bucket private. The frontend can still preview the uploaded image using:
     */
    /*
    r2:
     const publicUrl = R2_PUBLIC_URL ? `${R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
    res.json({ signedUrl, key, publicUrl });
 */
    res.json({ signedUrl, key });
  } catch (error) {
    console.error("Presign error:", error);
    res.status(500).json({ error: "Failed to generate URL" });
  }
});

// Step 7: Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
