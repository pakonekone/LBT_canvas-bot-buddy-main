import { Plus } from "lucide-react";
import { Button } from "./ui/button";

interface FloatingAddButtonProps {
  onClick?: () => void;
}

export const FloatingAddButton = ({ onClick }: FloatingAddButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className="fixed left-6 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-2xl z-50 transition-all hover:scale-110"
      size="icon"
      title="Add new block"
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
};