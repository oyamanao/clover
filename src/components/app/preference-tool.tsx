"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface PreferenceToolProps {
  onGenerateRecommendations: (preferences: string) => void;
  isLoading: boolean;
}

export function PreferenceTool({
  onGenerateRecommendations,
  isLoading,
}: PreferenceToolProps) {
  const [preferences, setPreferences] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (preferences.trim()) {
      onGenerateRecommendations(preferences);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Sparkles className="size-6" /> AI Recommendations
        </CardTitle>
        <CardDescription>
          Tell us what you like, and we'll find your next favorite book.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="e.g., I love science fiction, especially cyberpunk. My favorite authors are William Gibson and Philip K. Dick. I recently enjoyed 'Dune'."
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            className="min-h-[100px]"
          />
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !preferences.trim()}
            suppressHydrationWarning
          >
            {isLoading ? "Generating..." : "Get Recommendations & Chat"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}