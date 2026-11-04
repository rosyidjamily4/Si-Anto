/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AvatarConfig } from '../types/game';
import { Play, Users, Award, BookOpen, User, Volume2, VolumeX } from 'lucide-react';
import { sounds } from '../game/audio';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenMultiplayer: () => void;
  onOpenAvatar: () => void;
  onOpenLeaderboard: () => void;
  onOpenReport: () => void;
  avatar: AvatarConfig;
  highScore: number;
  highestLevel: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenMultiplayer,
  onOpenAvatar,
  onOpenLeaderboard,
  onOpenReport,
  avatar,
  highScore,
  highestLevel,
}) => {
  const [muted, setMuted] = React.useState(sounds.getMuted());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        onStartGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStartGame]);

  const toggleSound = () => {
    const nextMute = sounds.toggleMute();
    setMuted(nextMute);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col justify-between items-center select-none bg-gradient-to-b from-sky-400 via-sky-200 to-emerald-600 px-4 py-6">
      {/* Decorative Cloud elements */}
      <div className="absolute top-8 left-12 w-36 h-12 bg-white/70 rounded-full blur-[1px] pointer-events-none" />
      <div className="absolute top-20 right-16 w-48 h-16 bg-white/60 rounded-full blur-[1px] pointer-events-none" />
      <div className="absolute top-36 left-1/4 w-32 h-10 bg-white/50 rounded-full blur-[1px] pointer-events-none" />

      {/* Top Utility Bar */}
      <div className="w-full max-w-5xl flex justify-between items-center gap-2 z-10">
        <div className="flex items-center gap-2 bg-amber-950/85 border border-amber-600/90 rounded-2xl px-2.5 py-1.5 md:px-4 md:py-2 text-amber-100 shadow-lg">
          <span className="text-lg md:text-xl">🎓</span>
          <div>
            <div className="text-[9px] md:text-xs uppercase font-bold tracking-wider text-amber-300">Siswa Aktif</div>
            <div className="font-bold text-xs md:text-sm text-white truncate max-w-[120px] md:max-w-none">{avatar.studentName}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-amber-950/85 border border-amber-600/90 rounded-2xl px-2.5 py-1.5 md:px-4 md:py-2 text-amber-100 shadow-lg flex items-center gap-1.5 text-xs md:text-sm">
            <span className="text-amber-400 font-black">⭐</span>
            <span className="font-bold text-white num-tabular">{highScore} Poin</span>
          </div>

          <button
            onClick={toggleSound}
            className="p-2 md:p-3 bg-amber-900/90 border border-amber-600/90 rounded-2xl text-amber-200 hover:text-white hover:bg-amber-800 transition active:scale-95 shadow-lg"
            title={muted ? 'Nyalakan Suara' : 'Bisukan Suara'}
            aria-label={muted ? 'Nyalakan Suara' : 'Bisukan Suara'}
          >
            {muted ? <VolumeX className="w-4 h-4 md:w-5 md:h-5 text-red-300" /> : <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-green-300" />}
          </button>
        </div>
      </div>

      {/* Hero Title Lockup & Mascot Centerpiece */}
      <div className="flex flex-col items-center justify-center my-auto z-10 text-center max-w-3xl">
        {/* Bespoke Inline SVG Title Emblem */}
        <div className="relative mb-2">
          <svg className="w-full max-w-[580px] h-32 md:h-40 filter drop-shadow-[0_10px_12px_rgba(0,0,0,0.5)]" viewBox="0 0 600 130">
            {/* Wooden Plaque Frame */}
            <path
              d="M 30,35 Q 300,5 570,35 L 560,115 Q 300,135 40,115 Z"
              fill="#78350f"
              stroke="#b45309"
              strokeWidth="6"
            />
            <path
              d="M 40,42 Q 300,16 560,42 L 552,107 Q 300,125 48,107 Z"
              fill="#451a03"
            />
            {/* Title Text */}
            <text
              x="300"
              y="68"
              textAnchor="middle"
              fill="#fef08a"
              stroke="#713f12"
              strokeWidth="5"
              paintOrder="stroke fill"
              fontSize="40"
              fontWeight="900"
              fontFamily="Fredoka, Nunito, sans-serif"
              letterSpacing="1.5"
            >
              KETAPEL KATA
            </text>
            <text
              x="300"
              y="98"
              textAnchor="middle"
              fill="#38bdf8"
              stroke="#0369a1"
              strokeWidth="4"
              paintOrder="stroke fill"
              fontSize="20"
              fontWeight="800"
              fontFamily="Fredoka, Nunito, sans-serif"
              letterSpacing="3"
            >
              PETUALANGAN SINONIM & ANTONIM SD
            </text>
          </svg>
        </div>

        {/* Bouncing Mascot Preview */}
        <div 
          onClick={onOpenAvatar}
          className="group relative cursor-pointer my-2 flex flex-col items-center transition-transform hover:scale-105 active:scale-95"
          title="Klik untuk kustomisasi avatar burung kamu!"
        >
          <div className="relative w-24 h-24 flex items-center justify-center animate-bounce">
            {/* Mini Bird Mascot Icon */}
            <div className={`w-20 h-20 rounded-full shadow-2xl border-4 border-amber-200 relative flex items-center justify-center ${
              avatar.birdType === 'kakatua_emas' ? 'bg-amber-400' :
              avatar.birdType === 'cendrawasih_biru' ? 'bg-cyan-500' :
              avatar.birdType === 'hantu_bijak' ? 'bg-amber-800' : 'bg-red-500'
            }`}>
              {/* Beak */}
              <div className="absolute right-0 w-6 h-5 bg-amber-500 rounded-r-full border border-amber-700" />
              {/* Eye */}
              <div className="absolute right-4 top-4 w-6 h-6 bg-white rounded-full border-2 border-slate-900 flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-slate-900 rounded-full" />
              </div>
              {/* Hat tag */}
              {avatar.hat !== 'none' && (
                <div className="absolute -top-3 left-3 text-2xl filter drop-shadow">
                  {avatar.hat === 'sd_hat' ? '🧢' :
                   avatar.hat === 'wisuda' ? '🎓' :
                   avatar.hat === 'mahkota' ? '👑' :
                   avatar.hat === 'petualang' ? '🤠' :
                   avatar.hat === 'kacamata' ? '🕶️' : '🎀'}
                </div>
              )}
            </div>
          </div>
          <span className="text-xs bg-amber-950/80 border border-amber-500 text-amber-200 rounded-full px-3 py-0.5 group-hover:bg-amber-800">
            Kustomisasi Avatar Burung 🎨
          </span>
        </div>

        {/* Primary Start CTA Button */}
        <div className="mt-4 flex flex-col items-center gap-3 w-full max-w-md">
          <button
            data-start="true"
            onClick={onStartGame}
            className="w-full green-button text-white text-2xl font-black py-4 px-8 rounded-2xl flex items-center justify-center gap-3 shadow-xl hover:brightness-110 cursor-pointer"
          >
            <Play className="w-8 h-8 fill-white" />
            MULAI PETUALANGAN!
          </button>

          {/* Secondary Action Buttons Grid */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <button
              onClick={onOpenMultiplayer}
              className="blue-button text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow hover:brightness-110"
            >
              <Users className="w-5 h-5" />
              Duel Multiplayer
            </button>

            <button
              onClick={onOpenAvatar}
              className="wood-button text-amber-950 font-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow hover:brightness-110"
            >
              <User className="w-5 h-5 text-amber-900" />
              Ganti Karakter
            </button>

            <button
              onClick={onOpenLeaderboard}
              className="bg-amber-600 hover:bg-amber-500 border-b-4 border-amber-800 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow active:translate-y-1"
            >
              <Award className="w-5 h-5 text-yellow-300" />
              Papan Peringkat
            </button>

            <button
              onClick={onOpenReport}
              className="bg-purple-600 hover:bg-purple-500 border-b-4 border-purple-900 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow active:translate-y-1"
            >
              <BookOpen className="w-5 h-5 text-purple-200" />
              Raport Siswa
            </button>
          </div>
        </div>
      </div>

      {/* Single Flat Control Hint Line (Per Game Shell Guidelines) */}
      <div className="z-10 text-center text-xs md:text-sm font-bold text-amber-950/80 bg-amber-100/70 border border-amber-300/60 rounded-full px-6 py-1.5 shadow-sm">
        Tarik Ketapel · Bidik Kata Lawan/Persamaan · Spasi / Enter Mulai · Esc Jeda
      </div>
    </div>
  );
};
