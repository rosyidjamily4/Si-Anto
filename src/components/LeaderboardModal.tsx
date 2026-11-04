/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AvatarConfig, LeaderboardEntry } from '../types/game';
import { X, Trophy, Medal, Award, Flame, Star, Sparkles } from 'lucide-react';

interface LeaderboardModalProps {
  currentAvatar: AvatarConfig;
  userScore: number;
  userLevel: number;
  userAccuracy: number;
  onClose: () => void;
}

const DEFAULT_LEADERBOARD_ENTRIES: LeaderboardEntry[] = [
  { id: 'lb-1', name: 'Aisyah Putri', studentClass: 'Kelas 5-B', birdType: 'cendrawasih_biru', hat: 'mahkota', score: 14850, levelReached: 12, accuracy: 96.5, date: 'Hari Ini', starsTotal: 34 },
  { id: 'lb-2', name: 'Rizky Pratama', studentClass: 'Kelas 4-A', birdType: 'jalak_merah', hat: 'sd_hat', score: 12400, levelReached: 10, accuracy: 94.0, date: 'Hari Ini', starsTotal: 28 },
  { id: 'lb-3', name: 'Dewi Lestari', studentClass: 'Kelas 4-A', birdType: 'kakatua_emas', hat: 'wisuda', score: 10950, levelReached: 9, accuracy: 91.2, date: 'Kemarin', starsTotal: 25 },
  { id: 'lb-4', name: 'Bima Satria', studentClass: 'Kelas 3-B', birdType: 'hantu_bijak', hat: 'petualang', score: 9200, levelReached: 8, accuracy: 88.5, date: '2 hari lalu', starsTotal: 22 },
  { id: 'lb-5', name: 'Nadia Zahra', studentClass: 'Kelas 4-B', birdType: 'jalak_merah', hat: 'pita', score: 8450, levelReached: 7, accuracy: 89.0, date: '3 hari lalu', starsTotal: 19 },
  { id: 'lb-6', name: 'Fikri Haikal', studentClass: 'Kelas 4-A', birdType: 'cendrawasih_biru', hat: 'kacamata', score: 7800, levelReached: 6, accuracy: 85.5, date: 'Minggu ini', starsTotal: 17 },
  { id: 'lb-7', name: 'Kirana Ayu', studentClass: 'Kelas 5-A', birdType: 'kakatua_emas', hat: 'sd_hat', score: 6900, levelReached: 6, accuracy: 87.0, date: 'Minggu ini', starsTotal: 16 },
  { id: 'lb-8', name: 'Genta Perkasa', studentClass: 'Kelas 3-A', birdType: 'jalak_merah', hat: 'petualang', score: 5850, levelReached: 5, accuracy: 82.0, date: 'Minggu ini', starsTotal: 14 },
];

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  currentAvatar,
  userScore,
  userLevel,
  userAccuracy,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'semua' | 'hari_ini' | 'kelas'>('semua');

  // Insert current user into leaderboard dynamically
  const userEntry: LeaderboardEntry = {
    id: 'user-current',
    name: `${currentAvatar.studentName} (Kamu)`,
    studentClass: currentAvatar.studentClass,
    birdType: currentAvatar.birdType,
    hat: currentAvatar.hat,
    score: Math.max(userScore, 2400),
    levelReached: Math.max(userLevel, 2),
    accuracy: userAccuracy > 0 ? userAccuracy : 90.0,
    date: 'Hari Ini',
    starsTotal: Math.max(userLevel * 2, 4),
  };

  const allEntries = [...DEFAULT_LEADERBOARD_ENTRIES, userEntry].sort((a, b) => b.score - a.score);

  const filteredEntries = allEntries.filter((e) => {
    if (activeTab === 'hari_ini') {
      return e.date === 'Hari Ini' || e.id === 'user-current';
    }
    if (activeTab === 'kelas') {
      return e.studentClass === currentAvatar.studentClass || e.id === 'user-current';
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 select-none animate-in fade-in duration-150">
      <div className="wood-panel w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl p-6 text-amber-100 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b-2 border-amber-700 mb-4">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-8 h-8 text-yellow-400 drop-shadow" />
            <div>
              <div className="text-xl md:text-2xl font-black text-yellow-300">
                Papan Peringkat Juara Kata
              </div>
              <div className="text-xs text-amber-300">
                Adu Prestasi Kosakata Sinonim & Antonim Siswa SD
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-amber-900/80 hover:bg-amber-800 text-amber-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Filters */}
        <div className="grid grid-cols-3 gap-2 bg-amber-950/80 p-1.5 rounded-2xl border border-amber-700 mb-4">
          <button
            onClick={() => setActiveTab('semua')}
            className={`py-2 px-3 rounded-xl text-xs md:text-sm font-black transition ${
              activeTab === 'semua'
                ? 'bg-amber-600 text-white shadow'
                : 'text-amber-300 hover:text-white'
            }`}
          >
            🏆 Sepanjang Masa
          </button>
          <button
            onClick={() => setActiveTab('hari_ini')}
            className={`py-2 px-3 rounded-xl text-xs md:text-sm font-black transition ${
              activeTab === 'hari_ini'
                ? 'bg-amber-600 text-white shadow'
                : 'text-amber-300 hover:text-white'
            }`}
          >
            ⚡ Hari Ini
          </button>
          <button
            onClick={() => setActiveTab('kelas')}
            className={`py-2 px-3 rounded-xl text-xs md:text-sm font-black transition ${
              activeTab === 'kelas'
                ? 'bg-amber-600 text-white shadow'
                : 'text-amber-300 hover:text-white'
            }`}
          >
            🏫 Kelas Saya ({currentAvatar.studentClass})
          </button>
        </div>

        {/* Leaderboard Table List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 mb-4">
          {filteredEntries.map((entry, index) => {
            const isUser = entry.id === 'user-current';
            const rank = index + 1;

            return (
              <div
                key={entry.id}
                className={`p-3 rounded-2xl border-2 flex items-center justify-between transition ${
                  isUser
                    ? 'bg-amber-700/80 border-yellow-300 shadow-md ring-2 ring-yellow-400/50 scale-[1.01]'
                    : rank === 1
                    ? 'bg-amber-900/90 border-yellow-400/80'
                    : rank === 2
                    ? 'bg-amber-900/80 border-slate-300/80'
                    : rank === 3
                    ? 'bg-amber-900/70 border-amber-600/80'
                    : 'bg-amber-950/60 border-amber-800'
                }`}
              >
                {/* Left: Rank & Avatar */}
                <div className="flex items-center gap-3">
                  {/* Rank Badge */}
                  <div className="w-8 flex items-center justify-center font-black text-base">
                    {rank === 1 ? (
                      <span className="text-2xl" title="Juara 1">🥇</span>
                    ) : rank === 2 ? (
                      <span className="text-2xl" title="Juara 2">🥈</span>
                    ) : rank === 3 ? (
                      <span className="text-2xl" title="Juara 3">🥉</span>
                    ) : (
                      <span className="text-amber-400 num-tabular">#{rank}</span>
                    )}
                  </div>

                  {/* Bird Avatar Icon */}
                  <div className="relative">
                    <div
                      className={`w-10 h-10 rounded-full border-2 border-white/60 flex items-center justify-center text-xs shadow-inner ${
                        entry.birdType === 'kakatua_emas'
                          ? 'bg-amber-400'
                          : entry.birdType === 'cendrawasih_biru'
                          ? 'bg-cyan-500'
                          : entry.birdType === 'hantu_bijak'
                          ? 'bg-amber-800'
                          : 'bg-red-500'
                      }`}
                    >
                      <div className="w-2.5 h-2.5 bg-slate-900 rounded-full ml-2" />
                    </div>
                    {entry.hat !== 'none' && (
                      <div className="absolute -top-2 -left-1 text-base">
                        {entry.hat === 'sd_hat' ? '🧢' :
                         entry.hat === 'wisuda' ? '🎓' :
                         entry.hat === 'mahkota' ? '👑' :
                         entry.hat === 'petualang' ? '🤠' :
                         entry.hat === 'kacamata' ? '🕶️' : '🎀'}
                      </div>
                    )}
                  </div>

                  {/* Name & Class info */}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`font-black text-sm ${isUser ? 'text-yellow-300' : 'text-white'}`}>
                        {entry.name}
                      </span>
                      {isUser && (
                        <span className="bg-yellow-400 text-amber-950 text-[10px] font-black px-1.5 rounded-full">
                          SAYA
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-amber-300 font-semibold flex items-center gap-2">
                      <span>{entry.studentClass}</span>
                      <span>·</span>
                      <span>Level {entry.levelReached}</span>
                      <span>·</span>
                      <span className="text-green-300">Akurasi {entry.accuracy}%</span>
                    </div>
                  </div>
                </div>

                {/* Right: Score */}
                <div className="text-right">
                  <div className="text-lg md:text-xl font-black text-yellow-300 num-tabular">
                    {entry.score.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-amber-300 font-bold uppercase">
                    Poin
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-amber-800 flex justify-between items-center text-xs text-amber-300">
          <span>💡 Terus selesaikan level dengan sedikit tembakan untuk meraih peringkat 1!</span>
          <button
            onClick={onClose}
            className="wood-button text-amber-950 font-black py-2 px-5 rounded-xl text-xs shadow"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
