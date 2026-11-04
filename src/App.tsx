/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AvatarConfig,
  GameState,
  LevelConfig,
  StudentProgressReport,
  TargetBlock,
} from './types/game';
import { generateLevelConfig, calculateScore, calculateStars, updateStudentReport, calculateAccuracy } from './game/rules';
import { SlingshotEngine } from './game/engine';
import { sounds } from './game/audio';
import { TitleScreen } from './components/TitleScreen';
import { GameHUD } from './components/GameHUD';
import { VictoryModal } from './components/VictoryModal';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { AvatarModal } from './components/AvatarModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { StudentReportModal } from './components/StudentReportModal';
import { MultiplayerModal } from './components/MultiplayerModal';
import { VersusHUD, VersusWinnerModal } from './components/VersusHUD';

const DEFAULT_AVATAR: AvatarConfig = {
  birdType: 'jalak_merah',
  hat: 'sd_hat',
  trail: 'fire',
  studentName: 'Ahmad Maulana',
  studentClass: 'Kelas 4-A',
};

const DEFAULT_REPORT: StudentProgressReport = {
  studentName: 'Ahmad Maulana',
  studentClass: 'Kelas 4-A',
  totalAttempts: 12,
  totalCorrect: 11,
  sinonimCorrect: 5,
  sinonimTotal: 6,
  antonimCorrect: 6,
  antonimTotal: 6,
  highestLevel: 3,
  highestScore: 4850,
  wordMastery: {
    'antonim:BESAR': { prompt: 'BESAR', target: 'KECIL', type: 'antonim', correctCount: 2, errorCount: 0, lastAnswered: new Date().toISOString(), mastered: true },
    'antonim:PANAS': { prompt: 'PANAS', target: 'DINGIN', type: 'antonim', correctCount: 2, errorCount: 0, lastAnswered: new Date().toISOString(), mastered: true },
    'sinonim:PANDAI': { prompt: 'PANDAI', target: 'PINTAR', type: 'sinonim', correctCount: 2, errorCount: 0, lastAnswered: new Date().toISOString(), mastered: true },
    'sinonim:INDAH': { prompt: 'INDAH', target: 'ELOK', type: 'sinonim', correctCount: 1, errorCount: 1, lastAnswered: new Date().toISOString(), mastered: false },
  },
  recentSessions: [
    { date: 'Hari Ini, 09:30', level: 3, score: 4850, accuracy: 91.6 },
    { date: 'Kemarin, 14:15', level: 2, score: 2600, accuracy: 100 },
  ],
};

