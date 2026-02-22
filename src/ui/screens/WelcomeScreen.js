// ============================================
// WELCOME SCREEN
// ============================================

class WelcomeScreen {
  constructor() {
    this.startBtnHover = false;
  }

  draw() {
    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = "white";
    fill(255);
    textSize(40);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text("Welcome to Memoria!", width / 2, height / 3 - 40);
    drawingContext.shadowBlur = 0;

    fill(PALETTE.text);
    textSize(28);
    textStyle(NORMAL);
    text("Blu's Wonderland", width / 2, height / 3 + 10);

    // Floating Blu
    let floatY = sin(frameCount * 0.05) * 10;
    push();
    translate(width / 2, height / 2 - 20 + floatY);

    noStroke();
    fill(50, 100, 255);
    ellipse(0, 0, 80, 80);

    fill(255);
    ellipse(-15, -10, 25, 25);
    ellipse(15, -10, 25, 25);
    fill(0);
    ellipse(-15, -10, 10, 10);
    ellipse(15, -10, 10, 10);

    noFill();
    stroke(0);
    strokeWeight(3);
    arc(0, 10, 20, 10, 0, PI);
    pop();

    // START BUTTON
    this.drawStartButton();
  }

  drawStartButton() {
    let btnW = 200;
    let btnH = 60;
    let btnX = width / 2 - btnW / 2;
    let btnY = height * 0.75;

    if (
      mouseX > btnX &&
      mouseX < btnX + btnW &&
      mouseY > btnY &&
      mouseY < btnY + btnH
    ) {
      this.startBtnHover = true;
      cursor(HAND);
      fill(PALETTE.green);
      rect(btnX - 2, btnY - 2, btnW + 4, btnH + 4, 20);
    } else {
      this.startBtnHover = false;
      cursor(ARROW);
      fill(PALETTE.blue);
    }

    stroke(255);
    strokeWeight(3);
    rect(btnX, btnY, btnW, btnH, 20);

    noStroke();
    fill(255);
    textSize(24);
    textStyle(BOLD);
    text("START GAME", width / 2, btnY + btnH / 2 + 2);
  }

  handleClick() {
    let btnW = 200;
    let btnH = 60;
    let btnX = width / 2 - btnW / 2;
    let btnY = height * 0.75;

    if (
      mouseX > btnX &&
      mouseX < btnX + btnW &&
      mouseY > btnY &&
      mouseY < btnY + btnH
    ) {
      gameState.setScreen(GAME_STATES.AGE_SELECT);
      if (audioManager) audioManager.playSound("petal");
      return true;
    }
    return false;
  }
}
