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
    this.shakeTimer = 0;
    this.btnScale = 1.0; 

    this.milestoneAnim = 0; 
    this.confetti = [];

    this.blu = {
      x: 0, y: 0, targetX: 0, targetY: 0, size: 40,
    };

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
        this.lives--;
        this.shakeTimer = 15;
        
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
      this.milestoneAnim = 0;
      this.initConfetti();
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

    this.drawDynamicBackground();
    this.updateBlu();
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

    this.drawBlu();

    if (this.gameState === "RESULT") {
      this.drawPopupCard("Level Complete!", "NEXT LEVEL >>");
    } else if (this.gameState === "GAMEOVER") {
      this.drawPopupCard("Game Over", "FINISH");
    }
  }

  updateBlu() {
    if (this.gameState === "RESULT" || this.gameState === "GAMEOVER") {
      this.blu.targetX = width / 2;
      this.blu.targetY = height / 2 - 180;
    } else if (this.gameState === "INPUT") {
      this.blu.targetX = width * 0.2;
      this.blu.targetY = height * 0.82;
    } else {
      this.blu.targetX = width * 0.22;
      this.blu.targetY = height * 0.75;
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
    const floatY = sin(frameCount * 0.05) * 5;
    const breath = sin(frameCount * 0.08) * (bluSize * 0.03);
    const armSwing = sin(frameCount * 0.1) * 12;

    translate(0, floatY);
    for (let g = 3; g > 0; g--) {
      noStroke();
      fill(100, 160, 255, 12 * g);
      circle(0, 0, bluSize + g * 12);
    }

    fill(PALETTE?.blue || color(80, 160, 255));
    noStroke();

    push();
    translate(-bluSize * 0.45, 0);
    rotate(radians(armSwing - 20));
    ellipse(-bluSize * 0.1, 0, bluSize * 0.25, bluSize * 0.12);
    pop();

    push();
    translate(bluSize * 0.45, 0);
    rotate(radians(-armSwing + 20));
    ellipse(bluSize * 0.1, 0, bluSize * 0.25, bluSize * 0.12);
    pop();

    rectMode(CENTER);
    rect(0, 0, bluSize + breath, bluSize - breath, bluSize * 0.4);

    fill(255, 160, 180, 140);
    ellipse(-bluSize * 0.28, bluSize * 0.1, bluSize * 0.22, bluSize * 0.14);
    ellipse(bluSize * 0.28, bluSize * 0.1, bluSize * 0.22, bluSize * 0.14);

    fill(255);
    ellipse(-bluSize * 0.18, -bluSize * 0.1, bluSize * 0.35, bluSize * 0.35);
    ellipse(bluSize * 0.18, -bluSize * 0.1, bluSize * 0.35, bluSize * 0.35);

    fill(30);
    ellipse(-bluSize * 0.18, -bluSize * 0.1, bluSize * 0.18, bluSize * 0.18);
    ellipse(bluSize * 0.18, -bluSize * 0.1, bluSize * 0.18, bluSize * 0.18);

    fill(255);
    ellipse(-bluSize * 0.13, -bluSize * 0.14, bluSize * 0.08, bluSize * 0.08);
    ellipse(bluSize * 0.23, -bluSize * 0.14, bluSize * 0.08, bluSize * 0.08);

    noFill();
    stroke(30);
    strokeWeight(max(2, bluSize * 0.035));
    arc(0, bluSize * 0.12 - (breath * 0.5), bluSize * 0.26, bluSize * 0.16, 0, PI);

    noStroke();
    fill(255, 220, 60);
    push();
    translate(-bluSize * 0.42 - (breath * 0.5), -bluSize * 0.38 + (breath * 0.5));

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

  handleUI() {
    textAlign(CENTER, CENTER);
    if (this.gameState === "MEMORIZE") {
      this.timer--;
      drawingContext.shadowBlur = 10;
      drawingContext.shadowColor = "rgba(255,255,255,0.8)";
      fill(80);
      textSize(32); textStyle(BOLD);
      text("Memorize the pattern!", width / 2, 60);
      drawingContext.shadowBlur = 0;

      let barW = 340;
      let fillW = map(this.timer, 0, this.timerMax, 0, barW);
      noStroke();
      fill(220, 150);
      rectMode(CORNER);
      rect(width/2 - barW/2, 90, barW, 12, 6);
      let timerColor = this.timer < 60 ? (PALETTE?.pink || "#F6C0D9") : (PALETTE?.blue || "#B5CDF5");
      fill(timerColor);
      rect(width/2 - barW/2, 90, fillW, 12, 6);

      if (this.timer <= 0) this.gameState = "INPUT";
    }
    else if (this.gameState === "INPUT") {
      drawingContext.shadowBlur = 10;
      drawingContext.shadowColor = "rgba(255,255,255,0.8)";
      fill(80);
      textSize(32); textStyle(BOLD);
      text("Paint the petals!", width / 2, 60);
      drawingContext.shadowBlur = 0;
      
      textSize(16); textStyle(NORMAL); fill(100);
      text("Press ENTER when finished", width / 2, 95);
    }
    push();
    let hudX = max(40, width * 0.05);
    let hudY = height / 2 - 100;
    drawingContext.shadowBlur = 25;
    drawingContext.shadowColor = "rgba(0,0,0,0.1)";
    fill(255, 210);
    stroke(255);
    strokeWeight(2);
    rectMode(CORNER);
    rect(hudX, hudY, 160, 210, 20);
    
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
    text(this.totalScore, hudX + 25, hudY + 170);
    pop();
    if (this.gameState === "INPUT") {
      push();
      let spacing = 65;
      let rightX = width - 80;
      let startY = height / 2 - ((this.palette.length - 1) * spacing) / 2;
      drawingContext.shadowBlur = 25;
      drawingContext.shadowColor = "rgba(0,0,0,0.1)";
      fill(255, 210);
      stroke(255);
      strokeWeight(2);
      rectMode(CORNER);
      rect(rightX - 45, startY - 45, 90, (this.palette.length * spacing) + 30, 45);

      for (let i = 0; i < this.palette.length; i++) {
        let py = startY + i * spacing;
        let isSelected = (this.selectedBrushColor === this.palette[i]);
        drawingContext.shadowBlur = isSelected ? 20 : 5;
        drawingContext.shadowColor = isSelected ? this.palette[i] : "rgba(0,0,0,0.15)";

        fill(this.palette[i]);
        if (isSelected) {
          stroke(255); strokeWeight(5);
          circle(rightX, py, 48);
        } else {
          stroke(230); strokeWeight(2);
          circle(rightX, py, 38);
        }
      }
      drawingContext.shadowBlur = 0;
      pop();
    }
  }

  checkClick() {
    if (this.showMilestoneOverlay) {
      if (this.milestoneAnim < 0.9) return; 

      let btnW = 220, btnH = 54;
      let absoluteBtnY = height / 2 + 100; 
      
      if (mouseX > width/2 - btnW/2 && mouseX < width/2 + btnW/2 && 
          mouseY > absoluteBtnY - btnH/2 && mouseY < absoluteBtnY + btnH/2) {
        if (typeof audioManager !== "undefined") audioManager.playSound("petal");
        this.showMilestoneOverlay = false;
        this.levelStartMillis = millis();
      }
      return;
    }

    if (this.gameState === "RESULT" || this.gameState === "GAMEOVER") {
      this.checkPopupClick();
      return;
    }

    if (this.gameState !== "INPUT") return;
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
      text(btnLabel, 0, 1);
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
      this.milestoneAnim = lerp(this.milestoneAnim, 1.0, 0.15);
      fill(0, 150 * this.milestoneAnim); 
      noStroke(); rectMode(CORNER); 
      rect(0, 0, width, height);
      for (let i = this.confetti.length - 1; i >= 0; i--) {
        let p = this.confetti[i];
        p.vy += 0.4;
        p.vx *= 0.98;
        
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spin;

        push();
        translate(p.x, p.y);
        rotate(p.angle);
        fill(p.color);
        noStroke();
        rectMode(CENTER);
        rect(0, 0, p.size, p.size * abs(sin(frameCount * 0.1 + p.spin * 10))); 
        pop();
        if (p.y > height + 20) this.confetti.splice(i, 1);
      }
      let cardW = 500, cardH = 340;
      let btnW = 220, btnH = 54;
      let btnY = 100;

      push();
      translate(width / 2, height / 2);
      scale(this.milestoneAnim);
      drawingContext.shadowBlur = 40; 
      drawingContext.shadowColor = "rgba(0,0,0,0.3)";
      fill(255); 
      rectMode(CENTER); 
      rect(0, 0, cardW, cardH, 25);
      drawingContext.shadowBlur = 0; 
      fill(PALETTE?.yellow || "#FFD580");
      textSize(42); textStyle(BOLD); textAlign(CENTER, CENTER);
      text("🌟 LEVEL UP! 🌟", 2, -108);
      fill(PALETTE?.purple || "#9B5DE5");
      text("🌟 LEVEL UP! 🌟", 0, -110);
      fill(80); textSize(18); textStyle(NORMAL);
      text(this.milestoneMessage, 0, -60);
      let statY = -5;
      fill(245, 248, 255); stroke(PALETTE?.blue || "#B5CDF5"); strokeWeight(3);
      circle(-80, statY, 80);
      noStroke(); fill(120); textSize(12); textStyle(BOLD); text("LEVEL", -80, statY - 15);
      fill(PALETTE?.blue || "#5BACE0"); textSize(28); text(this.level, -80, statY + 10);
      stroke(PALETTE?.green || "#A0EACD"); strokeWeight(3); fill(245, 248, 255);
      circle(80, statY, 80);
      noStroke(); fill(120); textSize(12); textStyle(BOLD); text("SCORE", 80, statY - 15);
      fill(PALETTE?.green || "#5DC98A"); textSize(24); text(this.totalScore, 80, statY + 10);
      let isHovered = false;
      if (this.milestoneAnim > 0.9) {
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
      pop();

      pop();
  }

  drawDynamicBackground() {
    push();
    translate(width / 2, height / 2);
    rotate(frameCount * 0.0005);

    noFill();
    strokeWeight(2);
    let rings = 6;
    let maxRadius = (width > height ? width : height) * 0.6; 
    
    for (let i = 1; i <= rings; i++) {
      let baseRadius = (maxRadius / rings) * i;
      let alpha = map(i, 1, rings, 50, 5); 
      let col = color(this.palette[i % this.palette.length]);
      col.setAlpha(alpha);
      stroke(col);

      push();
      let ringRotation = i % 2 === 0 ? (frameCount * 0.001 * i) : (-frameCount * 0.001 * i);
      rotate(ringRotation);
      let points = 6 + (i * 2); 
      let angleStep = TWO_PI / points;

      beginShape();
      for (let a = 0; a < TWO_PI; a += angleStep) {
        let pulseR = baseRadius + sin(frameCount * 0.02 + i) * 15;
        let x = cos(a) * pulseR;
        let y = sin(a) * pulseR;
        vertex(x, y);
      }
      endShape(CLOSE);
      pop();
    }
    pop();
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
