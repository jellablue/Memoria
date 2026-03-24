class SummaryCard {
  constructor(gameKey, sessionScore, starsEarned) {
    this.gameKey      = gameKey;
    this.sessionScore = sessionScore;
    this.starsEarned  = (starsEarned !== undefined) ? starsEarned : sessionScore;

    this.animProgress = 0;
    this.animFrames   = 24;
    this.startOffsetY = max(height * 0.9, 520);
    this.animComplete = false;
    
    // Button hover animations
    this.btn1Scale = 1.0;
    this.btn2Scale = 1.0;

    this.CARD_W = constrain(width * 0.85, 340, 480);
    this.CARD_H = 460; // Fixed height prevents text overlap
    this._lastMetrics = null;

    this._NAMES = {
      kaleido: "Kaleido-Pop",
      jelly:   "Jelly Jams",
      tiptoe:  "Tiptoe Trails",
    };

    this._loggedErrors = new Set();
  }

  _logError(section, err, extra = {}) {
    const message = err && err.message ? err.message : String(err);
    const key = section + "::" + message;
    if (this._loggedErrors.has(key)) return;
    this._loggedErrors.add(key);
    console.error("[SummaryCard] " + section + " failed", { error: err, ...extra });
  }

  _easeOutCubic(t) {
    const p = constrain(t, 0, 1);
    return 1 - pow(1 - p, 3);
  }

  _getOffsetY() {
    const eased = this._easeOutCubic(this.animProgress);
    return (1 - eased) * this.startOffsetY;
  }

  _getMetrics() {
    const cardW = this.CARD_W;
    const cardH = this.CARD_H;
    
    const btnW = constrain(cardW * 0.4, 140, 200);
    const btnH = 50;
    const btnGapX = cardW * 0.23;

    return {
      cardW, cardH,
      titleY: -165,
      gameY: -130,
      dividerTopY: -95,
      
      row1Y: -50,
      row2Y: -5,
      row3Y: 40,
      
      dividerBottomY: 85,
      badgeY: 130,
      
      btnY: 190,
      btn1X: -btnGapX,
      btn2X: btnGapX,
      btnW, btnH,
      
      lineHalf: cardW * 0.40,
      statsLeftX: -cardW * 0.38,
      statsRightX: cardW * 0.38,
      
      badgeW: constrain(cardW * 0.6, 200, 280),
      badgeH: 42,
    };
  }

  update() {
    this.animProgress = min(1, this.animProgress + 1 / this.animFrames);
    if (this.animProgress >= 1) {
      this.animComplete = true;
    }
  }

  draw() {
    this.update();

    push();
    try {
      resetMatrix();
      blendMode(BLEND);
      rectMode(CORNER);

      fill(0, 150 * this._easeOutCubic(this.animProgress)); 
      noStroke();
      rect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const metrics = this._getMetrics();
      this._lastMetrics = metrics;
      const offsetY = this._getOffsetY();

      push();
      try {
        translate(cx, cy + offsetY);

        // Main Card 
        drawingContext.shadowBlur = 30;
        drawingContext.shadowColor = "rgba(0,0,0,0.2)";
        fill(255);
        noStroke();
        rectMode(CENTER);
        rect(0, 0, metrics.cardW, metrics.cardH, 25);
        rectMode(CORNER);
        drawingContext.shadowBlur = 0; // Reset shadows

        // 2. Headers
        textAlign(CENTER, CENTER);
        fill(PALETTE?.purple || "#9B5DE5");
        textStyle(BOLD);
        textSize(28);
        text("Session Complete!", 0, metrics.titleY);

        fill(130);
        textStyle(NORMAL);
        textSize(16);
        text(this._NAMES[this.gameKey] || "Game Over", 0, metrics.gameY);

        // Top Divider
        stroke(230);
        strokeWeight(2);
        strokeCap(ROUND);
        line(-metrics.lineHalf, metrics.dividerTopY, metrics.lineHalf, metrics.dividerTopY);

        // Stat Rows (with cute icons)
        const recordKey = this.gameKey + "Record";
        const record = (typeof starBank !== 'undefined') ? (starBank[recordKey] || 0) : 0;
        const isNewRecord = record > 0 && this.sessionScore >= record;
        const totalStars = (typeof starBank !== 'undefined') ? starBank.totalStars : 0;

        this._statRow(0, metrics.row1Y, "⭐ Stars Earned", "+" + this.starsEarned, "#E6A817", metrics);
        this._statRow(
          0, metrics.row2Y, "🏆 Best Score", 
          isNewRecord ? record + "  NEW!" : String(record),
          isNewRecord ? (PALETTE?.green || "#5DC98A") : "#999", 
          metrics
        );
        this._statRow(0, metrics.row3Y, "🌟 Grand Total", totalStars + " stars", PALETTE?.purple || "#9B5DE5", metrics);

        // Bottom Divider
        stroke(230);
        strokeWeight(2);
        line(-metrics.lineHalf, metrics.dividerBottomY, metrics.lineHalf, metrics.dividerBottomY);
        noStroke();

        // Level Badge
        const badgeY = metrics.badgeY;
        fill(typeof starBank !== 'undefined' ? starBank.getLevelBadgeColor() : "#FFB7B2");
        rectMode(CENTER);
        rect(0, badgeY, metrics.badgeW, metrics.badgeH, 20);
        rectMode(CORNER);
        
        fill(60);
        textStyle(BOLD);
        textSize(16);
        text(typeof starBank !== 'undefined' ? starBank.getLevel() : "Level 1", 0, badgeY + 1);

        // Interactive Buttons
        const h1 = this._isHover(metrics.btn1X, metrics.btnY, metrics.btnW, metrics.btnH, offsetY);
        const h2 = this._isHover(metrics.btn2X, metrics.btnY, metrics.btnW, metrics.btnH, offsetY);

        this.btn1Scale = lerp(this.btn1Scale, h1 ? 1.08 : 1.0, 0.2);
        this.btn2Scale = lerp(this.btn2Scale, h2 ? 1.08 : 1.0, 0.2);

        // Play Again Button
        push();
        translate(metrics.btn1X, metrics.btnY);
        scale(this.btn1Scale);
        drawingContext.shadowBlur = h1 ? 15 : 5;
        drawingContext.shadowColor = "rgba(0,0,0,0.15)";
        fill(h1 ? (PALETTE?.green || "#A0EACD") : (PALETTE?.blue || "#5BACE0"));
        rectMode(CENTER);
        rect(0, 0, metrics.btnW, metrics.btnH, 25);
        drawingContext.shadowBlur = 0;
        fill(h1 ? 255 : 250);
        textSize(15);
        textStyle(BOLD);
        text("PLAY AGAIN", 0, 1);
        pop();

        // Main Menu Button
        push();
        translate(metrics.btn2X, metrics.btnY);
        scale(this.btn2Scale);
        drawingContext.shadowBlur = h2 ? 15 : 5;
        drawingContext.shadowColor = "rgba(0,0,0,0.15)";
        fill(h2 ? "#D0D5E0" : "#E8EAF6"); // Soft grey
        rectMode(CENTER);
        rect(0, 0, metrics.btnW, metrics.btnH, 25);
        drawingContext.shadowBlur = 0;
        fill(100);
        textSize(15);
        textStyle(BOLD);
        text("MAIN MENU", 0, 1);
        pop();

        if (h1 || h2) cursor(HAND);
        

      } catch (err) {
        this._logError("draw card content", err);
      } finally {
        pop();
      }

    } catch (err) {
      this._logError("draw root", err);
    } finally {
      pop();
    }
  }

  isPlayAgainClicked() {
    if (this.animProgress < 0.9) return false;
    const m = this._lastMetrics || this._getMetrics();
    const btnY = height / 2 + m.btnY + this._getOffsetY();
    const btn1X = width / 2 + m.btn1X;
    return this._hitTest(btn1X, btnY, m.btnW, m.btnH);
  }

  isMenuClicked() {
    if (this.animProgress < 0.9) return false;
    const m = this._lastMetrics || this._getMetrics();
    const btnY = height / 2 + m.btnY + this._getOffsetY();
    const btn2X = width / 2 + m.btn2X;
    return this._hitTest(btn2X, btnY, m.btnW, m.btnH);
  }

  _statRow(cx, y, label, value, valueColor, metrics) {
    noStroke();
    
    // Left Label
    fill(100);
    textSize(18);
    textStyle(BOLD);
    textAlign(LEFT, CENTER);
    text(label, cx + metrics.statsLeftX, y);

    // Right Value
    fill(valueColor || PALETTE?.text || "#5D5D5D");
    textSize(18);
    textStyle(BOLD);
    textAlign(RIGHT, CENTER);
    text(value, cx + metrics.statsRightX, y);
  }

  _isHover(localBtnX, localBtnY, w, h, offsetY) {
    const screenX = width / 2 + localBtnX;
    const screenY = height / 2 + localBtnY + offsetY;
    return (
      mouseX > screenX - w / 2 && mouseX < screenX + w / 2 &&
      mouseY > screenY - h / 2 && mouseY < screenY + h / 2
    );
  }

  _hitTest(btnX, screenY, w, h) {
    return (
      mouseX > btnX - w / 2 && mouseX < btnX + w / 2 &&
      mouseY > screenY - h / 2 && mouseY < screenY + h / 2
    );
  }
}