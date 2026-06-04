type MimoeMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type StreamCallbacks = {
  onToken: (token: string) => void;
  onDone?: () => void;
};

export async function streamMimoeChat(
  messages: MimoeMessage[],
  callbacks: StreamCallbacks,
) {
  const baseUrl = process.env.MIMOE_BASE_URL;
  const apiKey = process.env.MIMOE_API_KEY || "1234";
  const model = process.env.MIMOE_MODEL || "qwen3-1.7b";

  if (!baseUrl) {
    throw new Error("MIMOE_BASE_URL is not configured");
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      temperature: 0.2,
    }),
  });

  if (!response.ok || !response.body) {
    const errorText = await response.text();
    throw new Error(
      `mimOE stream error: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      callbacks.onDone?.();
      return;
    }

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed.startsWith("data:")) {
        continue;
      }

      const data = trimmed.replace(/^data:\s*/, "");

      if (data === "[DONE]") {
        callbacks.onDone?.();
        return;
      }

      try {
        const parsed = JSON.parse(data);
        const token =
          parsed.choices?.[0]?.delta?.content ??
          parsed.choices?.[0]?.message?.content ??
          "";

        if (token) {
          callbacks.onToken(token);
        }
      } catch {
        // Ignore malformed streaming chunks.
      }
    }
  }
}
