class KaleidoPop extends Game {
  constructor(difficultyParams = {}) {
    super(difficultyParams);
    this.gameState = "MEMORIZE";
    this.timer = 3 * 60;
    this.timerMax = 3 * 60;
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

    this.showMilestoneOverlay = false;
    this.milestoneMessage = "";
    this.rotationSpeedMultiplier = 1;

    this.generateMandala();
  }

  getRotationStartLevel() {
    return (gameState.userAge <= 12) ? 10 : 6;
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

    let baseMemoSeconds = 3;
    let timeBonus = floor((this.level - 1) / 5) * 2;
    this.timerMax = (baseMemoSeconds + timeBonus) * 60;
    this.timer = this.timerMax;

    this.petals = [];
    this.currentRotation = 0;

    if (this.level % 5 === 1 && this.level > 1) {
      this.showMilestoneOverlay = true;
      this.milestoneMessage = "Great memory! Let's add more petals.";
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
    text(this.totalScore, hudX + 20, hudY + 160);
    pop();

    if (this.gameState === "INPUT") {
      push();
      let spacing = 65;
      let rightX = width - 80;
      let startY = height / 2 - ((this.palette.length - 1) * spacing) / 2;

      fill(255, 180); noStroke();
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
      let btnW = 200, btnH = 50, btnY = height / 2 + 120;
      if (abs(mouseX - width / 2) < btnW/2 && abs(mouseY - (btnY + btnH/2)) < btnH/2) {
        this.showMilestoneOverlay = false;
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
      fill(0, 100); noStroke(); rect(0, 0, width, height);
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
          if (correctCount === this.petals.length) fill("#2E7D32"); else fill("#D32F2F");
          text(`${correctCount}/${this.petals.length} Correct`, cardX, cardY - 30);
          fill(50); text(`+${correctCount * 10} Points`, cardX, cardY + 10);
      } else {
          text(`Final Score: ${this.totalScore}`, cardX, cardY - 30);
          text(`Reached Level: ${this.level}`, cardX, cardY + 10);
      }

      let btnW = 220, btnH = 50, btnY = cardY + 80;
      let isHovered = mouseX > cardX - btnW/2 && mouseX < cardX + btnW/2 && mouseY > btnY - btnH/2 && mouseY < btnY + btnH/2;

      fill(isHovered ? (PALETTE?.purple || "#9B5DE5") : (PALETTE?.blue || "#5BACE0"));
      if (isHovered) cursor(HAND);

      rectMode(CENTER); rect(cardX, btnY, btnW, btnH, 25); rectMode(CORNER);
      fill(255); textSize(18); textStyle(BOLD);
      text(btnLabel, cardX, btnY);
  }

  checkPopupClick() {
      let cardX = width / 2, btnY = height / 2 + 80, btnW = 220, btnH = 50;
      if (mouseX > cardX - btnW/2 && mouseX < cardX + btnW/2 && mouseY > btnY - btnH/2 && mouseY < btnY + btnH/2) {
          if (this.gameState === "RESULT") this.nextLevel();
          else if (this.gameState === "GAMEOVER") this.restartGame();
      }
  }

  drawMilestoneOverlay() {
      fill(0, 150); rect(0, 0, width, height);
      let cardW = 500, cardH = 300, cardX = width / 2, cardY = height / 2;

      drawingContext.shadowBlur = 30; drawingContext.shadowColor = "rgba(0,0,0,0.3)";
      fill(255); rectMode(CENTER); rect(cardX, cardY, cardW, cardH, 20);
      rectMode(CORNER); drawingContext.shadowBlur = 0;

      fill(PALETTE?.purple || "#9B5DE5"); textSize(28); textStyle(BOLD); textAlign(CENTER, CENTER);
      text(this.milestoneMessage, width / 2, height / 2 - 60);

      fill(80); textSize(20); textStyle(NORMAL);
      text("Level: " + this.level, width / 2, height / 2);
      text("Score: " + this.totalScore, width / 2, height / 2 + 35);

      let btnW = 200, btnH = 50, btnY = height / 2 + 100;
      let isHovered = mouseX > width/2 - btnW/2 && mouseX < width/2 + btnW/2 && mouseY > btnY - btnH/2 && mouseY < btnY + btnH/2;

      fill(isHovered ? PALETTE?.green : PALETTE?.blue);
      if (isHovered) cursor(HAND);

      rectMode(CENTER); rect(width / 2, btnY, btnW, btnH, 10); rectMode(CORNER);
      fill(255); textSize(18); textStyle(BOLD);
      text("CONTINUE", width / 2, btnY);
  }

  restartGame() {
    this.gameState = "MEMORIZE";
    this.level = 1;
    this.timerMax = 3 * 60;
    this.timer = this.timerMax;
    this.totalScore = 0;
    this.lives = 3;
    this.palette = ["#B5CDF5", "#A0EACD", "#F6C0D9", "#FFFFE0", "#FFD580"];
    this.petals = [];
    this.selectedBrushColor = this.palette[0];
    this.currentRotation = 0;
    this.generateMandala();
  }
}
