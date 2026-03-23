// ============================================
// CLOUD TRANSITION
// Sweeps 4 cloud images across the screen to
// reveal the next screen (parting-curtain style).
// ============================================

class CloudTransition {
  /**
   * @param {function} onComplete  Called once the reveal is fully done.
   */
  constructor(onComplete) {
    this.onComplete   = onComplete;
    this.done         = false;

    // Phase:
    //  "cover"  – clouds slide IN from each side, covering the screen
    //  "reveal" – clouds slide OUT to the sides, revealing the new screen
    this.phase        = "cover";
    this.progress     = 0;   // 0 → 1
    this.coverDone    = false;
    this.callbackFired = false;

    // Duration in frames (60 fps target)
    this.coverFrames  = 28;
    this.pauseFrames  = 6;    // brief hold with screen fully covered
    this.revealFrames = 32;
    this.pauseCount   = 0;

    // Each cloud entry: { img, startX, startY, targetX, w, h, revealTargetX }
    this._buildClouds();
  }

  _buildClouds() {
    // clouds[] is a global array populated in preload() [cloud1..cloud4]
    //
    // Layout: 3 rows × 2 sides = 6 clouds (images reused for rows 3).
    // Each cloud is 68 % of screen wide → left + right overlap by 36 %.
    // Each cloud is 42 % of screen tall, 3 rows → covers 126 % height.
    // A solid backing rect (drawn first) guarantees zero gaps.
    const W = width;
    const H = height;

    const cw = W * 0.82;   // left + right = ~114 % → ~7 % center overlap only
    const ch = H * 0.50;   // each row is 40 % tall; rows spaced 33 % apart → ~7 % vertical overlap

    // Row Y positions
    const rowY = [
      -H * 0.02,   // row 0  – top
       H * 0.31,   // row 1  – middle
       H * 0.63,   // row 2  – bottom
    ];

    // Image indices per row [leftIdx, rightIdx]
    const imgs = [
      [0, 1],
      [2, 3],
      [1, 0],  
    ];

    this.clouds = [];

    for (let r = 0; r < 3; r++) {
      const sy = rowY[r];

      // Left clouds
      this.clouds.push({
        img: cloudImgs[imgs[r][0]],
        startX: -cw - 10,
        startY: sy,
        targetX: W * 0.009,
        revealTargetX: -cw - 10,
        w: cw, h: ch,
      });

      // Right clouds
      this.clouds.push({
        img: cloudImgs[imgs[r][1]],
        startX: W + 10,
        startY: sy,
        targetX: W - cw + W * 0.009,
        revealTargetX: W + 10,
        w: cw, h: ch,
      });
    }
  }

  // Smooth easing
  _easeInOut(t) {
    return t < 0.5
      ? 2 * t * t
      : -1 + (4 - 2 * t) * t;
  }

  // Returns current x for a cloud given eased progress
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

    this.update();

    // Backing fill opacity:  ramps up 0→255 during cover, holds at 255 during
    // pause, then ramps back down 255→0 during reveal.  This guarantees no
    // pixel gap can show through the cloud images.
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
    fill(240, 238, 245, bgAlpha);   // soft lavender-white backing
    rect(0, 0, width, height);
    pop();

    for (let c of this.clouds) {
      let x;
      if (this.phase === "cover" || this.phase === "pause") {
        const coverT = this._easeInOut(
          this.phase === "pause" ? 1 : this.progress
        );
        x = this._lerp(c.startX, c.targetX, coverT);
      } else {
        const revT = this._easeInOut(this.progress);
        x = this._lerp(c.targetX, c.revealTargetX, revT);
      }

      image(c.img, x, c.startY, c.w, c.h);
    }
  }

  isActive() {
    return !this.done;
  }
}
