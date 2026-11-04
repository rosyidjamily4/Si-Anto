/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AvatarConfig, LevelConfig, ObstacleBlock, TargetBlock } from '../types/game';
import { sounds } from './audio';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'feather' | 'star' | 'splinter' | 'smoke' | 'confetti' | 'trail';
  rotation: number;
  vRot: number;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  scale: number;
  life: number;
}

export class SlingshotEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animFrameId: number | null = null;
  private isDestroyed = false;

  // Virtual dimensions
  public readonly vWidth = 1000;
  public readonly vHeight = 600;

  // Slingshot anchor
  private readonly anchorX = 170;
  private readonly anchorY = 410;
  private readonly maxPullRadius = 90;

  // State
  private level: LevelConfig;
  private avatar: AvatarConfig;
  private remainingBirds: number;
  private currentBirdIndex = 0;

  // Drag state
  private isDragging = false;
  private dragX = 170;
  private dragY = 410;
  private hasFired = false;

  // Bird physics
  private birdX = 170;
  private birdY = 410;
  private birdVx = 0;
  private birdVy = 0;
  private birdRadius = 24;
  private birdRotation = 0;
  private birdRestTimer = 0;
  private birdState: 'ready' | 'pulled' | 'flying' | 'resting' | 'dissolving' = 'ready';

  // Game feel juice
  private cameraShake = 0;
  private hitstopTimer = 0;
  private lastTime = 0;

  // Pools
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];

  // Callbacks
  public onTargetHit: ((block: TargetBlock, isCorrect: boolean) => void) | null = null;
  public onBirdUsed: ((remaining: number) => void) | null = null;
  public onStageClear: (() => void) | null = null;
  public onStageFail: (() => void) | null = null;

  constructor(canvas: HTMLCanvasElement, level: LevelConfig, avatar: AvatarConfig) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.level = JSON.parse(JSON.stringify(level));
    this.avatar = avatar;
    this.remainingBirds = level.maxBirds;

    this.resetBird();
    this.bindEvents();
    this.startLoop();
  }

  public setLevel(newLevel: LevelConfig) {
    this.level = JSON.parse(JSON.stringify(newLevel));
    this.remainingBirds = newLevel.maxBirds;
    this.currentBirdIndex = 0;
    this.particles = [];
    this.floatingTexts = [];
    this.resetBird();
  }

  public setAvatar(newAvatar: AvatarConfig) {
    this.avatar = newAvatar;
  }

  private resetBird() {
    this.birdX = this.anchorX;
    this.birdY = this.anchorY;
    this.dragX = this.anchorX;
    this.dragY = this.anchorY;
    this.birdVx = 0;
    this.birdVy = 0;
    this.birdRotation = 0;
    this.birdState = 'ready';
    this.hasFired = false;
    this.birdRestTimer = 0;
  }

  private bindEvents() {
    const handleDown = (clientX: number, clientY: number) => {
      if (this.birdState !== 'ready') return;
      const { x, y } = this.clientToVirtual(clientX, clientY);
      const dist = Math.hypot(x - this.anchorX, y - this.anchorY);
      if (dist < 60) {
        this.isDragging = true;
        this.birdState = 'pulled';
        this.updateDragPosition(x, y);
      }
    };

    const handleMove = (clientX: number, clientY: number) => {
      if (!this.isDragging) return;
      const { x, y } = this.clientToVirtual(clientX, clientY);
      this.updateDragPosition(x, y);
    };

    const handleUp = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.releaseSlingshot();
    };

    // Mouse listeners
    this.canvas.addEventListener('mousedown', (e) => handleDown(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => handleMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', handleUp);

    // Touch listeners
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        e.preventDefault();
        handleDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: false });

    window.addEventListener('touchend', handleUp);
  }

  private clientToVirtual(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.vWidth / rect.width;
    const scaleY = this.vHeight / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  private updateDragPosition(x: number, y: number) {
    const dx = x - this.anchorX;
    const dy = y - this.anchorY;
    const dist = Math.hypot(dx, dy);

    // Limit drag to pull radius (can only drag backwards/downwards)
    const angle = Math.atan2(dy, dx);
    const clampedDist = Math.min(dist, this.maxPullRadius);

    this.dragX = this.anchorX + Math.cos(angle) * clampedDist;
    this.dragY = this.anchorY + Math.sin(angle) * clampedDist;
    this.birdX = this.dragX;
    this.birdY = this.dragY;

    // Procedural sound tension
    const tension = clampedDist / this.maxPullRadius;
    if (Math.random() < 0.2) {
      sounds.playSlingshotPull(tension);
    }
  }

  private releaseSlingshot() {
    const dx = this.anchorX - this.dragX;
    const dy = this.anchorY - this.dragY;
    const pullDist = Math.hypot(dx, dy);

    if (pullDist < 15) {
      // Released too close to anchor; cancel
      this.resetBird();
      return;
    }

    // Launch impulse velocity
    const power = 0.23;
    this.birdVx = dx * power;
    this.birdVy = dy * power;
    this.birdState = 'flying';
    this.hasFired = true;

    sounds.playSlingshotRelease();

    // Spawn puff particles at launch
    for (let i = 0; i < 8; i++) {
      this.spawnParticle(this.anchorX, this.anchorY, 'smoke', '#e2e8f0');
    }
  }

  private startLoop() {
    const loop = (timestamp: number) => {
      if (this.isDestroyed) return;
      if (!this.lastTime) this.lastTime = timestamp;
      const rawDt = (timestamp - this.lastTime) / 1000;
      const dt = Math.min(rawDt, 0.05);
      this.lastTime = timestamp;

      this.update(dt);
      this.render();

      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  public destroy() {
    this.isDestroyed = true;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
  }

  private update(dt: number) {
    // Hitstop freeze timer
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      return;
    }

    // Camera shake decay
    if (this.cameraShake > 0) {
      this.cameraShake = Math.max(0, this.cameraShake - dt * 2.5);
    }

    // Update moving obstacles
    this.level.obstacles.forEach((obs) => {
      if (obs.isMoving && obs.moveRange && obs.initialY) {
        obs.y = obs.initialY + Math.sin(Date.now() * 0.003 * (obs.moveSpeed || 1)) * obs.moveRange;
      }
    });

    // Update Bird flight physics
    if (this.birdState === 'flying') {
      const gravity = 420; // virtual units / s^2
      const windForce = this.level.windSpeed * 15;

      this.birdVx += windForce * dt;
      this.birdVy += gravity * dt;

      this.birdX += this.birdVx * dt * 60 * 0.016;
      this.birdY += this.birdVy * dt * 60 * 0.016;

      this.birdRotation = Math.atan2(this.birdVy, this.birdVx);

      // Emit custom avatar trail particles
      if (Math.random() < 0.6) {
        this.emitTrailParticle(this.birdX - this.birdVx * 0.04, this.birdY - this.birdVy * 0.04);
      }

      // Check collision with Ground
      const groundY = 480;
      if (this.birdY + this.birdRadius >= groundY) {
        this.birdY = groundY - this.birdRadius;
        this.birdVy *= -0.4;
        this.birdVx *= 0.7;

        if (Math.abs(this.birdVy) < 20 && Math.abs(this.birdVx) < 20) {
          this.birdState = 'resting';
        }
      }

      // Check collision with Obstacles
      this.level.obstacles.forEach((obs) => {
        if (obs.isDestroyed) return;
        if (this.checkCircleBoxCollision(this.birdX, this.birdY, this.birdRadius, obs.x, obs.y, obs.width, obs.height)) {
          // Bounce off obstacle
          this.birdVx *= -0.55;
          this.birdVy *= 0.55;
          obs.health -= 1;
          this.cameraShake = Math.max(this.cameraShake, 0.4);
          sounds.playImpact(obs.material === 'stone' ? 'stone' : 'wood');

          // Splinters
          for (let i = 0; i < 6; i++) {
            this.spawnParticle(obs.x + obs.width / 2, obs.y + obs.height / 2, 'splinter', obs.material === 'stone' ? '#94a3b8' : '#b45309');
          }

          if (obs.health <= 0) {
            obs.isDestroyed = true;
          }
        }
      });

      // Check collision with Target Blocks
      this.level.blocks.forEach((block) => {
        if (block.isDestroyed) return;

        if (this.checkCircleBoxCollision(this.birdX, this.birdY, this.birdRadius, block.x, block.y, block.width, block.height)) {
          block.isHit = true;

          if (block.isCorrect) {
            // HIT CORRECT WORD!
            block.isDestroyed = true;
            this.hitstopTimer = 0.07; // 70ms hitstop
            this.cameraShake = 0.9;
            sounds.playImpact('pig');
            sounds.playCorrectJingle();

            // Big star burst + confetti
            for (let i = 0; i < 30; i++) {
              this.spawnParticle(block.x + block.width / 2, block.y + block.height / 2, 'star', '#f59e0b');
              this.spawnParticle(block.x + block.width / 2, block.y + block.height / 2, 'confetti', '#38bdf8');
            }

            this.addFloatingText(block.x + 30, block.y - 20, 'BENAR! +1000', '#22c55e');

            if (this.onTargetHit) {
              this.onTargetHit(block, true);
            }

            // Stage Cleared!
            setTimeout(() => {
              if (this.onStageClear) this.onStageClear();
            }, 600);
          } else {
            // HIT WRONG WORD!
            this.cameraShake = 0.5;
            this.birdVx *= -0.5;
            this.birdVy = -80;
            sounds.playWrongBoing();

            // Feathers fly out
            for (let i = 0; i < 10; i++) {
              this.spawnParticle(this.birdX, this.birdY, 'feather', '#ef4444');
            }

            this.addFloatingText(block.x + 10, block.y - 15, 'SALAH!', '#ef4444');

            if (this.onTargetHit) {
              this.onTargetHit(block, false);
            }
          }
        }
      });

      // Out of bounds (flew off right or left edge)
      if (this.birdX > this.vWidth + 50 || this.birdX < -50 || this.birdY > this.vHeight + 50) {
        this.birdState = 'resting';
      }
    }

    // If bird comes to rest, wait 1s then load next bird or fail
    if (this.birdState === 'resting') {
      this.birdRestTimer += dt;
      if (this.birdRestTimer > 1.2) {
        this.remainingBirds -= 1;
        if (this.onBirdUsed) {
          this.onBirdUsed(this.remainingBirds);
        }

        const isCorrectTargetAlive = this.level.blocks.some((b) => b.isCorrect && !b.isDestroyed);

        if (isCorrectTargetAlive && this.remainingBirds <= 0) {
          // Out of birds and correct block not hit -> Stage Failed
          sounds.playGameOver();
          if (this.onStageFail) this.onStageFail();
        } else if (isCorrectTargetAlive) {
          // Reload next bird
          this.resetBird();
        }
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.rotation += p.vRot * dt;
      p.life += dt;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    // Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= dt * 45;
      ft.life += dt;
      ft.alpha = Math.max(0, 1 - ft.life / 1.5);

      if (ft.life >= 1.5) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  private checkCircleBoxCollision(
    cx: number, cy: number, cr: number,
    bx: number, by: number, bw: number, bh: number
  ): boolean {
    const closestX = Math.max(bx, Math.min(cx, bx + bw));
    const closestY = Math.max(by, Math.min(cy, by + bh));
    const distX = cx - closestX;
    const distY = cy - closestY;
    return distX * distX + distY * distY < cr * cr;
  }

  private emitTrailParticle(x: number, y: number) {
    const trailType = this.avatar.trail;
    let color = '#f59e0b';

    if (trailType === 'fire') {
      const colors = ['#ef4444', '#f97316', '#fbbf24'];
      color = colors[Math.floor(Math.random() * colors.length)];
      this.spawnParticle(x, y, 'feather', color, 0.4);
    } else if (trailType === 'stars') {
      color = '#fde047';
      this.spawnParticle(x, y, 'star', color, 0.6);
    } else if (trailType === 'rainbow') {
      const colors = ['#f43f5e', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#facc15'];
      color = colors[Math.floor(Math.random() * colors.length)];
      this.spawnParticle(x, y, 'confetti', color, 0.5);
    } else if (trailType === 'leaf') {
      color = '#22c55e';
      this.spawnParticle(x, y, 'splinter', color, 0.6);
    } else {
      // smoke
      color = '#cbd5e1';
      this.spawnParticle(x, y, 'smoke', color, 0.5);
    }
  }

  private spawnParticle(
    x: number, y: number,
    type: Particle['type'],
    color: string,
    maxLife = 0.8
  ) {
    if (this.particles.length > 150) return; // GC ring cap

    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4 + 1;

    this.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      size: Math.random() * 6 + 3,
      color,
      alpha: 1,
      life: 0,
      maxLife,
      type,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 6
    });
  }

  private addFloatingText(x: number, y: number, text: string, color: string) {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      alpha: 1,
      scale: 1,
      life: 0
    });
  }

  private render() {
    const { ctx } = this;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.save();
    // Scale virtual coordinates (1000x600) to actual canvas dimensions
    const scale = Math.min(w / this.vWidth, h / this.vHeight);
    const offsetX = (w - this.vWidth * scale) / 2;
    const offsetY = (h - this.vHeight * scale) / 2;

    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    // Apply camera shake
    if (this.cameraShake > 0) {
      const shakeMag = this.cameraShake * 10;
      const sx = (Math.random() - 0.5) * shakeMag;
      const sy = (Math.random() - 0.5) * shakeMag;
      ctx.translate(sx, sy);
    }

    // 1. Background Scenery (Sky, distant mountains, trees, ground)
    this.renderBackground(ctx);

    // 2. Obstacles & Fortress structure
    this.renderObstacles(ctx);

    // 3. Target Word Blocks
    this.renderTargetBlocks(ctx);

    // 4. Slingshot Base & Back Rubber Band
    this.renderSlingshotBack(ctx);

    // 5. Bird in flight or inside slingshot
    this.renderBird(ctx);

    // 6. Slingshot Front Fork & Front Rubber Band
    this.renderSlingshotFront(ctx);

    // 7. Trajectory Dots (when aiming)
    if (this.isDragging) {
      this.renderTrajectoryDots(ctx);
    }

    // 8. Spare Birds sitting on the ground ready for launch
    this.renderSpareBirds(ctx);

    // 9. Particles
    this.renderParticles(ctx);

    // 10. Floating Texts
    this.renderFloatingTexts(ctx);

    ctx.restore();
  }

  private renderBackground(ctx: CanvasRenderingContext2D) {
    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 500);
    skyGrad.addColorStop(0, '#38bdf8'); // sky blue
    skyGrad.addColorStop(0.6, '#bae6fd');
    skyGrad.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, this.vWidth, this.vHeight);

    // Distant tropical mountains (soft blue-green)
    ctx.fillStyle = '#6ee7b7';
    ctx.beginPath();
    ctx.moveTo(0, 480);
    ctx.lineTo(140, 320);
    ctx.lineTo(340, 480);
    ctx.lineTo(520, 290);
    ctx.lineTo(760, 480);
    ctx.lineTo(920, 310);
    ctx.lineTo(1000, 480);
    ctx.closePath();
    ctx.fill();

    // Foreground rolling green hills
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.moveTo(0, 480);
    ctx.quadraticCurveTo(240, 410, 500, 470);
    ctx.quadraticCurveTo(750, 420, 1000, 480);
    ctx.lineTo(1000, 600);
    ctx.lineTo(0, 600);
    ctx.closePath();
    ctx.fill();

    // Grass ground platform
    ctx.fillStyle = '#15803d'; // deep grass green
    ctx.fillRect(0, 480, this.vWidth, 120);

    // Soil layer
    ctx.fillStyle = '#78350f'; // rich brown soil
    ctx.fillRect(0, 505, this.vWidth, 95);

    // Grass edge detail
    ctx.fillStyle = '#4ade80';
    for (let x = 0; x < this.vWidth; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, 480);
      ctx.lineTo(x + 8, 473);
      ctx.lineTo(x + 16, 480);
      ctx.fill();
    }

    // Animated decorative clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    const cloudTime = Date.now() * 0.01;
    const c1X = (cloudTime * 1.5) % (this.vWidth + 200) - 100;
    const c2X = (cloudTime * 0.9 + 500) % (this.vWidth + 200) - 100;
    this.drawCloud(ctx, c1X, 90, 60);
    this.drawCloud(ctx, c2X, 150, 45);

    // Wind indicator if windy
    if (Math.abs(this.level.windSpeed) > 0.2) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.font = '600 13px system-ui, sans-serif';
      const windDir = this.level.windSpeed > 0 ? '▶▶ Angin Kanan' : '◀◀ Angin Kiri';
      ctx.fillText(`${windDir} (${Math.abs(this.level.windSpeed).toFixed(1)} m/s)`, 440, 40);
    }
  }

  private drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.arc(x + r * 0.65, y - r * 0.2, r * 0.75, 0, Math.PI * 2);
    ctx.arc(x - r * 0.65, y, r * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderSlingshotBack(ctx: CanvasRenderingContext2D) {
    // Back wooden prong of slingshot
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(this.anchorX - 10, 480);
    ctx.lineTo(this.anchorX - 10, 420);
    ctx.lineTo(this.anchorX - 28, 380);
    ctx.stroke();

    // Back elastic rubber band (drawn behind bird)
    if (this.isDragging || this.birdState === 'ready') {
      ctx.strokeStyle = '#7f1d1d'; // dark crimson rubber band
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(this.anchorX - 26, 382);
      ctx.lineTo(this.dragX, this.dragY);
      ctx.stroke();
    }
  }

  private renderSlingshotFront(ctx: CanvasRenderingContext2D) {
    // Front elastic rubber band (drawn in front of bird)
    if (this.isDragging || this.birdState === 'ready') {
      ctx.strokeStyle = '#b91c1c'; // bright rubber band
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(this.dragX, this.dragY);
      ctx.lineTo(this.anchorX + 24, 382);
      ctx.stroke();

      // Leather pouch
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.arc(this.dragX, this.dragY, 14, 0, Math.PI * 2);
      ctx.fill();
    }

    // Front wooden prong & trunk of slingshot
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(this.anchorX, 480);
    ctx.lineTo(this.anchorX, 420);
    ctx.lineTo(this.anchorX + 22, 380);
    ctx.stroke();

    // Slingshot wooden fork highlight
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.anchorX + 2, 475);
    ctx.lineTo(this.anchorX + 2, 422);
    ctx.stroke();
  }

  private renderTrajectoryDots(ctx: CanvasRenderingContext2D) {
    const dx = this.anchorX - this.dragX;
    const dy = this.anchorY - this.dragY;
    const power = 0.23;
    let simVx = dx * power;
    let simVy = dy * power;
    let simX = this.dragX;
    let simY = this.dragY;
    const gravity = 420;
    const wind = this.level.windSpeed * 15;
    const stepDt = 0.045;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    for (let i = 0; i < 24; i++) {
      simVx += wind * stepDt;
      simVy += gravity * stepDt;
      simX += simVx * stepDt * 60 * 0.016;
      simY += simVy * stepDt * 60 * 0.016;

      if (simY > 480) break; // stop at ground

      const dotRadius = Math.max(2, 6 - i * 0.16);
      ctx.beginPath();
      ctx.arc(simX, simY, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderBird(ctx: CanvasRenderingContext2D) {
    if (this.birdState === 'resting' && this.birdRestTimer > 1) return;

    ctx.save();
    ctx.translate(this.birdX, this.birdY);
    ctx.rotate(this.birdRotation);

    // Squash & Stretch
    if (this.birdState === 'flying') {
      const speed = Math.hypot(this.birdVx, this.birdVy);
      const stretch = Math.min(1.3, 1 + speed * 0.0006);
      ctx.scale(stretch, 1 / stretch);
    }

    this.drawAvatarBird(ctx, this.avatar, this.birdRadius);

    ctx.restore();
  }

  private renderSpareBirds(ctx: CanvasRenderingContext2D) {
    const spareCount = this.remainingBirds - (this.birdState === 'flying' || this.birdState === 'resting' ? 0 : 1);
    for (let i = 0; i < spareCount; i++) {
      ctx.save();
      ctx.translate(70 - i * 36, 465);
      this.drawAvatarBird(ctx, this.avatar, 15);
      ctx.restore();
    }
  }

  private drawAvatarBird(ctx: CanvasRenderingContext2D, config: AvatarConfig, r: number) {
    // Body colors per bird type
    let bodyColor = '#ef4444'; // jalak_merah default
    let bellyColor = '#fca5a5';
    let beakColor = '#f59e0b';

    if (config.birdType === 'kakatua_emas') {
      bodyColor = '#eab308';
      bellyColor = '#fef08a';
      beakColor = '#ea580c';
    } else if (config.birdType === 'cendrawasih_biru') {
      bodyColor = '#06b6d4';
      bellyColor = '#a5f3fc';
      beakColor = '#f59e0b';
    } else if (config.birdType === 'hantu_bijak') {
      bodyColor = '#92400e';
      bellyColor = '#fed7aa';
      beakColor = '#d97706';
    }

    // Bird body circle
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Belly patch
    ctx.fillStyle = bellyColor;
    ctx.beginPath();
    ctx.arc(r * 0.25, r * 0.2, r * 0.55, 0, Math.PI * 2);
    ctx.fill();

    // Crest feathers
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(-r * 0.3, -r * 0.8);
    ctx.quadraticCurveTo(-r * 0.8, -r * 1.4, -r * 0.2, -r * 1.1);
    ctx.lineTo(0, -r * 0.9);
    ctx.fill();

    // Eye (determined/focused expression)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(r * 0.35, -r * 0.15, r * 0.32, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(r * 0.42, -r * 0.15, r * 0.16, 0, Math.PI * 2);
    ctx.fill();

    // Eye highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(r * 0.46, -r * 0.2, r * 0.07, 0, Math.PI * 2);
    ctx.fill();

    // Beak
    ctx.fillStyle = beakColor;
    ctx.beginPath();
    ctx.moveTo(r * 0.6, -r * 0.15);
    ctx.lineTo(r * 1.25, 0);
    ctx.lineTo(r * 0.6, r * 0.25);
    ctx.closePath();
    ctx.fill();

    // Tail feathers
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(-r * 0.8, -r * 0.1);
    ctx.lineTo(-r * 1.3, -r * 0.3);
    ctx.lineTo(-r * 1.3, r * 0.3);
    ctx.closePath();
    ctx.fill();

    // Render Accessory / Hat
    this.drawBirdHat(ctx, config.hat, r);
  }

  private drawBirdHat(ctx: CanvasRenderingContext2D, hat: AvatarConfig['hat'], r: number) {
    if (hat === 'none') return;

    if (hat === 'sd_hat') {
      // Indonesian Elementary School cap (Merah Putih)
      ctx.fillStyle = '#dc2626'; // red top
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.9, r * 0.6, r * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      // White front panel
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(r * 0.25, -r * 0.9, r * 0.25, 0, Math.PI * 2);
      ctx.fill();

      // Cap visor
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.moveTo(r * 0.1, -r * 0.8);
      ctx.lineTo(r * 0.9, -r * 0.7);
      ctx.lineTo(r * 0.2, -r * 0.65);
      ctx.fill();
    } else if (hat === 'wisuda') {
      // Graduation cap (Sarjana Cilik)
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(0, -r * 1.4);
      ctx.lineTo(r * 0.8, -r * 1.1);
      ctx.lineTo(0, -r * 0.8);
      ctx.lineTo(-r * 0.8, -r * 1.1);
      ctx.closePath();
      ctx.fill();

      // Tassel
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, -r * 1.1);
      ctx.lineTo(r * 0.5, -r * 0.7);
      ctx.stroke();
    } else if (hat === 'mahkota') {
      // Royal golden crown
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(-r * 0.5, -r * 0.8);
      ctx.lineTo(-r * 0.5, -r * 1.3);
      ctx.lineTo(-r * 0.2, -r * 1.0);
      ctx.lineTo(0, -r * 1.4);
      ctx.lineTo(r * 0.2, -r * 1.0);
      ctx.lineTo(r * 0.5, -r * 1.3);
      ctx.lineTo(r * 0.5, -r * 0.8);
      ctx.closePath();
      ctx.fill();

      // Crown jewel
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, -r * 0.95, r * 0.12, 0, Math.PI * 2);
      ctx.fill();
    } else if (hat === 'petualang') {
      // Explorer / Safari hat
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.8, r * 0.8, r * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#92400e';
      ctx.beginPath();
      ctx.arc(0, -r * 0.95, r * 0.45, Math.PI, 0);
      ctx.fill();
    } else if (hat === 'kacamata') {
      // Cool black sunglasses
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(r * 0.1, -r * 0.25, r * 0.5, r * 0.28, 4);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (hat === 'pita') {
      // Red ribbon bow
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.moveTo(-r * 0.3, -r * 1.1);
      ctx.lineTo(r * 0.3, -r * 0.9);
      ctx.lineTo(-r * 0.3, -r * 0.9);
      ctx.lineTo(r * 0.3, -r * 1.1);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(0, -r * 1.0, r * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderTargetBlocks(ctx: CanvasRenderingContext2D) {
    this.level.blocks.forEach((block) => {
      if (block.isDestroyed) return;

      ctx.save();
      ctx.translate(block.x, block.y);

      // Block Wood frame
      const isGold = block.isCorrect;
      ctx.fillStyle = isGold ? '#d97706' : '#78350f';
      ctx.strokeStyle = isGold ? '#f59e0b' : '#b45309';
      ctx.lineWidth = 4;

      ctx.beginPath();
      ctx.roundRect(0, 0, block.width, block.height, 8);
      ctx.fill();
      ctx.stroke();

      // Inner card background for high readability of Indonesian word
      ctx.fillStyle = isGold ? '#fef3c7' : '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(6, 6, block.width - 12, block.height - 12, 5);
      ctx.fill();

      // Indonesian Word Text (Clear display)
      ctx.fillStyle = isGold ? '#92400e' : '#1e293b';
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(block.word, block.width / 2, block.height / 2 + 1);

      // Cute little creature mascot on top of block
      this.drawBlockMascot(ctx, block.width / 2, -10, isGold);

      ctx.restore();
    });
  }

  private drawBlockMascot(ctx: CanvasRenderingContext2D, x: number, y: number, isGold: boolean) {
    // Cute round pig / monster kata on top of crate
    const r = 12;
    ctx.fillStyle = isGold ? '#fbbf24' : '#22c55e'; // green or golden mascot
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x - 4, y - 3, 3.5, 0, Math.PI * 2);
    ctx.arc(x + 4, y - 3, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(x - 3, y - 3, 1.8, 0, Math.PI * 2);
    ctx.arc(x + 5, y - 3, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Cute snout / smile
    ctx.fillStyle = isGold ? '#d97706' : '#15803d';
    ctx.beginPath();
    ctx.arc(x, y + 3, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderObstacles(ctx: CanvasRenderingContext2D) {
    this.level.obstacles.forEach((obs) => {
      if (obs.isDestroyed) return;

      ctx.save();
      ctx.translate(obs.x, obs.y);

      if (obs.material === 'wood') {
        ctx.fillStyle = '#92400e';
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 3;
        ctx.fillRect(0, 0, obs.width, obs.height);
        ctx.strokeRect(0, 0, obs.width, obs.height);

        // Wood grain line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.moveTo(obs.width / 2, 0);
        ctx.lineTo(obs.width / 2, obs.height);
        ctx.stroke();
      } else if (obs.material === 'stone') {
        ctx.fillStyle = '#64748b';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 3;
        ctx.fillRect(0, 0, obs.width, obs.height);
        ctx.strokeRect(0, 0, obs.width, obs.height);
      } else if (obs.material === 'ice') {
        // Floating cloud / ice obstacle
        ctx.fillStyle = 'rgba(224, 242, 254, 0.85)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(0, 0, obs.width, obs.height, 16);
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
    });
  }

  private renderParticles(ctx: CanvasRenderingContext2D) {
    this.particles.forEach((p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.type === 'star') {
        this.drawStar(ctx, 0, 0, 5, p.size, p.size * 0.45);
      } else if (p.type === 'confetti') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      } else if (p.type === 'smoke') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Splinter or feather
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }

      ctx.restore();
    });
  }

  private drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerR: number, innerR: number) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerR);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerR;
      y = cy + Math.sin(rot) * outerR;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerR;
      y = cy + Math.sin(rot) * innerR;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerR);
    ctx.closePath();
    ctx.fill();
  }

  private renderFloatingTexts(ctx: CanvasRenderingContext2D) {
    this.floatingTexts.forEach((ft) => {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 6;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });
  }
}
