/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type QuestionType = 'sinonim' | 'antonim';

export interface VocabularyWord {
  id: string;
  type: QuestionType;
  promptWord: string;       // e.g. "BESAR"
  correctAnswer: string;    // e.g. "KECIL" (antonim) or "AKBAR" (sinonim)
  distractors: string[];    // e.g. ["TINGGI", "LEBAR", "PANJANG"]
  explanation: string;      // Pedagogical explanation in Indonesian
  gradeLevel: number;       // 1 - 6 (SD Kelas 1 sampai 6)
  theme?: string;           // 'sifat', 'benda', 'aktivitas', 'alam'
}

export type BirdType = 'jalak_merah' | 'kakatua_emas' | 'cendrawasih_biru' | 'hantu_bijak';

export type HatType = 'none' | 'sd_hat' | 'wisuda' | 'petualang' | 'mahkota' | 'kacamata' | 'pita';

export type TrailType = 'smoke' | 'fire' | 'stars' | 'rainbow' | 'leaf';

export interface AvatarConfig {
  birdType: BirdType;
  hat: HatType;
  trail: TrailType;
  studentName: string;
  studentClass: string;     // e.g. "Kelas 4-A"
}

export type GameState = 
  | 'title' 
  | 'playing' 
  | 'paused' 
  | 'level_clear' 
  | 'gameover' 
  | 'avatar' 
  | 'leaderboard' 
  | 'report' 
  | 'multiplayer';

export interface TargetBlock {
  id: string;
  word: string;
  isCorrect: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  material: 'wood' | 'stone' | 'gold' | 'tnt';
  rotation: number;
  isHit: boolean;
  isDestroyed: boolean;
  vy: number;
  vx: number;
  isGrounded?: boolean;
}

export interface ObstacleBlock {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  material: 'wood' | 'stone' | 'ice';
  health: number;
  maxHealth: number;
  rotation: number;
  vx: number;
  vy: number;
  isDestroyed: boolean;
  isMoving?: boolean;
  moveRange?: number;
  moveSpeed?: number;
  initialY?: number;
}

export interface LevelConfig {
  levelNumber: number;
  question: VocabularyWord;
  blocks: TargetBlock[];
  obstacles: ObstacleBlock[];
  maxBirds: number;
  windSpeed: number; // -2 to +2
  difficultyName: string;
  gradeLabel: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  studentClass: string;
  birdType: BirdType;
  hat: HatType;
  score: number;
  levelReached: number;
  accuracy: number;
  date: string;
  starsTotal: number;
}

export interface WordMasteryRecord {
  prompt: string;
  target: string;
  type: QuestionType;
  correctCount: number;
  errorCount: number;
  lastAnswered: string;
  mastered: boolean;
}

export interface StudentProgressReport {
  studentName: string;
  studentClass: string;
  totalAttempts: number;
  totalCorrect: number;
  sinonimCorrect: number;
  sinonimTotal: number;
  antonimCorrect: number;
  antonimTotal: number;
  highestLevel: number;
  highestScore: number;
  wordMastery: Record<string, WordMasteryRecord>;
  recentSessions: Array<{
    date: string;
    level: number;
    score: number;
    accuracy: number;
  }>;
}

export interface MultiplayerPlayer {
  id: string;
  name: string;
  avatar: AvatarConfig;
  score: number;
  currentStreak: number;
  accuracy: number;
  hasFiredThisRound: boolean;
}
