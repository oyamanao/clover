"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, BookHeart } from "lucide-react";
import type { ChatMessage } from "@/lib/types";
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
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface RecommendationChatbotProps {
  chatHistory: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isReady: boolean;
}

function RecommendationItem({ recommendation }: { recommendation: string }) {
    // Naively parse title, author, and reason
    const titleMatch = recommendation.match(/\*\*Title:\*\*\s*(.*)/);
    const authorMatch = recommendation.match(/\*\*Author:\*\*\s*(.*)/);
    const reasonMatch = recommendation.match(/\*\*Reason:\*\*\s*([\s\S]*)/);

    const title = titleMatch ? titleMatch[1].trim() : 'Unknown Title';
    const author = authorMatch ? authorMatch[1].trim() : 'Unknown Author';
    const reason = reasonMatch ? reasonMatch[1].trim() : recommendation;

  return (
    <Card className="mt-3 bg-background/70">
      <CardHeader className="p-3">
        <CardTitle className="text-base font-headline flex items-center gap-2">
          <BookHeart className="text-accent" /> {title}
        </CardTitle>
        <CardDescription className="text-xs">by {author}</CardDescription>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <p className="text-sm whitespace-pre-wrap">{reason}</p>
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
  }, [chatHistory]);

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
                      {message.recommendations.split(/\n\s*\n/).map((rec, index) => (
                        <RecommendationItem key={index} recommendation={rec} />
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
                <div className="max-w-md rounded-lg p-3 bg-muted space-y-2">
                  <Skeleton className="h-4 w-10 animate-pulse" />
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
