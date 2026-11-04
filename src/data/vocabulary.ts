/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VocabularyWord } from '../types/game';

export const VOCABULARY_DATABASE: VocabularyWord[] = [
  // ==================== ANTONIM (LAWAN KATA) ====================
  // Kelas 1 - 3 (Dasar)
  {
    id: 'ant-1',
    type: 'antonim',
    promptWord: 'BESAR',
    correctAnswer: 'KECIL',
    distractors: ['TINGGI', 'LEBAR', 'LUAS'],
    explanation: "Antonim dari 'Besar' adalah 'Kecil'. Keduanya menggambarkan ukuran fisik suatu benda.",
    gradeLevel: 1,
    theme: 'sifat'
  },
  {
    id: 'ant-2',
    type: 'antonim',
    promptWord: 'PANAS',
    correctAnswer: 'DINGIN',
    distractors: ['HANGAT', 'SEJUK', 'PEDAS'],
    explanation: "Antonim dari 'Panas' adalah 'Dingin'. Keduanya menyatakan derajat suhu suatu benda atau ruangan.",
    gradeLevel: 1,
    theme: 'sifat'
  },
  {
    id: 'ant-3',
    type: 'antonim',
    promptWord: 'TINGGI',
    correctAnswer: 'RENDAH',
    distractors: ['PENDEK', 'KECIL', 'CURAM'],
    explanation: "Lawan kata 'Tinggi' untuk ukuran ketinggian objek/posisi adalah 'Rendah' (atau 'Pendek' untuk postur).",
    gradeLevel: 2,
    theme: 'sifat'
  },
  {
    id: 'ant-4',
    type: 'antonim',
    promptWord: 'TERANG',
    correctAnswer: 'GELAP',
    distractors: ['SURAM', 'REDUP', 'HITAM'],
    explanation: "Antonim dari 'Terang' adalah 'Gelap'. Terang berarti banyak cahaya, sedangkan gelap berarti tanpa cahaya.",
    gradeLevel: 2,
    theme: 'alam'
  },
  {
    id: 'ant-5',
    type: 'antonim',
    promptWord: 'CEPAT',
    correctAnswer: 'LAMBAT',
    distractors: ['PELAN', 'LAMAN', 'DIAM'],
    explanation: "Lawan kata dari 'Cepat' adalah 'Lambat', menunjukkan laju kecepatan gerak suatu benda.",
    gradeLevel: 2,
    theme: 'aktivitas'
  },
  {
    id: 'ant-6',
    type: 'antonim',
    promptWord: 'BERANI',
    correctAnswer: 'TAKUT',
    distractors: ['GENTAR', 'LEMAH', 'CEMAS'],
    explanation: "Antonim dari 'Berani' adalah 'Takut'. Berani tidak gentar, sedangkan takut merasa gentar.",
    gradeLevel: 3,
    theme: 'sifat'
  },
  {
    id: 'ant-7',
    type: 'antonim',
    promptWord: 'RAJIN',
    correctAnswer: 'MALAS',
    distractors: ['LETIH', 'BODOH', 'LALAI'],
    explanation: "Lawan kata dari 'Rajin' adalah 'Malas'. Siswa yang rajin giat berusaha, lawan perilakunya adalah malas.",
    gradeLevel: 3,
    theme: 'sifat'
  },
  {
    id: 'ant-8',
    type: 'antonim',
    promptWord: 'TEBAL',
    correctAnswer: 'TIPIS',
    distractors: ['LEMBEK', 'SEMPIT', 'RINGAN'],
    explanation: "Antonim dari 'Tebal' adalah 'Tipis'. Contohnya buku yang tebal berlawanan dengan lembaran yang tipis.",
    gradeLevel: 3,
    theme: 'benda'
  },
  // Kelas 4 - 6 (Menengah & Mahir)
  {
    id: 'ant-9',
    type: 'antonim',
    promptWord: 'SUKA',
    correctAnswer: 'DUKA',
    distractors: ['BENCI', 'SEDIH', 'MARAH'],
    explanation: "Dalam peribahasa 'Suka dan Duka', suka (kegembiraan) berlawanan langsung dengan duka (kesedihan mendalam).",
    gradeLevel: 4,
    theme: 'sifat'
  },
  {
    id: 'ant-10',
    type: 'antonim',
    promptWord: 'RAMAH',
    correctAnswer: 'SOMBONG',
    distractors: ['JAHAT', 'PENDIAM', 'KASAR'],
    explanation: "Antonim dari 'Ramah' (manis tutur kata dan sikap) adalah 'Sombong' atau 'Kasar'.",
    gradeLevel: 4,
    theme: 'sifat'
  },
  {
    id: 'ant-11',
    type: 'antonim',
    promptWord: 'HEMAT',
    correctAnswer: 'BOROS',
    distractors: ['PELIT', 'KIKIR', 'MISKIN'],
    explanation: "Lawan kata dari 'Hemat' adalah 'Boros'. Hemat berarti berhati-hati menggunakan uang, boros berlebih-lebihan.",
    gradeLevel: 4,
    theme: 'aktivitas'
  },
  {
    id: 'ant-12',
    type: 'antonim',
    promptWord: 'SUBUR',
    correctAnswer: 'GERSANG',
    distractors: ['KERING', 'TANDUS', 'KEMARAU'],
    explanation: "Antonim dari tanah yang 'Subur' (mudah ditumbuhi tanaman) adalah 'Gersang' atau 'Tandus'.",
    gradeLevel: 5,
    theme: 'alam'
  },
  {
    id: 'ant-13',
    type: 'antonim',
    promptWord: 'LUAS',
    correctAnswer: 'SEMPIT',
    distractors: ['PENDEK', 'KECIL', 'DANGKAL'],
    explanation: "Lawan kata dari 'Luas' (lapang) adalah 'Sempit'. Contohnya lapangan yang luas vs lorong yang sempit.",
    gradeLevel: 5,
    theme: 'sifat'
  },
  {
    id: 'ant-14',
    type: 'antonim',
    promptWord: 'ASLI',
    correctAnswer: 'PALSU',
    distractors: ['TIRUAN', 'BEKAS', 'RUSAK'],
    explanation: "Antonim dari 'Asli' (murni/bukan buatan) adalah 'Palsu'.",
    gradeLevel: 5,
    theme: 'benda'
  },
  {
    id: 'ant-15',
    type: 'antonim',
    promptWord: 'KREATIF',
    correctAnswer: 'MONOTON',
    distractors: ['PASIF', 'BODOH', 'KOLOT'],
    explanation: "Antonim dari 'Kreatif' (banyak daya cipta ragam baru) adalah 'Monoton' (selalu sama dan membosankan).",
    gradeLevel: 6,
    theme: 'sifat'
  },
  {
    id: 'ant-16',
    type: 'antonim',
    promptWord: 'ABADI',
    correctAnswer: 'FANA',
    distractors: ['SEMENTARA', 'SINGKAT', 'LENYAP'],
    explanation: "Lawan kata dari 'Abadi' (kekal selama-lamanya) adalah 'Fana' (dapat rusak/tidak kekal).",
    gradeLevel: 6,
    theme: 'sifat'
  },

  // ==================== SINONIM (PERSAMAAN KATA) ====================
  // Kelas 1 - 3 (Dasar)
  {
    id: 'sin-1',
    type: 'sinonim',
    promptWord: 'PANDAI',
    correctAnswer: 'PINTAR',
    distractors: ['CERDIK', 'RAJIN', 'CEPAT'],
    explanation: "Sinonim dari 'Pandai' adalah 'Pintar'. Keduanya berarti cakap, berilmu, dan mudah mengerti.",
    gradeLevel: 1,
    theme: 'sifat'
  },
  {
    id: 'sin-2',
    type: 'sinonim',
    promptWord: 'INDAH',
    correctAnswer: 'ELOK',
    distractors: ['BAGUS', 'CANTIK', 'MEGAH'],
    explanation: "Sinonim dari 'Indah' adalah 'Elok' atau 'Molek', yang berarti sangat sedap dipandang mata.",
    gradeLevel: 1,
    theme: 'sifat'
  },
  {
    id: 'sin-3',
    type: 'sinonim',
    promptWord: 'GEMBIRA',
    correctAnswer: 'SENANG',
    distractors: ['TERTAWA', 'BAHAGIA', 'LEGA'],
    explanation: "Sinonim dari 'Gembira' adalah 'Senang' atau 'Suka cita'. Menggambarkan perasaan hati yang riang.",
    gradeLevel: 2,
    theme: 'sifat'
  },
  {
    id: 'sin-4',
    type: 'sinonim',
    promptWord: 'BOHONG',
    correctAnswer: 'DUSTA',
    distractors: ['PALSU', 'CURANG', 'KELIRU'],
    explanation: "Sinonim dari 'Bohong' adalah 'Dusta'. Artinya tidak sesuai dengan keadaan yang sebenarnya.",
    gradeLevel: 2,
    theme: 'sifat'
  },
  {
    id: 'sin-5',
    type: 'sinonim',
    promptWord: 'SAHABAT',
    correctAnswer: 'KAWAN',
    distractors: ['TEMAN', 'SAUDARA', 'TETANGGA'],
    explanation: "Sinonim dari 'Sahabat' adalah 'Kawan' atau 'Teman akrab'.",
    gradeLevel: 2,
    theme: 'aktivitas'
  },
  {
    id: 'sin-6',
    type: 'sinonim',
    promptWord: 'WANGI',
    correctAnswer: 'HARUM',
    distractors: ['SEGAR', 'SEDAP', 'MANIS'],
    explanation: "Sinonim dari 'Wangi' adalah 'Harum', yaitu bau sedap yang tercium seperti bau bunga melati.",
    gradeLevel: 3,
    theme: 'alam'
  },
  {
    id: 'sin-7',
    type: 'sinonim',
    promptWord: 'MELIHAT',
    correctAnswer: 'MEMANDANG',
    distractors: ['MENATAP', 'MELIRIK', 'MENONTON'],
    explanation: "Sinonim dari 'Melihat' adalah 'Memandang', menggunakan indra penglihatan untuk memperhatikan sesuatu.",
    gradeLevel: 3,
    theme: 'aktivitas'
  },
  {
    id: 'sin-8',
    type: 'sinonim',
    promptWord: 'PAKAIAN',
    correctAnswer: 'BUSANA',
    distractors: ['BAJU', 'CELANA', 'KAIN'],
    explanation: "Sinonim dari 'Pakaian' adalah 'Busana', barang apa yang dipakai di tubuh untuk menutup aurat.",
    gradeLevel: 3,
    theme: 'benda'
  },
  // Kelas 4 - 6 (Menengah & Mahir)
  {
    id: 'sin-9',
    type: 'sinonim',
    promptWord: 'HAUS',
    correctAnswer: 'DAHAGA',
    distractors: ['LAPAR', 'KERING', 'DAHAGIA'],
    explanation: "Sinonim baku dari 'Haus' adalah 'Dahaga', perasaan sangat ingin minum air.",
    gradeLevel: 4,
    theme: 'sifat'
  },
  {
    id: 'sin-10',
    type: 'sinonim',
    promptWord: 'LAUT',
    correctAnswer: 'SAMUDRA',
    distractors: ['DANAU', 'PANTAI', 'SELAT'],
    explanation: "Sinonim yang setara dengan lautan luas adalah 'Samudra'.",
    gradeLevel: 4,
    theme: 'alam'
  },
  {
    id: 'sin-11',
    type: 'sinonim',
    promptWord: 'JUARA',
    correctAnswer: 'KAMPION',
    distractors: ['PEMENANG', 'JAGOAN', 'BINTANG'],
    explanation: "Sinonim dari 'Juara' dalam perlombaan adalah 'Kampion' atau 'Pemenang'.",
    gradeLevel: 4,
    theme: 'aktivitas'
  },
  {
    id: 'sin-12',
    type: 'sinonim',
    promptWord: 'HIKMAH',
    correctAnswer: 'MANFAAT',
    distractors: ['PELAJARAN', 'MAKNA', 'TUJUAN'],
    explanation: "Sinonim dari 'Hikmah' adalah 'Manfaat' atau 'Kebaikan di balik suatu peristiwa'.",
    gradeLevel: 5,
    theme: 'sifat'
  },
  {
    id: 'sin-13',
    type: 'sinonim',
    promptWord: 'GUGUR',
    correctAnswer: 'RUNTUH',
    distractors: ['JATUH', 'TEWAS', 'KALAH'],
    explanation: "Untuk daun atau tebing, 'Gugur' bersinonim dengan 'Runtuh' atau 'Jatuh meluruh'.",
    gradeLevel: 5,
    theme: 'alam'
  },
  {
    id: 'sin-14',
    type: 'sinonim',
    promptWord: 'PEDOMAN',
    correctAnswer: 'PANDUAN',
    distractors: ['PETUNJUK', 'ATURAN', 'KOMPAS'],
    explanation: "Sinonim dari 'Pedoman' adalah 'Panduan', sesuatu yang dijadikan dasar pegangan.",
    gradeLevel: 5,
    theme: 'benda'
  },
  {
    id: 'sin-15',
    type: 'sinonim',
    promptWord: 'KOLABORASI',
    correctAnswer: 'KERJASAMA',
    distractors: ['GOTONGROYONG', 'GABUNGAN', 'MUSYAWARAH'],
    explanation: "Sinonim serapan dari 'Kolaborasi' adalah 'Kerjasama' mencapai tujuan bersama.",
    gradeLevel: 6,
    theme: 'aktivitas'
  },
  {
    id: 'sin-16',
    type: 'sinonim',
    promptWord: 'PRIORITAS',
    correctAnswer: 'UTAMA',
    distractors: ['PENTING', 'POKOK', 'DAHULU'],
    explanation: "Sinonim dari 'Prioritas' adalah 'Keutamaan' atau hal yang paling 'Utama' didahulukan.",
    gradeLevel: 6,
    theme: 'sifat'
  }
];

export function getQuestionsByGrade(gradeLevel: number): VocabularyWord[] {
  return VOCABULARY_DATABASE.filter(w => w.gradeLevel <= gradeLevel);
}

export function getRandomQuestion(excludeIds: string[] = [], currentLevel = 1): VocabularyWord {
  // Scale difficulty according to currentLevel
  const maxGrade = Math.min(6, Math.max(1, Math.ceil(currentLevel / 2)));
  const eligible = VOCABULARY_DATABASE.filter(w => 
    w.gradeLevel <= maxGrade && !excludeIds.includes(w.id)
  );
  
  if (eligible.length === 0) {
    return VOCABULARY_DATABASE[Math.floor(Math.random() * VOCABULARY_DATABASE.length)];
  }
  return eligible[Math.floor(Math.random() * eligible.length)];
}
