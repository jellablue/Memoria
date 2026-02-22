class TiptoeTrails extends Game {
  constructor(difficultyParams = {}) {
    super(difficultyParams);
    this.gameState = "PREVIEW"; // PREVIEW, INPUT, RESULT, GAMEOVER
    this.level = 1;
    this.score = 0;
    this.lives = 3;

    this.gridCols = 4;
    this.gridRows = 4;

    this.previewTimer = 0;
    this.stepInterval = 40;

    this.tileSize = 60;
    this.offsetX = 0;
    this.offsetY = 0;

    this.path = [];
    this.playerPath = [];

    this.setupLevel();
  }

  setupLevel() {
    let startSize = this.difficultyParams.tiptoeGrid || 4;
    let baseSpeed = this.difficultyParams.tiptoeSpeed || 40;

    // Grid grows every 3 levels
    let growth = floor((this.level - 1) / 3);
    this.gridCols = min(startSize + growth, 8);
    this.gridRows = min(startSize + growth, 8);

    // Speed increases (interval decreases)
    this.stepInterval = max(10, baseSpeed - (this.level * 2));

    this.generatePath();
    this.gameState = "PREVIEW";
    this.previewTimer = 0;
    this.playerPath = [];
    
    console.log(`Level ${this.level}: ${this.gridCols}x${this.gridRows}, Speed: ${this.stepInterval}`);
  }

  generatePath() {
    this.path = [];
    let currentX = floor(random(this.gridCols));
    let currentY = this.gridRows - 1; // Start at bottom

    this.path.push({ x: currentX, y: currentY });

    while (currentY > 0) {
      let moves = [];
      moves.push({ x: 0, y: -1 }); // Up
      if (currentX > 0) moves.push({ x: -1, y: 0 }); // Left
      if (currentX < this.gridCols - 1) moves.push({ x: 1, y: 0 }); // Right

      let move = random(moves);
      currentX += move.x;
      currentY += move.y;

      // Avoid loops
      let alreadyVisited = this.path.some(p => p.x === currentX && p.y === currentY);
      if (!alreadyVisited) {
        this.path.push({ x: currentX, y: currentY });
      }
    }
  }

  draw() {
    // 1. Calculate Grid Dimensions
    // Keep it centered but leave room for UI
    let availableH = height - 100; 
    this.tileSize = min(width, availableH) / (this.gridCols + 1);
    this.offsetX = (width - this.gridCols * this.tileSize) / 2;
    this.offsetY = (height - this.gridRows * this.tileSize) / 2 - 20;

    // 2. Draw Grid
    push();
    translate(this.offsetX, this.offsetY);
    
    // Calculate how many steps to show during Preview
    let visibleSteps = floor(this.previewTimer / this.stepInterval);
    if (this.gameState === "INPUT") visibleSteps = 0; // Hide hints during input

    for (let c = 0; c < this.gridCols; c++) {
      for (let r = 0; r < this.gridRows; r++) {
        stroke(200);
        strokeWeight(2);

        let tileColor = color(255); // Default White

        // Logic to determine Tile Color
        let pathIndex = this.path.findIndex((p) => p.x === c && p.y === r);
        let isPath = pathIndex !== -1;
        
        let isPlayerClicked = this.playerPath.some((p) => p.x === c && p.y === r);

        if (this.gameState === "PREVIEW") {
          // reveal path step by step
          if (isPath && pathIndex <= visibleSteps) {
            tileColor = color(PALETTE.blue);
          }
        } 
        else if (this.gameState === "INPUT") {
          if (isPlayerClicked) {
             tileColor = color(PALETTE.green);
          }
        } 
        else if (this.gameState === "RESULT") {
          if (isPath) tileColor = color(PALETTE.green);
        } 
        else if (this.gameState === "GAMEOVER") {
          // Show correct path in green
          if (isPath) tileColor = color(PALETTE.green);
          
          // Show mistake in red
          let lastStep = this.playerPath[this.playerPath.length - 1];
          if (lastStep && lastStep.x === c && lastStep.y === r && !isPath) {
             tileColor = color("#D32F2F");
          }
        }

        fill(tileColor);
        rect(c * this.tileSize, r * this.tileSize, this.tileSize, this.tileSize, 10);

        // Start Marker (Little dot on the first tile)
        if (isPath && pathIndex === 0 && this.gameState === "PREVIEW") {
           fill(255, 100); noStroke();
           ellipse(this.tileSize/2, this.tileSize/2, 10);
        }
      }
    }
    pop();

    // 3. Logic & UI
    this.handleLogic();
    this.handleUI();
  }

  handleLogic() {
    if (this.gameState === "PREVIEW") {
      this.previewTimer++;
      
      // Total time = (Path Steps * Speed) + Pause
      let totalTime = (this.path.length * this.stepInterval) + 40;

      // Draw Progress Bar at bottom
      noStroke(); fill(PALETTE.blue);
      let barW = map(this.previewTimer, 0, totalTime, 0, width);
      rect(0, height - 8, barW, 8);

      if (this.previewTimer > totalTime) {
        this.gameState = "INPUT";
      }
    }
  }

  handleMouseClick() {
    // 1. Popup Clicks
    if (this.gameState === "RESULT" || this.gameState === "GAMEOVER") {
        this.checkPopupClick();
        return;
    }

    // 2. Grid Clicks
    if (this.gameState !== 'INPUT') return;

    // Check Bounds
    if (mouseX < this.offsetX || mouseX > this.offsetX + this.gridCols * this.tileSize || 
        mouseY < this.offsetY || mouseY > this.offsetY + this.gridRows * this.tileSize) {
        return;
    }

    const col = floor((mouseX - this.offsetX) / this.tileSize);
    const row = floor((mouseY - this.offsetY) / this.tileSize);

    if (col >= 0 && col < this.gridCols && row >= 0 && row < this.gridRows) {
      this.validateStep(col, row);
    }
  }

  validateStep(col, row) {
    // Check if tile is already clicked to prevent double counting
    if (this.playerPath.some(p => p.x === col && p.y === row)) return;

    const nextStepIndex = this.playerPath.length;
    const expectedStep = this.path[nextStepIndex];

    if (expectedStep && expectedStep.x === col && expectedStep.y === row) {
      // CORRECT STEP
      this.playerPath.push({ x: col, y: row });
      
      // Check Win Condition
      if (this.playerPath.length === this.path.length) {
        this.score += (this.path.length * 10);
        this.gameState = 'RESULT';
      }
    } else {
      // WRONG STEP
      this.lives--;
      
      // Flash Red Feedback (Simple Console log or sound trigger here)
      // Visual feedback happens in draw() loop (red tile) if we tracked wrong moves,
      // but simpler: just shake screen or sound.
      
      if (this.lives <= 0) {
          this.playerPath.push({ x: col, y: row }); // Show the mistake
          this.gameState = 'GAMEOVER';
      } else {
          // Optional: Reset player path to start? Or just ignore click?
          // Hardcore memory games reset you to start.
          // For this kid-friendly version, let's just NOT add the tile, 
          // effectively ignoring the click but penalizing the life.
          background(255, 200, 200); // Quick red flash
      }
    }
  }

  // --- UI & POPUPS (Standardized) ---
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

    // 2. Top Instructions
    textAlign(CENTER, CENTER);
    if (this.gameState === "PREVIEW") {
        fill(PALETTE.blue);
        text("Memorize the path...", width / 2, 50);
    } else if (this.gameState === "INPUT") {
        fill(PALETTE.green);
        text("Retrace the steps!", width / 2, 50);
    }

    // 3. Popups
    if (this.gameState === "RESULT") {
       this.drawPopupCard("Level Complete!", "NEXT LEVEL >>");
    } else if (this.gameState === "GAMEOVER") {
       this.drawPopupCard("Game Over", "TRY AGAIN");
    }
  }

  drawPopupCard(title, btnLabel) {
      // Blur Background
      fill(0, 100); noStroke();
      rect(0, 0, width, height); 
      
      // Card
      let cardW = 400; let cardH = 300;
      let cardX = width / 2; let cardY = height / 2;
      
      drawingContext.shadowBlur = 30;
      drawingContext.shadowColor = 'rgba(0,0,0,0.2)';
      fill(255);
      rectMode(CENTER);
      rect(cardX, cardY, cardW, cardH, 20);
      rectMode(CORNER);
      drawingContext.shadowBlur = 0;

      // Text
      fill(50); textSize(32); textStyle(BOLD); textAlign(CENTER, CENTER);
      text(title, cardX, cardY - 80);
      
      textSize(20); textStyle(NORMAL);
      if (this.gameState === "RESULT") {
          fill("#2E7D32");
          text("Path Completed!", cardX, cardY - 30);
          fill(50);
          text(`+${this.path.length * 10} Points`, cardX, cardY + 10);
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
      let cardX = width / 2; let cardY = height / 2;
      let btnY = cardY + 80; let btnW = 220; let btnH = 50;
      
      if (mouseX > cardX - btnW/2 && mouseX < cardX + btnW/2 &&
          mouseY > btnY - btnH/2 && mouseY < btnY + btnH/2) {
            
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
    this.setupLevel();
  }
}