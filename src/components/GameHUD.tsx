/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AvatarConfig, LevelConfig } from '../types/game';
import { Pause, RotateCcw, Volume2, VolumeX, Lightbulb, HelpCircle } from 'lucide-react';
import { sounds } from '../game/audio';

interface GameHUDProps {
  level: LevelConfig;
  score: number;
  combo: number;
  remainingBirds: number;
  avatar: AvatarConfig;
  feedbackMessage: { text: string; isCorrect: boolean } | null;
  onPause: () => void;
  onRestartLevel: () => void;
  onMuteToggle: () => void;
  isMuted: boolean;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  level,
  score,
  combo,
  remainingBirds,
  avatar,
  feedbackMessage,
  onPause,
  onRestartLevel,
  onMuteToggle,
  isMuted,
}) => {
  const [showHint, setShowHint] = useState(false);
  const isAntonim = level.question.type === 'antonim';

  return (
    <div className="fixed inset-0 pointer-events-none select-none z-20 flex flex-col justify-between p-3 md:p-5">
      {/* Top Perimeter Status Cluster */}
      <div className="w-full flex justify-between items-start gap-2">
        {/* Left: Level & Ammo Cluster */}
        <div className="flex flex-col gap-1.5 pointer-events-auto">
          {/* Level Badge */}
          <div className="bg-amber-950/90 border-2 border-amber-600 rounded-2xl px-3.5 py-1.5 shadow-lg flex items-center gap-2">
            <span className="text-amber-400 font-extrabold text-xs uppercase tracking-wide">
              Level {level.levelNumber}
            </span>
            <span className="text-xs bg-amber-800 text-amber-200 px-2 py-0.5 rounded-full font-semibold">
              {level.gradeLabel}
            </span>
          </div>

          {/* Remaining Birds (Ammo) */}
          <div className="bg-amber-950/90 border-2 border-amber-600 rounded-2xl px-3 py-1.5 shadow-lg flex items-center gap-1.5">
            <span className="text-xs text-amber-300 font-bold uppercase mr-1">Burung:</span>
            {Array.from({ length: level.maxBirds }).map((_, i) => (
              <div
                key={i}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  i < remainingBirds
                    ? avatar.birdType === 'kakatua_emas'
                      ? 'bg-amber-400 border-amber-200 shadow-sm scale-100'
                      : avatar.birdType === 'cendrawasih_biru'
                      ? 'bg-cyan-500 border-cyan-200 shadow-sm scale-100'
                      : avatar.birdType === 'hantu_bijak'
                      ? 'bg-amber-800 border-amber-300 shadow-sm scale-100'
                      : 'bg-red-500 border-red-200 shadow-sm scale-100'
                    : 'bg-slate-700/60 border-slate-600 opacity-30 scale-90'
                }`}
              >
                {i < remainingBirds && <div className="w-2 h-2 rounded-full bg-white/80" />}
              </div>
            ))}
          </div>
        </div>

        {/* Center: Educational Target Question Banner */}
        <div className="flex flex-col items-center pointer-events-auto max-w-lg text-center animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`border-3 rounded-2xl px-5 py-2.5 shadow-2xl flex flex-col items-center transition-colors ${
              isAntonim
                ? 'bg-gradient-to-r from-red-700 via-rose-800 to-red-700 border-red-400 text-white'
                : 'bg-gradient-to-r from-sky-700 via-blue-800 to-sky-700 border-sky-400 text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm font-black uppercase tracking-wider text-amber-300">
                {isAntonim ? '🏹 CARI LAWAN KATA (ANTONIM)' : '✨ CARI PERSAMAAN KATA (SINONIM)'}
              </span>
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-amber-200 hover:text-white transition"
                title="Bantuan Penjelasan Kata"
                aria-label="Bantuan Penjelasan Kata"
              >
                <Lightbulb className="w-4 h-4 fill-amber-300" />
              </button>
            </div>

            <div className="text-2xl md:text-3xl font-black tracking-wide text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mt-0.5">
              "{level.question.promptWord}"
            </div>
          </div>

          {/* Optional Educational Hint Popup */}
          {showHint && (
            <div className="mt-2 bg-amber-950/95 border-2 border-amber-500 text-amber-100 text-xs px-4 py-2 rounded-xl shadow-xl max-w-sm">
              <p className="font-semibold">{level.question.explanation}</p>
            </div>
          )}
        </div>

        {/* Right: Score, Combo & Controls */}
        <div className="flex items-start gap-2 pointer-events-auto">
          {/* Score & Combo */}
          <div className="bg-amber-950/90 border-2 border-amber-600 rounded-2xl px-4 py-2 text-right shadow-lg">
            <div className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider">SKOR</div>
            <div className="text-xl md:text-2xl font-black text-white num-tabular drop-shadow">
              {score}
            </div>
            {combo > 1 && (
              <div className="text-xs font-black text-yellow-400 animate-pulse">
                COMBO x{combo}! 🔥
              </div>
            )}
          </div>

          {/* Quick Utility Icon Buttons */}
          <div className="flex flex-col gap-1.5">
            <button
              onClick={onMuteToggle}
              tabIndex={-1}
              onMouseDown={(e) => e.currentTarget.blur()}
              className="p-2.5 bg-amber-900/90 border-2 border-amber-600 rounded-xl text-amber-200 hover:text-white hover:bg-amber-800 transition active:scale-95 shadow"
              title={isMuted ? 'Nyalakan Suara [M]' : 'Bisukan Suara [M]'}
              aria-label={isMuted ? 'Nyalakan Suara' : 'Bisukan Suara'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-300" /> : <Volume2 className="w-4 h-4 text-green-300" />}
            </button>

            <button
              onClick={onRestartLevel}
              tabIndex={-1}
              onMouseDown={(e) => e.currentTarget.blur()}
              className="p-2.5 bg-amber-900/90 border-2 border-amber-600 rounded-xl text-amber-200 hover:text-white hover:bg-amber-800 transition active:scale-95 shadow"
              title="Mulai Ulang Level [R]"
              aria-label="Mulai Ulang Level"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onPause}
              tabIndex={-1}
              onMouseDown={(e) => e.currentTarget.blur()}
              className="p-2.5 bg-amber-900/90 border-2 border-amber-600 rounded-xl text-amber-200 hover:text-white hover:bg-amber-800 transition active:scale-95 shadow"
              title="Jeda Game [Esc / P]"
              aria-label="Jeda Game"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Pedagogical Feedback Toast (When answer block is struck) */}
      {feedbackMessage && (
        <div className="self-center mb-6 pointer-events-auto transition-all animate-in zoom-in-95 duration-200">
          <div
            className={`border-3 rounded-2xl px-6 py-3 shadow-2xl flex items-center gap-3 ${
              feedbackMessage.isCorrect
                ? 'bg-emerald-800/95 border-emerald-400 text-emerald-100'
                : 'bg-rose-900/95 border-rose-400 text-rose-100'
            }`}
          >
            <span className="text-2xl">{feedbackMessage.isCorrect ? '🎉' : '💡'}</span>
            <div>
              <div className="font-black text-sm uppercase tracking-wide">
                {feedbackMessage.isCorrect ? 'LUAR BIASA! JAWABAN TEPAT' : 'UPS, BELUM TEPAT!'}
              </div>
              <div className="text-xs font-semibold text-white/90">
                {feedbackMessage.text}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Subtle Slingshot Touch / Drag Instruction */}
      <div className="self-center text-center text-xs font-bold text-amber-950/70 bg-white/60 backdrop-blur-none rounded-full px-4 py-1 pointer-events-none">
        Sentuh atau Tarik Burung ke Kiri Bawah · Lepas untuk Menembak
      </div>
    </div>
  );
};
