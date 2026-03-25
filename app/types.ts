export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

export type SearchDepth = "shallow" | "deep" | "super";

export type ContextTab = {
  id: string;
  query: string;
  explanation: string;
  context: string;
  depth: SearchDepth;
};
