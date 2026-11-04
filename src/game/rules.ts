/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LevelConfig, StudentProgressReport, TargetBlock, ObstacleBlock, VocabularyWord } from '../types/game';
import { getRandomQuestion } from '../data/vocabulary';

/**
 * Calculates score for hitting the correct word block.
 * Rewards accuracy, remaining birds (ammo), streak combo, and level difficulty.
 */
export function calculateScore(
  basePoints = 1000,
  remainingBirds = 2,
  comboMultiplier = 1,
  level = 1
): number {
  const birdBonus = Math.max(0, remainingBirds) * 350;
  const levelBonus = (level - 1) * 200;
  const rawScore = (basePoints + birdBonus + levelBonus) * Math.max(1, comboMultiplier);
  return Math.round(rawScore);
}

/**
 * Calculates star rating (1 to 3 stars) for stage completion.
 * 3 Stars: No mistakes, 2+ birds left.
 * 2 Stars: Completed with 1 bird left or 1 miss.
 * 1 Star: Completed on last bird.
 */
export function calculateStars(
  remainingBirds: number,
  totalBirds = 3,
  wrongShots = 0
): number {
  if (wrongShots === 0 && remainingBirds >= 2) {
    return 3;
  }
  if (remainingBirds >= 1 && wrongShots <= 1) {
    return 2;
  }
  return 1;
}

/**
 * Validates if the selected word matches the correct answer
 */
export function evaluateAnswer(selectedWord: string, question: VocabularyWord): boolean {
  return selectedWord.trim().toUpperCase() === question.correctAnswer.trim().toUpperCase();
}

/**
 * Calculates accuracy percentage rounded to 1 decimal place.
 */
export function calculateAccuracy(correct: number, total: number): number {
  if (total <= 0) return 100;
  return Math.round((correct / total) * 1000) / 10;
}

/**
 * Generates tailored pedagogical feedback & recommendations based on accuracy stats.
 */
export function getPedagogicalRecommendation(
  overallAcc: number,
  sinonimAcc: number,
  antonimAcc: number
): { title: string; advice: string; badge: string } {
  if (overallAcc >= 90) {
    return {
      title: 'Pakar Kosakata Bahasa Indonesia!',
      advice: 'Luar biasa! Pemahaman sinonim dan antonim Anda sangat matang. Siap untuk tantangan level mahir kelas 5-6!',
      badge: 'Bintang Emas 🌟'
    };
  }
  if (sinonimAcc < antonimAcc && sinonimAcc < 70) {
    return {
      title: 'Fokuskan Latihan Sinonim',
      advice: 'Anda sudah sangat mahir dengan Lawan Kata (Antonim), namun perlu memperbanyak membaca untuk memperkaya padanan kata (Sinonim).',
      badge: 'Terus Semangat 🚀'
    };
  }
  if (antonimAcc < sinonimAcc && antonimAcc < 70) {
    return {
      title: 'Perkuat Pemahaman Antonim',
      advice: 'Pemahaman sinonim sudah baik! Latih lebih banyak lawan kata untuk memperluas pembedaan sifat dan konsep.',
      badge: 'Pemberani 🏹'
    };
  }
  return {
    title: 'Performa Belajar Bagus!',
    advice: 'Hasil belajar seimbang. Tingkatkan konsistensi membidik dengan tenang untuk mencapai akurasi sempurna 100%.',
    badge: 'Penjelajah Kata 🧭'
  };
}

/**
 * Procedural Level Generator:
 * Creates target blocks and physical obstacles based on difficulty level.
 */
