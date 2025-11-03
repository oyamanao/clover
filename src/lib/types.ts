export interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
}

export interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  recommendations?: string;
}
