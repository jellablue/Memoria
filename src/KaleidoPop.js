class KaleidoPop extends Game {
  constructor(difficultyParams = {}) {
    super(difficultyParams);
    this.gameState = "MEMORIZE";
    this.timer = 3 * 60;
    this.totalScore = 0;

    this.palette = ["#B5CDF5", "#A0EACD", "#F6C0D9", "#FFFFE0", "#FFD580"];
    this.extraColorPool = [
      "#FFA07A", "#DDA0DD", "#F0E68C", "#98FB98", "#FF6961",
      "#87CEEB", "#FFB347", "#B0E0E6", "#F4A7B9", "#C3B1E1"
    ];
    this.petals = [];
    this.selectedBrushColor = this.palette[0];
    this.currentRotation = 0;
    this.rotationSpeed = this.difficultyParams.petalSpeed || 0.002;
    
    // Progression tracking
    this.showMilestoneOverlay = false;
    this.milestoneMessage = "";
    this.rotationSpeedMultiplier = 1;

    this.generateMandala();
  }

  getRotationStartLevel() {
    // Check if user is in JUNIOR age group
    if (gameState.userAge <= 12) {
      return 10; // JUNIOR: rotation starts at level 10
    } else {
      return 6; // ADULT and SENIOR: rotation starts at level 6
    }
  }

  generateMandala() {
    let minP = this.difficultyParams.minPetals || 6;

    // Exactly +1 petal every 5 levels
    let numPetals = minP + floor((this.level - 1) / 5);
    let angleStep = TWO_PI / numPetals;

    let petalRadius = 225 - this.level * 4.5; 
    petalRadius = max(petalRadius, 120);

    let colorBag = [];

    for (let c of this.palette) {
      colorBag.push(c);
      colorBag.push(c);
    }
    colorBag = shuffle(colorBag);

    for (let i = 0; i < numPetals; i++) {
      let petalColor = colorBag[i];
      this.petals.push({
        angle: i * angleStep, 
        targetColor: petalColor, 
        inputColor: null, 
        radius: petalRadius,
      });
    }
  }

  submitAnswer() {
    if (this.gameState === "INPUT") {
      let roundPoints = 0;
      let correctCount = 0;

      for (let p of this.petals) {
        if (p.inputColor === p.targetColor) {
          roundPoints += 1; 
          correctCount++;
        }
      }

      this.totalScore += roundPoints;

      if (correctCount !== this.petals.length) {
        this.lives--;
        if (this.lives <= 0) {
          this.gameState = "GAMEOVER";
          return;
        }
      }

      this.gameState = "RESULT";
    }
  }

  nextLevel() {
    this.level++;
    this.gameState = "MEMORIZE";

    // Timer: base 3s + 2 extra seconds per 5-level milestone
    let baseMemoSeconds = 3;
    let timeBonus = floor((this.level - 1) / 5) * 2;
    this.timer = (baseMemoSeconds + timeBonus) * 60;
    
    this.petals = [];
    this.currentRotation = 0;
    
    // Check for milestone every 5 levels
    if (this.level % 5 === 1 && this.level > 1) {
      this.showMilestoneOverlay = true;
      this.milestoneMessage = "You are great at memorizing, let's add more petals!!";
    }
    
    // Rotation speed: increases by 20% of current speed every 5 levels from rotationStartLevel
    let rotationStartLevel = this.getRotationStartLevel();
    if (this.level >= rotationStartLevel) {
      let speedIncreaseCount = floor((this.level - rotationStartLevel) / 5);
      this.rotationSpeedMultiplier = pow(1.2, speedIncreaseCount);
      this.rotationSpeed = (this.difficultyParams.petalSpeed || 0.002) * this.rotationSpeedMultiplier;
    }
    
    // Add 1 new color every 5 levels after level 10 (levels 11, 16, 21, 26, ...)
    if (this.level > 10) {
      let extraColorsNeeded = floor((this.level - 11) / 5) + 1;
      let targetPaletteSize = 5 + extraColorsNeeded;
      while (this.palette.length < targetPaletteSize && this.palette.length - 5 < this.extraColorPool.length) {
        this.palette.push(this.extraColorPool[this.palette.length - 5]);
      }
    }
    
    this.generateMandala();
  }

  draw() {
    // Show milestone overlay
    if (this.showMilestoneOverlay) {
      this.drawMilestoneOverlay();
      return;
    }

    push();
    translate(width / 2, height / 2);

    let rotationStartLevel = this.getRotationStartLevel();
    if (this.gameState === "INPUT" && this.level >= rotationStartLevel) {
      this.currentRotation += this.rotationSpeed;
    }

    rotate(this.currentRotation);

    for (let p of this.petals) {
      push();
      rotate(p.angle);

      if (this.gameState === "MEMORIZE") {
        fill(p.targetColor);
      } else if (this.gameState === "INPUT") {
        fill(p.inputColor || 255);
      } else if (this.gameState === "RESULT") {
        fill(p.inputColor || 255);
        if (p.inputColor === p.targetColor) stroke("#A0EACD");
        else stroke("#F6C0D9");
      }
      strokeWeight(3);
      if (this.gameState !== "RESULT") stroke("#3E5296");
      this.drawPetalShape(0, 0, p.radius, 90);
      pop();
    }

    fill("#3E5296");
    ellipse(0, 0, 50, 50);
    pop();

    this.handleUI();
  }

  drawMilestoneOverlay() {
    // Dim background
    fill(0, 150);
    rect(0, 0, width, height);

    // Card
    let cardW = 500;
    let cardH = 300;
    let cardX = width / 2 - cardW / 2;
    let cardY = height / 2 - cardH / 2;

    drawingContext.shadowBlur = 30;
    drawingContext.shadowColor = "rgba(0,0,0,0.3)";
    fill(255);
    rect(cardX, cardY, cardW, cardH, 20);
    drawingContext.shadowBlur = 0;

    // Message
    fill(PALETTE.purple);
    textSize(28);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text(this.milestoneMessage, width / 2, height / 2 - 60);

    // Stats
    fill(50);
    textSize(20);
    textStyle(NORMAL);
    text("Level: " + this.level, width / 2, height / 2);
    text("Score: " + this.totalScore, width / 2, height / 2 + 40);

    // Continue Button
    let btnW = 200;
    let btnH = 50;
    let btnX = width / 2 - btnW / 2;
    let btnY = height / 2 + 120;

    if (dist(mouseX, mouseY, width / 2, btnY + btnH / 2) < btnW / 2) {
      fill(PALETTE.green);
      cursor(HAND);
    } else {
      fill(PALETTE.blue);
      cursor(ARROW);
    }

    rect(btnX, btnY, btnW, btnH, 10);
    fill(255);
    textSize(18);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text("CONTINUE", width / 2, btnY + btnH / 2 + 2);
  }

  drawPetalShape(x, y, len, wid) {
    beginShape();
    vertex(x, y);
    bezierVertex(x + wid, y + len / 3, x + wid, y + len, x, y + len);
    bezierVertex(x - wid, y + len, x - wid, y + len / 3, x, y);
    endShape(CLOSE);
  }

  // --- FIXED CHECK CLICK ---
  checkClick() {
    // Case 0: Handle milestone overlay
    if (this.showMilestoneOverlay) {
      let btnW = 200;
      let btnH = 50;
      let btnX = width / 2 - btnW / 2;
      let btnY = height / 2 + 120;
      if (mouseX > btnX && mouseX < btnX + btnW && mouseY > btnY && mouseY < btnY + btnH) {
        this.showMilestoneOverlay = false;
      }
      return;
    }

    // Case 1: Handle Result/GameOver Buttons
    if (this.gameState === "RESULT" || this.gameState === "GAMEOVER") {
      this.checkPopupClick();
      return;
    }

    if (this.gameState !== "INPUT") return;

    // Case 2: Palette Clicks
    let spacing = 60;
    let totalW = (this.palette.length - 1) * spacing;
    let startX = width / 2 - totalW / 2;

    for (let i = 0; i < this.palette.length; i++) {
      let paletteX = startX + i * spacing;
      let paletteY = height - 50;

      if (dist(mouseX, mouseY, paletteX, paletteY) < 20) {
        this.selectedBrushColor = this.palette[i];
        return; 
      }
    }

    // Case 3: Petal Painting
    let mx = mouseX - width / 2;
    let my = mouseY - height / 2;
    let distFromCenter = dist(0, 0, mx, my);
    let mouseAngle = atan2(my, mx);
    mouseAngle -= this.currentRotation;
    mouseAngle -= HALF_PI; 

    while (mouseAngle < 0) mouseAngle += TWO_PI;
    while (mouseAngle >= TWO_PI) mouseAngle -= TWO_PI;

    let angleThreshold = TWO_PI / this.petals.length / 2;

    for (let p of this.petals) {
      if (distFromCenter > 25 && distFromCenter < p.radius) {
        let diff = abs(mouseAngle - p.angle);
        if (diff > PI) diff = TWO_PI - diff; 

        if (diff < angleThreshold) {
          p.inputColor = this.selectedBrushColor;
          if (typeof petalSound !== "undefined") petalSound.play();
          break; 
        }
      }
    }
  }

  handleUI() {
    noStroke();
    textSize(24);
    
    // Lower Left HUD
    textAlign(LEFT, BOTTOM);
    fill(PALETTE.text || 50);
    let hudX = 30;
    let hudY = height - 30; 
    text("Lives: " + "❤️".repeat(this.lives), hudX, hudY - 70);
    text("Level: " + this.level, hudX, hudY - 40);
    text("Score: " + this.totalScore, hudX, hudY - 10);
    
    textAlign(CENTER, CENTER); 

    if (this.gameState === "MEMORIZE") {
      this.timer--;
      fill(50);
      text("Memorize the pattern! " + ceil(this.timer / 60), width / 2, 80);
      if (this.timer <= 0) this.gameState = "INPUT";
    } 
    else if (this.gameState === "INPUT") {
      let spacing = 60;
      let totalW = (this.palette.length - 1) * spacing;
      let startX = width / 2 - totalW / 2;

      for (let i = 0; i < this.palette.length; i++) {
        fill(this.palette[i]);
        if (this.selectedBrushColor === this.palette[i]) {
          stroke(50); strokeWeight(4); 
        } else {
          noStroke();
        }
        circle(startX + i * spacing, height - 50, 40);
      }
      fill(50); noStroke();
      text("Select a color and paint!", width / 2, 50);
      textSize(16);
      text("Press ENTER to Submit", width / 2, 80);
    } 
    
    // --- NEW CARD OVERLAYS ---
    else if (this.gameState === "RESULT") {
         this.drawPopupCard("Level Complete!", "NEXT LEVEL >>");
    } 
    else if (this.gameState === "GAMEOVER") {
         this.drawPopupCard("Game Over", "RESTART GAME");
    }
    
    textStyle(NORMAL);
  }

  // --- CARD DRAWING LOGIC ---
  drawPopupCard(title, btnLabel) {
      // 1. Darken & Blur Background
      fill(0, 100); 
      noStroke();
      rect(0, 0, width, height); 
      
      // 2. The Big Card
      let cardW = 400;
      let cardH = 300;
      let cardX = width / 2;
      let cardY = height / 2;
      
      drawingContext.shadowBlur = 30;
      drawingContext.shadowColor = 'rgba(0,0,0,0.2)';
      
      fill(255);
      rectMode(CENTER);
      rect(cardX, cardY, cardW, cardH, 20);
      rectMode(CORNER);
      
      drawingContext.shadowBlur = 0; // Reset

      // 3. Card Content
      fill(50);
      textSize(32); textStyle(BOLD);
      text(title, cardX, cardY - 80);
      
      // Dynamic Stats
      textSize(20); textStyle(NORMAL);
      if (this.gameState === "RESULT") {
          let correctCount = 0;
          for (let p of this.petals) if (p.inputColor === p.targetColor) correctCount++;
          
          if (correctCount === this.petals.length) fill("#2E7D32"); // Green
          else fill("#D32F2F"); // Red
          
          text(`${correctCount}/${this.petals.length} Correct`, cardX, cardY - 30);
          fill(50);
          text(`+${correctCount * 10} Points`, cardX, cardY + 10);
      } else {
          text(`Final Score: ${this.totalScore}`, cardX, cardY - 30);
          text(`Reached Level: ${this.level}`, cardX, cardY + 10);
      }

      // 4. Action Button
      let btnW = 220;
      let btnH = 50;
      let btnY = cardY + 80;
      
      // Hover Effect
      if (dist(mouseX, mouseY, cardX, btnY) < btnW/2) { // rough hover check
          fill("#2A3B75"); // Darker Blue
          cursor(HAND);
      } else {
          fill("#3E5296"); // Normal Blue
          cursor(ARROW);
      }
      
      rectMode(CENTER);
      rect(cardX, btnY, btnW, btnH, 25);
      rectMode(CORNER);
      
      fill(255); textSize(20); textStyle(BOLD);
      text(btnLabel, cardX, btnY);
  }

  // ---  POPUP CLICK HANDLER ---
  checkPopupClick() {
      // Button Dimensions (Must match drawPopupCard)
      let cardX = width / 2;
      let cardY = height / 2;
      let btnY = cardY + 80;
      let btnW = 220;
      let btnH = 50;
      
      // Simple Rect Collision
      if (mouseX > cardX - btnW/2 && mouseX < cardX + btnW/2 &&
          mouseY > btnY - btnH/2 && mouseY < btnY + btnH/2) {
            
          if (this.gameState === "RESULT") {
              this.nextLevel();
          } else if (this.gameState === "GAMEOVER") {
              this.restartGame();
          }
      }
  }

  restartGame() {
    this.gameState = "MEMORIZE";
    this.level = 1;
    this.timer = 3 * 60; // Base: 3 seconds at level 1
    this.totalScore = 0;
    this.lives = 3;
    this.palette = ["#B5CDF5", "#A0EACD", "#F6C0D9", "#FFFFE0", "#FFD580"];
    this.extraColorPool = [
      "#FFA07A", "#DDA0DD", "#F0E68C", "#98FB98", "#FF6961",
      "#87CEEB", "#FFB347", "#B0E0E6", "#F4A7B9", "#C3B1E1"
    ];
    this.petals = [];
    this.selectedBrushColor = this.palette[0];
    this.currentRotation = 0;
    this.rotationSpeed = this.difficultyParams.petalSpeed || 0.002;
    this.showMilestoneOverlay = false;
    this.milestoneMessage = "";
    this.rotationSpeedMultiplier = 1;
    this.generateMandala();
  }
}