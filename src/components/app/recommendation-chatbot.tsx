
"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, BookHeart, Star, FileText, Globe, Building } from "lucide-react";
import type { ChatMessage, BookSearchResult } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { BookDetailsDialog } from "./book-details-dialog";

interface RecommendationChatbotProps {
  chatHistory: ChatMessage[];
  onSendMessage: (userInput: string) => void;
  isLoading: boolean;
  isReady: boolean;
}

function RecommendationItem({ book }: { book: BookSearchResult }) {
  return (
    <Card className="mt-3 bg-card/80 backdrop-blur-sm border-accent/20">
      <CardHeader className="p-4">
        <BookDetailsDialog book={book}>
            <CardTitle className="text-base font-headline flex items-center gap-2 hover:underline cursor-pointer">
                <BookHeart className="text-accent" /> {book.title}
            </CardTitle>
        </BookDetailsDialog>
        <CardDescription className="text-xs !mt-1">by {book.author}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm whitespace-pre-wrap font-body text-foreground/80">{book.description}</p>
      </CardContent>
    </Card>
  );
}


export function RecommendationChatbot({
  chatHistory,
  onSendMessage,
  isLoading,
  isReady,
}: RecommendationChatbotProps) {
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatHistory, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading && isReady) {
      onSendMessage(input);
      setInput("");
    }
  };

  const cardDescription = isReady
    ? "Chat with our AI to refine your book recommendations."
    : "Go to the 'Library' and 'Preferences' tabs to start chatting.";

  return (
    <Card className="h-full flex flex-col min-h-[70vh] mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Bot className="size-6" /> Recommendation Chatbot
        </CardTitle>
        <CardDescription>{cardDescription}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-grow pr-4 -mr-4" ref={scrollAreaRef}>
          <div className="space-y-6">
            {chatHistory.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <Avatar className="shadow">
                    <AvatarFallback>
                      <Bot className="size-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-xl rounded-lg p-3.5 shadow-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                  {message.recommendations && (
                     <div className="mt-4 space-y-3">
                      {message.recommendations.map((rec, index) => (
                        <RecommendationItem key={index} book={rec} />
                      ))}
                    </div>
                  )}
                </div>
                {message.role === "user" && (
                  <Avatar className="shadow">
                    <AvatarFallback>
                      <User className="size-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3 justify-start">
                <Avatar>
                  <AvatarFallback>
                    <Bot className="size-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="max-w-md rounded-lg p-3.5 bg-muted flex items-center space-x-2">
                  <span className="size-2 bg-foreground/40 rounded-full animate-pulse delay-0"></span>
                  <span className="size-2 bg-foreground/40 rounded-full animate-pulse delay-150"></span>
                  <span className="size-2 bg-foreground/40 rounded-full animate-pulse delay-300"></span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-4 border-t">
        <form
          onSubmit={handleSubmit}
          className="flex w-full items-center space-x-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell me more about what you like..."
            disabled={!isReady || isLoading}
            suppressHydrationWarning
          />
          <Button
            type="submit"
            size="icon"
            disabled={!isReady || isLoading || !input.trim()}
          >
            <Send className="size-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
