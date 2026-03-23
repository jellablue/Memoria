// ============================================
// AGE SELECTION SCREEN
// ============================================

class AgeSelectionScreen {
  constructor() {
    this.ageCards = [];
    this.initCards();
  }

  initCards() {
    // EDIT HERE: Move all cards up/down by changing this Y position.
    let btnY = height / 2;
    // EDIT HERE: Change this to make all age cards wider/narrower in the layout.
    let btnW = 250;
    // EDIT HERE: Change spacing between cards.
    let gap = 60;
    let totalW = btnW * 3 + gap * 2;
    let startX = (width - totalW) / 2 + btnW / 2;

    this.ageCards = [
      // EDIT HERE: Update title/subtitle/color for each age card.
      new AgeCard(startX, btnY, "Explorer", "Age 5-12", "#A0EACD"),
      new AgeCard(startX + btnW + gap, btnY, "Adventurer", "Age 13-59", "#B5CDF5"),
      new AgeCard( startX + (btnW + gap) * 2, btnY, "Master", "Age 60+", "#F6C0D9" ),
    ];
  }

  draw() {
    fill(100);
    // EDIT HERE: Change the main heading text and size for this screen.
    textSize(60);
    text("Welcome to Memoria!", width / 2, height / 4 - 40);
    // EDIT HERE: Change subtitle text and style.
    textSize(20);
    fill(100);
    text(
      "Where will your memory journey begin?",
      width / 2,
      height / 4 + 10
    );

    rectMode(CENTER);
    for (let card of this.ageCards) {
      card.display();
    }
    rectMode(CORNER);

    // Back Button
    this.drawBackButton();
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
      gameState.setScreen(GAME_STATES.WELCOME);
      return true;
    }

    // Check age cards
    for (let i = 0; i < this.ageCards.length; i++) {
      if (this.ageCards[i].isClicked()) {
        // EDIT HERE: Re-map cards to different age-group keys if needed.
        const categories = ["JUNIOR", "ADULT", "SENIOR"];
        gameState.setAgeGroup(categories[i]);
        gameState.initializeGames();
        if (audioManager) audioManager.playSound("petal");
        uiManager.requestTransition(GAME_STATES.MENU);
        return true;
      }
    }
    return false;
  }

  windowResized() {
    this.initCards();
  }
}
