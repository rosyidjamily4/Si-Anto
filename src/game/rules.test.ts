/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateScore,
  calculateStars,
  evaluateAnswer,
  calculateAccuracy,
  generateLevelConfig,
  updateStudentReport
} from './rules';
import { StudentProgressReport, VocabularyWord } from '../types/game';

test('calculateScore accounts for base points, remaining birds, and combo multiplier', () => {
  // Base: 1000 + (2 * 350) + (0 * 200) = 1700
  const score = calculateScore(1000, 2, 1, 1);
  assert.equal(score, 1700);

  // With combo x2 and level 3: (1000 + 700 + 400) * 2 = 4200
  const comboScore = calculateScore(1000, 2, 2, 3);
  assert.equal(comboScore, 4200);
});

test('calculateStars awards 1 to 3 stars based on performance', () => {
  // 3 stars when 2+ birds remaining and 0 wrong shots
  assert.equal(calculateStars(2, 3, 0), 3);
  assert.equal(calculateStars(3, 3, 0), 3);

  // 2 stars when 1 bird remaining or 1 mistake
  assert.equal(calculateStars(1, 3, 0), 2);
  assert.equal(calculateStars(2, 3, 1), 2);

  // 1 star on last bird or multiple misses
  assert.equal(calculateStars(0, 3, 2), 1);
  assert.equal(calculateStars(1, 3, 2), 1);
});

test('evaluateAnswer checks equality case-insensitively', () => {
  const q: VocabularyWord = {
    id: 'test-1',
    type: 'antonim',
    promptWord: 'BESAR',
    correctAnswer: 'KECIL',
    distractors: ['TINGGI', 'LEBAR'],
    explanation: 'Test',
    gradeLevel: 1
  };

  assert.equal(evaluateAnswer('KECIL', q), true);
  assert.equal(evaluateAnswer('kecil', q), true);
  assert.equal(evaluateAnswer('TINGGI', q), false);
});

test('calculateAccuracy returns correct percentage', () => {
  assert.equal(calculateAccuracy(10, 10), 100);
  assert.equal(calculateAccuracy(3, 4), 75);
  assert.equal(calculateAccuracy(0, 5), 0);
  assert.equal(calculateAccuracy(0, 0), 100); // Default edge case
});

test('generateLevelConfig creates valid blocks containing the correct answer', () => {
  const level1 = generateLevelConfig(1);
  assert.equal(level1.levelNumber, 1);
  assert.equal(level1.blocks.length, 2);
  const correctBlock = level1.blocks.find(b => b.isCorrect);
  assert.ok(correctBlock, 'Level 1 must contain a correct answer block');
  assert.equal(correctBlock.word, level1.question.correctAnswer);

  const level5 = generateLevelConfig(5);
  assert.equal(level5.blocks.length, 4);
  assert.ok(level5.obstacles.length >= 2, 'Higher levels must feature defensive obstacles');
});

test('updateStudentReport increments progress metrics accurately', () => {
  const initialReport: StudentProgressReport = {
    studentName: 'Budi Santoso',
    studentClass: 'Kelas 4-A',
    totalAttempts: 0,
    totalCorrect: 0,
    sinonimCorrect: 0,
    sinonimTotal: 0,
    antonimCorrect: 0,
    antonimTotal: 0,
    highestLevel: 1,
    highestScore: 0,
    wordMastery: {},
    recentSessions: []
  };

  const sampleQuestion: VocabularyWord = {
    id: 'ant-1',
    type: 'antonim',
    promptWord: 'BESAR',
    correctAnswer: 'KECIL',
    distractors: ['TINGGI'],
    explanation: 'Lawan kata besar adalah kecil',
    gradeLevel: 1
  };

  const updated = updateStudentReport(initialReport, sampleQuestion, true, 2, 2500);

  assert.equal(updated.totalAttempts, 1);
  assert.equal(updated.totalCorrect, 1);
  assert.equal(updated.antonimCorrect, 1);
  assert.equal(updated.antonimTotal, 1);
  assert.equal(updated.highestLevel, 2);
  assert.equal(updated.highestScore, 2500);
  assert.ok(updated.wordMastery['antonim:BESAR']);
  assert.equal(updated.wordMastery['antonim:BESAR'].correctCount, 1);
});
