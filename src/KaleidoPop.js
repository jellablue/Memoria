class KaleidoPop extends Game {
  constructor(difficultyParams = {}) {
    super(difficultyParams);
    this.gameState = "MEMORIZE";
    this.timer = 3 * 60;
    this.timerMax = 3 * 60;
    this.levelTimeAllowed = (this.timerMax / 60) * 1000;
    this.levelStartMillis = millis();
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
    
    // --- Visual Feedback States ---
    this.shakeTimer = 0;
    this.btnScale = 1.0; 

    this.milestoneAnim = 0; 
    this.confetti = [];

    this.generateMandala();
  }

  getRotationStartLevel() {
    return (typeof gameState !== 'undefined' && gameState.userAge <= 12) ? 10 : 6;
  }

  generateMandala() {
    let minP = this.difficultyParams.minPetals || 6;
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
      this.petals.push({
        angle: i * angleStep,
        targetColor: colorBag[i],
        inputColor: null,
        radius: petalRadius,
      });
    }
  }

  initConfetti() {
    this.confetti = [];
    const confettiColors = [
      PALETTE?.pink || "#F6C0D9",
      PALETTE?.blue || "#B5CDF5",
      PALETTE?.green || "#A0EACD",
      PALETTE?.yellow || "#FFD580",
      PALETTE?.purple || "#9B5DE5",
    ];

    const burstCount = 70;
    for (let i = 0; i < burstCount; i++) {
      this.confetti.push({
        x: width / 2 + random(-80, 80),
        y: height / 2 - 120 + random(-20, 20),
        vx: random(-5, 5),
        vy: random(-12, -4),
        angle: random(TWO_PI),
        spin: random(-0.2, 0.2),
        size: random(6, 14),
        color: random(confettiColors),
      });
    }
  }

  submitAnswer() {
    if (this.gameState === "INPUT") {
      if (!this.petals || this.petals.length === 0) return;

      const timeTaken = millis() - this.levelStartMillis;
      let roundPoints = 0;
      let correctCount = 0;

      for (let p of this.petals) {
        if (p.inputColor === p.targetColor) {
          roundPoints += 1;
          correctCount++;
        }
      }

      // FIXED LOGIC: Only proceed to RESULT if they got everything right.
      if (correctCount === this.petals.length) {
        this.totalScore += roundPoints;

        if (typeof starBank !== "undefined" && starBank.recordFastSubmit) {
          starBank.recordFastSubmit(timeTaken, this.levelTimeAllowed);
        }
        if (typeof starBank !== "undefined" && starBank.recordLevelComplete) {
          starBank.recordLevelComplete(this.lives === 3);
        }
        
        this.gameState = "RESULT";
        
      } else {
        // MISTAKE LOGIC: Penalize and stay in INPUT mode to try again.
        this.lives--;
        this.shakeTimer = 15; // Trigger camera shake
        
        if (this.lives <= 0) {
          this.gameState = "GAMEOVER";
        }
      }
    }
  }

  nextLevel() {
    this.level++;
    this.gameState = "MEMORIZE";

    let baseMemoSeconds = 3;
    let timeBonus = floor((this.level - 1) / 5) * 2;
    this.timerMax = (baseMemoSeconds + timeBonus) * 60;
    this.timer = this.timerMax;
    this.levelTimeAllowed = (this.timerMax / 60) * 1000;
    this.levelStartMillis = millis();

    this.petals = [];
    this.currentRotation = 0;

   if (this.level % 5 === 1 && this.level > 1) {
      this.showMilestoneOverlay = true;
      this.milestoneMessage = "Great memory! Let's add more petals.";
      this.milestoneAnim = 0; // Reset animation scaler
      this.initConfetti();    // Boom!
    }

    let rotationStartLevel = this.getRotationStartLevel();
    if (this.level >= rotationStartLevel) {
      let speedIncreaseCount = floor((this.level - rotationStartLevel) / 5);
      this.rotationSpeedMultiplier = pow(1.2, speedIncreaseCount);
      this.rotationSpeed = (this.difficultyParams.petalSpeed || 0.002) * this.rotationSpeedMultiplier;
    }

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
    if (this.showMilestoneOverlay) {
      this.drawMilestoneOverlay();
      return;
    }

    // 1. Draw UI (Doesn't shake)
    this.handleUI();

    let mx = mouseX - width / 2;
    let my = mouseY - height / 2;
    let distFromCenter = dist(0, 0, mx, my);
    let mouseAngle = atan2(my, mx);
    mouseAngle -= this.currentRotation;
    mouseAngle -= HALF_PI;
    while (mouseAngle < 0) mouseAngle += TWO_PI;
    while (mouseAngle >= TWO_PI) mouseAngle -= TWO_PI;
    let angleThreshold = TWO_PI / this.petals.length / 2;

    push();
    translate(width / 2, height / 2);

    // 2. Camera Shake Matrix (Only affects the Mandala)
    if (this.shakeTimer > 0) {
      translate(random(-6, 6), random(-6, 6));
      this.shakeTimer--;
    }

    let rotationStartLevel = this.getRotationStartLevel();
    if (this.gameState === "INPUT" && this.level >= rotationStartLevel) {
      this.currentRotation += this.rotationSpeed;
    }

    rotate(this.currentRotation);

    for (let p of this.petals) {
      push();
      rotate(p.angle);

      let isHovered = false;
      if (this.gameState === "INPUT" && distFromCenter > 25 && distFromCenter < p.radius) {
        let diff = abs(mouseAngle - p.angle);
        if (diff > PI) diff = TWO_PI - diff;
        if (diff < angleThreshold) isHovered = true;
      }

      if (this.gameState === "MEMORIZE") {
        fill(p.targetColor);
      } else if (this.gameState === "INPUT") {
        fill(p.inputColor || (isHovered ? 230 : 255));
      } else if (this.gameState === "RESULT") {
        fill(p.inputColor || 255);
        if (p.inputColor === p.targetColor) stroke(PALETTE?.green || "#A0EACD");
        else stroke(PALETTE?.pink || "#F6C0D9");
      }

      strokeWeight(isHovered ? 5 : 3);
      if (this.gameState !== "RESULT") stroke(PALETTE?.blue || "#3E5296");

      if (isHovered) scale(1.05);
      this.drawPetalShape(0, 0, p.radius, 90);
      pop();
    }

    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = "rgba(0,0,0,0.2)";
    fill(PALETTE?.blue || "#3E5296");
    stroke(255);
    strokeWeight(4);
    ellipse(0, 0, 60, 60);
    drawingContext.shadowBlur = 0;
    pop();

    // 3. Draw Overlays
    if (this.gameState === "RESULT") {
      this.drawPopupCard("Level Complete!", "NEXT LEVEL >>");
    } else if (this.gameState === "GAMEOVER") {
      this.drawPopupCard("Game Over", "FINISH");
    }
  }

  handleUI() {
    textAlign(CENTER, CENTER);
    if (this.gameState === "MEMORIZE") {
      this.timer--;
      fill(80);
      textSize(28); textStyle(BOLD);
      text("Memorize the pattern!", width / 2, 60);

      let barW = 300;
      let fillW = map(this.timer, 0, this.timerMax, 0, barW);
      noStroke();
      fill(220);
      rectMode(CORNER);
      rect(width/2 - barW/2, 90, barW, 10, 5);
      fill(PALETTE?.pink || "#F6C0D9");
      rect(width/2 - barW/2, 90, fillW, 10, 5);

      if (this.timer <= 0) this.gameState = "INPUT";
    }
    else if (this.gameState === "INPUT") {
      fill(80);
      textSize(28); textStyle(BOLD);
      text("Paint the petals!", width / 2, 60);
      textSize(16); textStyle(NORMAL); fill(120);
      text("Press ENTER when finished", width / 2, 90);
    }

    push();
    let hudX = max(40, width * 0.05);
    let hudY = height / 2 - 100;

    fill(255, 180); noStroke();
    rectMode(CORNER);
    rect(hudX, hudY, 160, 200, 20);

    fill(80); textAlign(LEFT, TOP);
    textSize(14); textStyle(BOLD);
    text("LIVES", hudX + 20, hudY + 20);
    textSize(20);
    text("❤️".repeat(max(0, this.lives)), hudX + 20, hudY + 40); // Added max() to prevent string error

    textSize(14); textStyle(BOLD); fill(80);
    text("LEVEL", hudX + 20, hudY + 80);
    textSize(24); fill(PALETTE?.blue || "#5BACE0");
    text(this.level, hudX + 20, hudY + 100);

    textSize(14); textStyle(BOLD); fill(80);
    text("SCORE", hudX + 20, hudY + 140);
    textSize(24); fill(PALETTE?.green || "#5DC98A");
    text(this.totalScore, hudX + 20, hudY + 160);
    pop();

    if (this.gameState === "INPUT") {
      push();
      let spacing = 65;
      let rightX = width - 80;
      let startY = height / 2 - ((this.palette.length - 1) * spacing) / 2;

      fill(255, 180); noStroke();
      rectMode(CORNER);
      rect(rightX - 35, startY - 40, 70, (this.palette.length * spacing) + 20, 35);

      for (let i = 0; i < this.palette.length; i++) {
        let py = startY + i * spacing;
        let isSelected = (this.selectedBrushColor === this.palette[i]);

        drawingContext.shadowBlur = isSelected ? 15 : 5;
        drawingContext.shadowColor = isSelected ? this.palette[i] : "rgba(0,0,0,0.2)";

        fill(this.palette[i]);
        if (isSelected) {
          stroke(255); strokeWeight(4);
          circle(rightX, py, 45);
        } else {
          stroke(200); strokeWeight(2);
          circle(rightX, py, 35);
        }
      }
      drawingContext.shadowBlur = 0;
      pop();
    }
  }

  checkClick() {
    if (this.showMilestoneOverlay) {
      // Prevent clicking if the card is still animating in
      if (this.milestoneAnim < 0.9) return; 

      let btnW = 220, btnH = 54;
      // Because the card is drawn from center, btnY is exactly 100 pixels below the middle of the screen
      let absoluteBtnY = height / 2 + 100; 
      
      if (mouseX > width/2 - btnW/2 && mouseX < width/2 + btnW/2 && 
          mouseY > absoluteBtnY - btnH/2 && mouseY < absoluteBtnY + btnH/2) {
        if (typeof audioManager !== "undefined") audioManager.playSound("petal");
        this.showMilestoneOverlay = false;
        // Reset the timer when they close the overlay so they don't lose time
        this.levelStartMillis = millis();
      }
      return;
    }

    if (this.gameState === "RESULT" || this.gameState === "GAMEOVER") {
      this.checkPopupClick();
      return;
    }

    if (this.gameState !== "INPUT") return;

    // Palette Clicks
    let spacing = 65;
    let rightX = width - 80;
    let startY = height / 2 - ((this.palette.length - 1) * spacing) / 2;

    for (let i = 0; i < this.palette.length; i++) {
      let py = startY + i * spacing;
      if (dist(mouseX, mouseY, rightX, py) < 25) {
        this.selectedBrushColor = this.palette[i];
        if (typeof audioManager !== "undefined") audioManager.playSound("petal");
        return;
      }
    }

    // Petal Clicks
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
          if (typeof audioManager !== "undefined") audioManager.playSound("petal");
          break;
        }
      }
    }
  }

  drawPetalShape(x, y, len, wid) {
    beginShape();
    vertex(x, y);
    bezierVertex(x + wid, y + len / 3, x + wid, y + len, x, y + len);
    bezierVertex(x - wid, y + len, x - wid, y + len / 3, x, y);
    endShape(CLOSE);
  }

  drawPopupCard(title, btnLabel) {
      fill(0, 100); noStroke(); rectMode(CORNER); rect(0, 0, width, height);
      let cardW = 400, cardH = 300, cardX = width / 2, cardY = height / 2;

      drawingContext.shadowBlur = 30;
      drawingContext.shadowColor = 'rgba(0,0,0,0.2)';
      fill(255); rectMode(CENTER); rect(cardX, cardY, cardW, cardH, 20);
      rectMode(CORNER); drawingContext.shadowBlur = 0;

      fill(50); textSize(32); textStyle(BOLD); textAlign(CENTER, CENTER);
      text(title, cardX, cardY - 80);

      textSize(20); textStyle(NORMAL);
      if (this.gameState === "RESULT") {
          let correctCount = 0;
          for (let p of this.petals) if (p.inputColor === p.targetColor) correctCount++;
          fill("#2E7D32");
          text(`${correctCount}/${this.petals.length} Correct`, cardX, cardY - 30);
          fill(50); text(`+${correctCount * 10} Points`, cardX, cardY + 10);
      } else {
          text(`Final Score: ${this.totalScore}`, cardX, cardY - 30);
          text(`Reached Level: ${this.level}`, cardX, cardY + 10);
      }

      let btnW = 220, btnH = 50, btnY = cardY + 80;
      let isHovered = mouseX > cardX - btnW/2 && mouseX < cardX + btnW/2 && mouseY > btnY - btnH/2 && mouseY < btnY + btnH/2;

      this.btnScale = lerp(this.btnScale || 1.0, isHovered ? 1.08 : 1.0, 0.2);
      
      push();
      translate(cardX, btnY);
      scale(this.btnScale);

      drawingContext.shadowBlur = isHovered ? 15 : 5;
      drawingContext.shadowColor = "rgba(0,0,0,0.15)";
      fill(isHovered ? (PALETTE?.purple || "#9B5DE5") : (PALETTE?.blue || "#5BACE0"));
      if (isHovered) cursor(HAND);

      rectMode(CENTER); rect(0, 0, btnW, btnH, 25); rectMode(CORNER);
      drawingContext.shadowBlur = 0;
      fill(isHovered ? 255 : 250); textSize(18); textStyle(BOLD);
      text(btnLabel, 0, 1); // Vertically centered tweak
      pop();
  }

  checkPopupClick() {
      let cardX = width / 2, btnY = height / 2 + 80, btnW = 220, btnH = 50;
      if (mouseX > cardX - btnW/2 && mouseX < cardX + btnW/2 && mouseY > btnY - btnH/2 && mouseY < btnY + btnH/2) {
        if (typeof audioManager !== "undefined") audioManager.playSound("petal");
          if (this.gameState === "RESULT") this.nextLevel();
          else if (this.gameState === "GAMEOVER") this.restartGame();
      }
  }

  drawMilestoneOverlay() {
      // 1. Smooth Spring Animation for the pop-in
      this.milestoneAnim = lerp(this.milestoneAnim, 1.0, 0.15);

      // 2. Dim Background (Fades in smoothly)
      fill(0, 150 * this.milestoneAnim); 
      noStroke(); rectMode(CORNER); 
      rect(0, 0, width, height);

      // 3. Draw and Update Confetti Physics!
      for (let i = this.confetti.length - 1; i >= 0; i--) {
        let p = this.confetti[i];
        
        // Apply Gravity and Friction
        p.vy += 0.4; // Gravity pulling down
        p.vx *= 0.98; // Air resistance slowing horizontal movement
        
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spin;

        push();
        translate(p.x, p.y);
        rotate(p.angle);
        fill(p.color);
        noStroke();
        rectMode(CENTER);
        // Make the confetti "flutter" in 3D by squishing its height
        rect(0, 0, p.size, p.size * abs(sin(frameCount * 0.1 + p.spin * 10))); 
        pop();

        // Remove off-screen confetti
        if (p.y > height + 20) this.confetti.splice(i, 1);
      }

      // 4. Draw the Card (Using Matrix Transformation to pop it in)
      let cardW = 500, cardH = 340; // Slightly taller to fit the nice graphics
      let btnW = 220, btnH = 54;
      let btnY = 100; // Relative to the center of the card

      push();
      translate(width / 2, height / 2);
      scale(this.milestoneAnim); // The whole card pops in!

      // Card Body
      drawingContext.shadowBlur = 40; 
      drawingContext.shadowColor = "rgba(0,0,0,0.3)";
      fill(255); 
      rectMode(CENTER); 
      rect(0, 0, cardW, cardH, 25);
      drawingContext.shadowBlur = 0; 

      // Hero Title
      fill(PALETTE?.yellow || "#FFD580"); // Gold shadow
      textSize(42); textStyle(BOLD); textAlign(CENTER, CENTER);
      text("🌟 LEVEL UP! 🌟", 2, -108); // Slight offset for 3D sticker effect
      fill(PALETTE?.purple || "#9B5DE5"); // Main text
      text("🌟 LEVEL UP! 🌟", 0, -110);

      // Subtitle Message
      fill(80); textSize(18); textStyle(NORMAL);
      text(this.milestoneMessage, 0, -60);

      // Stat Circles (Cute way to display Level and Score)
      let statY = -5;
      
      // Level Circle
      fill(245, 248, 255); stroke(PALETTE?.blue || "#B5CDF5"); strokeWeight(3);
      circle(-80, statY, 80);
      noStroke(); fill(120); textSize(12); textStyle(BOLD); text("LEVEL", -80, statY - 15);
      fill(PALETTE?.blue || "#5BACE0"); textSize(28); text(this.level, -80, statY + 10);

      // Score Circle
      stroke(PALETTE?.green || "#A0EACD"); strokeWeight(3); fill(245, 248, 255);
      circle(80, statY, 80);
      noStroke(); fill(120); textSize(12); textStyle(BOLD); text("SCORE", 80, statY - 15);
      fill(PALETTE?.green || "#5DC98A"); textSize(24); text(this.totalScore, 80, statY + 10);

      // The Button
      let isHovered = false;
      if (this.milestoneAnim > 0.9) { // Only allow hover once the card is fully popped in
        let relativeMouseX = mouseX - width / 2;
        let relativeMouseY = mouseY - height / 2;
        isHovered = relativeMouseX > -btnW/2 && relativeMouseX < btnW/2 && 
                    relativeMouseY > btnY - btnH/2 && relativeMouseY < btnY + btnH/2;
      }

      this.btnScale = lerp(this.btnScale || 1.0, isHovered ? 1.08 : 1.0, 0.2);

      push();
      translate(0, btnY);
      scale(this.btnScale);

      drawingContext.shadowBlur = isHovered ? 15 : 5;
      drawingContext.shadowColor = "rgba(0,0,0,0.15)";
      fill(isHovered ? (PALETTE?.green || "#A0EACD") : (PALETTE?.blue || "#B5CDF5"));
      if (isHovered) cursor(HAND);

      rectMode(CENTER); rect(0, 0, btnW, btnH, 27); 
      drawingContext.shadowBlur = 0;
      fill(isHovered ? 255 : 250); textSize(20); textStyle(BOLD);
      text("CONTINUE", 0, 1);
      pop(); // End Button

      pop(); // End Card
  }

  restartGame() {
    this.gameState = "MEMORIZE";
    this.level = 1;
    this.timerMax = 3 * 60;
    this.timer = this.timerMax;
    this.levelTimeAllowed = (this.timerMax / 60) * 1000;
    this.levelStartMillis = millis();
    this.totalScore = 0;
    this.lives = 3;
    this.shakeTimer = 0; 
    this.palette = ["#B5CDF5", "#A0EACD", "#F6C0D9", "#FFFFE0", "#FFD580"];
    this.petals = [];
    this.selectedBrushColor = this.palette[0];
    this.currentRotation = 0;
    this.generateMandala();
  }
}