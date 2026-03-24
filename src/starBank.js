const starBank = {
  totalStars:    0,
  kaleidoRecord: 0,
  jellyRecord:   0,
  tiptoeRecord:  0,
  _statsLoaded: false,
  STORAGE_KEY: "brainStats",
  brainStats: {
    kaleido: { bestScore: 0, totalScore: 0, playCount: 0 },
    jelly:   { bestScore: 0, totalScore: 0, playCount: 0 },
    tiptoe:  { bestScore: 0, totalScore: 0, playCount: 0 },
  },
  sessionDeltas: { kaleido: null, jelly: null, tiptoe: null },
  sessionScores: { kaleido: [], jelly: [], tiptoe: [] },
  consecutiveFlawless: 0,
  STREAK_THRESHOLD:    3,
  STREAK_BONUS:        15,
  _sessionStreakStars: 0,
  COGNITIVE_CAP: { kaleido: 200, jelly: 150, tiptoe: 150 },
  MAX_DEPTH_LEVEL: 10,

  popAnim:    { active: false, timer: 0, amount: 0, x: 0, y: 0 },
  streakAnim: { active: false, timer: 0 },

  /**
   * Main entry point called by GameScreen at session end.
   * @param {number} score        - Raw point score for the session
   * @param {number} maxLevel     - Highest level reached in this session
   * @param {number} livesLost    - How many lives were lost (0–3)
   * @param {string} gameKey      - "kaleido" | "jelly" | "tiptoe"
   * @returns {number}            - Total stars earned this session (base + streak)
   */
  addStarsFromSession(score, maxLevel, livesLost, gameKey) {
    this.resetSession();

    const depthBonus   = this._depthBonus(maxLevel);
    const accuracyMult = this._accuracyMultiplier(livesLost);
    const baseStars    = Math.floor(score * depthBonus * accuracyMult);
    const totalEarned = baseStars + this._sessionStreakStars;
    this.totalStars  += baseStars;
    this._pushSessionScore(gameKey, score);

    this.popAnim = {
      active:     true,
      timer:      0,
      amount:     totalEarned,
      perfectRun: livesLost === 0,
      x:          width  / 2,
      y:          height / 2 - 60,
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
        this.totalStars         += this.STREAK_BONUS;
        this._sessionStreakStars += this.STREAK_BONUS;
        this.streakAnim          = { active: true, timer: 0 };
      }
    } else {
      this.consecutiveFlawless = 0;
    }
  },

  /**
   * Call this in KaleidoPop when a mandala is submitted quickly.
   * @param {number} timeTaken   - Milliseconds the player took to submit
   * @param {number} timeAllowed - Total milliseconds allowed for this level
   */
  recordFastSubmit(timeTaken, timeAllowed) {
    const SPEED_BONUS     = 5;
    const SPEED_THRESHOLD = 0.75;
    if (timeTaken <= timeAllowed * SPEED_THRESHOLD) {
      this.totalStars         += SPEED_BONUS;
      this._sessionStreakStars += SPEED_BONUS;
      return SPEED_BONUS;
    }
    return 0;
  },

  /**
   * FIX 1: Depth bonus is now capped at MAX_DEPTH_LEVEL (10).
   * Level 5 → ×1.5 | Level 10 → ×2.0 | Level 0 → ×1.0
   * Levels above 10 no longer produce unbounded multipliers.
   */
  _depthBonus(maxLevel) {
    return 1 + (Math.min(maxLevel, this.MAX_DEPTH_LEVEL) / 10);
  },

  /**
   * Accuracy multiplier based on lives lost.
   * 0 lost → ×1.00 | 1 lost → ×0.85 | 2 lost → ×0.70 | 3 lost → ×0.55
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

  /**
   * FIX 5: Returns the average of the last 3 session scores for a game,
   * capped at COGNITIVE_CAP so it stays on the same scale as bestScore.
   * Falls back to the lifetime average when no session data exists yet.
   */
  _recentAvgScore(gameKey) {
    const arr = this.sessionScores[gameKey];
    const cap = this.COGNITIVE_CAP[gameKey] || 1;
    if (!arr.length) {
      return this._computeAverageScore(this.brainStats[gameKey] || this._defaultStat());
    }
    const raw = arr.reduce((a, b) => a + b, 0) / arr.length;
    return Math.min(raw, cap);
  },

  _defaultStat() {
    return { bestScore: 0, totalScore: 0, playCount: 0 };
  },

  _ensureStatsLoaded() {
    if (this._statsLoaded) return;

    this._statsLoaded = true;
    if (typeof localStorage === "undefined") return;

    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      const keys = ["kaleido", "jelly", "tiptoe"];
      for (const key of keys) {
        const g = parsed[key] || this._defaultStat();
        this.brainStats[key] = {
          bestScore:  Number(g.bestScore)  || 0,
          totalScore: Number(g.totalScore) || 0,
          playCount:  Number(g.playCount)  || 0,
        };
      }

      this.kaleidoRecord = max(this.kaleidoRecord, this.brainStats.kaleido.bestScore);
      this.jellyRecord   = max(this.jellyRecord,   this.brainStats.jelly.bestScore);
      this.tiptoeRecord  = max(this.tiptoeRecord,  this.brainStats.tiptoe.bestScore);
    } catch (err) {
      console.warn("Failed to load brainStats", err);
    }
  },

  _saveStats() {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.brainStats));
    } catch (err) {
      console.warn("Failed to save brainStats", err);
    }
  },

  updateStats(gameKey, newScore) {
    this._ensureStatsLoaded();

    const g         = this.brainStats[gameKey] || this._defaultStat();
    const safeScore = max(0, Number(newScore) || 0);
    const cap       = this.COGNITIVE_CAP[gameKey] || 1;
    const cappedScore  = min(safeScore, cap);
    const previousBest = g.bestScore;

    g.bestScore   = max(g.bestScore, cappedScore);
    g.totalScore += cappedScore;
    g.playCount  += 1;
    const previousBestPct = constrain((previousBest / cap) * 100, 0, 100);
    const latestPct       = constrain((cappedScore   / cap) * 100, 0, 100);
    const deltaPct        = Math.round(latestPct - previousBestPct);
    this.sessionDeltas[gameKey] = deltaPct > 0 ? "+" + deltaPct + "%" : null;

    this.brainStats[gameKey] = g;
    this._saveStats();
  },

  _computeAverageScore(g) {
    if (!g || !g.playCount) return 0;
    return g.totalScore / g.playCount;
  },

  /**
   * Composite score: 60% best, 40% recent average.
   * FIX 5: recent average now comes from _recentAvgScore (rolling 3-session
   * window) rather than the lifetime mean, so the profile reflects current
   * performance rather than diluted all-time history.
   */
  _computeScore(g, cap, gameKey) {
    const recentAvg = this._recentAvgScore(gameKey);
    const raw       = (0.6 * g.bestScore) + (0.4 * recentAvg);
    return constrain((raw / cap) * 100, 0, 100);
  },

  /**
   * Consistency: recent average relative to best score.
   * FIX 5: uses the rolling session window instead of lifetime avg, so a
   * player who has improved recently gets credit for that improvement.
   */
  _computeConsistency(g, gameKey) {
    if (!g || g.bestScore <= 0 || g.playCount <= 0) return 0;
    const recentAvg = this._recentAvgScore(gameKey);
    return constrain(recentAvg / g.bestScore, 0, 1);
  },

  getConsistencyLabel(c) {
    if (c < 0.4) return "Low";
    if (c < 0.7) return "Medium";
    return "High";
  },

  _getPerformanceLevel(scorePct) {
    if (scorePct < 35) return "Developing";
    if (scorePct < 60) return "Growing";
    if (scorePct < 80) return "Advanced";
    return "Excellent";
  },

  _getTagline(scorePct, consistency) {
    if (scorePct >= 75 && consistency >= 0.7) return "You perform consistently well with strong peak memory ability.";
    if (scorePct >= 60 && consistency >= 0.7) return "You are steadily strong and reliable across sessions.";
    if (scorePct >= 60 && consistency < 0.7)  return "You have strong peaks. Keep practicing for steadier results.";
    if (scorePct >= 35 && consistency >= 0.7) return "You are building a solid and consistent memory foundation.";
    return "You are improving. Keep playing to build both peak and consistency.";
  },

  updateRecord(gameKey, score) {
    this._ensureStatsLoaded();
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

  getCognitiveScores() {
    this._ensureStatsLoaded();

    const cap = this.COGNITIVE_CAP;
    const k   = this.brainStats.kaleido || this._defaultStat();
    const j   = this.brainStats.jelly   || this._defaultStat();
    const t   = this.brainStats.tiptoe  || this._defaultStat();
    const visual   = this._computeScore(k, cap.kaleido, "kaleido");
    const auditory = this._computeScore(j, cap.jelly,   "jelly");
    const spatial  = this._computeScore(t, cap.tiptoe,  "tiptoe");
    const visualRecentAvg   = this._recentAvgScore("kaleido");
    const auditoryRecentAvg = this._recentAvgScore("jelly");
    const spatialRecentAvg  = this._recentAvgScore("tiptoe");

    const visualAvgPct   = constrain((visualRecentAvg   / cap.kaleido) * 100, 0, 100);
    const auditoryAvgPct = constrain((auditoryRecentAvg / cap.jelly)   * 100, 0, 100);
    const spatialAvgPct  = constrain((spatialRecentAvg  / cap.tiptoe)  * 100, 0, 100);

    const visualPeakPct   = constrain((k.bestScore / cap.kaleido) * 100, 0, 100);
    const auditoryPeakPct = constrain((j.bestScore / cap.jelly)   * 100, 0, 100);
    const spatialPeakPct  = constrain((t.bestScore / cap.tiptoe)  * 100, 0, 100);

    const visualConsistency   = this._computeConsistency(k, "kaleido");
    const auditoryConsistency = this._computeConsistency(j, "jelly");
    const spatialConsistency  = this._computeConsistency(t, "tiptoe");

    return {
      visual,
      auditory,
      spatial,
      sessionVisual:   visualAvgPct,
      sessionAuditory: auditoryAvgPct,
      sessionSpatial:  spatialAvgPct,
      details: {
        kaleido: {
          finalScore:        visual,
          levelLabel:        this._getPerformanceLevel(visual),
          peakPct:           visualPeakPct,
          avgPct:            visualAvgPct,
          consistency:       visualConsistency,
          consistencyLabel:  this.getConsistencyLabel(visualConsistency),
          tagline:           this._getTagline(visual, visualConsistency),
        },
        jelly: {
          finalScore:        auditory,
          levelLabel:        this._getPerformanceLevel(auditory),
          peakPct:           auditoryPeakPct,
          avgPct:            auditoryAvgPct,
          consistency:       auditoryConsistency,
          consistencyLabel:  this.getConsistencyLabel(auditoryConsistency),
          tagline:           this._getTagline(auditory, auditoryConsistency),
        },
        tiptoe: {
          finalScore:        spatial,
          levelLabel:        this._getPerformanceLevel(spatial),
          peakPct:           spatialPeakPct,
          avgPct:            spatialAvgPct,
          consistency:       spatialConsistency,
          consistencyLabel:  this.getConsistencyLabel(spatialConsistency),
          tagline:           this._getTagline(spatial, spatialConsistency),
        },
      },
    };
  },

  /**
   * Returns a +N% delta string if the latest session beat the all-time record,
   * or null if there's no improvement to show.
   * @param {string} gameKey - "kaleido" | "jelly" | "tiptoe"
   */
  getSessionDelta(gameKey) {
    return this.sessionDeltas[gameKey] ?? null;
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

    if (this.popAnim.perfectRun) {
      fill(100, 220, 160, alpha);
    } else {
      fill(255, 195, 0, alpha);
    }

    text("+" + this.popAnim.amount + " \u2B50", this.popAnim.x, this.popAnim.y + yOff);

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

  /** Full reset (e.g. new player profile). */
  reset() {
    this.totalStars          = 0;
    this.kaleidoRecord       = 0;
    this.jellyRecord         = 0;
    this.tiptoeRecord        = 0;
    this.sessionScores       = { kaleido: [], jelly: [], tiptoe: [] };
    this.sessionDeltas       = { kaleido: null, jelly: null, tiptoe: null };
    this.brainStats          = {
      kaleido: this._defaultStat(),
      jelly:   this._defaultStat(),
      tiptoe:  this._defaultStat(),
    };
    this._saveStats();
    this.consecutiveFlawless = 0;
    this._sessionStreakStars  = 0;
    this.popAnim             = { active: false, timer: 0, amount: 0, x: 0, y: 0 };
    this.streakAnim          = { active: false, timer: 0 };
  },

  resetBrainStats() {
    this._statsLoaded  = true;
    this.kaleidoRecord = 0;
    this.jellyRecord   = 0;
    this.tiptoeRecord  = 0;
    this.sessionScores = { kaleido: [], jelly: [], tiptoe: [] };
    this.sessionDeltas = { kaleido: null, jelly: null, tiptoe: null };
    this.brainStats    = {
      kaleido: this._defaultStat(),
      jelly:   this._defaultStat(),
      tiptoe:  this._defaultStat(),
    };
    this._saveStats();
  },

  /**
   * Session reset — called automatically at the start of addStarsFromSession.
   * Also safe to call manually at the start of each game before lives are set.
   * FIX 3: now also clears _sessionStreakStars so the pop anim starts clean.
   */
  resetSession() {
    this.consecutiveFlawless = 0;
    this._sessionStreakStars  = 0;
    this.streakAnim          = { active: false, timer: 0 };
  },
};
