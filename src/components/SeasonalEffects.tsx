import { useEffect, useState } from "react";
import { useGameStore } from "@/store/gameStore";

const SeasonalEffects = () => {
  const { seasonalThemes } = useGameStore();
  const [particles, setParticles] = useState<{ id: number; emoji: string; left: number; delay: number; duration: number }[]>([]);

  const activeTheme = seasonalThemes.find((t) => t.enabled);

  useEffect(() => {
    if (!activeTheme) {
      setParticles([]);
      return;
    }

    const newParticles = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      emoji: activeTheme.decorations[Math.floor(Math.random() * activeTheme.decorations.length)],
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 8 + Math.random() * 6,
    }));

    setParticles(newParticles);
  }, [activeTheme]);

  if (!activeTheme || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute text-2xl animate-fall"
          style={{
            left: `${particle.left}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        >
          {particle.emoji}
        </div>
      ))}
      
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(360deg);
            opacity: 0.3;
          }
        }
        .animate-fall {
          animation: fall linear infinite;
        }
      `}</style>
    </div>
  );
};

export default SeasonalEffects;