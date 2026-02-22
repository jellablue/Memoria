class KaleidoPop extends Game {
  constructor(difficultyParams = {}) {
    super(difficultyParams);
    this.gameState = "MEMORIZE";
    this.timer = 3 * 60;
    this.totalScore = 0;

    this.palette = ["#B5CDF5", "#A0EACD", "#F6C0D9", "#FFFFE0", "#FFD580"];
    this.petals = [];
    this.selectedBrushColor = this.palette[0];
    this.currentRotation = 0;
    this.rotationSpeed = this.difficultyParams.petalSpeed || 0.002;

    this.generateMandala();
  }

  generateMandala() {
    let minP = this.difficultyParams.minPetals || 6;
    let maxP = this.difficultyParams.maxPetals || 12;

    let numPetals = floor(random(minP, maxP + 1));
    if (this.level <= 2) {
      numPetals = minP;
    } else if (this.level <= 5) {
      numPetals = minP + floor((maxP - minP) * 0.33);
    } else if (this.level <= 8) {
      numPetals = minP + floor((maxP - minP) * 0.66);
    } else {
      numPetals = maxP;
    }
    let angleStep = TWO_PI / numPetals;

    let petalRadius = 150 - this.level * 3; 
    petalRadius = max(petalRadius, 80);

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

    if (this.level <= 3) this.timer = 5 * 60; 
    else if (this.level <= 6) this.timer = 4 * 60; 
    else if (this.level <= 10) this.timer = 3 * 60; 
    else this.timer = 2 * 60; 
    
    this.petals = [];
    this.currentRotation = 0;
    if (this.level > 5) {
      this.rotationSpeed = 0.002 + (this.level - 5) * 0.0005; 
    }
    if (this.level === 5 && this.palette.length === 5) this.palette.push("#FFA07A"); 
    if (this.level === 10 && this.palette.length === 6) this.palette.push("#DDA0DD"); 
    
    this.generateMandala();
  }

  draw() {
    push();
    translate(width / 2, height / 2);

    if (this.gameState === "INPUT" && this.level > 5) {
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
      this.drawPetalShape(0, 0, p.radius, 60);
      pop();
    }

    fill("#3E5296");
    ellipse(0, 0, 50, 50);
    pop();

    this.handleUI();
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
    this.timer = 5 * 60;
    this.totalScore = 0;
    this.lives = 3;
    this.palette = ["#B5CDF5", "#A0EACD", "#F6C0D9", "#FFFFE0", "#FFD580"];
    this.petals = [];
    this.selectedBrushColor = this.palette[0];
    this.currentRotation = 0;
    this.rotationSpeed = this.difficultyParams.petalSpeed || 0.002;
    this.generateMandala();
  }
}