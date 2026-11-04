/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';

interface PauseModalProps {
  score: number;
  levelNumber: number;
  onResume: () => void;
  onRestart: () => void;
  onGoHome: () => void;
  onMuteToggle: () => void;
  isMuted: boolean;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  score,
  levelNumber,
  onResume,
  onRestart,
  onGoHome,
  onMuteToggle,
  isMuted,
}) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape' || e.code === 'KeyP') {
        e.preventDefault();
        onResume();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onResume]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 select-none animate-in fade-in duration-150">
      <div className="wood-panel w-full max-w-sm rounded-3xl p-6 text-center text-amber-100 flex flex-col items-center">
        <div className="text-2xl font-black text-yellow-300 drop-shadow mb-1">
          GAME DIJEDA ⏸️
        </div>
        <div className="text-xs text-amber-300 font-bold mb-4">
          Level {levelNumber} · Skor: <span className="num-tabular text-white">{score}</span>
        </div>

        <div className="flex flex-col gap-3 w-full my-2">
          <button
            onClick={onResume}
            className="green-button text-white font-black py-3 px-6 rounded-2xl flex items-center justify-center gap-2 shadow"
          >
            <Play className="w-5 h-5 fill-white" />
            Lanjutkan Game
          </button>

          <button
            onClick={onRestart}
            className="wood-button text-amber-950 font-bold py-2.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Mulai Ulang Level Ini
          </button>

          <button
            onClick={onMuteToggle}
            className="bg-amber-900/90 border border-amber-600 hover:bg-amber-800 text-amber-200 font-bold py-2.5 px-6 rounded-2xl flex items-center justify-center gap-2 text-sm shadow"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-300" /> : <Volume2 className="w-4 h-4 text-green-300" />}
            {isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
          </button>

          <button
            onClick={onGoHome}
            className="bg-amber-800 hover:bg-amber-700 border-b-2 border-amber-950 text-white font-bold py-2.5 px-6 rounded-2xl flex items-center justify-center gap-2 text-sm shadow mt-1"
          >
            <Home className="w-4 h-4" />
            Kembali ke Menu Utama
          </button>
        </div>
      </div>
    </div>
  );
};
