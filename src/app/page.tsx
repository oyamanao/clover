"use client";

import { useState, useEffect } from "react";
import type { Book, ChatMessage } from "@/lib/types";
import { BookLibrary } from "@/components/app/book-library";
import { PreferenceTool } from "@/components/app/preference-tool";
import { RecommendationChatbot } from "@/components/app/recommendation-chatbot";
import { Header } from "@/components/app/header";
import { generateBookRecommendations } from "@/ai/flows/generate-book-recommendations";
import { refineRecommendationsViaChatbot } from "@/ai/flows/refine-recommendations-via-chatbot";
import { summarizeLibrary } from "@/ai/flows/summarize-library";
import { useToast } from "@/hooks/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Book as BookIcon, Bot, Sparkles } from "lucide-react";

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [userPreferences, setUserPreferences] = useState("");
  const [initialRecommendations, setInitialRecommendations] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [activeTab, setActiveTab] = useState("library");

  const { toast } = useToast();

  const handleAddBook = (book: Omit<Book, "id">) => {
    // Check if book is already in the library
    if (books.find((b) => b.title === book.title && b.author === book.author)) {
      toast({
        variant: "destructive",
        title: "Book Already in Library",
        description: `"${book.title}" is already in your library.`,
      });
      return;
    }
    setBooks((prev) => [...prev, { ...book, id: Date.now() }]);
    toast({
      title: "Book Added",
      description: `"${book.title}" has been added to your library.`,
    });
    setActiveTab("preferences");
  };

  const handleRemoveBook = (bookId: number) => {
    const bookToRemove = books.find((b) => b.id === bookId);
    setBooks((prev) => prev.filter((book) => book.id !== bookId));
    if (bookToRemove) {
      toast({
        title: "Book Removed",
        description: `"${bookToRemove.title}" has been removed from your library.`,
      });
    }
  };
  
  const handleRefreshPreferences = async () => {
    setIsSummarizing(true);
    try {
      const libraryContent = books.map(b => `${b.title} by ${b.author}`).join('\n');
      const result = await summarizeLibrary({ books: libraryContent });
      setUserPreferences(result.preferences);
      toast({
        title: "Preferences Refreshed",
        description: "We've analyzed your library and updated your preferences.",
      })
    } catch (error) {
       console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to refresh preferences.",
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  useEffect(() => {
    if (books.length > 0) {
      handleRefreshPreferences();
    } else {
      setUserPreferences("");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [books.length]);


  const handleGenerateRecommendations = async (preferences: string) => {
    setUserPreferences(preferences);
    setIsGenerating(true);
    setInitialRecommendations("");
    setChatHistory([]);
    try {
      const result = await generateBookRecommendations({ preferences });
      setInitialRecommendations(result.recommendations);
      setChatHistory([
        {
          id: Date.now(),
          role: "assistant",
          content:
            "I've generated some initial recommendations for you. Feel free to ask me to refine them!",
          recommendations: result.recommendations,
        },
      ]);
      setActiveTab("chatbot");
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate recommendations.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async (userInput: string) => {
    const newHistory: ChatMessage[] = [
      ...chatHistory,
      { id: Date.now(), role: "user", content: userInput },
    ];
    setChatHistory(newHistory);
    setIsChatting(true);

    try {
      const bookDetails = books
        .map(
          (b) =>
            `Title: ${b.title}, Author: ${b.author}, Description: ${b.description}`
        )
        .join("\n\n");
      const formattedChatHistory = newHistory
        .map((m) => `${m.role}: ${m.content}`)
        .join("\n");

      const result = await refineRecommendationsViaChatbot({
        bookDetails,
        userPreferences,
        chatHistory: formattedChatHistory,
        userInput,
      });

      const assistantMessage: ChatMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: result.chatbotResponse,
        recommendations: result.refinedRecommendations,
      };
      setChatHistory((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setChatHistory((prev) => [...prev, errorMessage]);
      toast({
        variant: "destructive",
        title: "Chatbot Error",
        description: "Failed to get a response from the chatbot.",
      });
    } finally {
      setIsChatting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 flex justify-center">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full max-w-4xl"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="library">
              <BookIcon className="mr-2" /> Library
            </TabsTrigger>
            <TabsTrigger value="preferences" disabled={books.length === 0}>
              <Sparkles className="mr-2" /> Preferences
            </TabsTrigger>
            <TabsTrigger
              value="chatbot"
              disabled={books.length === 0 || userPreferences === ""}
            >
              <Bot className="mr-2" /> Chatbot
            </TabsTrigger>
          </TabsList>
          <TabsContent value="library">
            <BookLibrary books={books} onAddBook={handleAddBook} onRemoveBook={handleRemoveBook} />
          </TabsContent>
          <TabsContent value="preferences">
            <PreferenceTool
              onGenerateRecommendations={handleGenerateRecommendations}
              isLoading={isGenerating}
              preferences={userPreferences}
              setPreferences={setUserPreferences}
              onRefreshPreferences={handleRefreshPreferences}
              isSummarizing={isSummarizing}
            />
          </TabsContent>
          <TabsContent value="chatbot">
            <RecommendationChatbot
              chatHistory={chatHistory}
              onSendMessage={handleSendMessage}
              isLoading={isChatting}
              isReady={books.length > 0 && userPreferences !== ""}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
