import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Play, Sparkles, CheckCircle2, Rocket } from "lucide-react";

interface FlowCompleteCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  onSeeInAction: () => void;
}

export const FlowCompleteCelebration = ({
  isOpen,
  onClose,
  onSeeInAction
}: FlowCompleteCelebrationProps) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      // Stop confetti after 3 seconds
      const timeout = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  const handleSeeInAction = () => {
    onSeeInAction();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        {/* Confetti Animation */}
        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-10px',
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              >
                <Sparkles
                  className={`h-4 w-4 ${
                    i % 4 === 0
                      ? 'text-yellow-400'
                      : i % 4 === 1
                      ? 'text-green-400'
                      : i % 4 === 2
                      ? 'text-blue-400'
                      : 'text-pink-400'
                  }`}
                />
              </div>
            ))}
          </div>
        )}

        <DialogHeader className="text-center space-y-4 pt-6">
          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center animate-scale-in shadow-lg">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>

          <DialogTitle className="text-2xl font-bold">
            🎉 Your Bot is Ready!
          </DialogTitle>

          <DialogDescription className="text-base">
            Congratulations! You've successfully configured your complete lead generation bot with HubSpot integration.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-6">
          {/* Feature List */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Complete conversation flow</p>
                <p className="text-xs text-muted-foreground">All questions and messages configured</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">HubSpot integration active</p>
                <p className="text-xs text-muted-foreground">Lead data will be sent to your CRM</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Ready for real-world testing</p>
                <p className="text-xs text-muted-foreground">Preview how it works before publishing</p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="font-semibold text-green-900 dark:text-green-100">
                Ready to see it in action?
              </p>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">
              Click the button below to preview your complete bot flow and see how it interacts with users.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pb-2">
          <Button
            onClick={handleSeeInAction}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
            size="lg"
          >
            <Play className="h-4 w-4 mr-2" />
            See in Action
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            size="lg"
          >
            Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
