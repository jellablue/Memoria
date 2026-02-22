// ============================================
// AGE SELECTION SCREEN
// ============================================

class AgeSelectionScreen {
  constructor() {
    this.ageCards = [];
    this.initCards();
  }

  initCards() {
    let btnY = height / 2;
    let btnW = 200;
    let gap = 30;
    let totalW = btnW * 3 + gap * 2;
    let startX = (width - totalW) / 2 + btnW / 2;

    this.ageCards = [
      new AgeCard(startX, btnY, "JUNIOR", "Age 5-12", "#A0EACD"),
      new AgeCard(startX + btnW + gap, btnY, "ADULT", "Age 13-59", "#B5CDF5"),
      new AgeCard(
        startX + (btnW + gap) * 2,
        btnY,
        "SENIOR",
        "Age 60+",
        "#F6C0D9"
      ),
    ];
  }

  draw() {
    fill(50);
    textSize(32);
    text("Welcome to Memoria!", width / 2, height / 4 - 40);
    textSize(20);
    fill(100);
    text(
      "Select your age group to personalize your brain training:",
      width / 2,
      height / 4
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
    push();
    fill(255);
    stroke(200);
    strokeWeight(1);
    rect(10, 10, 60, 30, 5);
    fill(100);
    noStroke();
    textSize(12);
    textStyle(NORMAL);
    textAlign(LEFT, CENTER);
    text("BACK", 18, 25);
    pop();
  }

  handleClick() {
    // Check back button
    if (mouseX > 10 && mouseX < 70 && mouseY > 10 && mouseY < 40) {
      gameState.setScreen(GAME_STATES.WELCOME);
      return true;
    }

    // Check age cards
    for (let i = 0; i < this.ageCards.length; i++) {
      if (this.ageCards[i].isClicked()) {
        const categories = ["JUNIOR", "ADULT", "SENIOR"];
        gameState.setAgeGroup(categories[i]);
        gameState.initializeGames();
        gameState.setScreen(GAME_STATES.MENU);
        if (audioManager) audioManager.playSound("petal");
        return true;
      }
    }
    return false;
  }

  windowResized() {
    this.initCards();
  }
}
