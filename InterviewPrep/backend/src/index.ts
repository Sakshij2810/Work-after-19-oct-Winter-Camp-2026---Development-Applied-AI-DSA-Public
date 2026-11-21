import express from "express";
import { emailQueue } from "./queue";

const app = express();

app.use(express.json());

app.post("/welcome-email", async (req, res) => {
  try {
    const { to, name } = req.body ?? {};

    if (!to) {
      return res.status(400).json({
        message: "Recipient email is required",
      });
    }

    const job = await emailQueue.add(
      "send-welcome-email",
      {
        to,
        name: name || "Learner",
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
      },
    );

    return res.status(200).json({
      message: "Welcome email job added to the queue!",
      jobId: job.id,
      jobName: job.name,
      jobData: job.data,
    });
  } catch (error) {
    console.error("Error adding job:", error);

    return res.status(500).json({
      message: "Error while adding job to queue",
    });
  }
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
