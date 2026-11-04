/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { LevelConfig } from '../types/game';
import { RotateCcw, Home, HelpCircle } from 'lucide-react';

interface GameOverModalProps {
  level: LevelConfig;
  score: number;
  onRetry: () => void;
  onGoHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  level,
  score,
  onRetry,
  onGoHome,
}) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        onRetry();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onRetry]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 select-none animate-in fade-in duration-200">
      <div className="wood-panel w-full max-w-md rounded-3xl p-6 text-center text-amber-100 flex flex-col items-center">
        {/* Banner */}
        <div className="w-16 h-16 bg-red-900/80 border-2 border-red-500 rounded-full flex items-center justify-center text-3xl mb-2 shadow-inner">
          🏹
        </div>
        <div className="text-3xl font-black text-rose-400 drop-shadow mb-1">
          BURUNG HABIS!
        </div>
        <div className="text-sm text-amber-200 font-semibold mb-4">
          Jangan berkecil hati, mari kita pelajari jawabannya dan coba lagi!
        </div>

        {/* Pedagogical Guidance (Reveals correct answer with explanation) */}
        <div className="w-full bg-amber-950/90 border-2 border-amber-600 rounded-2xl p-4 my-2 text-left">
          <div className="flex items-center gap-2 text-xs font-black text-amber-300 uppercase mb-2">
            <HelpCircle className="w-4 h-4 text-yellow-400" />
            Kunci Jawaban yang Benar:
          </div>

          <div className="bg-amber-900/80 border border-amber-700 rounded-xl p-3 mb-2 flex items-center justify-between">
            <div>
              <span className="text-xs text-amber-300 font-bold uppercase">
                {level.question.type === 'antonim' ? 'Lawan Kata dari:' : 'Persamaan Kata dari:'}
              </span>
              <div className="text-lg font-black text-white">"{level.question.promptWord}"</div>
            </div>
            <div className="text-right">
              <span className="text-xs text-green-300 font-bold uppercase">Jawaban:</span>
              <div className="text-xl font-black text-yellow-300 bg-amber-950 px-3 py-1 rounded-lg border border-amber-500">
                {level.question.correctAnswer}
              </div>
            </div>
          </div>

          <p className="text-xs font-medium text-amber-200 leading-relaxed">
            {level.question.explanation}
          </p>
        </div>

        {/* Score Readout */}
        <div className="text-xs text-amber-400 font-bold mt-2 mb-4">
          Skor Sementara: <span className="text-white text-base num-tabular">{score}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          <button
            data-start="true"
            onClick={onRetry}
            className="green-button text-white text-lg font-black py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:brightness-110 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            COBA LAGI!
          </button>

          <button
            onClick={onGoHome}
            className="bg-amber-800 hover:bg-amber-700 border-b-2 border-amber-950 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 text-sm"
          >
            <Home className="w-4 h-4" />
            Kembali ke Menu Utama
          </button>
        </div>
      </div>
    </div>
  );
};
