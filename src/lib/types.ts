export interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  imageUrl: string;
  averageRating?: number;
  pageCount?: number;
  publisher?: string;
  language?: string;
}

export interface BookWithListContext extends Omit<Book, 'id'> {
    listId: string;
    listName: string;
}

export interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  recommendations?: string;
}

export interface BookSearchResult {
  title: string;
  author: string;
  description: string;
  imageUrl: string;
  averageRating?: number;
  pageCount?: number;
  publisher?: string;
  language?: string;
}
