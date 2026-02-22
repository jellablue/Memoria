// ============================================
// MENU SCREEN
// ============================================

class MenuScreen {
  constructor() {
    this.menuButtons = [];
    this.initButtons();
  }

  initButtons() {
    let btnW = 260;
    let btnH = 70;
    let startY = height / 2 + 20;

    this.menuButtons = [
      new MenuButton(
        width / 2,
        startY + 50,
        btnW,
        btnH,
        "Kaleido-Pop",
        PALETTE.pink,
        "GAME_A"
      ),
      new MenuButton(
        width / 2,
        startY + 140,
        btnW,
        btnH,
        "Jelly Jams",
        PALETTE.blue,
        "GAME_B"
      ),
      new MenuButton(
        width / 2,
        startY + 230,
        btnW,
        btnH,
        "Tiptoe Trails",
        PALETTE.green,
        "GAME_C"
      ),
      new MenuButton(
        width / 2,
        startY + 320,
        btnW,
        btnH,
        "My Brain Profile",
        "#E0E0E0",
        "RESULTS"
      ),
    ];
  }

  draw() {
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = "rgba(255, 255, 255, 0.8)";

    fill(255);
    textSize(38);
    textStyle(BOLD);
    text("Memoria", width / 2, height / 2 - 180);

    textSize(64);
    fill(PALETTE.purple);
    stroke(255);
    strokeWeight(4);
    text("Blu's Wonderland", width / 2, height / 2 - 90);

    drawingContext.shadowBlur = 0;
    noStroke();

    for (let btn of this.menuButtons) {
      btn.display();
    }

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
      gameState.setScreen(GAME_STATES.AGE_SELECT);
      return true;
    }

    // Check menu buttons
    for (let btn of this.menuButtons) {
      if (btn.isClicked()) {
        if (btn.action === "GAME_A") {
          gameState.showGameInstructions("GAME_A");
          gameState.setScreen(GAME_STATES.GAME_A);
        } else if (btn.action === "GAME_B") {
          gameState.showGameInstructions("GAME_B");
          gameState.setScreen(GAME_STATES.GAME_B);
        } else if (btn.action === "GAME_C") {
          gameState.showGameInstructions("GAME_C");
          gameState.setScreen(GAME_STATES.GAME_C);
        } else if (btn.action === "RESULTS") {
          gameState.setScreen(GAME_STATES.RESULTS);
        }
        if (audioManager) audioManager.playSound("petal");
        return true;
      }
    }
    return false;
  }

  windowResized() {
    this.initButtons();
  }
}
