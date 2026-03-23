
const starBank = {
  totalStars:    0,
  kaleidoRecord: 0,
  jellyRecord:   0,
  tiptoeRecord:  0,

  COGNITIVE_CAP: { kaleido: 200, jelly: 150, tiptoe: 150 },

  popAnim: { active: false, timer: 0, amount: 0, x: 0, y: 0 },

  addStars(amount) {
    this.totalStars += amount;
    this.popAnim = {
      active: true,
      timer:  0,
      amount,
      x: width  / 2,
      y: height / 2 - 60,
    };
  },

  updateRecord(gameKey, score) {
    const key = gameKey + "Record";
    if (this[key] !== undefined && score > this[key]) {
      this[key] = score;
      return true;
    }
    return false;
  },

  getLevel() {
    if (this.totalStars < 1000) return "Newbie";
    if (this.totalStars < 5000) return "Explorer";
    return "Memory Master";
  },

  getLevelBadgeColor() {
    if (this.totalStars < 1000) return "#AEC6CF";
    if (this.totalStars < 5000) return "#C1E1C1";
    return "#FDFD96";
  },

  drawPopAnim() {
    if (!this.popAnim.active) return;

    this.popAnim.timer++;
    const t = this.popAnim.timer;

    if (t > 80) {
      this.popAnim.active = false;
      return;
    }

    const alpha = map(t,  0, 80, 255, 0);
    const yOff  = map(t,  0, 80,   0, -110);
    const sz    = t < 14 ? map(t, 0, 14, 0, 48) : 48;

    push();
    noStroke();
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(sz);
    fill(255, 195, 0, alpha);
    text("+" + this.popAnim.amount + " \u2B50", this.popAnim.x, this.popAnim.y + yOff);
    pop();
  },

  getCognitiveScores() {
    const cap = this.COGNITIVE_CAP;
    return {
      visual  : constrain((this.kaleidoRecord / cap.kaleido) * 100, 0, 100),
      auditory: constrain((this.jellyRecord   / cap.jelly  ) * 100, 0, 100),
      spatial : constrain((this.tiptoeRecord  / cap.tiptoe ) * 100, 0, 100),
    };
  },

  reset() {
    this.totalStars    = 0;
    this.kaleidoRecord = 0;
    this.jellyRecord   = 0;
    this.tiptoeRecord  = 0;
    this.popAnim = { active: false, timer: 0, amount: 0, x: 0, y: 0 };
  },
};
