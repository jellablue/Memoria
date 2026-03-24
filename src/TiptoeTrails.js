class TiptoeTrails extends Game {
  constructor(difficultyParams = {}) {
    super(difficultyParams);
    this.gameState = "PREVIEW";
    this.level = 1;
    this.score = 0;
    this.lives = 3;

    this.gridCols = 4;
    this.gridRows = 4;

    this.previewTimer = 0;
    this.stepInterval = 40;

    this.tileSize = 60;
    this.gap = 10;
    this.offsetX = 0;
    this.offsetY = 0;

    this.path = [];
    this.playerPath = [];
    this.tiles = [];

    this._lastW = -1;
    this._lastH = -1;

    this.flashTimer = 0;

    this.setupLevel();
  }

  setupLevel() {
    let startSize = this.difficultyParams.tiptoeGrid || 4;
    let baseSpeed = this.difficultyParams.tiptoeSpeed || 40;

    let growth = floor((this.level - 1) / 3);
    this.gridCols = min(startSize + growth, 8);
    this.gridRows = min(startSize + growth, 8);

    this.stepInterval = max(10, baseSpeed - (this.level * 2));

    this.generatePath();
    this.gameState = "PREVIEW";
    this.previewTimer = 0;
    this.playerPath = [];

    this._lastW = -1;
  }

  generatePath() {
    this.path = [];
    let currentX = floor(random(this.gridCols));
    let currentY = this.gridRows - 1;

    this.path.push({ x: currentX, y: currentY });

    while (currentY > 0) {
      let moves = [];
      moves.push({ x: 0, y: -1 });
      if (currentX > 0) moves.push({ x: -1, y: 0 });
      if (currentX < this.gridCols - 1) moves.push({ x: 1, y: 0 });

      let move = random(moves);
      currentX += move.x;
      currentY += move.y;

      let alreadyVisited = this.path.some(p => p.x === currentX && p.y === currentY);
      if (!alreadyVisited) {
        this.path.push({ x: currentX, y: currentY });
      }
    }
  }

  _syncLayout() {
    if (this._lastW !== width || this._lastH !== height) {
      let playCenterX = width / 2;
      let playCenterY = height * 0.52;

      let maxGridDim = max(this.gridCols, this.gridRows);

      let availableSpace = min(width * 0.5, height * 0.6);
      this.tileSize = constrain(availableSpace / maxGridDim, 40, 85);

      let totalW = (this.gridCols * this.tileSize) + ((this.gridCols - 1) * this.gap);
      let totalH = (this.gridRows * this.tileSize) + ((this.gridRows - 1) * this.gap);

      this.offsetX = playCenterX - totalW / 2 + this.tileSize / 2;
      this.offsetY = playCenterY - totalH / 2 + this.tileSize / 2;

      this.tiles = [];
      for (let r = 0; r < this.gridRows; r++) {
        for (let c = 0; c < this.gridCols; c++) {
          this.tiles.push({
            c: c, r: r,
            x: this.offsetX + c * (this.tileSize + this.gap),
            y: this.offsetY + r * (this.tileSize + this.gap),
            scale: 1.0
          });
        }
      }

      this._lastW = width;
      this._lastH = height;
    }
  }

  draw() {
    this._syncLayout();
    this.handleLogic();

    push();
    if (this.shakeTimer > 0) {
      let shakeX = random(-6, 6);
      let shakeY = random(-6, 6);
      translate(shakeX, shakeY);
      this.shakeTimer--;
    }

    rectMode(CENTER);
    let visibleSteps = floor(this.previewTimer / this.stepInterval);
    if (this.gameState === "INPUT") visibleSteps = 0;

    for (let t of this.tiles) {
      let pathIndex = this.path.findIndex((p) => p.x === t.c && p.y === t.r);
      let isPath = pathIndex !== -1;
      let isPlayerClicked = this.playerPath.some((p) => p.x === t.c && p.y === t.r);
      let hover = this.isHovering(t) && this.gameState === "INPUT";

      let tileColor = color(255);
      let targetScale = 1.0;

      if (this.gameState === "PREVIEW") {
        if (isPath && pathIndex <= visibleSteps) {
          tileColor = color(PALETTE?.blue || "#B5CDF5");
          if (pathIndex === visibleSteps) targetScale = 1.15;
        }
      }
      else if (this.gameState === "INPUT") {
        if (isPlayerClicked) {
           tileColor = color(PALETTE?.green || "#A0EACD");
        } else if (hover) {
           tileColor = lerpColor(color(255), color(PALETTE?.green || "#A0EACD"), 0.3);
           targetScale = 1.08;
           cursor(HAND);
        }
      }
      else if (this.gameState === "RESULT") {
        if (isPath) tileColor = color(PALETTE?.green || "#A0EACD");
      }
      else if (this.gameState === "GAMEOVER") {
        if (isPath) tileColor = color(PALETTE?.green || "#A0EACD");
        let lastStep = this.playerPath[this.playerPath.length - 1];
        if (lastStep && lastStep.x === t.c && lastStep.y === t.r && !isPath) {
           tileColor = color("#D32F2F");
           targetScale = 1.1;
        }
      }

      t.scale = lerp(t.scale, targetScale, 0.2);

      push();
      translate(t.x, t.y);
      scale(t.scale);

      if (isPlayerClicked || (isPath && this.gameState !== "INPUT" && pathIndex <= visibleSteps)) {
        drawingContext.shadowBlur = 20;
        drawingContext.shadowColor = tileColor;
        stroke(255);
        strokeWeight(3);
      } else {
        drawingContext.shadowBlur = hover ? 15 : 8;
        drawingContext.shadowColor = "rgba(0,0,0,0.1)";
        noStroke();
      }

      fill(tileColor);
      rect(0, 0, this.tileSize, this.tileSize, 15);

      if (isPath && pathIndex === 0 && this.gameState === "PREVIEW") {
         let pulse = sin(frameCount * 0.1) * 3;
         fill(255); noStroke();
         circle(0, 0, 12 + pulse);
      }
      pop();
    }
    rectMode(CORNER);

    pop();

    this.handleUI();
  }

  handleLogic() {
    if (this.gameState === "PREVIEW") {
      this.previewTimer++;

      let totalTime = (this.path.length * this.stepInterval) + 40;

      let barMaxW = 400;
      let barW = map(this.previewTimer, 0, totalTime, 0, barMaxW);

      noStroke(); fill(220);
      rect(width / 2 - barMaxW/2, height - 30, barMaxW, 8, 4);
      fill(PALETTE?.blue || "#B5CDF5");
      rect(width / 2 - barMaxW/2, height - 30, barW, 8, 4);

      if (this.previewTimer > totalTime) {
        this.gameState = "INPUT";
      }
    }
  }

  isHovering(t) {
    return mouseX > t.x - this.tileSize/2 && mouseX < t.x + this.tileSize/2 &&
           mouseY > t.y - this.tileSize/2 && mouseY < t.y + this.tileSize/2;
  }

  handleMouseClick() {
    if (this.gameState === "RESULT" || this.gameState === "GAMEOVER") {
        this.checkPopupClick();
        return;
    }

    if (this.gameState !== 'INPUT') return;

    for (let t of this.tiles) {
      if (this.isHovering(t)) {
        this.validateStep(t.c, t.r);
        return;
      }
    }
  }

  validateStep(col, row) {
    if (this.playerPath.some(p => p.x === col && p.y === row)) return;

    const nextStepIndex = this.playerPath.length;
    const expectedStep = this.path[nextStepIndex];

    if (expectedStep && expectedStep.x === col && expectedStep.y === row) {
      this.playerPath.push({ x: col, y: row });
      if (typeof audioManager !== 'undefined') audioManager.playSound("petal");

      if (this.playerPath.length === this.path.length) {
        this.score += (this.path.length * 10);
        if (typeof starBank !== "undefined" && starBank.recordLevelComplete) {
          starBank.recordLevelComplete(this.lives === 3);
        }
        this.gameState = 'RESULT';
      }
    } else {
      this.lives--;
      this.shakeTimer = 15;

      if (this.lives <= 0) {
          this.playerPath.push({ x: col, y: row });
          this.gameState = 'GAMEOVER';
      }
    }
  }

  handleUI() {
    noStroke();
    let topY = height * 0.1;

    push();
    textAlign(CENTER, CENTER);
    if (this.gameState === "PREVIEW") {
       fill(255, 200);
       rectMode(CENTER);
       rect(width / 2, topY, 350, 50, 25);
       fill(PALETTE?.blue || 80);
       textSize(22); textStyle(BOLD);
       text("Memorize the path...", width / 2, topY);
    }
    else if (this.gameState === "INPUT") {
       fill(255, 220);
       rectMode(CENTER);
       rect(width / 2, topY, 350, 60, 30);
       fill(PALETTE?.green || "#5DC98A");
       textSize(24); textStyle(BOLD);
       text("Retrace the steps!", width / 2, topY);
    }
    pop();

    push();
    let hudX = max(40, width * 0.05);
    let hudY = height / 2 - 100;

    fill(255, 180); noStroke();
    rect(hudX, hudY, 160, 200, 20);

    fill(80); textAlign(LEFT, TOP);
    textSize(14); textStyle(BOLD);
    text("LIVES", hudX + 20, hudY + 20);
    textSize(20);
    text("❤️".repeat(this.lives), hudX + 20, hudY + 40);

    textSize(14); textStyle(BOLD); fill(80);
    text("LEVEL", hudX + 20, hudY + 80);
    textSize(24); fill(PALETTE?.blue || "#5BACE0");
    text(this.level, hudX + 20, hudY + 100);

    textSize(14); textStyle(BOLD); fill(80);
    text("SCORE", hudX + 20, hudY + 140);
    textSize(24); fill(PALETTE?.green || "#5DC98A");
    text(this.score, hudX + 20, hudY + 160);
    pop();

    if (this.gameState === "RESULT") this.drawPopupCard("Level Complete!", "NEXT LEVEL >>");
    else if (this.gameState === "GAMEOVER") this.drawPopupCard("Game Over", "TRY AGAIN");
  }

  drawPopupCard(title, btnLabel) {
      fill(0, 100); noStroke();
      rect(0, 0, width, height);

      let cardW = 400, cardH = 300;
      let cardX = width / 2, cardY = height / 2;

      drawingContext.shadowBlur = 30;
      drawingContext.shadowColor = 'rgba(0,0,0,0.2)';
      fill(255); rectMode(CENTER);
      rect(cardX, cardY, cardW, cardH, 20);
      rectMode(CORNER); drawingContext.shadowBlur = 0;

      fill(50); textSize(32); textStyle(BOLD); textAlign(CENTER, CENTER);
      text(title, cardX, cardY - 80);

      textSize(20); textStyle(NORMAL);
      if (this.gameState === "RESULT") {
          fill("#2E7D32"); text("Path Completed!", cardX, cardY - 30);
          fill(50); text(`+${this.path.length * 10} Points`, cardX, cardY + 10);
      } else if (this.gameState === "GAMEOVER") {
          text(`Final Score: ${this.score}`, cardX, cardY - 30);
          text(`Level Reached: ${this.level}`, cardX, cardY + 10);
      }

      let btnW = 220, btnH = 50, btnY = cardY + 80;
      let isHovered = mouseX > cardX - btnW/2 && mouseX < cardX + btnW/2 && mouseY > btnY - btnH/2 && mouseY < btnY + btnH/2;

      fill(isHovered ? (PALETTE?.purple || "#9B5DE5") : (PALETTE?.blue || "#5BACE0"));
      if (isHovered) cursor(HAND);

      rectMode(CENTER); rect(cardX, btnY, btnW, btnH, 25); rectMode(CORNER);
      fill(255); textSize(18); textStyle(BOLD);
      text(btnLabel, cardX, btnY);
      textStyle(NORMAL);
  }

  checkPopupClick() {
      let cardX = width / 2, btnY = height / 2 + 80, btnW = 220, btnH = 50;

      if (mouseX > cardX - btnW/2 && mouseX < cardX + btnW/2 && mouseY > btnY - btnH/2 && mouseY < btnY + btnH/2) {
          if (this.gameState === "RESULT") {
              this.level++;
              this.setupLevel();
          } else if (this.gameState === "GAMEOVER") {
              this.restartGame();
          }
      }
  }

  restartGame() {
    this.level = 1;
    this.score = 0;
    this.lives = 3;
    this.flashTimer = 0;
    this.setupLevel();
  }
}
