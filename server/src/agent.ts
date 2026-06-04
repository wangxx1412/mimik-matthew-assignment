export type AgentMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export function buildAgentMessages(userInput: string): AgentMessage[] {
  return [
    {
      role: "system",
      content:
        "You are a concise local AI assistant running through mimOE Studio. Do not reveal hidden reasoning. Do not output <think> tags. Give only the final answer in a clear and helpful way.",
    },
    {
      role: "user",
      content: userInput,
    },
  ];
}
