import { useGameStore } from "@/store/gameStore";

interface SeasonalDecorationsProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "corners";
  size?: "sm" | "md" | "lg";
}

const SeasonalDecorations = ({ position = "corners", size = "md" }: SeasonalDecorationsProps) => {
  const { seasonalThemes } = useGameStore();
  const activeTheme = seasonalThemes.find((t) => t.enabled);

  if (!activeTheme) return null;

  const sizeClasses = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-6xl",
  };

  const decorations = activeTheme.decorations;

  if (position === "corners") {
    return (
      <>
        <div className={`absolute top-10 left-10 ${sizeClasses[size]} hidden lg:block animate-float`}>
          {decorations[0]}
        </div>
        <div className={`absolute top-10 right-10 ${sizeClasses[size]} hidden lg:block animate-float`} style={{ animationDelay: "1s" }}>
          {decorations[1]}
        </div>
        <div className={`absolute bottom-10 left-10 ${sizeClasses[size]} hidden lg:block animate-float`} style={{ animationDelay: "2s" }}>
          {decorations[2]}
        </div>
        <div className={`absolute bottom-10 right-10 ${sizeClasses[size]} hidden lg:block animate-float`} style={{ animationDelay: "3s" }}>
          {decorations[3]}
        </div>
      </>
    );
  }

  const positionClasses = {
    "top-left": "top-10 left-10",
    "top-right": "top-10 right-10",
    "bottom-left": "bottom-10 left-10",
    "bottom-right": "bottom-10 right-10",
  };

  return (
    <div className={`absolute ${positionClasses[position]} ${sizeClasses[size]} hidden lg:block animate-float`}>
      {decorations[0]}
    </div>
  );
};

export default SeasonalDecorations;