export default function App() {
  // Game state machine
  const [gameState, setGameState] = useState<GameState>('title');

  // Player identity & customizations
  const [avatar, setAvatar] = useState<AvatarConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ketapel_kata_avatar');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return DEFAULT_AVATAR;
  });

  // Academic Progress Report
  const [report, setReport] = useState<StudentProgressReport>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ketapel_kata_report');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return DEFAULT_REPORT;
  });

  // Gameplay Run state
  const [currentLevelNumber, setCurrentLevelNumber] = useState(1);
  const [currentLevel, setCurrentLevel] = useState<LevelConfig>(() => generateLevelConfig(1));
  const [score, setScore] = useState(0);
  const [levelScore, setLevelScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [wrongShotsThisLevel, setWrongShotsThisLevel] = useState(0);
  const [remainingBirds, setRemainingBirds] = useState(3);
  const [starsEarned, setStarsEarned] = useState(3);
  const [highScore, setHighScore] = useState(() => {
    if (typeof window !== 'undefined') {
      return Number(localStorage.getItem('ketapel_kata_highscore') || '4850');
    }
    return 4850;
  });

  // Sound & Feedback
  const [isMuted, setIsMuted] = useState(sounds.getMuted());
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; isCorrect: boolean } | null>(null);

  // Versus / Multiplayer State
  const [isVersusMode, setIsVersusMode] = useState(false);
  const [versusOpponent, setVersusOpponent] = useState('Teman Sebangku');
  const [versusRound, setVersusRound] = useState(1);
  const [versusActivePlayer, setVersusActivePlayer] = useState<1 | 2>(1);
  const [p1VersusScore, setP1VersusScore] = useState(0);
  const [p2VersusScore, setP2VersusScore] = useState(0);
  const [showVersusWinner, setShowVersusWinner] = useState(false);

  // Canvas & Engine refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<SlingshotEngine | null>(null);

  // Sync dataset.state to document.body per Game Shell guidelines
  useEffect(() => {
    document.body.dataset.state = gameState;
  }, [gameState]);

  // Handle URL autostart (?autostart=1)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        startGame();
      }
    }
  }, []);

  // Keyboard navigation & Shortcuts (Esc/P for Pause, M for Mute, R for Restart)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyM') {
        toggleMute();
      } else if (e.code === 'Escape' || e.code === 'KeyP') {
        if (gameState === 'playing') {
          setGameState('paused');
        } else if (gameState === 'paused') {
          setGameState('playing');
        }
      } else if (e.code === 'KeyR' && gameState === 'playing') {
        restartCurrentLevel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Window resize observer for canvas sharpness
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize or reconfigure Slingshot Engine
  const initEngine = useCallback((lvlConfig: LevelConfig, avatarConfig: AvatarConfig) => {
    if (!canvasRef.current) return;
    canvasRef.current.width = window.innerWidth;
    canvasRef.current.height = window.innerHeight;

    if (engineRef.current) {
      engineRef.current.destroy();
    }

    const engine = new SlingshotEngine(canvasRef.current, lvlConfig, avatarConfig);

    // Callbacks from physics engine
    engine.onTargetHit = (block: TargetBlock, isCorrect: boolean) => {
      if (isCorrect) {
        // Correct Hit!
        const points = calculateScore(1000, engine['remainingBirds'], combo, lvlConfig.levelNumber);
        setLevelScore(points);
        setScore((prev) => {
          const nextScore = prev + points;
          if (nextScore > highScore) {
            setHighScore(nextScore);
            localStorage.setItem('ketapel_kata_highscore', String(nextScore));
          }
          return nextScore;
        });

        if (isVersusMode) {
          if (versusActivePlayer === 1) {
            setP1VersusScore((prev) => prev + points);
          } else {
            setP2VersusScore((prev) => prev + points);
          }
        }

        setCombo((prev) => prev + 1);
        setFeedbackMessage({
          text: lvlConfig.question.explanation,
          isCorrect: true,
        });

        // Update Student Progress Report
        setReport((prev) => {
          const updated = updateStudentReport(prev, lvlConfig.question, true, lvlConfig.levelNumber, score + points);
          localStorage.setItem('ketapel_kata_report', JSON.stringify(updated));
          return updated;
        });
      } else {
        // Wrong Hit!
        setCombo(1);
        setWrongShotsThisLevel((prev) => prev + 1);
        setFeedbackMessage({
          text: `Salah sasaran! ${lvlConfig.question.explanation}`,
          isCorrect: false,
        });

        // Update Student Progress Report
        setReport((prev) => {
          const updated = updateStudentReport(prev, lvlConfig.question, false, lvlConfig.levelNumber, score);
          localStorage.setItem('ketapel_kata_report', JSON.stringify(updated));
          return updated;
        });
      }
    };

    engine.onBirdUsed = (remaining) => {
      setRemainingBirds(remaining);
    };

    engine.onStageClear = () => {
      const earned = calculateStars(engine['remainingBirds'], lvlConfig.maxBirds, wrongShotsThisLevel);
      setStarsEarned(earned);

      if (isVersusMode) {
        if (versusRound >= 5) {
          setShowVersusWinner(true);
        } else {
          // Switch turn for next round
          setTimeout(() => {
            setVersusRound((r) => r + 1);
            setVersusActivePlayer((p) => (p === 1 ? 2 : 1));
            nextLevel();
          }, 1500);
        }
      } else {
        setGameState('level_clear');
      }
    };

    engine.onStageFail = () => {
      if (isVersusMode) {
        if (versusRound >= 5) {
          setShowVersusWinner(true);
        } else {
          setVersusRound((r) => r + 1);
          setVersusActivePlayer((p) => (p === 1 ? 2 : 1));
          nextLevel();
        }
      } else {
        setGameState('gameover');
      }
    };

    engineRef.current = engine;
  }, [combo, highScore, isVersusMode, versusActivePlayer, versusRound, wrongShotsThisLevel, score]);

  // Start a new game run
  const startGame = () => {
    setIsVersusMode(false);
    setCurrentLevelNumber(1);
    setScore(0);
    setLevelScore(0);
    setCombo(1);
    setWrongShotsThisLevel(0);
    setRemainingBirds(3);
    setFeedbackMessage(null);

    const firstLevel = generateLevelConfig(1);
    setCurrentLevel(firstLevel);
    setGameState('playing');

    setTimeout(() => {
      initEngine(firstLevel, avatar);
      sounds.startBGM();
    }, 50);
  };

  // Start Versus Match
  const startVersusMatch = (opponentName: string, mode: 'local_pass_play' | 'online_room') => {
    setIsVersusMode(true);
    setVersusOpponent(opponentName);
    setVersusRound(1);
    setVersusActivePlayer(1);
    setP1VersusScore(0);
    setP2VersusScore(0);
    setShowVersusWinner(false);

    setScore(0);
    setLevelScore(0);
    setCombo(1);
    setWrongShotsThisLevel(0);
    setRemainingBirds(3);
    setFeedbackMessage(null);

    const firstLevel = generateLevelConfig(1);
    setCurrentLevel(firstLevel);
    setGameState('playing');

    setTimeout(() => {
      initEngine(firstLevel, avatar);
      sounds.startBGM();
    }, 50);
  };

  // Advance to next level
  const nextLevel = () => {
    const nextLvlNum = currentLevelNumber + 1;
    setCurrentLevelNumber(nextLvlNum);
    setWrongShotsThisLevel(0);
    setRemainingBirds(3);
    setFeedbackMessage(null);

    const newLevelConfig = generateLevelConfig(nextLvlNum);
    setCurrentLevel(newLevelConfig);
    setGameState('playing');

    setTimeout(() => {
      if (engineRef.current) {
        engineRef.current.setLevel(newLevelConfig);
      } else {
        initEngine(newLevelConfig, avatar);
      }
    }, 50);
  };

  // Restart current level
  const restartCurrentLevel = () => {
    setWrongShotsThisLevel(0);
    setRemainingBirds(3);
    setFeedbackMessage(null);
    setGameState('playing');

    const freshLevel = generateLevelConfig(currentLevelNumber);
    setCurrentLevel(freshLevel);

    setTimeout(() => {
      if (engineRef.current) {
        engineRef.current.setLevel(freshLevel);
      } else {
        initEngine(freshLevel, avatar);
      }
    }, 50);
  };

  // Save Avatar configuration
  const handleSaveAvatar = (newAvatar: AvatarConfig) => {
    setAvatar(newAvatar);
    localStorage.setItem('ketapel_kata_avatar', JSON.stringify(newAvatar));
    if (engineRef.current) {
      engineRef.current.setAvatar(newAvatar);
    }
  };

  const toggleMute = () => {
    const nextMute = sounds.toggleMute();
    setIsMuted(nextMute);
  };

  const goHome = () => {
    setGameState('title');
    setIsVersusMode(false);
    setShowVersusWinner(false);
    if (engineRef.current) {
      engineRef.current.destroy();
      engineRef.current = null;
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 1. Canvas Layer (Lives permanently; rendered when state is 'playing', 'paused', 'level_clear', 'gameover') */}
      <canvas
        ref={canvasRef}
        data-testid="game-canvas"
        className={`absolute inset-0 w-full h-full block ${
          gameState === 'title' ? 'hidden' : 'block'
        }`}
      />

      {/* 2. Title Screen View */}
      {gameState === 'title' && (
        <TitleScreen
          onStartGame={startGame}
          onOpenMultiplayer={() => setGameState('multiplayer')}
          onOpenAvatar={() => setGameState('avatar')}
          onOpenLeaderboard={() => setGameState('leaderboard')}
          onOpenReport={() => setGameState('report')}
          avatar={avatar}
          highScore={highScore}
          highestLevel={report.highestLevel}
        />
      )}

      {/* 3. In-Game HUD (Visible during gameplay) */}
      {gameState === 'playing' && (
        <>
          {isVersusMode ? (
            <VersusHUD
              currentRound={versusRound}
              maxRounds={5}
              activePlayer={versusActivePlayer}
              player1Name={avatar.studentName}
              player2Name={versusOpponent}
              player1Score={p1VersusScore}
              player2Score={p2VersusScore}
              onExitVersus={goHome}
            />
          ) : (
            <GameHUD
              level={currentLevel}
              score={score}
              combo={combo}
              remainingBirds={remainingBirds}
              avatar={avatar}
              feedbackMessage={feedbackMessage}
              onPause={() => setGameState('paused')}
              onRestartLevel={restartCurrentLevel}
              onMuteToggle={toggleMute}
              isMuted={isMuted}
            />
          )}
        </>
      )}

      {/* 4. Modals and Overlays */}
      {gameState === 'paused' && (
        <PauseModal
          score={score}
          levelNumber={currentLevelNumber}
          onResume={() => setGameState('playing')}
          onRestart={restartCurrentLevel}
          onGoHome={goHome}
          onMuteToggle={toggleMute}
          isMuted={isMuted}
        />
      )}

      {gameState === 'level_clear' && (
        <VictoryModal
          level={currentLevel}
          score={score}
          levelScore={levelScore}
          stars={starsEarned}
          remainingBirds={remainingBirds}
          onNextLevel={nextLevel}
          onReplayLevel={restartCurrentLevel}
          onGoHome={goHome}
        />
      )}

      {gameState === 'gameover' && (
        <GameOverModal
          level={currentLevel}
          score={score}
          onRetry={restartCurrentLevel}
          onGoHome={goHome}
        />
      )}

      {gameState === 'avatar' && (
        <AvatarModal
          currentAvatar={avatar}
          onSave={handleSaveAvatar}
          onClose={() => setGameState('title')}
        />
      )}

      {gameState === 'leaderboard' && (
        <LeaderboardModal
          currentAvatar={avatar}
          userScore={score > 0 ? score : highScore}
          userLevel={report.highestLevel}
          userAccuracy={calculateAccuracy(report.totalCorrect, report.totalAttempts)}
          onClose={() => setGameState('title')}
        />
      )}

      {gameState === 'report' && (
        <StudentReportModal
          report={report}
          onClose={() => setGameState('title')}
        />
      )}

      {gameState === 'multiplayer' && (
        <MultiplayerModal
          currentAvatar={avatar}
          onStartVersusMatch={startVersusMatch}
          onClose={() => setGameState('title')}
        />
      )}

      {showVersusWinner && (
        <VersusWinnerModal
          player1Name={avatar.studentName}
          player2Name={versusOpponent}
          player1Score={p1VersusScore}
          player2Score={p2VersusScore}
          onRematch={() => startVersusMatch(versusOpponent, 'local_pass_play')}
          onClose={goHome}
        />
      )}
    </div>
  );
}
