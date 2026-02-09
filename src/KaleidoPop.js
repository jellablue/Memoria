class KaleidoPop {
  constructor() {
    this.gameState = "MEMORIZE";
    this.level = 1;
    this.timer = 3 * 60;
    this.totalScore = 0;
    this.lives = 3;

    this.palette = ["#B5CDF5", "#A0EACD", "#F6C0D9", "#FFFFE0", "#FFD580"];
    this.petals = [];
    this.selectedBrushColor = this.palette[0];
    this.currentRotation = 0;
    this.rotationSpeed = difficultyParams.petalSpeed || 0.002;
    this.currentSpeed = this.baseRotationSpeed;

    this.generateMandala();
  }

  generateMandala() {
    let minP = difficultyParams.minPetals || 6;
    let maxP = difficultyParams.maxPetals || 12;

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

    let petalRadius = 150 - this.level * 3; // Decreases by 3 pixels per level
    petalRadius = max(petalRadius, 80);

    for (let i = 0; i < numPetals; i++) {
      let petalColor = random(this.palette);

      this.petals.push({
        angle: i * angleStep, // rotation of petal
        targetColor: petalColor, // correct color to match
        inputColor: null, // input of player
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
          roundPoints += 1; // one point each petal
          correctCount++;
        }
      }

      this.totalScore += roundPoints * 10;

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

    if (this.level <= 3) {
      this.timer = 5 * 60; // 5 seconds
    } else if (this.level <= 6) {
      this.timer = 4 * 60; // 4 seconds
    } else if (this.level <= 10) {
      this.timer = 3 * 60; // 3 seconds
    } else {
      this.timer = 2 * 60; // 2 seconds for extreme levels
    }
    this.petals = [];
    this.currentRotation = 0;
    if (this.level > 5) {
      this.rotationSpeed = 0.002 + (this.level - 5) * 0.0005; // Gets faster each level
    }
    if (this.level === 5 && this.palette.length === 5) {
      this.palette.push("#FFA07A"); // Light Salmon
    }
    if (this.level === 10 && this.palette.length === 6) {
      this.palette.push("#DDA0DD"); // Plum
    }
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

  checkClick() {
    if (this.gameState !== "INPUT") return;

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
          console.log("Clicked petal at angle: " + p.angle);
          p.inputColor = this.selectedBrushColor;
          petalSound.play();
          break; // Stop checking other petals
        }
      }
    }
  }

  handleUI() {
    noStroke();
    textSize(24);
    textAlign(CENTER);

    fill(PALETTE.text || 50);
    textAlign(LEFT);
    text("Level " + this.level, 30, 40);
    text("Lives: " + "❤️".repeat(this.lives), 30, 70);

    textAlign(RIGHT);
    text("Score: " + this.totalScore, width - 30, 40);

    textAlign(CENTER);

    if (this.gameState === "MEMORIZE") {
      this.timer--;
      fill(50);
      text(
        "Memorize the pattern! Time left: " + ceil(this.timer / 60),
        width / 2,
        50,
      );

      if (this.timer <= 0) {
        this.gameState = "INPUT";
      }
    } else if (this.gameState === "INPUT") {
      let startX = width / 2 - 100;
      for (let i = 0; i < this.palette.length; i++) {
        fill(this.palette[i]);
        if (this.selectedBrushColor === this.palette[i]) {
          stroke(50);
          strokeWeight(3);
        } else {
          noStroke();
        }
        circle(startX + i * 60, height - 50, 40);
      }

      fill(50);
      noStroke();
      text("Select a color and click the petals to paint!", width / 2, 50);
      text("Press ENTER to Submit", width / 2, 80);
    } else if (this.gameState === "RESULT") {
      let correctCount = 0;
      for (let p of this.petals)
        if (p.inputColor === p.targetColor) correctCount++;
      fill(50);
      textSize(28);
      if (correctCount === this.petals.length) {
        fill("#2E7D32"); // Green for perfect
        text(
          `Perfect! ${correctCount}/${this.petals.length} Correct! 🌟`,
          width / 2,
          height / 2 - 40,
        );
      } else {
        fill("#D32F2F"); // Red for imperfect
        text(
          `Result: ${correctCount}/${this.petals.length} Correct`,
          width / 2,
          height / 2 - 40,
        );
        textSize(20);
        fill(50);
        text("Life Lost! (-1 ❤️)", width / 2, height / 2 - 10);
      }

      textSize(20);
      fill(50);
      text(`+${correctCount * 10} Points!`, width / 2, height / 2 + 20);

      // Continue Button
      fill("#3E5296");
      rectMode(CENTER);
      rect(width / 2, height - 100, 200, 50, 20);
      fill(255);
      textSize(24);
      text("NEXT LEVEL >>", width / 2, height - 95);
      rectMode(CORNER);
    } else if (this.gameState === "GAMEOVER") {
      // Game Over Screen
      fill(50);
      textSize(48);
      text("GAME OVER", width / 2, height / 2 - 60);

      textSize(28);
      text(`Final Score: ${this.totalScore}`, width / 2, height / 2);
      text(`Level Reached: ${this.level}`, width / 2, height / 2 + 40);

      // Restart Button
      fill("#3E5296");
      rectMode(CENTER);
      rect(width / 2, height - 100, 200, 50, 20);
      fill(255);
      textSize(24);
      text("RESTART", width / 2, height - 95);
      rectMode(CORNER);
    }
  }

  checkNextLevelButton() {
    if (this.gameState === "RESULT" || this.gameState === "GAMEOVER") {
      // Check if mouse is over the "NEXT LEVEL" button
      let buttonX = width / 2;
      let buttonY = height - 100;
      let buttonWidth = 200;
      let buttonHeight = 50;

      if (
        mouseX > buttonX - buttonWidth / 2 &&
        mouseX < buttonX + buttonWidth / 2 &&
        mouseY > buttonY - buttonHeight / 2 &&
        mouseY < buttonY + buttonHeight / 2
      ) {
        if (this.gameState === "RESULT") {
          this.nextLevel();
        } else if (this.gameState === "GAMEOVER") {
          this.restartGame();
        }
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
    this.rotationSpeed = difficultyParams.petalSpeed || 0.002;
    this.generateMandala();
  }
}
