import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface LoadingModalProps {
  isOpen: boolean;
}

const LOADING_MESSAGES = [
  "Building your AI Agent...",
  "Configuring bot structure...",
  "Setting up conversation flow...",
  "Almost ready...",
];

export const LoadingModal = ({ isOpen }: LoadingModalProps) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 800);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card rounded-lg shadow-xl p-8 max-w-md w-full mx-4 border border-border">
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
      </div>
    </div>
  );
};