export function generateLevelConfig(
  levelNumber: number,
  excludeIds: string[] = []
): LevelConfig {
  const question = getRandomQuestion(excludeIds, levelNumber);

  // Determine option count based on level
  // Level 1: 2 options (1 correct, 1 distractor)
  // Level 2-3: 3 options
  // Level 4+: 4 options
  let numOptions = 2;
  if (levelNumber >= 4) {
    numOptions = 4;
  } else if (levelNumber >= 2) {
    numOptions = 3;
  }

  // Shuffle correct answer with selected distractors
  const distractors = [...question.distractors]
    .sort(() => 0.5 - Math.random())
    .slice(0, numOptions - 1);

  const allWords = [question.correctAnswer, ...distractors].sort(() => 0.5 - Math.random());

  // Layout target blocks inside target fortress
  // Base coordinate system: Canvas width ~1000, height ~600 (virtual coords)
  const fortressBaseX = 640;
  const fortressBaseY = 480;

  const blocks: TargetBlock[] = [];
  const obstacles: ObstacleBlock[] = [];

  // Wind speed increases slightly at level 5+
  const windSpeed = levelNumber >= 5 ? (Math.sin(levelNumber) * 1.5) : 0;

  // Grade label
  const gradeLabel = question.gradeLevel <= 3 
    ? `SD Kelas ${question.gradeLevel} (Dasar)` 
    : `SD Kelas ${question.gradeLevel} (Lanjutan)`;

  // Generate target blocks with words
  const blockW = 110;
  const blockH = 50;

  allWords.forEach((word, index) => {
    let bx = fortressBaseX;
    let by = fortressBaseY - (index * 65);

    // Varied fortress layouts by level
    if (levelNumber === 1) {
      // 2 stacked blocks on a sturdy wooden platform
      bx = fortressBaseX + (index * 130);
      by = fortressBaseY - 25;
    } else if (levelNumber === 2 || levelNumber === 3) {
      // 3 blocks: 2 bottom, 1 top center
      if (index === 0) {
        bx = fortressBaseX;
        by = fortressBaseY - 25;
      } else if (index === 1) {
        bx = fortressBaseX + 130;
        by = fortressBaseY - 25;
      } else {
        bx = fortressBaseX + 65;
        by = fortressBaseY - 95;
      }
    } else {
      // Level 4+: 2 columns or stepped structure
      const col = index % 2;
      const row = Math.floor(index / 2);
      bx = fortressBaseX + (col * 140);
      by = fortressBaseY - 25 - (row * 80);
    }

    const isCorrect = word === question.correctAnswer;
    const material: 'wood' | 'stone' | 'gold' = isCorrect ? 'gold' : 'wood';

    blocks.push({
      id: `target-${index}-${word}`,
      word,
      isCorrect,
      x: bx,
      y: by,
      width: blockW,
      height: blockH,
      health: 1,
      maxHealth: 1,
      material,
      rotation: 0,
      isHit: false,
      isDestroyed: false,
      vx: 0,
      vy: 0
    });
  });

  // Add structural obstacles (beams, pillars) to protect or support blocks
  if (levelNumber >= 2) {
    // Add protective wooden pillar in front
    obstacles.push({
      id: 'obs-pillar-1',
      x: fortressBaseX - 35,
      y: fortressBaseY - 45,
      width: 20,
      height: 90,
      material: 'wood',
      health: 2,
      maxHealth: 2,
      rotation: 0,
      vx: 0,
      vy: 0,
      isDestroyed: false
    });
  }

  if (levelNumber >= 4) {
    // Add stone top beam or stone defense
    obstacles.push({
      id: 'obs-stone-roof',
      x: fortressBaseX + 65,
      y: fortressBaseY - 145,
      width: 150,
      height: 22,
      material: 'stone',
      health: 3,
      maxHealth: 3,
      rotation: 0,
      vx: 0,
      vy: 0,
      isDestroyed: false
    });
  }

  if (levelNumber >= 6) {
    // Moving cloud obstacle that can deflect shots
    obstacles.push({
      id: 'obs-moving-cloud',
      x: 460,
      y: 220,
      width: 60,
      height: 60,
      material: 'ice',
      health: 99,
      maxHealth: 99,
      rotation: 0,
      vx: 0,
      vy: 0,
      isDestroyed: false,
      isMoving: true,
      moveRange: 70,
      moveSpeed: 1.2,
      initialY: 220
    });
  }

  return {
    levelNumber,
    question,
    blocks,
    obstacles,
    maxBirds: 3,
    windSpeed,
    difficultyName: levelNumber <= 3 ? 'Pemula' : levelNumber <= 6 ? 'Menengah' : 'Tantangan Ahli',
    gradeLabel
  };
}

/**
 * Updates student academic progress tracking
 */
export function updateStudentReport(
  current: StudentProgressReport,
  question: VocabularyWord,
  isCorrect: boolean,
  level: number,
  score: number
): StudentProgressReport {
  const isSinonim = question.type === 'sinonim';
  const masteryKey = `${question.type}:${question.promptWord}`;
  
  const existingMastery = current.wordMastery[masteryKey] || {
    prompt: question.promptWord,
    target: question.correctAnswer,
    type: question.type,
    correctCount: 0,
    errorCount: 0,
    lastAnswered: new Date().toISOString(),
    mastered: false
  };

  const updatedMasteryItem = {
    ...existingMastery,
    correctCount: existingMastery.correctCount + (isCorrect ? 1 : 0),
    errorCount: existingMastery.errorCount + (isCorrect ? 0 : 1),
    lastAnswered: new Date().toISOString(),
    mastered: isCorrect && (existingMastery.correctCount + 1 >= 2)
  };

  const totalAttempts = current.totalAttempts + 1;
  const totalCorrect = current.totalCorrect + (isCorrect ? 1 : 0);

  const sinonimTotal = current.sinonimTotal + (isSinonim ? 1 : 0);
  const sinonimCorrect = current.sinonimCorrect + (isSinonim && isCorrect ? 1 : 0);

  const antonimTotal = current.antonimTotal + (!isSinonim ? 1 : 0);
  const antonimCorrect = current.antonimCorrect + (!isSinonim && isCorrect ? 1 : 0);

  const highestLevel = Math.max(current.highestLevel, level);
  const highestScore = Math.max(current.highestScore, score);

  const sessionEntry = {
    date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
    level,
    score,
    accuracy: calculateAccuracy(totalCorrect, totalAttempts)
  };

  return {
    ...current,
    totalAttempts,
    totalCorrect,
    sinonimTotal,
    sinonimCorrect,
    antonimTotal,
    antonimCorrect,
    highestLevel,
    highestScore,
    wordMastery: {
      ...current.wordMastery,
      [masteryKey]: updatedMasteryItem
    },
    recentSessions: [sessionEntry, ...current.recentSessions.slice(0, 9)]
  };
}
