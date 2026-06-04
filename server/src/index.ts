import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { buildAgentMessages } from "./agent.js";
import { streamMimoeChat } from "./mimoeClient.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const port = Number(process.env.PORT || 4000);

app.post("/api/agent/stream", async (req, res) => {
  const message = req.body?.message;

  if (!message || typeof message !== "string") {
    return res.status(400).json({
      error: "message is required",
    });
  }

  const messages = buildAgentMessages(message);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  function sendEvent(event: string, data: unknown) {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  try {
    await streamMimoeChat(messages, {
      onToken: (token) => {
        sendEvent("token", { token });
      },
      onDone: () => {
        sendEvent("done", { ok: true });
        res.end();
      },
    });
  } catch (error) {
    sendEvent("error", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    res.end();
  }
});

app.listen(port, () => {
  console.log(`mimOE local agent server running on http://localhost:${port}`);
});
