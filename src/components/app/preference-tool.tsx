"use client";

import { RefreshCw, Sparkles, Loader2, BookCheck, Tags } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { SummarizeLibraryOutput } from "@/ai/flows/summarize-library";
import { Badge } from "../ui/badge";
import { Progress } from "@/components/ui/progress";

interface PreferenceToolProps {
  onGenerateRecommendations: (preferences: string) => void;
  isLoading: boolean;
  preferences: string;
  setPreferences: (value: string) => void;
  onRefreshPreferences: () => void;
  isSummarizing: boolean;
  summarizedPreferences: SummarizeLibraryOutput | null;
}

export function PreferenceTool({
  onGenerateRecommendations,
  isLoading,
  preferences,
  setPreferences,
  onRefreshPreferences,
  isSummarizing,
  summarizedPreferences,
}: PreferenceToolProps) {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prefsToGenerate = preferences.trim();
    onGenerateRecommendations(prefsToGenerate);
  };

  return (
    <Card>
      {isSummarizing && <Progress value={100} className="w-full h-1 animate-pulse bg-accent" />}
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
          Here is the AI's analysis of your library. You can add more details below before generating recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isSummarizing && !summarizedPreferences ? (
            <div className="space-y-4 rounded-lg border bg-muted/50 p-4 animate-pulse">
                <div className="h-5 w-3/4 rounded bg-muted-foreground/20"></div>
                 <div className="flex flex-wrap gap-2">
                    <div className="h-6 w-24 rounded-full bg-muted-foreground/20"></div>
                    <div className="h-6 w-32 rounded-full bg-muted-foreground/20"></div>
                 </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="h-6 w-28 rounded-full bg-muted-foreground/20"></div>
                    <div className="h-6 w-20 rounded-full bg-muted-foreground/20"></div>
                 </div>
            </div>
        ) : summarizedPreferences && summarizedPreferences.summary && (
          <div className="space-y-4 rounded-lg border-2 border-muted/30 bg-muted/10 p-6 shadow-inner">
            <p className="font-semibold text-center italic text-foreground/90">
              &quot;{summarizedPreferences.summary}&quot;
            </p>
            <div className="space-y-3 pt-3">
              <div>
                <h4 className="font-headline flex items-center gap-2 mb-2 text-sm uppercase tracking-wider text-muted-foreground/70"><BookCheck /> Preferred Genres</h4>
                <div className="flex flex-wrap gap-2">
                  {summarizedPreferences.genres.map((genre) => (
                    <Badge key={genre} variant="outline" className="border-accent text-accent bg-transparent text-sm">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
               <div>
                <h4 className="font-headline flex items-center gap-2 mb-2 text-sm uppercase tracking-wider text-muted-foreground/70"><Tags /> Common Themes</h4>
                <div className="flex flex-wrap gap-2">
                  {summarizedPreferences.themes.map((theme) => (
                     <Badge key={theme} variant="outline" className="border-accent text-accent bg-transparent text-sm">
                      {theme}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <label htmlFor="preferences-textarea" className="font-headline text-muted-foreground">Add more details (optional)</label>
          <Textarea
            id="preferences-textarea"
            placeholder="e.g., 'I'm in the mood for something fast-paced' or 'Suggest books similar to Project Hail Mary'."
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            className="min-h-[100px]"
            disabled={isSummarizing}
            suppressHydrationWarning
          />
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || isSummarizing}
            suppressHydrationWarning
          >
            {isLoading ? "Generating..." : "Get Recommendations & Chat"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
