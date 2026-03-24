class MenuScreen {
  constructor() {
    this.menuButtons = [];
    this.layout = {};
    this._lastW = -1;
    this._lastH = -1;

    this.backBtnScale = 1.0;
    this.profileBtnScale = 1.0;

    this.initButtons();
  }

  _getStarCardMetrics() {
    // FIXED: Increased breakpoint to 1100px. 
    // This ensures that when the buttons are dead-center, the StarBank 
    // card won't overlap them on medium-sized screens (like tablets).
    const isNarrow = width < 1100; 
    
    const pad = constrain(width * 0.02, 10, 24);
    const cardW = constrain(width * (isNarrow ? 0.8 : 0.25), 260, 320); // Slightly refined max-width
    const cardH = constrain(height * 0.35, 240, 280);

    // On narrow screens, it anchors to the bottom center. On wide screens, top right.
    const x = isNarrow ? (width / 2 - cardW / 2) : (width - cardW - pad);
    const y = isNarrow ? (height - cardH - pad) : pad;

    return { pad, cardW, cardH, x, y, isNarrow };
  }

  _syncLayout() {
    if (this._lastW === width && this._lastH === height) return;

    const base = min(width, height);
    const m = this._getStarCardMetrics();

    const btnW = constrain(width * 0.36, 260, 380);
    const btnH = constrain(height * 0.12, 76, 96);
    const gap = constrain(height * 0.03, 16, 26);

    // FIXED: Unconditionally set the buttons and title to the dead center of the screen
    const centerX = width / 2;

    this.layout = {
      btnW,
      btnH,
      gap,
      centerX,
      titleY: height * 0.18,
      subtitleY: height * 0.26,
      // Shift buttons slightly up on mobile to avoid hitting the StarBank card
      startY: m.isNarrow ? height * 0.32 : height * 0.36, 
      titleSize: constrain(base * 0.08, 38, 72),
      subtitleSize: constrain(base * 0.04, 20, 36),
    };

    this._lastW = width;
    this._lastH = height;
    this.initButtons();
  }

  initButtons() {
    if (!this.layout.btnW) this._syncLayout();

    let { btnW, btnH, gap, startY, centerX } = this.layout;

    this.menuButtons = [
      new MenuButton(
        centerX, startY, btnW, btnH,
        "Kaleido-Pop", PALETTE?.pink || "#FFB7B2", "GAME_A",
        "Pattern memory and visual matching"
      ),
      new MenuButton(
        centerX, startY + btnH + gap, btnW, btnH,
        "Jelly Jams", PALETTE?.blue || "#B5CDF5", "GAME_B",
        "Sound sequence recall and rhythm focus"
      ),
      new MenuButton(
        centerX, startY + (btnH + gap) * 2, btnW, btnH,
        "Tiptoe Trails", PALETTE?.green || "#A0EACD", "GAME_C",
        "Path memory and spatial navigation"
      ),
    ];
  }

  draw() {
    this._syncLayout();

    cursor(ARROW);

    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = "rgba(255, 255, 255, 0.7)";
    fill(PALETTE?.text || 60);
    textSize(this.layout.titleSize);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text("Choose an Activity", this.layout.centerX, this.layout.titleY);
    drawingContext.shadowBlur = 0;

    textSize(this.layout.subtitleSize);
    fill(120);
    textStyle(NORMAL);
    text("Train your brain with Blu!", this.layout.centerX, this.layout.subtitleY);

    for (let btn of this.menuButtons) {
      if (btn.display) btn.display();
    }

    this.drawStarBank();
    this.drawBackButton();
  }

  _brainBtnBounds() {
    const m = this._getStarCardMetrics();
    return {
      x: m.x + m.cardW * 0.05,
      y: m.y + m.cardH * 0.8,
      w: m.cardW * 0.9,
      h: m.cardH * 0.15,
    };
  }

  _isHoverBrainBtn() {
    const b = this._brainBtnBounds();
    return mouseX > b.x && mouseX < b.x + b.w &&
           mouseY > b.y && mouseY < b.y + b.h;
  }

  drawStarBank() {
    const m = this._getStarCardMetrics();

    let floatY = sin(frameCount * 0.03) * 4;

    push();
    translate(0, floatY);

    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = "rgba(0,0,0,0.1)";
    fill(255, 220);
    stroke(255);
    strokeWeight(2);
    rect(m.x, m.y, m.cardW, m.cardH, 20);
    drawingContext.shadowBlur = 0;
    noStroke();

    const rowY = m.y + m.cardH * 0.15;
    textAlign(LEFT, CENTER);
    textStyle(BOLD);
    textSize(constrain(m.cardW * 0.1, 24, 34));
    fill("#E6A817");
    text("⭐", m.x + m.cardW * 0.08, rowY + m.cardH * 0.02);

    textSize(constrain(m.cardW * 0.09, 20, 28));
    fill(60);
    text(typeof starBank !== 'undefined' ? starBank.totalStars : "0", m.x + m.cardW * 0.25, rowY);

    textSize(constrain(m.cardW * 0.05, 12, 16));
    textStyle(NORMAL);
    fill(120);
    text("total stars", m.x + m.cardW * 0.25, rowY + m.cardH * 0.09);

    const badgeY = rowY + m.cardH * 0.22;
    const badgeW = m.cardW * 0.84;
    const badgeX = m.x + m.cardW * 0.08;

    fill(typeof starBank !== 'undefined' ? starBank.getLevelBadgeColor() : PALETTE?.pink || '#FFB7B2');
    rect(badgeX, badgeY - m.cardH * 0.05, badgeW, m.cardH * 0.12, 12);

    fill(60);
    textSize(constrain(m.cardW * 0.05, 12, 16));
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text(typeof starBank !== 'undefined' ? starBank.getLevel() : "Level 1", badgeX + badgeW / 2, badgeY + m.cardH * 0.01);

    const records = [
      { label: "🌸 Kaleido", val: typeof starBank !== 'undefined' ? starBank.kaleidoRecord : 0 },
      { label: "🎵 Jelly",   val: typeof starBank !== 'undefined' ? starBank.jellyRecord : 0 },
      { label: "👣 Tiptoe",  val: typeof starBank !== 'undefined' ? starBank.tiptoeRecord : 0 },
    ];

    const recStartY = badgeY + m.cardH * 0.15;
    const colW = m.cardW / 3;

    for (let i = 0; i < records.length; i++) {
      const rx = m.x + i * colW + colW / 2;
      fill(140);
      textStyle(NORMAL);
      textSize(constrain(m.cardW * 0.045, 11, 14));
      text(records[i].label, rx, recStartY);

      fill(80);
      textStyle(BOLD);
      textSize(constrain(m.cardW * 0.06, 14, 18));
      text(records[i].val, rx, recStartY + m.cardH * 0.08);
    }

    stroke(230);
    strokeWeight(2);
    strokeCap(ROUND);
    let lineY = m.y + m.cardH * 0.72;
    line(m.x + m.cardW * 0.08, lineY, m.x + m.cardW * 0.92, lineY);
    noStroke();

    const b = this._brainBtnBounds();
    const hoverB = this._isHoverBrainBtn();

    this.profileBtnScale = lerp(this.profileBtnScale, hoverB ? 1.05 : 1.0, 0.2);

    push();
    translate(b.x + b.w / 2, b.y + b.h / 2);
    scale(this.profileBtnScale);

    fill(hoverB ? (PALETTE?.purple || "#9B5DE5") : "#F0F0F5");
    rectMode(CENTER);
    rect(0, 0, b.w, b.h, 12);

    fill(hoverB ? 255 : (PALETTE?.purple || "#9B5DE5"));
    textSize(constrain(m.cardW * 0.045, 12, 15));
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text("\uD83E\uDDE0 View Brain Profile \u2192", 0, 0);
    pop();

    if (hoverB) cursor(HAND);
    pop();
  }

  drawBackButton() {
    let cx = max(40, width * 0.05);
    let cy = max(40, height * 0.06);
    let r = 24;
    let hover = dist(mouseX, mouseY, cx, cy) < r;

    this.backBtnScale = lerp(this.backBtnScale, hover ? 1.15 : 1.0, 0.2);

    push();
    translate(cx, cy);
    scale(this.backBtnScale);

    drawingContext.shadowBlur = hover ? 15 : 5;
    drawingContext.shadowColor = 'rgba(0,0,0,0.15)';
    noStroke();
    fill(255);
    circle(0, 0, r * 2);
    drawingContext.shadowBlur = 0;

    stroke(hover ? (PALETTE?.pink || '#FFB7B2') : 100);
    strokeWeight(4);
    strokeCap(ROUND);
    strokeJoin(ROUND);
    noFill();

    beginShape();
    vertex(4, -8);
    vertex(-4, 0);
    vertex(4, 8);
    endShape();
    pop();

    if (hover) cursor(HAND);
  }

  handleClick() {
    let cx = max(40, width * 0.05);
    let cy = max(40, height * 0.06);

    if (dist(mouseX, mouseY, cx, cy) < 24) {
      gameState.setScreen(GAME_STATES.AGE_SELECT);
      if (typeof audioManager !== 'undefined') audioManager.playSound("petal");
      return true;
    }

    for (let btn of this.menuButtons) {
      if (btn.isClicked && btn.isClicked()) {
       if (typeof audioManager !== 'undefined') {
        audioManager.playSound("petal");
        
        if (btn.action === "GAME_A") audioManager.playBackgroundMusic("kaleido");
        if (btn.action === "GAME_B") audioManager.playBackgroundMusic("jelly");
        if (btn.action === "GAME_C") audioManager.playBackgroundMusic("tiptoe");
      }

        gameState.showGameInstructions(btn.action);
        uiManager.requestTransition(btn.action);
        return true;
      }
    }

    if (this._isHoverBrainBtn()) {
      if (typeof audioManager !== 'undefined') audioManager.playSound("petal");
      gameState.setScreen(GAME_STATES.RESULTS);
      return true;
    }

    return false;
  }

  windowResized() {
    this._lastW = -1;
    this._lastH = -1;
    this._syncLayout();
  }
}