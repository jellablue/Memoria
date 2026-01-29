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
    this.drawVisuals();
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
      fill(PALETTE.green);
      textSize(24);
      text("Your Turn!", width / 2, 50);
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
    this.nextRound();
  }

  nextRound() {
    let nextStep = floor(random(0, 9));
    this.sequence.push(nextStep);

    this.gameState = "WATCH";
    this.playerStep = 0;
    this.playbackIndex = 0;
    this.playbackTimer = -30;
    this.playbackSpeed = max(30, 60 - this.sequence.length * 2);

    console.log("New Sequence: " + this.sequence);
  }

  activateJelly(index) {
    if (index >= 0 && index < this.jellies.length) {
      this.jellies[index].active = true;
      this.jellies[index].animTimer = 0;
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
          this.activateJelly(i);

          if (i === this.sequence[this.playerStep]) {
            this.playerStep++;

            if (this.playerStep >= this.sequence.length) {
              this.score++;
              console.log("Your step is correct: " + i);
              this.gameState = "SUCCESS";
              // SUCCESS SOUND
              setTimeout(() => this.nextRound(), 1000);
              return;
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
}
