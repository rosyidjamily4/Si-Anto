/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { LevelConfig } from '../types/game';
import { Star, ArrowRight, RotateCcw, Home } from 'lucide-react';
import { sounds } from '../game/audio';

interface VictoryModalProps {
  level: LevelConfig;
  score: number;
  levelScore: number;
  stars: number;
  remainingBirds: number;
  onNextLevel: () => void;
  onReplayLevel: () => void;
  onGoHome: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  level,
  score,
  levelScore,
  stars,
  remainingBirds,
  onNextLevel,
  onReplayLevel,
  onGoHome,
}) => {
  useEffect(() => {
    // Star chime sequence
    for (let i = 0; i < stars; i++) {
      setTimeout(() => {
        sounds.playStarPop(i);
      }, 300 + i * 280);
    }
  }, [stars]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        onNextLevel();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onNextLevel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 select-none animate-in fade-in duration-200">
      <div className="wood-panel w-full max-w-md rounded-3xl p-6 text-center text-amber-100 flex flex-col items-center">
        {/* Banner Title */}
        <div className="text-3xl font-black text-yellow-300 drop-shadow mb-1">
          LEVEL SELESAI! 🎉
        </div>
        <div className="text-sm text-amber-200 font-bold mb-4">
          Hebat Sekali! Kamu Berhasil Menembak Kata yang Benar
        </div>

        {/* 3 Stars Container */}
        <div className="flex items-center justify-center gap-3 my-2">
          {[1, 2, 3].map((starIdx) => {
            const isEarned = starIdx <= stars;
            return (
              <div
                key={starIdx}
                className={`transition-all duration-300 transform ${
                  isEarned ? 'scale-110 text-yellow-400' : 'scale-90 text-amber-950/70'
                }`}
              >
                <Star
                  className={`w-14 h-14 ${
                    isEarned
                      ? 'fill-yellow-400 stroke-amber-700 stroke-2 drop-shadow-[0_4px_8px_rgba(234,179,8,0.5)]'
                      : 'fill-amber-900/50 stroke-amber-800/40'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Score & Metrics Box */}
        <div className="w-full bg-amber-950/80 border-2 border-amber-700 rounded-2xl p-4 my-4 flex justify-around">
          <div>
            <div className="text-xs uppercase text-amber-400 font-bold">Poin Level</div>
            <div className="text-2xl font-black text-white num-tabular">+{levelScore}</div>
          </div>
          <div className="border-r border-amber-800" />
          <div>
            <div className="text-xs uppercase text-amber-400 font-bold">Total Skor</div>
            <div className="text-2xl font-black text-yellow-300 num-tabular">{score}</div>
          </div>
          <div className="border-r border-amber-800" />
          <div>
            <div className="text-xs uppercase text-amber-400 font-bold">Sisa Burung</div>
            <div className="text-2xl font-black text-green-400 num-tabular">{remainingBirds} 🏹</div>
          </div>
        </div>

        {/* Pedagogical Explanation Box */}
        <div className="w-full bg-amber-900/60 border border-amber-600/70 rounded-2xl p-3.5 mb-5 text-left">
          <div className="text-xs font-black text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span>📚</span> Catatan Kosakata:
          </div>
          <p className="text-xs font-semibold text-amber-100 leading-relaxed">
            {level.question.explanation}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          <button
            data-start="true"
            onClick={onNextLevel}
            className="green-button text-white text-lg font-black py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:brightness-110 cursor-pointer"
          >
            LEVEL SELANJUTNYA
            <ArrowRight className="w-6 h-6" />
          </button>

          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              onClick={onReplayLevel}
              className="wood-button text-amber-950 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Ulangi Level
            </button>
            <button
              onClick={onGoHome}
              className="bg-amber-800 hover:bg-amber-700 border-b-2 border-amber-950 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 text-sm"
            >
              <Home className="w-4 h-4" />
              Menu Utama
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
