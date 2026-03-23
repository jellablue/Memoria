
class AgeSelectionScreen {
  constructor() {
    this.ageCards = [];
    this._lastW = -1;
    this._lastH = -1;

    this.backBtnScale = 1.0;

    this.initCards();
  }

  initCards() {
    const isNarrow = width < 980;
    const cardW = constrain(width * (isNarrow ? 0.62 : 0.23), 190, 280);
    const cardH = constrain(height * (isNarrow ? 0.22 : 0.34), 170, 280);

    if (isNarrow) {
      const centerX = width / 2;
      const startY = height * 0.40;
      const gapY = cardH + constrain(height * 0.025, 14, 24);

      this.ageCards = [
        new AgeCard(centerX, startY, "Explorer", "Age 5-12", PALETTE?.green || "#A0EACD", cardW, cardH),
        new AgeCard(centerX, startY + gapY, "Adventurer", "Age 13-59", PALETTE?.blue || "#B5CDF5", cardW, cardH),
        new AgeCard(centerX, startY + gapY * 2, "Master", "Age 60+", PALETTE?.pink || "#F6C0D9", cardW, cardH),
      ];
    } else {
      const gap = constrain(width * 0.04, 30, 80);
      const totalW = cardW * 3 + gap * 2;
      const y = height * 0.58;
      const startX = (width - totalW) / 2 + cardW / 2;

      this.ageCards = [
        new AgeCard(startX, y, "Explorer", "Age 5-12", PALETTE?.green || "#A0EACD", cardW, cardH),
        new AgeCard(startX + cardW + gap, y, "Adventurer", "Age 13-59", PALETTE?.blue || "#B5CDF5", cardW, cardH),
        new AgeCard(startX + (cardW + gap) * 2, y, "Master", "Age 60+", PALETTE?.pink || "#F6C0D9", cardW, cardH),
      ];
    }

    this._lastW = width;
    this._lastH = height;
  }

  _syncLayout() {
    if (this._lastW !== width || this._lastH !== height) {
      this.initCards();
    }
  }

  draw() {
    this._syncLayout();

    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = "rgba(255, 255, 255, 0.8)";
    fill(PALETTE?.text || 60);
    textSize(constrain(min(width, height) * 0.075, 34, 54));
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text("Who is playing today?", width / 2, height * 0.18);
    drawingContext.shadowBlur = 0;

    textSize(constrain(min(width, height) * 0.03, 16, 22));
    fill(120);
    textStyle(NORMAL);
    text(
      "Select an age group to tailor your Wonderland experience.",
      width / 2,
      height * 0.25
    );

    rectMode(CENTER);
    for (let card of this.ageCards) {
      card.display();
    }
    rectMode(CORNER);

    this.drawBackButton();
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

    if (hover) {
      cursor(HAND);
    }
  }

  handleClick() {
    let cx = max(40, width * 0.05);
    let cy = max(40, height * 0.06);

    if (dist(mouseX, mouseY, cx, cy) < 24) {
      gameState.setScreen(GAME_STATES.WELCOME);
      if (typeof audioManager !== 'undefined') audioManager.playSound("petal");
      return true;
    }

    for (let i = 0; i < this.ageCards.length; i++) {
      if (this.ageCards[i].isClicked()) {
        const categories = ["JUNIOR", "ADULT", "SENIOR"];
        gameState.setAgeGroup(categories[i]);
        gameState.initializeGames();

        if (typeof audioManager !== 'undefined') audioManager.playSound("petal");

        uiManager.requestTransition(GAME_STATES.MENU);
        return true;
      }
    }
    return false;
  }

  windowResized() {
    this._lastW = -1;
    this._lastH = -1;
    this.initCards();
  }
}
