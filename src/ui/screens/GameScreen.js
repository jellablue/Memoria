class GameScreen {
  constructor(gameType) {
    this.gameType = gameType;
    this.game = gameState.getGameInstance(gameType);
    this.instructionOverlay = null;

    // SummaryCard state
    this.summaryCard    = null;
    this._scoreReported = false;

    if (gameState.showInstructions) {
      this.instructionOverlay = new InstructionOverlay(
        gameState.currentInstructionKey
      );
    }
  }

  // Map GAME_X enum → starBank key
  _getGameKey() {
    if (this.gameType === "GAME_A") return "kaleido";
    if (this.gameType === "GAME_B") return "jelly";
    if (this.gameType === "GAME_C") return "tiptoe";
    return "unknown";
  }

  // KaleidoPop uses `totalScore`; Jelly + Tiptoe use `score`
  _getSessionScore() {
    if (!this.game) return 0;
    return (this.game.totalScore !== undefined)
      ? this.game.totalScore
      : (this.game.score || 0);
  }

  // Create summaryCard immediately when GAMEOVER is detected.
  // Called synchronously after every game input (click or key) so the card
  // is ready before any follow-up click can re-enter the game's own handler.
  _checkAndCreateSummaryCard() {
    if (
      this.game &&
      this.game.gameState === "GAMEOVER" &&
      !this.summaryCard &&
      !this._scoreReported
    ) {
      const sessionScore = this._getSessionScore();
      const gameKey      = this._getGameKey();
      try {
        // Create the card first; only mark/report score after successful creation.
        this.summaryCard = new SummaryCard(gameKey, sessionScore);
        starBank.addStars(sessionScore);
        starBank.updateRecord(gameKey, sessionScore);
        this._scoreReported = true;
      } catch (err) {
        console.error("[GameScreen] Failed to create SummaryCard", {
          error: err,
          gameType: this.gameType,
          gameKey,
          sessionScore,
        });
        this.summaryCard = null;
        this._scoreReported = false;
      }
    }
  }

  // Reset the current game and clear summary state
  _restartGame() {
    if (this.gameType === "GAME_A") {
      gameState.games.kaleido = new KaleidoPop(gameState.difficultyParams);
      this.game = gameState.games.kaleido;
    } else if (this.gameType === "GAME_B") {
      gameState.games.jelly = new JellyJams(gameState.difficultyParams);
      gameState.games.jelly.startGame();
      this.game = gameState.games.jelly;
    } else if (this.gameType === "GAME_C") {
      gameState.games.tiptoe = new TiptoeTrails(gameState.difficultyParams);
      this.game = gameState.games.tiptoe;
    }
    this.summaryCard    = null;
    this._scoreReported = false;
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

    // --- SUMMARY CARD ---
    // Detect first GAMEOVER frame, commit score to starBank, then slide card in.
    this._checkAndCreateSummaryCard();

    // Draw the sliding summary card on top of everything
    if (this.summaryCard) {
      this.summaryCard.draw();
    }
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
    // --- Summary card takes full click priority ---
    if (this.summaryCard) {
      if (this.summaryCard.isPlayAgainClicked()) {
        this._restartGame();
        return true;
      }
      if (this.summaryCard.isMenuClicked()) {
        this.summaryCard    = null;
        this._scoreReported = false;
        gameState.setScreen(GAME_STATES.MENU);
        gameState.hideGameInstructions();
        return true;
      }
      return true; // swallow all other clicks while card is open
    }

    // Back button
    if (dist(mouseX, mouseY, 35, 35) < 22) {
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
      // Immediately create summaryCard if this click just caused GAMEOVER.
      // This prevents a rapid follow-up click from reaching the game's own
      // restartGame() before draw() has had a chance to create the card.
      this._checkAndCreateSummaryCard();
    }

    return true;
  }

  handleKeyPress(keyCode) {
    // Block input while summary card is visible
    if (this.summaryCard) return;

    if (
      keyCode === ENTER &&
      this.gameType === "GAME_A" &&
      this.game &&
      this.game.gameState === "INPUT"
    ) {
      this.game.submitAnswer();
      // ENTER may have just triggered GAMEOVER; create the card immediately
      // so the very next click is intercepted regardless of draw() timing.
      this._checkAndCreateSummaryCard();
    }
  }

  windowResized() {
    // Games can handle their own resizing in draw()
  }
}
