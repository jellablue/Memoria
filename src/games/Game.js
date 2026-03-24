
class Game {
  constructor(difficultyParams = {}) {
    this.level = 1;
    this.score = 0;
    this.lives = 3;
    this.gameState = "IDLE";
    this.difficultyParams = difficultyParams;
  }

  drawPopupCard(title, btnLabel, scoreInfo = {}) {
    fill(0, 100);
    noStroke();
    rect(0, 0, width, height);

    let cardW = 400;
    let cardH = 300;
    let cardX = width / 2;
    let cardY = height / 2;

    drawingContext.shadowBlur = 30;
    drawingContext.shadowColor = "rgba(0,0,0,0.2)";
    fill(255);
    rectMode(CENTER);
    rect(cardX, cardY, cardW, cardH, 20);
    rectMode(CORNER);
    drawingContext.shadowBlur = 0;

    fill(50);
    textSize(32);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text(title, cardX, cardY - 80);

    textSize(20);
    textStyle(NORMAL);
    if (scoreInfo.correct !== undefined) {
      fill("#2E7D32");
      text(scoreInfo.message || "Great job!", cardX, cardY - 30);
      fill(50);
      text(scoreInfo.points || "", cardX, cardY + 10);
    } else {
      text(`Final Score: ${this.score}`, cardX, cardY - 30);
      text(`Level Reached: ${this.level}`, cardX, cardY + 10);
    }

    let btnW = 220;
    let btnH = 50;
    let btnY = cardY + 80;

    if (dist(mouseX, mouseY, cardX, btnY) < btnW / 2) {
      fill("#2A3B75");
      cursor(HAND);
    } else {
      fill("#3E5296");
      cursor(ARROW);
    }

    rectMode(CENTER);
    rect(cardX, btnY, btnW, btnH, 25);
    rectMode(CORNER);

    fill(255);
    textSize(20);
    textStyle(BOLD);
    text(btnLabel, cardX, btnY);
    textStyle(NORMAL);
  }

  drawHUD() {
    noStroke();
    textSize(24);

    textAlign(LEFT, BOTTOM);
    fill(PALETTE.text || 50);
    let hudX = 30;
    let hudY = height - 30;
    text("Lives: " + "❤️".repeat(this.lives), hudX, hudY - 70);
    text("Level: " + this.level, hudX, hudY - 40);
    text("Score: " + this.score, hudX, hudY - 10);
  }

  handlePopupClick(clickHandler) {
    let cardX = width / 2;
    let cardY = height / 2;
    let btnY = cardY + 80;
    let btnW = 220;
    let btnH = 50;

    if (
      mouseX > cardX - btnW / 2 &&
      mouseX < cardX + btnW / 2 &&
      mouseY > btnY - btnH / 2 &&
      mouseY < btnY + btnH / 2
    ) {
      clickHandler();
    }
  }

  restartGame() {
    this.level = 1;
    this.score = 0;
    this.lives = 3;
  }
}
