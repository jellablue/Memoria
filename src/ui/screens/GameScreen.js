// ============================================
// GAME SCREEN
// ============================================

class GameScreen {
  constructor(gameType) {
    this.gameType = gameType;
    this.game = gameState.getGameInstance(gameType);
    this.instructionOverlay = null;

    if (gameState.showInstructions) {
      this.instructionOverlay = new InstructionOverlay(
        gameState.currentInstructionKey
      );
    }
  }

  draw() {
    // Set background color based on game
    if (this.gameType === "GAME_A") {
      background("#E6F0FF");
    } else if (this.gameType === "GAME_B") {
      background("#FFF5E6");
    } else if (this.gameType === "GAME_C") {
      background("#F0FFF0");
    }

    // Draw game
    if (this.game && !gameState.showInstructions) {
      this.game.draw();
    }

    // Draw back button
    this.drawBackButton();

    // Draw instruction overlay if active
    if (gameState.showInstructions && this.instructionOverlay) {
      this.instructionOverlay.draw();
    }
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
    text("MENU", 22, 25);
    pop();
  }

  handleClick() {
    // Back button
    if (mouseX > 10 && mouseX < 70 && mouseY > 10 && mouseY < 40) {
      gameState.setScreen(GAME_STATES.MENU);
      gameState.hideGameInstructions();
      return true;
    }

    // Instruction overlay button
    if (gameState.showInstructions && this.instructionOverlay) {
      if (this.instructionOverlay.isButtonClicked()) {
        gameState.hideGameInstructions();
        
        // Reset game when instructions close
        if (this.gameType === "GAME_A" && gameState.games.kaleido) {
          gameState.games.kaleido = new KaleidoPop(gameState.difficultyParams);
        } else if (this.gameType === "GAME_B" && gameState.games.jelly) {
          gameState.games.jelly = new JellyJams(gameState.difficultyParams);
          gameState.games.jelly.startGame();
        } else if (this.gameType === "GAME_C" && gameState.games.tiptoe) {
          gameState.games.tiptoe = new TiptoeTrails(gameState.difficultyParams);
        }
        
        this.game = gameState.getGameInstance(this.gameType);
        return true;
      }
      return false;
    }

    // Game click handling
    if (this.game) {
      if (this.gameType === "GAME_A" && this.game.checkClick) {
        this.game.checkClick();
      } else if (this.gameType === "GAME_B" && this.game.checkClick) {
        this.game.checkClick();
      } else if (
        this.gameType === "GAME_C" &&
        this.game.handleMouseClick
      ) {
        this.game.handleMouseClick();
      }
    }

    return true;
  }

  handleKeyPress(keyCode) {
    if (
      keyCode === ENTER &&
      this.gameType === "GAME_A" &&
      this.game &&
      this.game.gameState === "INPUT"
    ) {
      this.game.submitAnswer();
    }
  }

  windowResized() {
    // Games can handle their own resizing in draw()
  }
}
