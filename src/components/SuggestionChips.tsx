import { Suggestion } from "@/types/botBuilder";

interface SuggestionChipsProps {
  suggestions: Suggestion[];
  onChipClick: (prompt: string, chipId: string) => void;
}

export const SuggestionChips = ({ suggestions, onChipClick }: SuggestionChipsProps) => {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mt-3 mb-5">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion.id}
          onClick={() => onChipClick(suggestion.prompt, suggestion.id)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-xs text-gray-700 transition-colors"
        >
          <span className="text-sm">{suggestion.emoji}</span>
          <span>{suggestion.text}</span>
        </button>
      ))}
    </div>
  );
};
