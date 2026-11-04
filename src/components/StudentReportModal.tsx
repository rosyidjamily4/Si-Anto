/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { StudentProgressReport } from '../types/game';
import { calculateAccuracy, getPedagogicalRecommendation } from '../game/rules';
import { X, Printer, BookOpen, CheckCircle2, AlertCircle, Award, TrendingUp, Calendar } from 'lucide-react';

interface StudentReportModalProps {
  report: StudentProgressReport;
  onClose: () => void;
}

export const StudentReportModal: React.FC<StudentReportModalProps> = ({
  report,
  onClose,
}) => {
  const overallAcc = calculateAccuracy(report.totalCorrect, report.totalAttempts);
  const sinonimAcc = calculateAccuracy(report.sinonimCorrect, report.sinonimTotal);
  const antonimAcc = calculateAccuracy(report.antonimCorrect, report.antonimTotal);

  const recommendation = getPedagogicalRecommendation(overallAcc, sinonimAcc, antonimAcc);

  const handlePrint = () => {
    window.print();
  };

  const masteryList = Object.values(report.wordMastery);
  const masteredWords = masteryList.filter((w) => w.mastered || w.correctCount >= 1);
  const needsPracticeWords = masteryList.filter((w) => w.errorCount > 0 && !w.mastered);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/70 select-none animate-in fade-in duration-150">
      <div className="wood-panel w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl p-5 md:p-8 text-amber-100 flex flex-col bg-slate-900 border-amber-600 print:bg-white print:text-black print:border-none print:shadow-none print:p-0 print:max-h-none print:overflow-visible">
        
        {/* Modal Top Header (Hidden on print) */}
        <div className="flex justify-between items-center pb-3 border-b-2 border-amber-700 mb-4 no-print">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-yellow-400" />
            <div>
              <div className="text-xl md:text-2xl font-black text-yellow-300">
                Laporan Kemajuan Belajar Siswa
              </div>
              <div className="text-xs text-amber-300">
                Pemantauan Performa Kosakata Sinonim & Antonim Bahasa Indonesia
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-1.5 px-3.5 rounded-xl flex items-center gap-1.5 text-xs shadow active:scale-95"
              title="Cetak atau Simpan sebagai PDF"
            >
              <Printer className="w-4 h-4" />
              Cetak Raport
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-amber-900/80 hover:bg-amber-800 text-amber-300 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Report Card Document */}
        <div className="bg-amber-950/70 border-2 border-amber-700/80 rounded-2xl p-5 md:p-6 mb-4 print:border-none print:bg-white print:p-0">
          
          {/* Official Academic Header */}
          <div className="text-center pb-4 border-b border-amber-700/80 print:border-black mb-5">
            <div className="text-xs font-black tracking-widest text-amber-400 uppercase print:text-gray-700">
              REPUBLIK INDONESIA · KEMENTERIAN PENDIDIKAN DASAR
            </div>
            <h1 className="text-lg md:text-2xl font-black text-white print:text-black mt-1">
              RAPOR CAPAIAN KOMPETENSI KOSAKATA BAHASA INDONESIA
            </h1>
            <p className="text-xs text-amber-200 print:text-gray-600 font-medium">
              Instrumen Asesmen Formatif Berbasis Gamifikasi Interaktif SD
            </p>
          </div>

          {/* Student Profile Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-amber-900/50 print:bg-gray-100 p-3.5 rounded-xl border border-amber-700/60 print:border-gray-300 text-xs mb-5">
            <div>
              <span className="text-amber-400 print:text-gray-600 font-bold block">Nama Siswa:</span>
              <span className="font-black text-white print:text-black text-sm">{report.studentName}</span>
            </div>
            <div>
              <span className="text-amber-400 print:text-gray-600 font-bold block">Kelas / Fase:</span>
              <span className="font-black text-white print:text-black text-sm">{report.studentClass}</span>
            </div>
            <div>
              <span className="text-amber-400 print:text-gray-600 font-bold block">Level Tertinggi:</span>
              <span className="font-black text-yellow-300 print:text-black text-sm">Level {report.highestLevel}</span>
            </div>
            <div>
              <span className="text-amber-400 print:text-gray-600 font-bold block">Tanggal Asesmen:</span>
              <span className="font-black text-white print:text-black text-sm">
                {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Key Academic Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
            {/* Overall Accuracy */}
            <div className="bg-amber-900/40 print:bg-gray-50 border border-amber-700 print:border-gray-300 p-4 rounded-xl text-center">
              <div className="text-xs font-bold text-amber-300 print:text-gray-600 uppercase mb-1">
                Akurasi Keseluruhan
              </div>
              <div className="text-3xl font-black text-yellow-300 print:text-blue-700 num-tabular">
                {overallAcc}%
              </div>
              <div className="text-[11px] font-semibold text-amber-200 print:text-gray-600 mt-1">
                {report.totalCorrect} benar dari {report.totalAttempts} soal
              </div>
            </div>

            {/* Sinonim Accuracy */}
            <div className="bg-amber-900/40 print:bg-gray-50 border border-amber-700 print:border-gray-300 p-4 rounded-xl text-center">
              <div className="text-xs font-bold text-sky-300 print:text-gray-600 uppercase mb-1">
                Persamaan Kata (Sinonim)
              </div>
              <div className="text-3xl font-black text-sky-400 print:text-blue-700 num-tabular">
                {sinonimAcc}%
              </div>
              <div className="text-[11px] font-semibold text-amber-200 print:text-gray-600 mt-1">
                {report.sinonimCorrect} dari {report.sinonimTotal} soal
              </div>
            </div>

            {/* Antonim Accuracy */}
            <div className="bg-amber-900/40 print:bg-gray-50 border border-amber-700 print:border-gray-300 p-4 rounded-xl text-center">
              <div className="text-xs font-bold text-rose-300 print:text-gray-600 uppercase mb-1">
                Lawan Kata (Antonim)
              </div>
              <div className="text-3xl font-black text-rose-400 print:text-blue-700 num-tabular">
                {antonimAcc}%
              </div>
              <div className="text-[11px] font-semibold text-amber-200 print:text-gray-600 mt-1">
                {report.antonimCorrect} dari {report.antonimTotal} soal
              </div>
            </div>
          </div>

          {/* Pedagogical Teacher Recommendation Box */}
          <div className="bg-amber-900/60 print:bg-blue-50 border-2 border-amber-600 print:border-blue-400 p-4 rounded-xl mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400 print:text-blue-600" />
                <span className="font-black text-yellow-300 print:text-blue-900 text-sm">
                  Rekomendasi & Catatan Guru: {recommendation.title}
                </span>
              </div>
              <span className="text-xs font-bold bg-amber-800 print:bg-blue-200 text-amber-200 print:text-blue-900 px-2.5 py-0.5 rounded-full">
                Predikat: {recommendation.badge}
              </span>
            </div>
            <p className="text-xs text-amber-100 print:text-gray-800 font-medium leading-relaxed">
              {recommendation.advice}
            </p>
          </div>

          {/* Mastered Vocabulary Showcase */}
          <div className="mb-4">
            <div className="text-xs font-black uppercase tracking-wider text-green-400 print:text-green-800 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              Kosakata yang Telah Dikuasai ({masteredWords.length} kata):
            </div>
            {masteredWords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {masteredWords.map((w, idx) => (
                  <span
                    key={idx}
                    className="bg-emerald-900/70 print:bg-green-100 border border-emerald-500/80 print:border-green-400 text-emerald-200 print:text-green-900 text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1"
                  >
                    <span>✓</span>
                    <span className="text-white print:text-black">{w.prompt}</span>
                    <span className="text-[10px] opacity-75">
                      ({w.type === 'sinonim' ? '=' : '≠'} {w.target})
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-amber-300 italic">
                Terus mainkan ketapel untuk menguasai lebih banyak kosakata!
              </p>
            )}
          </div>

          {/* Words Needing Review */}
          {needsPracticeWords.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-black uppercase tracking-wider text-amber-400 print:text-amber-800 mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                Kosakata yang Memerlukan Latihan Lanjutan ({needsPracticeWords.length} kata):
              </div>
              <div className="flex flex-wrap gap-2">
                {needsPracticeWords.map((w, idx) => (
                  <span
                    key={idx}
                    className="bg-amber-900/60 print:bg-yellow-100 border border-amber-500/80 print:border-yellow-400 text-amber-200 print:text-yellow-900 text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1"
                  >
                    <span>⚠️</span>
                    <span className="text-white print:text-black">{w.prompt}</span>
                    <span className="text-[10px] opacity-80">
                      ({w.type === 'sinonim' ? 'Sinonim:' : 'Antonim:'} {w.target})
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Official Sign-off on Print */}
          <div className="hidden print:flex justify-between items-end mt-12 text-xs">
            <div className="text-center">
              <div>Mengetahui,</div>
              <div className="mt-1">Orang Tua / Wali Siswa</div>
              <div className="mt-14 border-t border-black w-40 mx-auto" />
            </div>
            <div className="text-center">
              <div>Guru Mata Pelajaran Bahasa Indonesia</div>
              <div className="mt-14 border-t border-black w-40 mx-auto font-bold">( ............................................ )</div>
              <div>NIP. .....................................</div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls (Hidden on Print) */}
        <div className="no-print pt-2 flex justify-end gap-2 border-t border-amber-800">
          <button
            onClick={onClose}
            className="wood-button text-amber-950 font-black py-2.5 px-6 rounded-xl text-sm shadow"
          >
            Tutup Raport
          </button>
        </div>
      </div>
    </div>
  );
};
