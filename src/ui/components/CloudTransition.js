
class CloudTransition {
  constructor(onComplete) {
    this.onComplete   = onComplete;
    this.done         = false;

    this.phase        = "cover";
    this.progress     = 0;
    this.callbackFired = false;

    this.coverFrames  = 30;
    this.pauseFrames  = 15;
    this.revealFrames = 30;
    this.pauseCount   = 0;

    this._buildClouds();
  }

  _buildClouds() {
    const W = width;
    const H = height;

    const cw = W * 0.8;
    const ch = H * 0.6;

    const rowY = [
      -H * 0.15,
       H * 0.25,
       H * 0.60
    ];

    const imgs = [
      [0, 1],
      [2, 3],
      [1, 0],
    ];

    this.clouds = [];

    const leftTargetX = -W * 0.05;
    const rightTargetX = W - cw + (W * 0.05);

    for (let r = 0; r < 3; r++) {
      const sy = rowY[r];

      this.clouds.push({
        img: typeof cloudImgs !== 'undefined' ? cloudImgs[imgs[r][0]] : null,
        startX: -cw - 50,
        startY: sy,
        targetX: leftTargetX,
        revealTargetX: -cw - 50,
        w: cw, h: ch,
      });

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
    fill(240, 238, 245, bgAlpha);
    rect(0, 0, width, height);

    for (let c of this.clouds) {
      if (!c.img) continue;

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
