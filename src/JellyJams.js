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
    this.drawDynamicBackground();
    
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
              if (typeof starBank !== "undefined" && starBank.recordLevelComplete) {
                starBank.recordLevelComplete(this.lives === 3);
              }
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
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = "rgba(0,0,0,0.15)";
    
    if (this.gameState === "WATCH") {
       fill(255, 210);
       stroke(255); strokeWeight(2);
       rectMode(CENTER);
       rect(width / 2, topY, 400, 60, 30);
       
       drawingContext.shadowBlur = 0;
       noStroke();
       fill(PALETTE?.purple || "#9B5DE5");
       textSize(22); textStyle(BOLD);
       text("Watch Blu memorise the tune...", width / 2, topY);
    }
    else if (this.gameState === "INPUT") {
       fill(255, 210);
       stroke(255); strokeWeight(2);
       rectMode(CENTER);
       rect(width / 2, topY, 440, 60, 30);

       drawingContext.shadowBlur = 0;
       noStroke();
       
       if (this.isReverse) {
         let pulseRed = lerpColor(color("#D32F2F"), color("#FF5252"), (sin(frameCount * 0.1) + 1) / 2);
         fill(pulseRed);
         textSize(24); textStyle(BOLD);
         text("↺ REWIND! Input Backwards! ↺", width / 2, topY);
       } else {
         fill(PALETTE?.green || "#5DC98A");
         textSize(24); textStyle(BOLD);
         text("Your Turn! Replay the tune.", width / 2, topY);
       }
    }
    pop();
    push();
    let hudX = max(40, width * 0.05);
    let hudY = height / 2 - 100;
    drawingContext.shadowBlur = 25;
    drawingContext.shadowColor = "rgba(0,0,0,0.1)";
    fill(255, 210); 
    stroke(255); 
    strokeWeight(2);
    rectMode(CORNER);
    let hudH = this.isReverse ? 250 : 210;
    rect(hudX, hudY, 160, hudH, 20); 
    
    drawingContext.shadowBlur = 0;
    noStroke();

    fill(80); textAlign(LEFT, TOP);
    textSize(14); textStyle(BOLD);
    text("LIVES", hudX + 25, hudY + 25);
    textSize(20);
    text("❤️".repeat(max(0, this.lives)), hudX + 25, hudY + 45);

    textSize(14); textStyle(BOLD); fill(80);
    text("LEVEL", hudX + 25, hudY + 85);
    textSize(28); fill(PALETTE?.blue || "#5BACE0");
    text(this.level, hudX + 25, hudY + 105);

    textSize(14); textStyle(BOLD); fill(80);
    text("SCORE", hudX + 25, hudY + 150);
    textSize(28); fill(PALETTE?.green || "#5DC98A");
    text(this.score, hudX + 25, hudY + 170);

    if (this.isReverse) {
      fill("#D32F2F");
      textSize(14); textAlign(CENTER, TOP);
      text("⚠️ REVERSE ⚠️", hudX + 80, hudY + 215);
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
        if (typeof audioManager !== "undefined") audioManager.playSound("petal");
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
    noStroke(); 
    fill(0, 50); 
    ellipse(0, 20, 30, 10);
    let jumpHeight = dist(this.blu.x, this.blu.y, this.blu.targetX, this.blu.targetY);
    let bounce = min(jumpHeight * 0.4, 60);
    translate(0, -bounce);
    const bluSize = this.blu.size * 2.2; 
    const floatY  = sin(frameCount * 0.05) * 5; 
    const breath  = sin(frameCount * 0.08) * (bluSize * 0.03); 
    const armSwing = sin(frameCount * 0.1) * 12; 
    if (this.isReverse) {
      rotate(sin(frameCount * 0.3) * 0.15);
    }
    
    translate(0, floatY);
    for (let g = 3; g > 0; g--) {
      noStroke();
      fill(100, 160, 255, 12 * g);
      circle(0, 0, bluSize + g * 12);
    }
    let bodyColor = this.isReverse ? (PALETTE?.purple || color(195, 177, 225)) : (PALETTE?.blue || color(80, 160, 255));
    fill(bodyColor);
    noStroke();
    push();
    translate(-bluSize * 0.45, 0);
    rotate(radians(this.isReverse ? armSwing * 3 : armSwing - 20)); 
    ellipse(-bluSize * 0.1, 0, bluSize * 0.25, bluSize * 0.12);
    pop();
    push();
    translate(bluSize * 0.45, 0);
    rotate(radians(this.isReverse ? -armSwing * 3 : -armSwing + 20));
    ellipse(bluSize * 0.1, 0, bluSize * 0.25, bluSize * 0.12);
    pop();
    rectMode(CENTER);
    rect(0, 0, bluSize + breath, bluSize - breath, bluSize * 0.4);
    fill(255, 160, 180, 140);
    ellipse(-bluSize * 0.28, bluSize * 0.1, bluSize * 0.22, bluSize * 0.14);
    ellipse( bluSize * 0.28, bluSize * 0.1, bluSize * 0.22, bluSize * 0.14);
    fill(255);
    ellipse(-bluSize * 0.18, -bluSize * 0.1, bluSize * 0.35, bluSize * 0.35);
    ellipse( bluSize * 0.18, -bluSize * 0.1, bluSize * 0.35, bluSize * 0.35);
    
    fill(30);
    if (this.isReverse) {
      ellipse(-bluSize * 0.18 + sin(frameCount * 0.5) * 4, -bluSize * 0.1, bluSize * 0.15, bluSize * 0.15);
      ellipse( bluSize * 0.18 - sin(frameCount * 0.5) * 4, -bluSize * 0.1, bluSize * 0.15, bluSize * 0.15);
    } else {
      ellipse(-bluSize * 0.18, -bluSize * 0.1, bluSize * 0.18, bluSize * 0.18);
      ellipse( bluSize * 0.18, -bluSize * 0.1, bluSize * 0.18, bluSize * 0.18);
    }
    if (!this.isReverse) {
        fill(255);
        ellipse(-bluSize * 0.13, -bluSize * 0.14, bluSize * 0.08, bluSize * 0.08);
        ellipse( bluSize * 0.23, -bluSize * 0.14, bluSize * 0.08, bluSize * 0.08);
        ellipse(-bluSize * 0.22, -bluSize * 0.06, bluSize * 0.03, bluSize * 0.03);
        ellipse( bluSize * 0.14, -bluSize * 0.06, bluSize * 0.03, bluSize * 0.03);
    }
    if (this.isReverse) {
        noFill(); 
        stroke(30); 
        strokeWeight(max(2, bluSize * 0.035));
        ellipse(0, bluSize * 0.12, bluSize * 0.12, bluSize * 0.15); 
    } else {
        noFill();
        stroke(30);
        strokeWeight(max(2, bluSize * 0.035));
        arc(0, bluSize * 0.12 - (breath * 0.5), bluSize * 0.26, bluSize * 0.16, 0, PI); 
    }
    noStroke();
    fill(255, 220, 60);
    push();
    translate(-bluSize * 0.42 - (breath*0.5), -bluSize * 0.38 + (breath*0.5));
    
    let outerRadius = bluSize * 0.09;
    let innerRadius = bluSize * 0.045;
    let angle = TWO_PI / 5;
    let halfAngle = angle / 2.0;
    beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
      let sx = cos(a - HALF_PI) * outerRadius;
      let sy = sin(a - HALF_PI) * outerRadius;
      vertex(sx, sy);
      sx = cos(a + halfAngle - HALF_PI) * innerRadius;
      sy = sin(a + halfAngle - HALF_PI) * innerRadius;
      vertex(sx, sy);
    }
    endShape(CLOSE);
    pop();
    
    pop(); 
  }

  drawDynamicBackground() {
    push();
    noStroke();
    
    let colors = [
      PALETTE?.pink || "#FFB7B2", PALETTE?.blue || "#B5CDF5",
      PALETTE?.yellow || "#FDFD96", PALETTE?.green || "#A0EACD",
      PALETTE?.purple || "#C3B1E1"
    ];

    for (let i = 0; i < 15; i++) {
      let x = (width / 2) + sin(frameCount * 0.003 + i * 2.1) * (width * 0.5);
      let y = (height / 2) + cos(frameCount * 0.004 + i * 3.4) * (height * 0.5);
      let size = 100 + sin(frameCount * 0.02 + i) * 50;

      let col = color(colors[i % colors.length]);
      col.setAlpha(30);
      
      fill(col);
      circle(x, y, size);
    }

    
    let isPlaying = this.jellies.some(j => j.active);
    
    let targetWaveHeight = isPlaying ? 60 : 15;
    this.waveHeight = lerp(this.waveHeight || 15, targetWaveHeight, 0.15);

    fill(255, 30); 
    beginShape();
    vertex(0, height);
    for (let x = 0; x <= width + 50; x += 50) {
      let wave1 = sin(frameCount * 0.05 + x * 0.01) * this.waveHeight;
      let wave2 = cos(frameCount * 0.07 + x * 0.02) * (this.waveHeight * 0.5);
      vertex(x, height - 70 + wave1 + wave2);
    }
    vertex(width, height);
    endShape(CLOSE);
    
    pop();
  }
}
