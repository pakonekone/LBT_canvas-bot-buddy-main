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
    <div className="space-y-1">
      {/* Main message */}
      {sections.main && (
        <div className="text-sm text-gray-900">
          {sections.main}
        </div>
      )}

      {/* What I understood */}
      {sections.understood && (
        <div className="text-[11px] text-gray-400 italic">
          {sections.understood}
        </div>
      )}

      {/* Actions taken */}
      {sections.actions.length > 0 && (
        <div className="text-[11px] text-gray-400 space-y-0">
          {sections.actions.map((action, idx) => (
            <div key={idx}>• {action}</div>
          ))}
        </div>
      )}

      {/* Current bot flow */}
      {sections.flow && (
        <div className="text-[11px] font-mono text-gray-400">
          {sections.flow}
        </div>
      )}
    </div>
  );
};
