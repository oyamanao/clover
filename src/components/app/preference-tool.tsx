"use client";

import { RefreshCw, Sparkles, Loader2 } from "lucide-react";
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
  preferences: string;
  setPreferences: (value: string) => void;
  onRefreshPreferences: () => void;
  isSummarizing: boolean;
}

export function PreferenceTool({
  onGenerateRecommendations,
  isLoading,
  preferences,
  setPreferences,
  onRefreshPreferences,
  isSummarizing,
}: PreferenceToolProps) {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (preferences.trim()) {
      onGenerateRecommendations(preferences);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between font-headline">
          <div className="flex items-center gap-2">
            <Sparkles className="size-6" /> AI Recommendations
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefreshPreferences}
            disabled={isSummarizing || isLoading}
            suppressHydrationWarning
          >
            {isSummarizing ? (
              <Loader2 className="mr-2 animate-spin" />
            ) : (
              <RefreshCw className="mr-2" />
            )}
            Refresh Preferences
          </Button>
        </CardTitle>
        <CardDescription>
          We've analyzed your library to guess your preferences. Feel free to
          edit them before getting recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="e.g., I love science fiction, especially cyberpunk. My favorite authors are William Gibson and Philip K. Dick. I recently enjoyed 'Dune'."
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            className="min-h-[150px]"
            disabled={isSummarizing}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || isSummarizing || !preferences.trim()}
            suppressHydrationWarning
          >
            {isLoading ? "Generating..." : "Get Recommendations & Chat"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
