/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AvatarConfig, BirdType, HatType, TrailType } from '../types/game';
import { X, Check, Sparkles, User, GraduationCap } from 'lucide-react';

interface AvatarModalProps {
  currentAvatar: AvatarConfig;
  onSave: (avatar: AvatarConfig) => void;
  onClose: () => void;
}

export const AvatarModal: React.FC<AvatarModalProps> = ({
  currentAvatar,
  onSave,
  onClose,
}) => {
  const [birdType, setBirdType] = useState<BirdType>(currentAvatar.birdType);
  const [hat, setHat] = useState<HatType>(currentAvatar.hat);
  const [trail, setTrail] = useState<TrailType>(currentAvatar.trail);
  const [studentName, setStudentName] = useState(currentAvatar.studentName);
  const [studentClass, setStudentClass] = useState(currentAvatar.studentClass);

  const birdOptions: Array<{ type: BirdType; name: string; desc: string; color: string; icon: string }> = [
    { type: 'jalak_merah', name: 'Jalak Merah', desc: 'Pemberani & Cepat', color: 'from-red-500 to-rose-700', icon: '🔴' },
    { type: 'kakatua_emas', name: 'Kakatua Emas', desc: 'Cerdas & Penuh Semangat', color: 'from-amber-400 to-yellow-600', icon: '🟡' },
    { type: 'cendrawasih_biru', name: 'Cendrawasih', desc: 'Anggun & Presisi', color: 'from-cyan-400 to-blue-600', icon: '🔵' },
    { type: 'hantu_bijak', name: 'Hantu Bijak', desc: 'Teliti & Berwawasan', color: 'from-amber-700 to-amber-900', icon: '🦉' },
  ];

  const hatOptions: Array<{ type: HatType; name: string; icon: string }> = [
    { type: 'none', name: 'Tanpa Topi', icon: '❌' },
    { type: 'sd_hat', name: 'Topi Siswa SD', icon: '🧢' },
    { type: 'wisuda', name: 'Sarjana Cilik', icon: '🎓' },
    { type: 'mahkota', name: 'Mahkota Juara', icon: '👑' },
    { type: 'petualang', name: 'Petualang', icon: '🤠' },
    { type: 'kacamata', name: 'Kacamata Keren', icon: '🕶️' },
    { type: 'pita', name: 'Pita Manis', icon: '🎀' },
  ];

  const trailOptions: Array<{ type: TrailType; name: string; icon: string; previewColor: string }> = [
    { type: 'fire', name: 'Bulu Api', icon: '🔥', previewColor: 'bg-red-500' },
    { type: 'stars', name: 'Bintang Emas', icon: '⭐', previewColor: 'bg-yellow-400' },
    { type: 'rainbow', name: 'Pelangi Ceria', icon: '🌈', previewColor: 'bg-gradient-to-r from-red-400 via-green-400 to-blue-400' },
    { type: 'leaf', name: 'Daun Tropis', icon: '🍃', previewColor: 'bg-green-500' },
    { type: 'smoke', name: 'Asap Lembut', icon: '💨', previewColor: 'bg-slate-300' },
  ];

  const handleSave = () => {
    onSave({
      birdType,
      hat,
      trail,
      studentName: studentName.trim() || 'Siswa Berprestasi',
      studentClass: studentClass.trim() || 'Kelas 4-A',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 select-none animate-in fade-in duration-150">
      <div className="wood-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 text-amber-100 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b-2 border-amber-700 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎨</span>
            <div className="text-xl md:text-2xl font-black text-yellow-300">
              Kustomisasi Avatar Siswa
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-amber-900/80 hover:bg-amber-800 text-amber-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Avatar Preview Centerpiece */}
        <div className="flex flex-col items-center justify-center bg-amber-950/80 border-2 border-amber-600 rounded-2xl p-4 mb-4">
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* Bird body preview */}
            <div
              className={`w-24 h-24 rounded-full shadow-2xl border-4 border-amber-200 relative flex items-center justify-center transition-all ${
                birdType === 'kakatua_emas'
                  ? 'bg-amber-400'
                  : birdType === 'cendrawasih_biru'
                  ? 'bg-cyan-500'
                  : birdType === 'hantu_bijak'
                  ? 'bg-amber-800'
                  : 'bg-red-500'
              }`}
            >
              {/* Beak */}
              <div className="absolute right-0 w-7 h-6 bg-amber-500 rounded-r-full border border-amber-700" />
              {/* Eye */}
              <div className="absolute right-5 top-5 w-7 h-7 bg-white rounded-full border-2 border-slate-900 flex items-center justify-center">
                <div className="w-3 h-3 bg-slate-900 rounded-full" />
              </div>
              {/* Accessory Hat */}
              {hat !== 'none' && (
                <div className="absolute -top-4 left-4 text-3xl filter drop-shadow">
                  {hat === 'sd_hat' ? '🧢' :
                   hat === 'wisuda' ? '🎓' :
                   hat === 'mahkota' ? '👑' :
                   hat === 'petualang' ? '🤠' :
                   hat === 'kacamata' ? '🕶️' : '🎀'}
                </div>
              )}
            </div>
          </div>

          <div className="mt-2 text-center">
            <div className="text-base font-black text-yellow-300">{studentName || 'Nama Siswa'}</div>
            <div className="text-xs text-amber-300 font-semibold">{studentClass} · Jejak: {trailOptions.find(t => t.type === trail)?.name}</div>
          </div>
        </div>

        {/* Form Fields: Name & Grade */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-bold text-amber-300 uppercase mb-1">
              Nama Siswa:
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Masukkan nama siswa..."
              className="w-full bg-amber-900/90 border-2 border-amber-600 rounded-xl px-3.5 py-2 text-white font-bold placeholder-amber-400/50 focus:outline-none focus:border-yellow-400 text-sm"
              maxLength={24}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-300 uppercase mb-1">
              Tingkat Kelas SD:
            </label>
            <select
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              className="w-full bg-amber-900/90 border-2 border-amber-600 rounded-xl px-3.5 py-2 text-white font-bold focus:outline-none focus:border-yellow-400 text-sm"
            >
              <option value="Kelas 1-A">Kelas 1-A</option>
              <option value="Kelas 1-B">Kelas 1-B</option>
              <option value="Kelas 2-A">Kelas 2-A</option>
              <option value="Kelas 2-B">Kelas 2-B</option>
              <option value="Kelas 3-A">Kelas 3-A</option>
              <option value="Kelas 3-B">Kelas 3-B</option>
              <option value="Kelas 4-A">Kelas 4-A</option>
              <option value="Kelas 4-B">Kelas 4-B</option>
              <option value="Kelas 5-A">Kelas 5-A</option>
              <option value="Kelas 5-B">Kelas 5-B</option>
              <option value="Kelas 6-A">Kelas 6-A</option>
              <option value="Kelas 6-B">Kelas 6-B</option>
            </select>
          </div>
        </div>

        {/* Section 1: Bird Species */}
        <div className="mb-4">
          <div className="text-xs font-black uppercase tracking-wider text-amber-300 mb-2">
            1. Pilih Karakter Burung:
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {birdOptions.map((b) => (
              <button
                key={b.type}
                onClick={() => setBirdType(b.type)}
                className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center transition ${
                  birdType === b.type
                    ? 'bg-amber-700/80 border-yellow-400 shadow-md scale-102 ring-2 ring-yellow-400/40'
                    : 'bg-amber-950/60 border-amber-800 hover:bg-amber-900/60'
                }`}
              >
                <span className="text-2xl mb-1">{b.icon}</span>
                <span className="text-xs font-black text-white">{b.name}</span>
                <span className="text-[10px] text-amber-300 mt-0.5">{b.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Hats / Accessories */}
        <div className="mb-4">
          <div className="text-xs font-black uppercase tracking-wider text-amber-300 mb-2">
            2. Aksesoris Kepala & Topi:
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {hatOptions.map((h) => (
              <button
                key={h.type}
                onClick={() => setHat(h.type)}
                className={`p-2.5 rounded-xl border-2 flex items-center gap-2 transition ${
                  hat === h.type
                    ? 'bg-amber-700/80 border-yellow-400 shadow-md ring-2 ring-yellow-400/40'
                    : 'bg-amber-950/60 border-amber-800 hover:bg-amber-900/60'
                }`}
              >
                <span className="text-xl">{h.icon}</span>
                <span className="text-xs font-bold text-amber-100">{h.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section 3: Trail Effect */}
        <div className="mb-5">
          <div className="text-xs font-black uppercase tracking-wider text-amber-300 mb-2">
            3. Efek Jejak Tembakan (Trail Effect):
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {trailOptions.map((t) => (
              <button
                key={t.type}
                onClick={() => setTrail(t.type)}
                className={`p-2.5 rounded-xl border-2 flex items-center justify-between transition ${
                  trail === t.type
                    ? 'bg-amber-700/80 border-yellow-400 shadow-md ring-2 ring-yellow-400/40'
                    : 'bg-amber-950/60 border-amber-800 hover:bg-amber-900/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{t.icon}</span>
                  <span className="text-xs font-bold text-amber-100">{t.name}</span>
                </div>
                <div className={`w-4 h-4 rounded-full ${t.previewColor} border border-white/50`} />
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="green-button text-white text-base font-black py-3 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:brightness-110 cursor-pointer"
        >
          <Check className="w-5 h-5" />
          SIMPAN PROFIL & AVATAR
        </button>
      </div>
    </div>
  );
};
