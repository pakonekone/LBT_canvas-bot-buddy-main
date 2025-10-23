import { CheckCircle2, Lightbulb, GitBranch } from "lucide-react";
import { Card } from "./ui/card";

interface ActionSummaryProps {
  content: string;
}

export const ActionSummary = ({ content }: ActionSummaryProps) => {
  // Parse the summary structure
  const sections = {
    main: '',
    understood: '',
    actions: [] as string[],
    flow: ''
  };

  // Extract main message (first line before "**What I understood:**")
  const mainMatch = content.match(/^(.+?)(?=\*\*What I understood:\*\*)/s);
  if (mainMatch) sections.main = mainMatch[1].trim();

  // Extract "What I understood" section
  const understoodMatch = content.match(/\*\*What I understood:\*\*\s*(.+?)(?=\*\*Actions taken:\*\*)/s);
  if (understoodMatch) sections.understood = understoodMatch[1].trim();

  // Extract "Actions taken" bullet points - make it work without flow section
  const actionsMatch = content.match(/\*\*Actions taken:\*\*\s*(.+?)(?=\*\*Current bot flow:\*\*|$)/s);
  if (actionsMatch) {
    sections.actions = actionsMatch[1]
      .split('\n')
      .filter(line => line.trim().startsWith('•'))
      .map(line => line.replace(/^•\s*/, '').trim());
  }

  return (
    <Card className="border-l-4 border-l-primary bg-muted/50 p-4 space-y-3">
      {/* Main message */}
      {sections.main && (
        <div className="text-sm font-medium text-foreground">
          {sections.main}
        </div>
      )}

      {/* What I understood */}
      {sections.understood && (
        <div className="flex gap-2 items-start">
          <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
              What I understood
            </div>
            <div className="text-xs text-muted-foreground">
              {sections.understood}
            </div>
          </div>
        </div>
      )}

      {/* Actions taken */}
      {sections.actions.length > 0 && (
        <div className="flex gap-2 items-start">
          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">
              Actions taken
            </div>
            <ul className="space-y-1">
              {sections.actions.map((action, idx) => (
                <li key={idx} className="text-xs text-muted-foreground flex gap-2">
                  <span className="text-green-500">•</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Current bot flow */}
      {sections.flow && (
        <div className="flex gap-2 items-start">
          <GitBranch className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
              Current bot flow
            </div>
            <div className="text-xs font-mono text-muted-foreground bg-background/50 p-2 rounded">
              {sections.flow}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
