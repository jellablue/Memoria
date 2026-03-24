class GameScreen {
  constructor(gameType) {
    this.gameType = gameType;
    this.game = gameState.getGameInstance(gameType);
    this.instructionOverlay = null;

    this.summaryCard    = null;
    this._scoreReported = false;
    this.showExitConfirm = false;

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
    this.showExitConfirm = false;

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
    this.showExitConfirm = false;
  }

  _backButtonHit() {
    let cx = max(40, width * 0.05);
    let cy = max(40, height * 0.06);
    return dist(mouseX, mouseY, cx, cy) < 24;
  }

  _confirmBounds() {
    const cardW = min(width * 0.86, 560);
    const cardH = 300;
    const cx = width / 2;
    const cy = height / 2;
    const btnW = 180;
    const btnH = 50;
    const gap = 26;

    return {
      cardW,
      cardH,
      cx,
      cy,
      stayBtn: {
        x: cx - gap / 2 - btnW,
        y: cy + 86,
        w: btnW,
        h: btnH,
      },
      leaveBtn: {
        x: cx + gap / 2,
        y: cy + 86,
        w: btnW,
        h: btnH,
      },
    };
  }

  _inRect(b) {
    return mouseX >= b.x && mouseX <= b.x + b.w && mouseY >= b.y && mouseY <= b.y + b.h;
  }

  _drawExitConfirmation() {
    const b = this._confirmBounds();
    const stayHover = this._inRect(b.stayBtn);
    const leaveHover = this._inRect(b.leaveBtn);

    push();
    fill(0, 140);
    noStroke();
    rect(0, 0, width, height);

    drawingContext.shadowBlur = 28;
    drawingContext.shadowColor = "rgba(0,0,0,0.2)";
    fill(255);
    rectMode(CENTER);
    rect(b.cx, b.cy, b.cardW, b.cardH, 20);
    rectMode(CORNER);
    drawingContext.shadowBlur = 0;

    textAlign(CENTER, CENTER);
    fill(PALETTE?.purple || "#9B5DE5");
    textStyle(BOLD);
    textSize(30);
    text("Leave This Game?", b.cx, b.cy - 80);

    fill(95);
    textStyle(NORMAL);
    textSize(18);
    text("If you leave now, this run will not be recorded.", b.cx, b.cy - 28);
    text("Go back to menu anyway?", b.cx, b.cy);

    fill(stayHover ? "#E8EDF5" : "#F3F5F9");
    rect(b.stayBtn.x, b.stayBtn.y, b.stayBtn.w, b.stayBtn.h, 14);
    fill(85);
    textStyle(BOLD);
    textSize(17);
    text("Stay", b.stayBtn.x + b.stayBtn.w / 2, b.stayBtn.y + b.stayBtn.h / 2 + 1);

    fill(leaveHover ? (PALETTE?.pink || "#FFB7B2") : "#F6D3CF");
    rect(b.leaveBtn.x, b.leaveBtn.y, b.leaveBtn.w, b.leaveBtn.h, 14);
    fill(95);
    textStyle(BOLD);
    textSize(17);
    text("Leave", b.leaveBtn.x + b.leaveBtn.w / 2, b.leaveBtn.y + b.leaveBtn.h / 2 + 1);

    if (stayHover || leaveHover) cursor(HAND);
    pop();
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

    if (this.showExitConfirm) {
      this._drawExitConfirmation();
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

    if (hover && !this.summaryCard && !this.instructionOverlay && !this.showExitConfirm) {
        cursor(HAND);
    }
  }

  handleClick() {
    if (this.showExitConfirm) {
      const b = this._confirmBounds();
      if (this._inRect(b.stayBtn)) {
        if (typeof audioManager !== 'undefined') audioManager.playSound("petal");
        this.showExitConfirm = false;
      } else if (this._inRect(b.leaveBtn)) {
        if (typeof audioManager !== 'undefined') audioManager.playSound("petal");
        this.showExitConfirm = false;
        if (typeof audioManager !== 'undefined') audioManager.playBackgroundMusic("menu");
        gameState.setScreen(GAME_STATES.MENU);
        gameState.hideGameInstructions();
      }
      return true;
    }

    if (this.summaryCard) {
      if (this.summaryCard.isPlayAgainClicked && this.summaryCard.isPlayAgainClicked()) {
        if (typeof audioManager !== 'undefined') audioManager.playSound("petal");
        this._restartGame();
        return true;
      }
      if (this.summaryCard.isMenuClicked && this.summaryCard.isMenuClicked()) {
        if (typeof audioManager !== 'undefined') audioManager.playSound("petal");
        this.summaryCard = null;
        this._scoreReported = false;
        if (typeof audioManager !== 'undefined') audioManager.playBackgroundMusic("menu");
        gameState.setScreen(GAME_STATES.MENU);
        gameState.hideGameInstructions();
        return true;
      }
      return true;
    }

    if (this._backButtonHit()) {
      if (gameState.showInstructions && this.instructionOverlay) {
        if (typeof audioManager !== 'undefined') audioManager.playSound("petal");
        if (typeof audioManager !== 'undefined') audioManager.playBackgroundMusic("menu");
        gameState.setScreen(GAME_STATES.MENU);
        gameState.hideGameInstructions();
      } else {
        if (typeof audioManager !== 'undefined') audioManager.playSound("petal");
        this.showExitConfirm = true;
      }
      return true;
    }

    if (gameState.showInstructions && this.instructionOverlay) {
      if (this.instructionOverlay.isButtonClicked && this.instructionOverlay.isButtonClicked()) {
        if (typeof audioManager !== 'undefined') audioManager.playSound("petal");
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
