class MenuScreen {
  constructor() {
    this.menuButtons = [];
    this.initButtons();
  }

  initButtons() {
    let btnW = 280;
    let btnH = 70;
    let startY = height / 2 + 10;

    this.menuButtons = [
      new MenuButton(
        width / 2,
        startY + 10,
        btnW,
        btnH,
        "Kaleido-Pop",
        PALETTE.pink,
        "GAME_A"
      ),
      new MenuButton(
        width / 2,
        startY + 100,
        btnW,
        btnH,
        "Jelly Jams",
        PALETTE.blue,
        "GAME_B"
      ),
      new MenuButton(
        width / 2,
        startY + 190,
        btnW,
        btnH,
        "Tiptoe Trails",
        PALETTE.green,
        "GAME_C"
      ),
    ];
  }

  draw() {
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = "rgba(255, 255, 255, 0.8)";

  // TITLE: TO BE CHANGED    
    fill(255);
    textSize(80);
    textStyle(BOLD);
    text("Memoria", width / 2, height / 2 - 180);

    textSize(50);
    fill(PALETTE.purple);
    stroke(255);
    strokeWeight(4);
    text("Blu's Wonderland", width / 2, height / 2 - 110);

    drawingContext.shadowBlur = 0;
    noStroke();

    for (let btn of this.menuButtons) {
      btn.display();
    }

    this.drawBackButton();
    this.drawStarBank();
  }

  // ── Bounds of the "Brain Profile" button inside the StarBank card ──
  _brainBtnBounds() {
    const PAD = 16, CARD_W = 300;
    const x   = width - CARD_W - PAD;
    return { x: x + 14, y: PAD + 182, w: CARD_W - 28, h: 32 };
  }

  _isHoverBrainBtn() {
    const b = this._brainBtnBounds();
    return mouseX > b.x && mouseX < b.x + b.w &&
           mouseY > b.y && mouseY < b.y + b.h;
  }

  drawStarBank() {
    const PAD    = 16;
    const CARD_W = 330;
    const CARD_H = 260;         
    const x      = width - CARD_W - PAD;   // top-right corner
    const y      = PAD;

    // Card shadow + body
    push();
    drawingContext.shadowBlur  = 18;
    drawingContext.shadowColor = "rgba(0,0,0,0.14)";
    fill(255, 150);
    
    rect(x, y, CARD_W, CARD_H, 16);
    drawingContext.shadowBlur = 0;

    // ── Grand total row ──
    const rowY = y + 28;
    textAlign(LEFT, CENTER);
    textStyle(BOLD);
    textSize(30);
    fill("#E6A817");
    text("⭐", x + 14, rowY + 10);

    textSize(25);
    fill(60);
    text(starBank.totalStars, x + 60, rowY);

    textSize(18);
    textStyle(NORMAL);
    fill(140);
    text("total stars", x + 60, rowY + 22);

    // ── Level badge ──
    const badgeY = rowY + 55;
    const badgeW = CARD_W - 28;
    fill(starBank.getLevelBadgeColor());
    noStroke();
    rect(x + 14, badgeY - 13, badgeW, 26, 13);
    fill(60);
    textSize(18);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text(starBank.getLevel(), x + 14 + badgeW / 2, badgeY);

    // ── Per-game records ──
    const records = [
      { label: "🌸Kaleido", val: starBank.kaleidoRecord },
      { label: "🎵Jelly",   val: starBank.jellyRecord   },
      { label: "👣Tiptoe",  val: starBank.tiptoeRecord  },
    ];

    const recStartY = badgeY + 22;
    const colW      = CARD_W / 3;

    textSize(16);
    textStyle(NORMAL);

    for (let i = 0; i < records.length; i++) {
      const rx = x + i * colW + colW / 2;

      fill(140);
      textAlign(CENTER, CENTER);
      text(records[i].label, rx, recStartY + 12);

      fill(60);
      textStyle(BOLD);
      textSize(18);
      text(records[i].val, rx, recStartY + 35);
      textStyle(NORMAL);
      textSize(16);
    }

    // ── Divider ──
    stroke(220);
    strokeWeight(1);
    line(x + 14, y + 171, x + CARD_W - 14, y + 171);
    noStroke();

    // ── Brain Profile button ──
    const b      = this._brainBtnBounds();
    const hoverB = this._isHoverBrainBtn();
    fill(hoverB ? PALETTE.purple : "#EDE8F0");
    noStroke();
    rect(b.x, b.y, b.w, b.h, 16);
    fill(hoverB ? 255 : PALETTE.purple);
    textSize(13);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text("\uD83E\uDDE0  View Brain Profile  \u2192", x + CARD_W / 2, b.y + b.h / 2);

    if (hoverB) cursor(HAND);

    pop();
  }

  drawBackButton() {
    let cx = 35, cy = 35, r = 22;
    let hover = dist(mouseX, mouseY, cx, cy) < r;
    push();
    drawingContext.shadowBlur = hover ? 14 : 4;
    drawingContext.shadowColor = 'rgba(0,0,0,0.25)';
    noStroke();
    fill(255, hover ? 230 : 180);
    circle(cx, cy, r * 2);
    drawingContext.shadowBlur = 0;
    stroke(80);
    strokeWeight(2.5);
    strokeCap(ROUND);
    noFill();
    beginShape();
    vertex(cx + 6, cy - 9);
    vertex(cx - 6, cy);
    vertex(cx + 6, cy + 9);
    endShape();
    if (hover) cursor(HAND); else cursor(ARROW);
    pop();
  }

  handleClick() {
    // Check back button
    if (dist(mouseX, mouseY, 35, 35) < 22) {
      gameState.setScreen(GAME_STATES.AGE_SELECT);
      return true;
    }

    // Check menu buttons
    for (let btn of this.menuButtons) {
      if (btn.isClicked()) {
        if (btn.action === "GAME_A") {
          gameState.showGameInstructions("GAME_A");
          if (audioManager) audioManager.playSound("petal");
          uiManager.requestTransition(GAME_STATES.GAME_A);
        } else if (btn.action === "GAME_B") {
          gameState.showGameInstructions("GAME_B");
          if (audioManager) audioManager.playSound("petal");
          uiManager.requestTransition(GAME_STATES.GAME_B);
        } else if (btn.action === "GAME_C") {
          gameState.showGameInstructions("GAME_C");
          if (audioManager) audioManager.playSound("petal");
          uiManager.requestTransition(GAME_STATES.GAME_C);
        }
        return true;
      }
    }

    // Brain Profile button inside the StarBank card
    if (this._isHoverBrainBtn()) {
      if (audioManager) audioManager.playSound("petal");
      gameState.setScreen(GAME_STATES.RESULTS);
      return true;
    }

    return false;
  }

  windowResized() {
    this.initButtons();
  }
}
