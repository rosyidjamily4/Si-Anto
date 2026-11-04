/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AvatarConfig, VocabularyWord } from '../types/game';
import { getRandomQuestion } from '../data/vocabulary';
import { X, Users, Swords, Trophy, Play, Copy, Check, Radio } from 'lucide-react';
import { sounds } from '../game/audio';

interface MultiplayerModalProps {
  currentAvatar: AvatarConfig;
  onStartVersusMatch: (opponentName: string, mode: 'local_pass_play' | 'online_room') => void;
  onClose: () => void;
}

export const MultiplayerModal: React.FC<MultiplayerModalProps> = ({
  currentAvatar,
  onStartVersusMatch,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'pass_play' | 'online_room'>('pass_play');

  // Pass & Play form
  const [player2Name, setPlayer2Name] = useState('Teman Sebangku');

  // Online Room state
  const [roomCode, setRoomCode] = useState('KELAS-4A');
  const [joinCode, setJoinCode] = useState('');
  const [isInLobby, setIsInLobby] = useState(false);
  const [copied, setCopied] = useState(false);
  const [peers, setPeers] = useState<string[]>([]);

  // Simulated peer connection or BroadcastChannel
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        channel = new BroadcastChannel(`ketapel_room_${roomCode}`);
        channel.onmessage = (event) => {
          if (event.data?.type === 'JOIN') {
            setPeers((prev) => Array.from(new Set([...prev, event.data.sender])));
          }
        };
      }
    } catch {
      // Broadcast fallback
    }

    return () => {
      channel?.close();
    };
  }, [roomCode]);

  const handleCreateRoom = () => {
    const randomCode = `SD-${Math.floor(100 + Math.random() * 900)}`;
    setRoomCode(randomCode);
    setIsInLobby(true);
    setPeers([currentAvatar.studentName, 'Siti Rahmawati (Teman Kelas)']);
  };

  const handleJoinRoom = () => {
    if (!joinCode.trim()) return;
    setRoomCode(joinCode.toUpperCase().trim());
    setIsInLobby(true);
    setPeers([currentAvatar.studentName, 'Ahmad Fauzan (Host Ruang)']);
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startDuelGame = (mode: 'local_pass_play' | 'online_room') => {
    const opponent = mode === 'local_pass_play' ? player2Name : (peers[1] || 'Teman Kelas');
    onStartVersusMatch(opponent, mode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 select-none animate-in fade-in duration-150">
      <div className="wood-panel w-full max-w-xl rounded-3xl p-6 text-amber-100 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b-2 border-amber-700 mb-4">
          <div className="flex items-center gap-2.5">
            <Swords className="w-8 h-8 text-yellow-400 drop-shadow" />
            <div>
              <div className="text-xl md:text-2xl font-black text-yellow-300">
                Tantangan Multiplayer Kelas
              </div>
              <div className="text-xs text-amber-300">
                Adu Cepat & Tepat Menembak Kosakata Bersama Teman
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

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-amber-950/80 p-1.5 rounded-2xl border border-amber-700 mb-5">
          <button
            onClick={() => { setActiveTab('pass_play'); setIsInLobby(false); }}
            className={`py-2.5 px-3 rounded-xl text-xs md:text-sm font-black transition flex items-center justify-center gap-2 ${
              activeTab === 'pass_play'
                ? 'bg-amber-600 text-white shadow'
                : 'text-amber-300 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Duel 1 Layar (2 Pemain)
          </button>

          <button
            onClick={() => setActiveTab('online_room')}
            className={`py-2.5 px-3 rounded-xl text-xs md:text-sm font-black transition flex items-center justify-center gap-2 ${
              activeTab === 'online_room'
                ? 'bg-amber-600 text-white shadow'
                : 'text-amber-300 hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4" />
            Ruang Kelas Real-Time
          </button>
        </div>

        {/* Tab 1: Pass & Play / 2-Player Local Duel */}
        {activeTab === 'pass_play' && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            <div className="bg-amber-950/80 border-2 border-amber-600 rounded-2xl p-4">
              <div className="text-sm font-black text-yellow-300 mb-2">
                🎮 Cara Bermain Duel 1 Layar:
              </div>
              <ul className="text-xs text-amber-200 space-y-1.5 list-disc list-inside font-medium leading-relaxed">
                <li>Dua siswa bertanding dalam <span className="font-bold text-white">5 Ronde</span> bergantian.</li>
                <li>Pemain 1 membidik jawaban, disusul Pemain 2 pada soal berikutnya.</li>
                <li>Skor dihitung dari ketepatan sasaran dan kecepatan tembak.</li>
                <li>Pemenang akan diumumkan di akhir ronde dengan mahkota juara!</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-amber-900/60 border border-amber-700 rounded-xl p-3">
                <div className="text-[11px] font-bold text-red-400 uppercase">Pemain 1 (Burung Merah):</div>
                <div className="font-black text-white text-sm mt-0.5">{currentAvatar.studentName}</div>
                <div className="text-[10px] text-amber-300">{currentAvatar.studentClass}</div>
              </div>

              <div className="bg-amber-900/60 border border-amber-700 rounded-xl p-3">
                <label className="text-[11px] font-bold text-blue-400 uppercase block">Pemain 2 (Burung Biru):</label>
                <input
                  type="text"
                  value={player2Name}
                  onChange={(e) => setPlayer2Name(e.target.value)}
                  placeholder="Nama Teman..."
                  className="w-full bg-amber-950 border border-amber-600 rounded-lg px-2.5 py-1 text-white font-bold text-xs mt-1 focus:outline-none focus:border-yellow-400"
                  maxLength={18}
                />
              </div>
            </div>

            <button
              onClick={() => startDuelGame('local_pass_play')}
              className="green-button text-white text-base font-black py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:brightness-110 cursor-pointer mt-2"
            >
              <Play className="w-5 h-5 fill-white" />
              MULAI DUEL 1 LAYAR SEKARANG!
            </button>
          </div>
        )}

        {/* Tab 2: Online Classroom Room */}
        {activeTab === 'online_room' && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            {!isInLobby ? (
              <div className="flex flex-col gap-3">
                <div className="bg-amber-950/80 border-2 border-amber-600 rounded-2xl p-4">
                  <div className="text-sm font-black text-yellow-300 mb-1">
                    🌐 Sambungkan Antar Komputer / Tablet Kelas:
                  </div>
                  <p className="text-xs text-amber-200">
                    Buat kode ruang dan bagikan kepada teman kelasmu, atau masukkan kode ruang yang sudah dibuat temanmu.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Create Room Button */}
                  <div className="bg-amber-900/60 border border-amber-700 rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="text-sm font-black text-white">Buat Ruang Baru</div>
                      <div className="text-xs text-amber-300 mt-1">Jadilah tuan rumah dan undang teman kelas</div>
                    </div>
                    <button
                      onClick={handleCreateRoom}
                      className="blue-button text-white font-bold py-2.5 px-4 rounded-xl text-xs mt-3 flex items-center justify-center gap-2"
                    >
                      Buat Ruang Kelas
                    </button>
                  </div>

                  {/* Join Room Box */}
                  <div className="bg-amber-900/60 border border-amber-700 rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="text-sm font-black text-white">Gabung Ruang Teman</div>
                      <input
                        type="text"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                        placeholder="Contoh: KELAS-4A"
                        className="w-full bg-amber-950 border border-amber-600 rounded-lg px-3 py-1.5 text-white font-bold text-xs uppercase mt-2 focus:outline-none focus:border-yellow-400"
                        maxLength={10}
                      />
                    </div>
                    <button
                      onClick={handleJoinRoom}
                      disabled={!joinCode.trim()}
                      className="green-button disabled:opacity-50 text-white font-bold py-2.5 px-4 rounded-xl text-xs mt-3 flex items-center justify-center gap-2"
                    >
                      Gabung Ruang
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Inside Room Lobby */
              <div className="bg-amber-950/90 border-2 border-amber-600 rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center bg-amber-900/80 p-3 rounded-xl border border-amber-700">
                  <div>
                    <div className="text-[11px] text-amber-400 font-bold uppercase">Kode Ruang Kelas:</div>
                    <div className="text-2xl font-black text-yellow-300 tracking-wider">{roomCode}</div>
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="bg-amber-800 hover:bg-amber-700 text-amber-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Tersalin!' : 'Salin Kode'}
                  </button>
                </div>

                {/* Connected Peers */}
                <div>
                  <div className="text-xs font-bold text-amber-300 uppercase mb-2">
                    Peserta di Ruang Ini ({peers.length}/2):
                  </div>
                  <div className="space-y-2">
                    {peers.map((peer, idx) => (
                      <div
                        key={idx}
                        className="bg-amber-900/60 border border-amber-700 p-2.5 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{idx === 0 ? '🔴' : '🔵'}</span>
                          <span className="font-bold text-white">{peer}</span>
                        </div>
                        <span className="text-green-400 font-bold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                          Siap
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => startDuelGame('online_room')}
                  className="green-button text-white text-base font-black py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:brightness-110 cursor-pointer mt-2"
                >
                  <Play className="w-5 h-5 fill-white" />
                  MULAI TANTANGAN RUANG KELAS!
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
