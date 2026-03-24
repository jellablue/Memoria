const starBank = {
  totalStars:    0,
  kaleidoRecord: 0,
  jellyRecord:   0,
  tiptoeRecord:  0,

  // --- Session tracking (reset each game) ---
  sessionScores: { kaleido: [], jelly: [], tiptoe: [] }, // last 3 session scores per game

  // --- Streak tracking (reset each game session) ---
  consecutiveFlawless: 0, // levels completed without losing a life
  STREAK_THRESHOLD:    3, // levels in a row needed for a streak bonus
  STREAK_BONUS:        15,

  // --- Cognitive mastery targets (score needed for 100%) ---
  COGNITIVE_CAP: { kaleido: 200, jelly: 150, tiptoe: 150 },

  popAnim:       { active: false, timer: 0, amount: 0, x: 0, y: 0 },
  streakAnim:    { active: false, timer: 0 },

  // ─────────────────────────────────────────
  // STAR CONVERSION
  // Stars = floor(score × depthBonus × accuracyMultiplier) + streakBonuses
  // ─────────────────────────────────────────

  /**
   * Main entry point called by GameScreen at session end.
   * @param {number} score        - Raw point score for the session
   * @param {number} maxLevel     - Highest level reached in this session
   * @param {number} livesLost    - How many lives were lost (0–3)
   * @param {string} gameKey      - "kaleido" | "jelly" | "tiptoe"
   */
  addStarsFromSession(score, maxLevel, livesLost, gameKey) {
    const depthBonus        = this._depthBonus(maxLevel);
    const accuracyMult      = this._accuracyMultiplier(livesLost);
    const baseStars         = Math.floor(score * depthBonus * accuracyMult);
    const totalEarned       = baseStars; // streak bonuses are accumulated separately via recordLevelComplete()

    this.totalStars += totalEarned;

    // Track session score for cognitive profile averaging
    this._pushSessionScore(gameKey, score);

    this.popAnim = {
      active:        true,
      timer:         0,
      amount:        totalEarned,
      perfectRun:    livesLost === 0,
      x:             width  / 2,
      y:             height / 2 - 60,
    };

    return totalEarned;
  },

  /**
   * Call this when a player completes a level (before checking game over).
   * Handles streak counting and awards streak bonus stars immediately.
   * @param {boolean} flawless - true if no lives were lost on this level
   */
  recordLevelComplete(flawless) {
    if (flawless) {
      this.consecutiveFlawless++;
      if (this.consecutiveFlawless > 0 && this.consecutiveFlawless % this.STREAK_THRESHOLD === 0) {
        this.totalStars  += this.STREAK_BONUS;
        this.streakAnim   = { active: true, timer: 0 };
      }
    } else {
      this.consecutiveFlawless = 0;
    }
  },

  /**
   * Call this in KaleidoPop when a mandala is submitted quickly.
   * @param {number} timeTaken    - Milliseconds the player took to submit
   * @param {number} timeAllowed  - Total milliseconds allowed for this level
   */
  recordFastSubmit(timeTaken, timeAllowed) {
    const SPEED_BONUS       = 5;
    const SPEED_THRESHOLD   = 0.75; // must submit within 75% of allotted time
    if (timeTaken <= timeAllowed * SPEED_THRESHOLD) {
      this.totalStars += SPEED_BONUS;
      return SPEED_BONUS;
    }
    return 0;
  },

  // ─────────────────────────────────────────
  // INTERNAL HELPERS
  // ─────────────────────────────────────────

  /**
   * Depth bonus grows with the highest level reached.
   * Level 5  → ×1.5   Level 10 → ×2.0   Level 0 → ×1.0
   */
  _depthBonus(maxLevel) {
    return 1 + (maxLevel / 10);
  },

  /**
   * Accuracy multiplier based on lives lost.
   * 0 lost → ×1.00 | 1 lost → ×0.85 | 2 lost → ×0.70 | 3 lost → ×0.55
   * Floor of 0.55 keeps even bad runs rewarding.
   */
  _accuracyMultiplier(livesLost) {
    return Math.max(1.0 - (livesLost * 0.15), 0.55);
  },

  /** Keeps a rolling window of the last 3 session scores per game. */
  _pushSessionScore(gameKey, score) {
    const arr = this.sessionScores[gameKey];
    arr.push(score);
    if (arr.length > 3) arr.shift();
  },

  /** Returns the average of the last 3 session scores for a game. */
  _sessionAvg(gameKey) {
    const arr = this.sessionScores[gameKey];
    if (!arr.length) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  },

  // ─────────────────────────────────────────
  // RECORDS
  // ─────────────────────────────────────────

  updateRecord(gameKey, score) {
    const key = gameKey + "Record";
    if (this[key] !== undefined && score > this[key]) {
      this[key] = score;
      return true;
    }
    return false;
  },

  // ─────────────────────────────────────────
  // LEVEL & BADGE
  // ─────────────────────────────────────────

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

  // ─────────────────────────────────────────
  // COGNITIVE PROFILE
  // Returns all data the ProfileScreen needs.
  // ─────────────────────────────────────────

  getCognitiveScores() {
    const cap = this.COGNITIVE_CAP;

    const allTimeVisual   = constrain((this.kaleidoRecord / cap.kaleido) * 100, 0, 100);
    const allTimeAuditory = constrain((this.jellyRecord   / cap.jelly  ) * 100, 0, 100);
    const allTimeSpatial  = constrain((this.tiptoeRecord  / cap.tiptoe ) * 100, 0, 100);

    const sessionVisual   = constrain((this._sessionAvg("kaleido") / cap.kaleido) * 100, 0, 100);
    const sessionAuditory = constrain((this._sessionAvg("jelly")   / cap.jelly  ) * 100, 0, 100);
    const sessionSpatial  = constrain((this._sessionAvg("tiptoe")  / cap.tiptoe ) * 100, 0, 100);

    return {
      // All-time high score % — drives the solid bar fill
      visual:   allTimeVisual,
      auditory: allTimeAuditory,
      spatial:  allTimeSpatial,

      // Session average % — drives the light overlay behind the bar
      sessionVisual,
      sessionAuditory,
      sessionSpatial,
    };
  },

  /**
   * Returns a +N% delta string if the latest session beat the all-time record,
   * or null if there's no improvement to show. Never returns a negative value.
   * @param {string} gameKey - "kaleido" | "jelly" | "tiptoe"
   */
  getSessionDelta(gameKey) {
    const cap         = this.COGNITIVE_CAP[gameKey];
    const record      = this[gameKey + "Record"];
    const latestScore = this.sessionScores[gameKey].at(-1) ?? 0;

    const recordPct  = constrain((record      / cap) * 100, 0, 100);
    const sessionPct = constrain((latestScore / cap) * 100, 0, 100);
    const delta      = Math.round(sessionPct - recordPct);

    return delta > 0 ? "+" + delta + "%" : null;
  },

  // ─────────────────────────────────────────
  // ANIMATIONS
  // ─────────────────────────────────────────

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

    if (this.popAnim.perfectRun) {
      fill(100, 220, 160, alpha); // green tint for perfect runs
    } else {
      fill(255, 195, 0, alpha);
    }

    text("+" + this.popAnim.amount + " \u2B50", this.popAnim.x, this.popAnim.y + yOff);

    // "Full hearts!" sub-label on perfect runs
    if (this.popAnim.perfectRun && t < 60) {
      textSize(18);
      fill(100, 220, 160, map(t, 0, 60, 200, 0));
      text("All hearts kept! \u2764\uFE0F", this.popAnim.x, this.popAnim.y + yOff + 44);
    }

    pop();
  },

  drawStreakAnim() {
    if (!this.streakAnim.active) return;

    this.streakAnim.timer++;
    const t = this.streakAnim.timer;

    if (t > 90) {
      this.streakAnim.active = false;
      return;
    }

    const alpha = map(t,  0, 90, 255, 0);
    const yOff  = map(t,  0, 90,   0, -80);
    const sz    = t < 10 ? map(t, 0, 10, 0, 36) : 36;

    push();
    noStroke();
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(sz);
    fill(255, 140, 0, alpha);
    text("\uD83D\uDD25 Flawless streak! +" + this.STREAK_BONUS + "\u2B50", width / 2, height / 2 - 120 + yOff);
    pop();
  },

  // ─────────────────────────────────────────
  // RESET
  // ─────────────────────────────────────────

  /** Full reset (e.g. new player profile). */
  reset() {
    this.totalStars          = 0;
    this.kaleidoRecord       = 0;
    this.jellyRecord         = 0;
    this.tiptoeRecord        = 0;
    this.sessionScores       = { kaleido: [], jelly: [], tiptoe: [] };
    this.consecutiveFlawless = 0;
    this.popAnim             = { active: false, timer: 0, amount: 0, x: 0, y: 0 };
    this.streakAnim          = { active: false, timer: 0 };
  },

  /** Session reset — call at the start of each game, before lives are set. */
  resetSession() {
    this.consecutiveFlawless = 0;
    this.streakAnim          = { active: false, timer: 0 };
  },
};