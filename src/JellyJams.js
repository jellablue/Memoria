class JellyJams {
  constructor() {
    this.gridSize = 3;
    this.jellies = [];
    this.gap = 20;
    this.cellSize = 100;

    this.sequence = [];
    this.playerStep = 0;
    this.gameState = "IDLE"; // IDLE, WATCH, INPUT, GAMEOVER
    this.score = 0;

    this.playbackIndex = 0;
    this.playbackTimer = 0;
    this.playbackSpeed = 60;

    this.osc = new p5.Oscillator("sine");
    this.osc.amp(0);
    this.osc.start();

    this.notes = [
      261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25, 587.33,
    ];

    this.blu = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      size: 40,
    };

    this.standbyPos = { x: 100, y: height - 100 };

    this.initGrid();
  }

  initGrid() {
    let startX =
      width / 2 -
      (this.gridSize * this.cellSize + (this.gridSize - 1) * this.gap) / 2;
    let startY =
      height / 2 -
      (this.gridSize * this.cellSize + (this.gridSize - 1) * this.gap) / 2;

    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        let x = startX + c * (this.cellSize + this.gap);
        let y = startY + r * (this.cellSize + this.gap);
        let baseColor = random([
          PALETTE.pink,
          PALETTE.blue,
          PALETTE.yellow,
          PALETTE.purple,
        ]);
        this.jellies.push({
          x: x,
          y: y,
          w: this.cellSize,
          h: this.cellSize,
          color: baseColor,
          active: false,
          animTimer: 0,
        });
      }
    }
  }

  draw() {
    this.handleLogic();
    this.updateBlu();
    this.drawVisuals();
    this.drawBlu();
  }

  handleLogic() {
    for (let j of this.jellies) {
      if (j.active) {
        j.animTimer++;
        if (j.animTimer > 20) {
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
    textAlign(CENTER, CENTER);
    noStroke();

    if (this.gameState === "IDLE") {
      fill(PALETTE.text);
      textSize(24);
      text("Click anywhere to start!", width / 2, 50);
    } else if (this.gameState === "WATCH") {
      fill(PALETTE.purple);
      textSize(24);
      text("Watch Blu...", width / 2, 50);
    } else if (this.gameState === "INPUT") {
      if (this.isReverse) {
        fill(PALETTE.pink); // Use a warning color
        textSize(24);
        text("REVERSE! (Backwards)", width / 2, 50);
      } else {
        fill(PALETTE.green);
        textSize(24);
        text("Your Turn!", width / 2, 50);
      }
    } else if (this.gameState === "GAMEOVER") {
      fill("red");
      textSize(24);
      text("Game Over! Score: " + this.score, width / 2, 50);
      textSize(16);
      fill(100);
      text("Click to restart", width / 2, 80);
    }

    for (let i = 0; i < this.jellies.length; i++) {
      let j = this.jellies[i];

      if (j.active) {
        fill(255);
        stroke(j.color);
        strokeWeight(4);
      } else if (this.isHovering(i) && this.gameState === "INPUT") {
        fill(lerpColor(color(j.color), color(255), 0.4));
      } else {
        noStroke();
        fill(j.color);
      }

      rect(j.x, j.y, j.w, j.h, 20);
      noStroke();
    }
  }

  startGame() {
    this.sequence = [];
    this.score = 0;
    this.playerStep = 0;

    let startCount = difficultyParams.jellyStartLength - 1;
    for (let i=0; i < startCount; i++) {
        this.sequence.push(floor(random(0, 9)));
    }

    this.nextRound();
  }

  nextRound() {
    let nextStep = floor(random(0, 9));
    this.sequence.push(nextStep);

    if (this.score >= 3 && random() < difficultyParams.jellyTwistChance) {
      this.isReverse = true;
    } else {
      this.isReverse = false;
    }

    this.gameState = "WATCH";
    this.playerStep = 0;
    this.playbackIndex = 0;
    this.playbackTimer = -30;
    this.playbackSpeed = max(30, 60 - this.sequence.length * 2);

    let baseSpeed = difficultyParams.jellySpeed;
    this.playbackSpeed = max(10, baseSpeed - (this.sequence.length * 1.5))

    console.log("New Sequence: " + this.sequence);
  }

  activateJelly(index, isPlayerClick = false) {
    if (index >= 0 && index < this.jellies.length) {
      this.jellies[index].active = true;
      this.jellies[index].animTimer = 0;

      if (this.gameState === "WATCH") {
        this.blu.targetX = this.jellies[index].x + this.jellies[index].w / 2;
        this.blu.targetY =
          this.jellies[index].y + this.jellies[index].h / 2 - 20;
      }

      if (this.osc) {
        this.osc.freq(this.notes[index], 0.1);
        this.osc.amp(0.5, 0.05);
        this.osc.amp(0, 0.2, 0.1);
      }
    }
  }

  checkClick() {
    if (this.gameState === "GAMEOVER" || this.gameState === "IDLE") {
      this.startGame();
      return;
    }

    if (this.gameState !== "INPUT") {
      return;
    }

    if (this.gameState === "INPUT") {
      for (let i = 0; i < this.jellies.length; i++) {
        if (this.isHovering(i)) {
          this.activateJelly(i, true);

          let expectedIndex;

          if (this.isReverse) {
            expectedIndex =
              this.sequence[this.sequence.length - 1 - this.playerStep];
          } else {
            expectedIndex = this.sequence[this.playerStep];
          }

          if (i === expectedIndex) {
            this.playerStep++;

            if (this.playerStep >= this.sequence.length) {
              this.score++;
              this.gameState = "SUCCESS";

              setTimeout(() => {
                if (state === "GAME_B") this.nextRound();
              }, 1000);
            }
          } else {
            console.log(
              "Wrong! Expected " +
                this.sequence[this.playerStep] +
                " but got " +
                i,
            );
            this.gameState = "GAMEOVER";
            // FAIL SOUND
          }
          return;
        }
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
    if (this.gameState === "IDLE") {
      this.blu.targetX = width / 2;
      this.blu.targetY = height / 2;
    } else if (this.gameState === "INPUT" || this.gameState === "SUCCESS") {
      this.blu.targetX = this.standbyPos.x;
      this.blu.targetY = this.standbyPos.y;
    }

    this.blu.x = lerp(this.blu.x, this.blu.targetX, 0.15);
    this.blu.y = lerp(this.blu.y, this.blu.targetY, 0.15);
  }

  drawBlu() {
    push();
    translate(this.blu.x, this.blu.y);

    // --- 1. SHADOW (Always stays on the ground) ---
    noStroke();
    fill(0, 50);
    ellipse(0, 20, 30, 10);

    // --- 2. CALCULATE BOUNCE ---
    let jumpHeight = dist(
      this.blu.x,
      this.blu.y,
      this.blu.targetX,
      this.blu.targetY,
    );
    let bounce = min(jumpHeight * 0.5, 50);

    // Apply the bounce to the drawing context
    translate(0, -bounce);

    // --- 3. REWIND REMIX VISUAL CUE (The "Dizzy" Twist) ---
    // If the game is in Reverse Mode, make Blu wobble!
    if (this.isReverse) {
      rotate(sin(frameCount * 0.2) * 0.5); // Wobble back and forth

      // Optional: Add tiny "confused" marks
      fill(PALETTE.pink);
      ellipse(20, -20, 8, 8);
      ellipse(-20, 10, 5, 5);
    }

    // --- 4. DRAW BLU (Body) ---
    // Change color to Purple if Reverse, otherwise Blue
    if (this.isReverse) fill(PALETTE.purple);
    else fill(50, 100, 255);

    ellipse(0, 0, this.blu.size, this.blu.size);

    // Eyes
    fill(255);
    ellipse(-8, -5, 12, 12);
    ellipse(8, -5, 12, 12);
    fill(0);

    // If Dizzy, make pupils wander
    if (this.isReverse) {
      ellipse(-8 + sin(frameCount * 0.5) * 3, -5, 4, 4); // Crazy eyes
      ellipse(8 - sin(frameCount * 0.5) * 3, -5, 4, 4);
    } else {
      ellipse(-8, -5, 5, 5);
      ellipse(8, -5, 5, 5);
    }

    // Mouth
    noFill();
    stroke(0);
    strokeWeight(2);
    // If Dizzy, mouth is a straight line or open 'O'
    if (this.isReverse) {
      ellipse(0, 5, 10, 10); // 'O' mouth
    } else {
      arc(0, 5, 10, 5, 0, PI); // Smile
    }

    pop();
  }
}
