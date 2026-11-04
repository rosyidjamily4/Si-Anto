/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Trophy, Swords, Crown } from 'lucide-react';

interface VersusHUDProps {
  currentRound: number;
  maxRounds: number;
  activePlayer: 1 | 2;
  player1Name: string;
  player2Name: string;
  player1Score: number;
  player2Score: number;
  onExitVersus: () => void;
}

export const VersusHUD: React.FC<VersusHUDProps> = ({
  currentRound,
  maxRounds,
  activePlayer,
  player1Name,
  player2Name,
  player1Score,
  player2Score,
  onExitVersus,
}) => {
  return (
    <div className="fixed top-3 left-0 right-0 pointer-events-none z-30 flex justify-center px-4">
      <div className="bg-amber-950/95 border-2 border-amber-600 rounded-3xl p-2.5 px-5 shadow-2xl flex items-center gap-4 md:gap-8 pointer-events-auto">
        {/* Player 1 Badge */}
        <div className={`flex items-center gap-2.5 transition-all ${activePlayer === 1 ? 'scale-105' : 'opacity-70'}`}>
          <div className="w-9 h-9 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-xs shadow">
            🔴
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-white text-xs md:text-sm">{player1Name}</span>
              {activePlayer === 1 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                  MENEMBAK
                </span>
              )}
            </div>
            <div className="text-base md:text-lg font-black text-yellow-300 num-tabular">
              {player1Score} Poin
            </div>
          </div>
        </div>

        {/* Center Round Indicator */}
        <div className="flex flex-col items-center border-x border-amber-700/80 px-3 md:px-5">
          <div className="text-[10px] uppercase font-black tracking-widest text-amber-400 flex items-center gap-1">
            <Swords className="w-3.5 h-3.5 text-yellow-400" />
            DUEL KELAS
          </div>
          <div className="text-sm md:text-base font-black text-white">
            Ronde {currentRound} / {maxRounds}
          </div>
        </div>

        {/* Player 2 Badge */}
        <div className={`flex items-center gap-2.5 transition-all ${activePlayer === 2 ? 'scale-105' : 'opacity-70'}`}>
          <div className="w-9 h-9 rounded-full bg-cyan-500 border-2 border-white flex items-center justify-center text-xs shadow">
            🔵
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-white text-xs md:text-sm">{player2Name}</span>
              {activePlayer === 2 && (
                <span className="bg-cyan-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                  MENEMBAK
                </span>
              )}
            </div>
            <div className="text-base md:text-lg font-black text-yellow-300 num-tabular">
              {player2Score} Poin
            </div>
          </div>
        </div>

        {/* Exit Button */}
        <button
          onClick={onExitVersus}
          className="text-xs bg-amber-900 hover:bg-amber-800 text-amber-200 border border-amber-700 rounded-xl px-2.5 py-1.5 font-bold transition"
        >
          Keluar
        </button>
      </div>
    </div>
  );
};

interface VersusWinnerModalProps {
  player1Name: string;
  player2Name: string;
  player1Score: number;
  player2Score: number;
  onRematch: () => void;
  onClose: () => void;
}

export const VersusWinnerModal: React.FC<VersusWinnerModalProps> = ({
  player1Name,
  player2Name,
  player1Score,
  player2Score,
  onRematch,
  onClose,
}) => {
  const isDraw = player1Score === player2Score;
  const winnerName = player1Score > player2Score ? player1Name : player2Name;
  const winnerScore = Math.max(player1Score, player2Score);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 select-none animate-in fade-in duration-200">
      <div className="wood-panel w-full max-w-md rounded-3xl p-6 text-center text-amber-100 flex flex-col items-center">
        <Crown className="w-16 h-16 text-yellow-400 drop-shadow animate-bounce mb-2" />
        <div className="text-2xl md:text-3xl font-black text-yellow-300 drop-shadow mb-1">
          {isDraw ? 'HASIL IMBANG! 🤝' : `JUARA DUEL KELAS! 🏆`}
        </div>
        <div className="text-sm text-amber-200 font-bold mb-4">
          {isDraw ? 'Keduanya memiliki ketepatan luar biasa!' : `Selamat kepada ${winnerName} atas kemenangannya!`}
        </div>

        {/* Score comparison card */}
        <div className="w-full bg-amber-950/80 border-2 border-amber-600 rounded-2xl p-4 my-2 flex justify-around items-center">
          <div className="text-center">
            <div className="text-xs font-bold text-red-400 uppercase">{player1Name}</div>
            <div className="text-2xl font-black text-white num-tabular">{player1Score}</div>
          </div>
          <div className="text-xl font-black text-amber-500">VS</div>
          <div className="text-center">
            <div className="text-xs font-bold text-blue-400 uppercase">{player2Name}</div>
            <div className="text-2xl font-black text-white num-tabular">{player2Score}</div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 w-full mt-4">
          <button
            onClick={onRematch}
            className="green-button text-white text-base font-black py-3 px-6 rounded-2xl flex items-center justify-center gap-2 shadow"
          >
            Tanding Ulang (Rematch) ⚔️
          </button>
          <button
            onClick={onClose}
            className="wood-button text-amber-950 font-bold py-2.5 px-6 rounded-xl text-sm shadow"
          >
            Kembali ke Menu Utama
          </button>
        </div>
      </div>
    </div>
  );
};
