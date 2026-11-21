import { Worker } from "bullmq";
import { connection } from "./queue";

const emailWorker = new Worker(
  "email-queue",
  async (job) => {
    console.log(
      "Worker started. Processing email job...",
      job.id,
      job.name,
      job.data,
    );

    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log("Email job completed!", job.id);
  },
  {
    connection,
  },
);

emailWorker.on("completed", (job) => {
  console.log("Job completed!", job.id);
});

emailWorker.on("failed", (job, err) => {
  console.log("Job failed!", job?.id, err);
});
