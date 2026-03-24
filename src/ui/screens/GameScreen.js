class GameScreen {
  constructor(gameType) {
    this.gameType = gameType;
    this.game = gameState.getGameInstance(gameType);
    this.instructionOverlay = null;

    this.summaryCard    = null;
    this._scoreReported = false;

    this.backBtnScale = 1.0;

    if (gameState.showInstructions) {
      this.instructionOverlay = new InstructionOverlay(gameState.currentInstructionKey);
    }
  }


  _createGameInstance() {
    let newGame = null;
    if (this.gameType === "GAME_A") newGame = new KaleidoPop(gameState.difficultyParams);
    else if (this.gameType === "GAME_B") newGame = new JellyJams(gameState.difficultyParams);
    else if (this.gameType === "GAME_C") newGame = new TiptoeTrails(gameState.difficultyParams);

    if (newGame) {
      gameState.setGameInstance(this.gameType, newGame);
      this.game = newGame;
    }
  }

  _resetGameInstance() {
    if (!this.game) this._createGameInstance();
    if (!this.game) return;

    if (typeof starBank !== 'undefined' && starBank.resetSession) {
      starBank.resetSession();
    }

    if (this.gameType === "GAME_A" && this.game.restartGame) this.game.restartGame();
    else if (this.gameType === "GAME_B" && this.game.startGame) this.game.startGame();
    else if (this.gameType === "GAME_C" && this.game.restartGame) this.game.restartGame();
  }

  prepareForEntry() {
    this.game = gameState.getGameInstance(this.gameType);
    this._resetGameInstance();
    this.summaryCard = null;
    this._scoreReported = false;

    if (gameState.showInstructions) {
      this.instructionOverlay = new InstructionOverlay(gameState.currentInstructionKey);
    } else {
      this.instructionOverlay = null;
    }
  }

  _getGameKey() {
    if (this.gameType === "GAME_A") return "kaleido";
    if (this.gameType === "GAME_B") return "jelly";
    if (this.gameType === "GAME_C") return "tiptoe";
    return "unknown";
  }

  _getSessionScore() {
    if (!this.game) return 0;
    return (this.game.totalScore !== undefined) ? this.game.totalScore : (this.game.score || 0);
  }

  _getSessionMaxLevel() {
    if (!this.game || this.game.level === undefined) return 1;
    return this.game.level;
  }

  _getSessionLivesLost() {
    if (!this.game || this.game.lives === undefined) return 0;
    return Math.max(0, 3 - this.game.lives);
  }

  _checkAndCreateSummaryCard() {
    if (this.game && this.game.gameState === "GAMEOVER" && !this.summaryCard && !this._scoreReported) {
      const sessionScore = this._getSessionScore();
      const maxLevel     = this._getSessionMaxLevel();
      const livesLost    = this._getSessionLivesLost();
      const gameKey      = this._getGameKey();
      try {
        let starsEarned = sessionScore;
        if (typeof starBank !== 'undefined') {
          starsEarned = starBank.addStarsFromSession(sessionScore, maxLevel, livesLost, gameKey);
          starBank.updateRecord(gameKey, sessionScore);
        }
        this.summaryCard = new SummaryCard(gameKey, sessionScore, starsEarned);
        this._scoreReported = true;
      } catch (err) {
        console.error("[GameScreen] Failed to create SummaryCard", err);
      }
    }
  }

  _restartGame() {
    this._resetGameInstance();
    this.summaryCard    = null;
    this._scoreReported = false;
  }

  draw() {
    if (this.gameType === "GAME_A") background("#F4F7FB");
    else if (this.gameType === "GAME_B") background("#FFF9F2");
    else if (this.gameType === "GAME_C") background("#F2FCF5");

    cursor(ARROW);

    if (this.game && !gameState.showInstructions) {
      this.game.draw();
    }

    this.drawBackButton();

    if (gameState.showInstructions && this.instructionOverlay) {
      this.instructionOverlay.draw();
    }

    this._checkAndCreateSummaryCard();

    if (this.summaryCard) {
      this.summaryCard.draw();
    }
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

    if (hover && !this.summaryCard && !this.instructionOverlay) {
        cursor(HAND);
    }
  }

  handleClick() {
    if (this.summaryCard) {
      if (this.summaryCard.isPlayAgainClicked && this.summaryCard.isPlayAgainClicked()) {
        this._restartGame();
        return true;
      }
      if (this.summaryCard.isMenuClicked && this.summaryCard.isMenuClicked()) {
        this.summaryCard = null;
        this._scoreReported = false;
        gameState.setScreen(GAME_STATES.MENU);
        gameState.hideGameInstructions();
        return true;
      }
      return true;
    }

    let cx = max(40, width * 0.05);
    let cy = max(40, height * 0.06);
    if (dist(mouseX, mouseY, cx, cy) < 24) {
      gameState.setScreen(GAME_STATES.MENU);
      gameState.hideGameInstructions();
      return true;
    }

    if (gameState.showInstructions && this.instructionOverlay) {
      if (this.instructionOverlay.isButtonClicked && this.instructionOverlay.isButtonClicked()) {
        gameState.hideGameInstructions();
        this._resetGameInstance();
        this.game = gameState.getGameInstance(this.gameType);
        this.instructionOverlay = null;
        return true;
      }
      return false;
    }

    if (this.game) {
      if (this.gameType === "GAME_A" && this.game.checkClick) this.game.checkClick();
      else if (this.gameType === "GAME_B" && this.game.checkClick) this.game.checkClick();
      else if (this.gameType === "GAME_C" && this.game.handleMouseClick) this.game.handleMouseClick();

      this._checkAndCreateSummaryCard();
    }
    return true;
  }

  handleKeyPress(keyCode) {
    if (this.summaryCard) return;

    if (keyCode === ENTER && this.gameType === "GAME_A" && this.game && this.game.gameState === "INPUT") {
      this.game.submitAnswer();
      this._checkAndCreateSummaryCard();
    }
  }
}
