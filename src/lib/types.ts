

export interface Book {
  id?: number; // Optional because search results might not have it
  title: string;//some comments
  author: string;
  description: string;
  imageUrl: string;
  averageRating: number;
  pageCount: number;
  publisher: string;
  language: string;
}

export interface BookWithListContext extends Book {
    listId: string;
    listName: string;
}

export interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  recommendations?: BookSearchResult[];
}

export interface BookSearchResult {
  title: string;
  author: string;
  description: string;
  imageUrl: string;
  averageRating: number;
  pageCount: number;
  publisher: string;
  language: string;
}
