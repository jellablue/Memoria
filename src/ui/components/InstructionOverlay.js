// ============================================
// INSTRUCTION OVERLAY COMPONENT
// ============================================

class InstructionOverlay {
  constructor(gameKey) {
    this.gameKey = gameKey;
    this.info = GAME_INSTRUCTIONS[gameKey];
    this.boxW = 600;
    this.boxH = 400;
    this.btnW = 200;
    this.btnH = 50;
  }

  draw() {
    // Dim background
    fill(0, 150);
    rect(0, 0, width, height);

    // White modal box
    let boxX = (width - this.boxW) / 2;
    let boxY = (height - this.boxH) / 2;

    fill(255);
    stroke(200);
    strokeWeight(2);
    rect(boxX, boxY, this.boxW, this.boxH, 20);

    // Title
    noStroke();
    fill(PALETTE.purple || "#B39EB5");
    textSize(32);
    textStyle(BOLD);
    textAlign(CENTER, TOP);
    text(this.info.title, width / 2, boxY + 30);

    // Steps
    fill(50);
    textSize(20);
    textStyle(NORMAL);
    textAlign(LEFT, TOP);
    let stepStartY = boxY + 90;
    for (let i = 0; i < this.info.steps.length; i++) {
      text(this.info.steps[i], boxX + 40, stepStartY + i * 40);
    }

    // Scientific context
    fill(100);
    textSize(16);
    textStyle(ITALIC);
    textAlign(CENTER, TOP);
    text(this.info.science, width / 2, boxY + this.boxH - 100);

    // START BUTTON
    this.drawButton(boxX, boxY);
  }

  drawButton(boxX, boxY) {
    let btnX = width / 2 - this.btnW / 2;
    let btnY = boxY + this.boxH - 70;

    if (
      mouseX > btnX &&
      mouseX < btnX + this.btnW &&
      mouseY > btnY &&
      mouseY < btnY + this.btnH
    ) {
      fill(PALETTE.green || "#C1E1C1");
      cursor(HAND);
    } else {
      fill(PALETTE.blue || "#AEC6CF");
      cursor(ARROW);
    }

    rect(btnX, btnY, this.btnW, this.btnH, 10);

    fill(255);
    textSize(24);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text("START PLAYING", width / 2, btnY + this.btnH / 2 + 2);
  }

  isButtonClicked() {
    let btnX = width / 2 - this.btnW / 2;
    let btnY = height / 2 + this.boxH / 2 - 70;

    return (
      mouseX > btnX &&
      mouseX < btnX + this.btnW &&
      mouseY > btnY &&
      mouseY < btnY + this.btnH
    );
  }
}
