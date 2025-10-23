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
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            {!isStarted ? (
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center animate-pulse">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            )}
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">
              {!isStarted ? "Ready to Build Your Bot?" : "Creating Your Bot"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {!isStarted ? (
                "Click below to start"
              ) : (
                <span className="animate-pulse">{LOADING_MESSAGES[messageIndex]}</span>
              )}
            </p>
          </div>
          {!isStarted ? (
            <Button
              onClick={onStart}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-all"
            >
              Start Building
            </Button>
          ) : (
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300 ease-in-out"
                style={{
                  width: `${((messageIndex + 1) / LOADING_MESSAGES.length) * 100}%`,
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
