// ============================================
// CLOUD TRANSITION
// Sweeps 6 cloud images across the screen to
// reveal the next screen (parting-curtain style).
// ============================================

class CloudTransition {
  /**
   * @param {function} onComplete  Called once the reveal is fully done.
   */
  constructor(onComplete) {
    this.onComplete   = onComplete;
    this.done         = false;

    // Phase: "cover" -> "pause" -> "reveal"
    this.phase        = "cover";
    this.progress     = 0;   // 0 → 1
    this.callbackFired = false;

    // --- TIMING FIX (Target: ~1.25 seconds at 60 FPS) ---
    // Total Frames = 75 (1.25s)
    this.coverFrames  = 30;  // 0.5 seconds to close
    this.pauseFrames  = 15;  // 0.25 seconds hold (gives UIManager time to swap screens safely)
    this.revealFrames = 30;  // 0.5 seconds to open
    this.pauseCount   = 0;

    this._buildClouds();
  }

  _buildClouds() {
    const W = width;
    const H = height;

    // --- OVERSCAN FIX ---
    // Make clouds 80% of screen width and 60% of height to guarantee overlap
    const cw = W * 0.8;
    const ch = H * 0.6;

    // --- ARRAY OUT OF BOUNDS FIX ---
    // Added a 3rd Y-coordinate so the loop doesn't return 'undefined'
    const rowY = [
      -H * 0.15, // Top row (bleeds off top edge)
       H * 0.25, // Middle row
       H * 0.60  // Bottom row (bleeds off bottom edge)
    ];

    // Image indices per row [leftIdx, rightIdx]
    const imgs = [
      [0, 1],
      [2, 3],
      [1, 0],  
    ];

    this.clouds = [];

    // Push clouds slightly past the center so they interlock
    const leftTargetX = -W * 0.05; 
    const rightTargetX = W - cw + (W * 0.05);

    for (let r = 0; r < 3; r++) {
      const sy = rowY[r];

      // Left clouds
      this.clouds.push({
        img: typeof cloudImgs !== 'undefined' ? cloudImgs[imgs[r][0]] : null, // Safely reference global
        startX: -cw - 50,
        startY: sy,
        targetX: leftTargetX,
        revealTargetX: -cw - 50,
        w: cw, h: ch,
      });

      // Right clouds
      this.clouds.push({
        img: typeof cloudImgs !== 'undefined' ? cloudImgs[imgs[r][1]] : null,
        startX: W + 50,
        startY: sy,
        targetX: rightTargetX,
        revealTargetX: W + 50,
        w: cw, h: ch,
      });
    }
  }

  // Smooth quadratic easing (Motion Graphics principle)
  _easeInOut(t) {
    return t < 0.5
      ? 2 * t * t
      : -1 + (4 - 2 * t) * t;
  }

  _lerp(a, b, t) {
    return a + (b - a) * t;
  }

  update() {
    if (this.done) return;

    if (this.phase === "cover") {
      this.progress += 1 / this.coverFrames;
      if (this.progress >= 1) {
        this.progress = 1;
        this.phase    = "pause";
        this.pauseCount = 0;
        
        // Notify caller that the screen is now hidden – safe to swap
        if (!this.callbackFired) {
          this.callbackFired = true;
          if (this.onComplete) this.onComplete();
        }
      }

    } else if (this.phase === "pause") {
      this.pauseCount++;
      if (this.pauseCount >= this.pauseFrames) {
        this.phase    = "reveal";
        this.progress = 0;
      }

    } else if (this.phase === "reveal") {
      this.progress += 1 / this.revealFrames;
      if (this.progress >= 1) {
        this.progress = 1;
        this.done     = true;
      }
    }
  }

  draw() {
    if (this.done) return;

    // Always update logic before rendering
    this.update();

    let bgAlpha;
    if (this.phase === "cover") {
      bgAlpha = this._easeInOut(this.progress) * 255;
    } else if (this.phase === "pause") {
      bgAlpha = 255;
    } else {
      bgAlpha = (1 - this._easeInOut(this.progress)) * 255;
    }

    push();
    noStroke();
    // Solid lavender backing to prevent 1-pixel gaps
    fill(240, 238, 245, bgAlpha);   
    rect(0, 0, width, height);
    
    // Draw the actual clouds
    for (let c of this.clouds) {
      if (!c.img) continue; // Safety check in case images aren't loaded

      let x;
      if (this.phase === "cover" || this.phase === "pause") {
        const coverT = this._easeInOut(this.phase === "pause" ? 1 : this.progress);
        x = this._lerp(c.startX, c.targetX, coverT);
      } else {
        const revT = this._easeInOut(this.progress);
        x = this._lerp(c.targetX, c.revealTargetX, revT);
      }

      image(c.img, x, c.startY, c.w, c.h);
    }
    pop();
  }

  isActive() {
    return !this.done;
  }
}