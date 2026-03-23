
class SummaryCard {
  constructor(gameKey, sessionScore) {
    this.gameKey      = gameKey;
    this.sessionScore = sessionScore;

    this.animProgress = 0;
    this.animFrames   = 24;
    this.startOffsetY = max(height * 0.9, 520);
    this.animComplete = false;

    this.CARD_W = 500;
    this.CARD_H = 450;
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

    console.error("[SummaryCard] " + section + " failed", {
      error: err,
      gameKey: this.gameKey,
      sessionScore: this.sessionScore,
      offsetY: this._getOffsetY(),
      ...extra,
    });
  }

  _drawFallbackCard(cx, cy) {
    fill(255);
    noStroke();
    rectMode(CENTER);
    rect(cx, cy, 420, 240, 22);
    rectMode(CORNER);

    fill(60);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(30);
    text("Session Complete", cx, cy - 42);

    textStyle(NORMAL);
    textSize(18);
    text("Score: " + this.sessionScore, cx, cy + 2);

    textSize(14);
    fill(120);
    text("SummaryCard fallback active", cx, cy + 36);
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
    const cardW = constrain(width * 0.84, 320, this.CARD_W);
    const cardH = constrain(height * 0.78, 340, this.CARD_H);
    const statGap = cardH * 0.12;
    const btnW = constrain(cardW * 0.36, 130, 190);
    const btnH = constrain(cardH * 0.11, 38, 48);
    const btnGapX = cardW * 0.24;

    return {
      cardW,
      cardH,
      titleY: -cardH * 0.41,
      gameY: -cardH * 0.34,
      dividerTopY: -cardH * 0.30,
      row1Y: -cardH * 0.22,
      row2Y: -cardH * 0.22 + statGap,
      row3Y: -cardH * 0.22 + statGap * 2,
      dividerBottomY: -cardH * 0.01,
      badgeY: cardH * 0.18,
      btnY: cardH * 0.37,
      btn1X: -btnGapX,
      btn2X: btnGapX,
      btnW,
      btnH,
      lineHalf: cardW * 0.41,
      statsLeftX: -cardW * 0.40,
      statsRightX: cardW * 0.40,
      badgeW: constrain(cardW * 0.50, 180, 250),
      badgeH: constrain(cardH * 0.10, 36, 46),
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

      fill(0, 165);
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

        drawingContext.shadowBlur = 24;
        drawingContext.shadowColor = "rgba(0,0,0,0.22)";
        fill(255);
        noStroke();
        rectMode(CENTER);
        rect(0, 0, metrics.cardW, metrics.cardH, 28);
        rectMode(CORNER);
        drawingContext.shadowBlur = 0;

        textAlign(CENTER, CENTER);
        fill(PALETTE.purple);
        textStyle(BOLD);
        textSize(constrain(metrics.cardW * 0.06, 22, 30));
        text("Session Complete!", 0, metrics.titleY);

        fill(130);
        textStyle(NORMAL);
        textSize(constrain(metrics.cardW * 0.034, 14, 17));
        text(this._NAMES[this.gameKey] || "Game Over", 0, metrics.gameY);

        stroke(220);
        strokeWeight(1);
        line(-metrics.lineHalf, metrics.dividerTopY, metrics.lineHalf, metrics.dividerTopY);
        noStroke();

        this._statRow(0, metrics.row1Y, "Stars Earned", "+" + this.sessionScore, "#E6A817", metrics);

        const recordKey = this.gameKey + "Record";
        const record = starBank[recordKey] || 0;
        const isNewRecord = record > 0 && this.sessionScore >= record;
        this._statRow(
          0,
          metrics.row2Y,
          "Best Score",
          isNewRecord ? record + "  NEW!" : String(record),
          isNewRecord ? "#2E7D32" : "#999",
          metrics
        );

        this._statRow(0, metrics.row3Y, "Grand Total", starBank.totalStars + " stars", PALETTE.purple, metrics);

        stroke(220);
        strokeWeight(1);
        line(-metrics.lineHalf, metrics.dividerBottomY, metrics.lineHalf, metrics.dividerBottomY);
        noStroke();

        const badgeY = metrics.badgeY;
        fill(starBank.getLevelBadgeColor());
        rectMode(CENTER);
        rect(0, badgeY, metrics.badgeW, metrics.badgeH, 23);
        rectMode(CORNER);
        fill(60);
        textStyle(BOLD);
        textSize(constrain(metrics.cardW * 0.036, 14, 18));
        text(starBank.getLevel(), 0, badgeY);

        const btnY = metrics.btnY;
        const btn1X = metrics.btn1X;
        const btn2X = metrics.btn2X;
        const h1 = this._isHover(btn1X, btnY, metrics.btnW, metrics.btnH, offsetY);
        const h2 = this._isHover(btn2X, btnY, metrics.btnW, metrics.btnH, offsetY);

        fill(h1 ? "#2A3B75" : "#3E5296");
        noStroke();
        rectMode(CENTER);
        rect(btn1X, btnY, metrics.btnW, metrics.btnH, metrics.btnH / 2);
        rectMode(CORNER);
        fill(255);
        textSize(constrain(metrics.cardW * 0.032, 12, 16));
        textStyle(BOLD);
        text("PLAY AGAIN", btn1X, btnY);

        fill(h2 ? "#555" : "#9E9E9E");
        noStroke();
        rectMode(CENTER);
        rect(btn2X, btnY, metrics.btnW, metrics.btnH, metrics.btnH / 2);
        rectMode(CORNER);
        fill(255);
        textSize(constrain(metrics.cardW * 0.032, 12, 16));
        textStyle(BOLD);
        text("MAIN MENU", btn2X, btnY);

        if (h1 || h2) cursor(HAND);
        else cursor(ARROW);
      } catch (err) {
        this._logError("draw card content", err);
        this._drawFallbackCard(cx, cy);
      } finally {
        pop();
      }

      try {
        starBank.drawPopAnim();
      } catch (err) {
        this._logError("draw pop animation", err);
      }
    } catch (err) {
      this._logError("draw root", err);
    } finally {
      pop();
    }
  }

  isPlayAgainClicked() {
    const m = this._lastMetrics || this._getMetrics();
    const btnY = height / 2 + m.btnY + this._getOffsetY();
    const btn1X = width / 2 + m.btn1X;
    return this._hitTest(btn1X, btnY, m.btnW, m.btnH);
  }

  isMenuClicked() {
    const m = this._lastMetrics || this._getMetrics();
    const btnY = height / 2 + m.btnY + this._getOffsetY();
    const btn2X = width / 2 + m.btn2X;
    return this._hitTest(btn2X, btnY, m.btnW, m.btnH);
  }

  _statRow(cx, y, label, value, valueColor, metrics) {
    noStroke();
    fill(100);
    textSize(constrain(metrics.cardW * 0.032, 12, 16));
    textStyle(NORMAL);
    textAlign(LEFT, CENTER);
    text(label, cx + metrics.statsLeftX, y);

    fill(valueColor || PALETTE.text || "#5D5D5D");
    textSize(constrain(metrics.cardW * 0.032, 12, 16));
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
