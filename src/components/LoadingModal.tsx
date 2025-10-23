import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

interface LoadingModalProps {
  isOpen: boolean;
  onStart?: () => void;
  isStarted?: boolean;
}

const LOADING_MESSAGES = [
  "Building your AI Agent...",
  "Configuring bot structure...",
  "Setting up conversation flow...",
  "Almost ready...",
];

export const LoadingModal = ({ isOpen, onStart, isStarted = false }: LoadingModalProps) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isOpen || !isStarted) return;

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 800);

    return () => clearInterval(interval);
  }, [isOpen, isStarted]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card rounded-lg shadow-xl p-8 max-w-md w-full mx-4 border border-border">
        {!isStarted ? (
          // Initial state with Start button
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Ready to Build?</h3>
              <p className="text-sm text-muted-foreground">
                Click the button below to create your AI-powered bot
              </p>
            </div>
            <Button
              onClick={onStart}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Start Building
            </Button>
          </div>
        ) : (
          // Loading state
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center animate-pulse">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Creating Your Bot</h3>
              <p className="text-sm text-muted-foreground animate-pulse">
                {LOADING_MESSAGES[messageIndex]}
              </p>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-primary transition-all duration-300 ease-in-out"
                style={{
                  width: `${((messageIndex + 1) / LOADING_MESSAGES.length) * 100}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
