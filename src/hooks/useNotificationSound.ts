import { useRef, useCallback } from "react";

export const useNotificationSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/sounds/notification.mp3");
    }

    // Reseta o áudio antes de tocar
    audioRef.current.currentTime = 0;

    // Tenta tocar o áudio
    audioRef.current.play().catch((error) => {
      console.error("Erro ao tocar áudio:", error);
    });
  }, []);

  return { playSound };
};
