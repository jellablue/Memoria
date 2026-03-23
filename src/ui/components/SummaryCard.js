// ============================================
// SUMMARY CARD — End-of-game sliding panel
// ============================================
//
// Uses p5.js translate() to animate the card sliding up from below the
// screen into center view when a game session ends.

class SummaryCard {
  constructor(gameKey, sessionScore) {
    this.gameKey      = gameKey;      // "kaleido" | "jelly" | "tiptoe"
    this.sessionScore = sessionScore;

    // Slide animation: cardOffsetY starts far below and lerps to 0.
    // translate(0, cardOffsetY) shifts the whole card.
    this.cardOffsetY  = height + 500;
    this.targetOffset = 0;
    this.animComplete = false;

    // Card dimensions
    this.CARD_W = 500;
    this.CARD_H = 450;

    // Map game keys to display names
    this._NAMES = {
      kaleido: "Kaleido-Pop",
      jelly:   "Jelly Jams",
      tiptoe:  "Tiptoe Trails",
    };

    // Avoid flooding the console with identical per-frame errors.
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
      cardOffsetY: this.cardOffsetY,
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

  // ------------------------------------------
  // Update the slide animation each frame
  // ------------------------------------------
  update() {
    this.cardOffsetY = lerp(this.cardOffsetY, this.targetOffset, 0.10);
    if (abs(this.cardOffsetY - this.targetOffset) < 0.5) {
      this.cardOffsetY  = this.targetOffset;
      this.animComplete = true;
    }
  }

  // ------------------------------------------
  // Draw the full summary card
  // ------------------------------------------
  draw() {
    this.update();

    // Guard against transform/blend-state leakage from active game draw calls.
    push();
    try {
      resetMatrix();
      blendMode(BLEND);
      rectMode(CORNER);

      // Dim background
      fill(0, 165);
      noStroke();
      rect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // --- Apply slide transform ---
      push();
      try {
        translate(0, this.cardOffsetY);

        drawingContext.shadowBlur = 50;
        drawingContext.shadowColor = "rgba(0,0,0,0.22)";
        fill(255);
        noStroke();
        rectMode(CENTER);
        rect(cx, cy, this.CARD_W, this.CARD_H, 28);
        rectMode(CORNER);
        drawingContext.shadowBlur = 0;

        textAlign(CENTER, CENTER);
        fill(PALETTE.purple);
        textSize(30);
        textStyle(BOLD);
        text("Session Complete! \uD83C\uDF89", cx, cy - 188);

        fill(130);
        textSize(17);
        textStyle(NORMAL);
        text(this._NAMES[this.gameKey] || "Game Over", cx, cy - 155);

        stroke(220);
        strokeWeight(1);
        line(cx - 205, cy - 134, cx + 205, cy - 134);
        noStroke();

        const row1 = cy - 100;
        this._statRow(cx, row1, "\u2B50 Stars Earned", "+" + this.sessionScore, "#E6A817");

        const recordKey = this.gameKey + "Record";
        const record = starBank[recordKey] || 0;
        const isNewRecord = record > 0 && this.sessionScore >= record;
        this._statRow(
          cx,
          row1 + 54,
          "\uD83C\uDFC6 Best Score",
          isNewRecord ? record + "  \u2605 NEW!" : String(record),
          isNewRecord ? "#2E7D32" : "#999"
        );

        this._statRow(cx, row1 + 108, "\uD83D\uDCAB Grand Total", starBank.totalStars + " stars", PALETTE.purple);

        stroke(220);
        strokeWeight(1);
        line(cx - 205, cy + 42, cx + 205, cy + 42);
        noStroke();

        const badgeY = cy + 82;
        fill(starBank.getLevelBadgeColor());
        noStroke();
        rectMode(CENTER);
        rect(cx, badgeY, 250, 46, 23);
        rectMode(CORNER);
        fill(60);
        textSize(18);
        textStyle(BOLD);
        textAlign(CENTER, CENTER);
        text(starBank.getLevel(), cx, badgeY);

        const btnY = cy + 168;
        const btn1X = cx - 118;
        const btn2X = cx + 118;
        const h1 = this._isHover(btn1X, btnY, 190, 48);
        const h2 = this._isHover(btn2X, btnY, 190, 48);

        fill(h1 ? "#2A3B75" : "#3E5296");
        noStroke();
        rectMode(CENTER);
        rect(btn1X, btnY, 190, 48, 24);
        rectMode(CORNER);
        fill(255);
        textSize(16);
        textStyle(BOLD);
        textAlign(CENTER, CENTER);
        text("PLAY AGAIN", btn1X, btnY);

        fill(h2 ? "#555" : "#9E9E9E");
        noStroke();
        rectMode(CENTER);
        rect(btn2X, btnY, 190, 48, 24);
        rectMode(CORNER);
        fill(255);
        textSize(16);
        textStyle(BOLD);
        textAlign(CENTER, CENTER);
        text("MAIN MENU", btn2X, btnY);

        if (h1 || h2) cursor(HAND);
        else cursor(ARROW);
      } catch (err) {
        this._logError("draw card content", err);
        this._drawFallbackCard(cx, cy);
      } finally {
        pop(); // end translate
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

  // ------------------------------------------
  // Click detection (compensates for translate)
  // ------------------------------------------
  isPlayAgainClicked() {
    const btnY  = height / 2 + 168 + this.cardOffsetY;
    const btn1X = width  / 2 - 118;
    return this._hitTest(btn1X, btnY, 190, 48);
  }

  isMenuClicked() {
    const btnY  = height / 2 + 168 + this.cardOffsetY;
    const btn2X = width  / 2 + 118;
    return this._hitTest(btn2X, btnY, 190, 48);
  }

  // ------------------------------------------
  // Helpers
  // ------------------------------------------
  _statRow(cx, y, label, value, valueColor) {
    noStroke();
    fill(100);
    textSize(16);
    textStyle(NORMAL);
    textAlign(LEFT, CENTER);
    text(label, cx - 200, y);

    fill(valueColor || PALETTE.text || "#5D5D5D");
    textSize(16);
    textStyle(BOLD);
    textAlign(RIGHT, CENTER);
    text(value, cx + 200, y);
  }

  // Hover check accounts for the live cardOffsetY shift
  _isHover(btnX, localBtnY, w, h) {
    const screenY = localBtnY + this.cardOffsetY;
    return (
      mouseX > btnX - w / 2 && mouseX < btnX + w / 2 &&
      mouseY > screenY - h / 2 && mouseY < screenY + h / 2
    );
  }

  // Hit-test uses actual screen coords (already shifted)
  _hitTest(btnX, screenY, w, h) {
    return (
      mouseX > btnX - w / 2 && mouseX < btnX + w / 2 &&
      mouseY > screenY - h / 2 && mouseY < screenY + h / 2
    );
  }
}
