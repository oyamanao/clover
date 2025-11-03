import { Clover } from "lucide-react";

export function Header() {
  return (
    <header className="border-b bg-card shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center gap-3">
        <Clover className="size-8 text-accent" />
        <div>
          <h1 className="text-3xl font-headline font-bold text-accent leading-none">
            Clover AI
          </h1>
          <p className="text-sm text-muted-foreground">Your AI-powered guide to the world of books.</p>
        </div>
      </div>
    </header>
  );
}
