class KaleidoPop {
  constructor() {
    this.gameState = "MEMORIZE";
    this.timer = 5 * 60;

    this.palette = ["#B5CDF5", "#A0EACD", "#F6C0D9", "#FFFFE0", "#FFD580", "#C0C0C0"];
    this.petals = [];

    this.selectedBrushColor = this.palette[0];

    this.generateMandala();
  }

  generateMandala() {
    let numPetals = floor(random(6, 12)); //randomize no. of petals
    let angleStep = TWO_PI / numPetals; // calculate angle step

    for (let i = 0; i < numPetals; i++) {
      let petalColor = random(this.palette);

      this.petals.push({
        angle: i * angleStep, // rotation of petal
        targetColor: petalColor, // correct color to match
        inputColor: null, // input of player
        radius: 150, // length of petal
      });
    }
  }

  draw() {
    push();
    translate(width / 2, height / 2);

    this.currentRotation = this.gameState === "INPUT" ? frameCount * 0.005 : 0;
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
        if (p.inputCOlor === p.targetColor) stroke("#A0EACD");
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
    let adjustedAngle = mouseAngle - this.currentRotation - HALF_PI;

    adjustedAngle %= TWO_PI;
    if (adjustedAngle < 0) adjustedAngle += TWO_PI;

    let angleThreshold = TWO_PI / this.petals.length / 2;

    for (let p of this.petals) {
      if (distFromCenter > 25 && distFromCenter < p.radius) {
        let diff = abs(adjustedAngle - p.angle);

        if (diff > PI) diff = TWO_PI - diff;

        if (diff < angleThreshold) {
          console.log("Clicked petal at angle: " + p.angle);
          p.inputColor = this.selectedBrushColor;
          // TODO: Play a 'squish' sound here later
          break; // Stop checking other petals
        }
      }
    }
  }

  handleUI() {
    noStroke();
    textSize(24);
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
      fill(50);
      text("Results! Green = Correct, Pink = Wrong", width / 2, 50);
    }
  }
}
