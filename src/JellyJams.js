class JellyJams extends Game {
  constructor(difficultyParams = {}) {
    super(difficultyParams);
    this.gridSize = 3;
    this.jellies = [];
    this.gap = 25;
    this.cellSize = 100;

    this.level = 1;
    this.lives = 3;
    this.score = 0;

    this.sequence = [];
    this.playerStep = 0;
    this.gameState = "IDLE";

    this.playbackIndex = 0;
    this.playbackTimer = 0;
    this.playbackSpeed = 60;
    this.isReverse = false;

    this.flashTimer = 0;

    this.osc = new p5.Oscillator("sine");
    this.osc.amp(0);
    this.osc.start();
    this.notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99];

    this.blu = {
      x: 0, y: 0, targetX: 0, targetY: 0, size: 40,
    };

    this._lastW = -1;
    this._lastH = -1;

    this.initJellyArray();
  }

  initJellyArray() {
    let jellyColors = [
      PALETTE?.pink || "#FFB7B2", PALETTE?.blue || "#B5CDF5",
      PALETTE?.yellow || "#FDFD96", PALETTE?.green || "#A0EACD",
      PALETTE?.purple || "#C3B1E1"
    ];

    this.jellies = [];
    for (let i = 0; i < this.gridSize * this.gridSize; i++) {
      this.jellies.push({
        x: 0, y: 0, w: 0, h: 0,
        color: random(jellyColors),
        active: false,
        animTimer: 0,
        scale: 1.0
      });
    }
  }

  _syncLayout() {
    if (this._lastW !== width || this._lastH !== height) {

      this.cellSize = constrain(width * 0.11, 70, 115);

      let gridCenterX = width / 2;
      let gridCenterY = height * 0.52;

      let totalSpan = (this.gridSize * this.cellSize) + ((this.gridSize - 1) * this.gap);
      let startX = gridCenterX - totalSpan / 2 + this.cellSize / 2;
      let startY = gridCenterY - totalSpan / 2 + this.cellSize / 2;

      let index = 0;
      for (let r = 0; r < this.gridSize; r++) {
        for (let c = 0; c < this.gridSize; c++) {
          if (this.jellies[index]) {
            this.jellies[index].x = startX + c * (this.cellSize + this.gap);
            this.jellies[index].y = startY + r * (this.cellSize + this.gap);
            this.jellies[index].w = this.cellSize;
            this.jellies[index].h = this.cellSize;
          }
          index++;
        }
      }

      this.standbyPos = { x: width * 0.2, y: height * 0.8 };

      this._lastW = width;
      this._lastH = height;
    }
  }

  draw() {
    this._syncLayout();
    this.handleLogic();
    this.updateBlu();
    
    push(); 
    if (this.shakeTimer > 0) {
      let shakeX = random(-6, 6);
      let shakeY = random(-6, 6);
      translate(shakeX, shakeY); 
      
      this.shakeTimer--; 
    }

    this.drawVisuals(); 
    this.drawBlu();
    
    pop(); 
    
    this.handleUI();  

   }

  handleLogic() {
    for (let j of this.jellies) {
      if (j.active) {
        j.animTimer++;
        if (j.animTimer > 25) {
          j.active = false;
          j.animTimer = 0;
        }
      }
    }

    if (this.gameState === "WATCH") {
      this.playbackTimer++;

      if (this.playbackTimer > this.playbackSpeed) {
        this.playbackTimer = 0;

        if (this.playbackIndex < this.sequence.length) {
          this.activateJelly(this.sequence[this.playbackIndex]);
          this.playbackIndex++;
        } else {
          this.gameState = "INPUT";
          this.playerStep = 0;
        }
      }
    }
  }

  drawVisuals() {
    rectMode(CENTER);

    for (let i = 0; i < this.jellies.length; i++) {
      let j = this.jellies[i];
      let hover = this.isHovering(i) && this.gameState === "INPUT";

      let targetScale = 1.0;
      if (j.active) targetScale = 1.15;
      else if (hover) targetScale = 1.05;
      else targetScale = 1.0 + sin(frameCount * 0.05 + i) * 0.02;

      j.scale = lerp(j.scale, targetScale, 0.2);

      push();
      translate(j.x, j.y);
      scale(j.scale);

      if (j.active) {
        drawingContext.shadowBlur = 30;
        drawingContext.shadowColor = j.color;
        fill(255);
        stroke(j.color);
        strokeWeight(6);
      } else if (hover) {
        drawingContext.shadowBlur = 15;
        drawingContext.shadowColor = "rgba(0,0,0,0.15)";
        fill(lerpColor(color(j.color), color(255), 0.3));
        stroke(255);
        strokeWeight(3);
        cursor(HAND);
      } else {
        drawingContext.shadowBlur = 10;
        drawingContext.shadowColor = "rgba(0,0,0,0.05)";
        noStroke();
        fill(j.color);
      }

      rect(0, 0, j.w, j.h, 25);
      drawingContext.shadowBlur = 0;
      pop();
    }
    rectMode(CORNER);
  }

  startGame() {
    this.level = 1;
    this.lives = 3;
    this.score = 0;
    this.flashTimer = 0;
    this.sequence = [];
    let startCount = this.difficultyParams.jellyStartLength || 3;
    for (let i=0; i < startCount; i++) this.sequence.push(floor(random(0, 9)));
    this.startRound();
  }

  startRound() {
    if (this.level > 1) this.sequence.push(floor(random(0, 9)));
    this.isReverse = (this.level >= 3 && random() < (this.difficultyParams.jellyTwistChance || 0.3));
    this.gameState = "WATCH";
    this.playerStep = 0;
    this.playbackIndex = 0;
    this.playbackTimer = -30;
    let baseSpeed = this.difficultyParams.jellySpeed || 60;
    this.playbackSpeed = max(20, baseSpeed - (this.level * 2));
  }

  activateJelly(index, isPlayerClick = false) {
    if (index >= 0 && index < this.jellies.length) {
      let j = this.jellies[index];
      j.active = true;
      j.animTimer = 0;

      if (this.gameState === "WATCH") {
        this.blu.targetX = j.x;
        this.blu.targetY = j.y - (j.h / 3);
      }

      if (this.osc && typeof getAudioContext !== 'undefined' && getAudioContext().state === 'running') {
        this.osc.freq(this.notes[index], 0.1);
        this.osc.amp(0.5, 0.05);
        this.osc.amp(0, 0.2, 0.1);
      }
    }
  }

  checkClick() {
    if (this.gameState === "RESULT" || this.gameState === "GAMEOVER" || this.gameState === "IDLE") {
        this.checkPopupClick();
        return;
    }
    if (this.gameState !== "INPUT") return;

    for (let i = 0; i < this.jellies.length; i++) {
        if (this.isHovering(i)) {
          this.activateJelly(i, true);

          let expectedIndex = this.isReverse ? this.sequence[this.sequence.length - 1 - this.playerStep] : this.sequence[this.playerStep];

          if (i === expectedIndex) {
            this.playerStep++;
            if (this.playerStep >= this.sequence.length) {
              this.score += (this.sequence.length * 10);
              this.gameState = "RESULT";
            }
          } else {
            this.lives--;
            this.shakeTimer = 15;

            if (this.lives <= 0) {
                this.gameState = "GAMEOVER";
            }
          }
          return;
        }
    }
  }

  handleUI() {
    noStroke();
    let topY = height * 0.1;

    push();
    textAlign(CENTER, CENTER);
    if (this.gameState === "WATCH") {
       fill(255, 200);
       rectMode(CENTER);
       rect(width / 2, topY, 380, 50, 25);
       fill(PALETTE?.purple || 80);
       textSize(22); textStyle(BOLD);
       text("Watch Blu memorise the tune...", width / 2, topY);
    }
    else if (this.gameState === "INPUT") {
       fill(255, 220);
       rectMode(CENTER);
       rect(width / 2, topY, 400, 60, 30);

       if (this.isReverse) {
         fill("#D32F2F");
         textSize(24); textStyle(BOLD);
         text("↺ REWIND! Input Backwards! ↺", width / 2, topY);
       } else {
         fill(PALETTE?.green || "#5DC98A");
         textSize(24); textStyle(BOLD);
         text("Your Turn! Replay the tune.", width / 2, topY);
       }
    }
    pop();

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

    if (this.isReverse) {
      fill("#D32F2F");
      textSize(14); textAlign(CENTER, TOP);
      text("REVERSE MODE", hudX + 80, hudY + 220);
    }
    pop();

    if (this.gameState === "IDLE") this.drawPopupCard("Jelly Jams", "START GAME");
    else if (this.gameState === "RESULT") this.drawPopupCard("Level Complete!", "NEXT LEVEL >>");
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
      if (this.gameState === "IDLE") {
          text("Follow the musical jellies!", cardX, cardY - 20);
      } else if (this.gameState === "RESULT") {
          fill("#2E7D32"); text("Sequence Matched!", cardX, cardY - 30);
          fill(50); text(`+${this.sequence.length * 10} Points`, cardX, cardY + 10);
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
          if (this.gameState === "IDLE" || this.gameState === "GAMEOVER") this.startGame();
          else if (this.gameState === "RESULT") { this.level++; this.startRound(); }
      }
  }

  isHovering(index) {
    let j = this.jellies[index];
    return (
      mouseX > j.x - j.w/2 && mouseX < j.x + j.w/2 &&
      mouseY > j.y - j.h/2 && mouseY < j.y + j.h/2
    );
  }

  updateBlu() {
    if (this.gameState === "IDLE" || this.gameState === "RESULT" || this.gameState === "GAMEOVER") {
      this.blu.targetX = width / 2;
      this.blu.targetY = height / 2 - 180;
    } else if (this.gameState === "INPUT") {
      this.blu.targetX = this.standbyPos.x;
      this.blu.targetY = this.standbyPos.y;
    }

    this.blu.x = lerp(this.blu.x, this.blu.targetX, 0.15);
    this.blu.y = lerp(this.blu.y, this.blu.targetY, 0.15);
  }

  drawBlu() {
    push();
    translate(this.blu.x, this.blu.y);

    noStroke(); fill(0, 50); ellipse(0, 20, 30, 10);

    let jumpHeight = dist(this.blu.x, this.blu.y, this.blu.targetX, this.blu.targetY);
    let bounce = min(jumpHeight * 0.4, 60);
    translate(0, -bounce);

    if (this.isReverse) {
      rotate(sin(frameCount * 0.2) * 0.5);
      fill(PALETTE?.pink || "#FFB7B2");
      ellipse(20, -20, 8, 8); ellipse(-20, 10, 5, 5);
    }

    fill(this.isReverse ? (PALETTE?.purple || "#C3B1E1") : color(50, 100, 255));
    ellipse(0, 0, this.blu.size, this.blu.size);

    fill(255); ellipse(-8, -5, 12, 12); ellipse(8, -5, 12, 12);
    fill(0);
    if (this.isReverse) {
      ellipse(-8 + sin(frameCount * 0.5) * 3, -5, 4, 4);
      ellipse(8 - sin(frameCount * 0.5) * 3, -5, 4, 4);
    } else {
      ellipse(-8, -5, 5, 5); ellipse(8, -5, 5, 5);
    }

    noFill(); stroke(0); strokeWeight(2);
    if (this.isReverse) ellipse(0, 5, 10, 10);
    else arc(0, 5, 10, 5, 0, PI);

    pop();
  }
}
