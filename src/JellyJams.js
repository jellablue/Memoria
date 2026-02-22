class JellyJams extends Game {
  constructor(difficultyParams = {}) {
    super(difficultyParams);
    this.gridSize = 3;
    this.jellies = [];
    this.gap = 20;
    this.cellSize = 100;

    // --- SCORING & PROGRESSION ---
    this.level = 1;
    this.lives = 3;
    this.score = 0;
    
    this.sequence = [];
    this.playerStep = 0;
    this.gameState = "IDLE"; // IDLE, WATCH, INPUT, RESULT, GAMEOVER
    
    this.playbackIndex = 0;
    this.playbackTimer = 0;
    this.playbackSpeed = 60;
    this.isReverse = false;

    // Audio
    this.osc = new p5.Oscillator("sine");
    this.osc.amp(0);
    this.osc.start();
    this.notes = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25, 587.33];

    // Mascot
    this.blu = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      size: 40,
    };
    this.standbyPos = { x: 100, y: height - 150 }; // Moved up slightly for HUD

    this.initGrid();
  }

  initGrid() {
    let startX = width / 2 - (this.gridSize * this.cellSize + (this.gridSize - 1) * this.gap) / 2;
    let startY = height / 2 - (this.gridSize * this.cellSize + (this.gridSize - 1) * this.gap) / 2;

    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        let x = startX + c * (this.cellSize + this.gap);
        let y = startY + r * (this.cellSize + this.gap);
        let baseColor = random([PALETTE.pink, PALETTE.blue, PALETTE.yellow, PALETTE.purple]);
        
        this.jellies.push({
          x: x, y: y, w: this.cellSize, h: this.cellSize,
          color: baseColor, active: false, animTimer: 0,
        });
      }
    }
  }

  draw() {
    this.handleLogic();
    this.updateBlu();
    
    // Draw Game Elements
    this.drawVisuals(); 
    this.drawBlu();
    
    // Draw UI Overlay (HUD + Popups)
    this.handleUI();
  }

  handleLogic() {
    // 1. Jelly Animations
    for (let j of this.jellies) {
      if (j.active) {
        j.animTimer++;
        if (j.animTimer > 20) {
          j.active = false;
          j.animTimer = 0;
        }
      }
    }

    // 2. Sequence Playback Logic
    if (this.gameState === "WATCH") {
      this.playbackTimer++;

      if (this.playbackTimer > this.playbackSpeed) {
        this.playbackTimer = 0;

        if (this.playbackIndex < this.sequence.length) {
          let jellyIndex = this.sequence[this.playbackIndex];
          this.activateJelly(jellyIndex);
          this.playbackIndex++;
        } else {
          this.gameState = "INPUT";
          this.playerStep = 0;
        }
      }
    }
  }

  drawVisuals() {
    for (let i = 0; i < this.jellies.length; i++) {
      let j = this.jellies[i];

      if (j.active) {
        fill(255);
        stroke(j.color);
        strokeWeight(4);
      } else if (this.isHovering(i) && this.gameState === "INPUT") {
        fill(lerpColor(color(j.color), color(255), 0.4));
        noStroke();
      } else {
        noStroke();
        fill(j.color);
      }

      rect(j.x, j.y, j.w, j.h, 20);
      noStroke();
    }
  }

  startGame() {
    this.level = 1;
    this.lives = 3;
    this.score = 0;
    this.sequence = [];
    
    let startCount = this.difficultyParams.jellyStartLength || 3;
    for (let i=0; i < startCount; i++) {
        this.sequence.push(floor(random(0, 9)));
    }
    
    this.startRound();
  }

  startRound() {
    // Logic to start the sequence playback
    if (this.level > 1) {
        // Add one new step per level
        this.sequence.push(floor(random(0, 9)));
    }

    // Twist Mechanic Check
    if (this.level >= 3 && random() < (this.difficultyParams.jellyTwistChance || 0.3)) {
      this.isReverse = true;
    } else {
      this.isReverse = false;
    }

    this.gameState = "WATCH";
    this.playerStep = 0;
    this.playbackIndex = 0;
    this.playbackTimer = -30; // Small delay before starting
    
    // Speed scaling
    let baseSpeed = this.difficultyParams.jellySpeed || 60;
    this.playbackSpeed = max(20, baseSpeed - (this.level * 2));
    
    console.log("Level " + this.level + " Sequence: " + this.sequence);
  }

  activateJelly(index, isPlayerClick = false) {
    if (index >= 0 && index < this.jellies.length) {
      this.jellies[index].active = true;
      this.jellies[index].animTimer = 0;

      if (this.gameState === "WATCH") {
        this.blu.targetX = this.jellies[index].x + this.jellies[index].w / 2;
        this.blu.targetY = this.jellies[index].y + this.jellies[index].h / 2 - 20;
      }

      if (this.osc) {
        this.osc.freq(this.notes[index], 0.1);
        this.osc.amp(0.5, 0.05);
        this.osc.amp(0, 0.2, 0.1);
      }
    }
  }

  checkClick() {
    // --- 1. HANDLE POPUP CLICKS (Result/Game Over) ---
    if (this.gameState === "RESULT" || this.gameState === "GAMEOVER" || this.gameState === "IDLE") {
        this.checkPopupClick();
        return;
    }

    if (this.gameState !== "INPUT") return;

    // --- 2. HANDLE GAMEPLAY CLICKS ---
    for (let i = 0; i < this.jellies.length; i++) {
        if (this.isHovering(i)) {
          this.activateJelly(i, true);

          // Calculate Expected Input
          let expectedIndex;
          if (this.isReverse) {
            expectedIndex = this.sequence[this.sequence.length - 1 - this.playerStep];
          } else {
            expectedIndex = this.sequence[this.playerStep];
          }

          if (i === expectedIndex) {
            // CORRECT CLICK
            this.playerStep++;
            if (this.playerStep >= this.sequence.length) {
              // ROUND COMPLETE
              this.score += (this.sequence.length * 10);
              this.gameState = "RESULT"; // Show "Level Complete" card
            }
          } else {
            // WRONG CLICK
            this.lives--;
            // Shake Effect or Sound here
            if (this.lives <= 0) {
                this.gameState = "GAMEOVER";
            } else {
                // Optional: Replay the sequence if they fail but have lives?
                // For now, let's just let them continue inputting or reset input?
                // Hard mode: Reset input. Easy mode: Just ignore the click.
                // Let's Flash Screen Red briefly
                background(255, 200, 200); 
            }
          }
          return;
        }
    }
  }

  // --- UI & SCORING SYSTEM (MATCHING KALEIDOPOP) ---
  handleUI() {
    noStroke();
    textSize(24);
    
    // 1. Lower Left HUD
    textAlign(LEFT, BOTTOM);
    fill(PALETTE.text || 50);
    
    let hudX = 30;
    let hudY = height - 30; 

    text("Lives: " + "❤️".repeat(this.lives), hudX, hudY - 70);
    text("Level: " + this.level, hudX, hudY - 40);
    text("Score: " + this.score, hudX, hudY - 10);

    // 2. Instructions / Top Text
    textAlign(CENTER, CENTER);
    if (this.gameState === "IDLE") {
       this.drawPopupCard("Jelly Jams", "START GAME");
    } 
    else if (this.gameState === "WATCH") {
       fill(PALETTE.purple);
       text("Watch Blu memorise the tune...", width/2, 50);
    } 
    else if (this.gameState === "INPUT") {
       if (this.isReverse) {
         fill("#D32F2F"); // Red warning
         textSize(28); textStyle(BOLD);
         text("↺ REWIND! Input Backwards! ↺", width/2, 50);
       } else {
         fill(PALETTE.green);
         text("Your Turn! Replay the tune.", width/2, 50);
       }
       textStyle(NORMAL);
    }
    
    // 3. Popups
    else if (this.gameState === "RESULT") {
       this.drawPopupCard("Level Complete!", "NEXT LEVEL >>");
    } 
    else if (this.gameState === "GAMEOVER") {
       this.drawPopupCard("Game Over", "TRY AGAIN");
    }
  }

  // --- POPUP CARD SYSTEM ---
  drawPopupCard(title, btnLabel) {
      // Blur Background
      fill(0, 100); noStroke();
      rect(0, 0, width, height); 
      
      // Card Body
      let cardW = 400; let cardH = 300;
      let cardX = width / 2; let cardY = height / 2;
      
      drawingContext.shadowBlur = 30;
      drawingContext.shadowColor = 'rgba(0,0,0,0.2)';
      fill(255);
      rectMode(CENTER);
      rect(cardX, cardY, cardW, cardH, 20);
      rectMode(CORNER);
      drawingContext.shadowBlur = 0;

      // Text Content
      fill(50); textSize(32); textStyle(BOLD); textAlign(CENTER, CENTER);
      text(title, cardX, cardY - 80);
      
      textSize(20); textStyle(NORMAL);
      if (this.gameState === "IDLE") {
          text("Follow the musical jellies!", cardX, cardY - 20);
      } else if (this.gameState === "RESULT") {
          fill("#2E7D32");
          text("Sequence Matched!", cardX, cardY - 30);
          fill(50);
          text(`+${this.sequence.length * 10} Points`, cardX, cardY + 10);
      } else if (this.gameState === "GAMEOVER") {
          text(`Final Score: ${this.score}`, cardX, cardY - 30);
          text(`Level Reached: ${this.level}`, cardX, cardY + 10);
      }

      // Button
      let btnW = 220; let btnH = 50; let btnY = cardY + 80;
      
      if (dist(mouseX, mouseY, cardX, btnY) < btnW/2) {
          fill("#2A3B75"); cursor(HAND);
      } else {
          fill("#3E5296"); cursor(ARROW);
      }
      
      rectMode(CENTER);
      rect(cardX, btnY, btnW, btnH, 25);
      rectMode(CORNER);
      
      fill(255); textSize(20); textStyle(BOLD);
      text(btnLabel, cardX, btnY);
      textStyle(NORMAL);
  }

  checkPopupClick() {
      let cardX = width / 2;
      let cardY = height / 2;
      let btnY = cardY + 80;
      let btnW = 220;
      let btnH = 50;
      
      if (mouseX > cardX - btnW/2 && mouseX < cardX + btnW/2 &&
          mouseY > btnY - btnH/2 && mouseY < btnY + btnH/2) {
            
          if (this.gameState === "IDLE" || this.gameState === "GAMEOVER") {
              this.startGame();
          } else if (this.gameState === "RESULT") {
              this.level++;
              this.startRound();
          }
      }
  }

  isHovering(index) {
    let j = this.jellies[index];
    return (
      mouseX > j.x && mouseX < j.x + j.w && mouseY > j.y && mouseY < j.y + j.h
    );
  }

  updateBlu() {
    if (this.gameState === "IDLE" || this.gameState === "RESULT" || this.gameState === "GAMEOVER") {
      this.blu.targetX = width / 2;
      this.blu.targetY = height / 2 - 150; // Sit above the card
    } else if (this.gameState === "INPUT") {
      this.blu.targetX = this.standbyPos.x;
      this.blu.targetY = this.standbyPos.y;
    }

    this.blu.x = lerp(this.blu.x, this.blu.targetX, 0.1);
    this.blu.y = lerp(this.blu.y, this.blu.targetY, 0.1);
  }

  drawBlu() {
    push();
    translate(this.blu.x, this.blu.y);

    // Shadow
    noStroke(); fill(0, 50); ellipse(0, 20, 30, 10);

    // Jump Physics
    let jumpHeight = dist(this.blu.x, this.blu.y, this.blu.targetX, this.blu.targetY);
    let bounce = min(jumpHeight * 0.5, 50);
    translate(0, -bounce);

    // Reverse/Dizzy Animation
    if (this.isReverse) {
      rotate(sin(frameCount * 0.2) * 0.5);
      fill(PALETTE.pink); ellipse(20, -20, 8, 8); ellipse(-20, 10, 5, 5);
    }

    // Body
    if (this.isReverse) fill(PALETTE.purple);
    else fill(50, 100, 255);
    ellipse(0, 0, this.blu.size, this.blu.size);

    // Eyes
    fill(255); ellipse(-8, -5, 12, 12); ellipse(8, -5, 12, 12);
    fill(0);
    if (this.isReverse) {
      ellipse(-8 + sin(frameCount * 0.5) * 3, -5, 4, 4);
      ellipse(8 - sin(frameCount * 0.5) * 3, -5, 4, 4);
    } else {
      ellipse(-8, -5, 5, 5); ellipse(8, -5, 5, 5);
    }

    // Mouth
    noFill(); stroke(0); strokeWeight(2);
    if (this.isReverse) ellipse(0, 5, 10, 10);
    else arc(0, 5, 10, 5, 0, PI);

    pop();
  }
}