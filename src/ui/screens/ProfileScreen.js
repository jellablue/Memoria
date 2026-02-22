// ============================================
// PROFILE SCREEN (Radar Chart)
// ============================================

class ProfileScreen {
  constructor() {
    this.maxRadius = 150;
  }

  draw() {
    background(255);

    fill(PALETTE.purple);
    textAlign(CENTER, CENTER);
    textSize(32);
    textStyle(BOLD);
    text("Your Cognitive Shape", width / 2, 50);

    let cx = width / 2;
    let cy = height / 2 + 20;

    // Draw background grid
    this.drawGrid(cx, cy);

    // Draw labels
    this.drawLabels(cx, cy);

    // Draw player's shape
    this.drawPlayerShape(cx, cy);

    // Feedback text
    fill(50);
    textSize(18);
    textStyle(ITALIC);
    text(
      "Your brain profile based on gameplay performance.",
      cx,
      height - 60
    );

    this.drawBackButton();
  }

  drawGrid(cx, cy) {
    stroke(200);
    strokeWeight(1);
    noFill();

    for (let r = 1; r <= 4; r++) {
      let radius = (this.maxRadius / 4) * r;
      beginShape();
      for (let i = 0; i < 3; i++) {
        let angle = (TWO_PI / 3) * i - HALF_PI;
        let x = cx + cos(angle) * radius;
        let y = cy + sin(angle) * radius;
        vertex(x, y);
      }
      endShape(CLOSE);
    }
  }

  drawLabels(cx, cy) {
    fill(100);
    noStroke();
    textSize(16);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);

    text("VISUAL\n(Binding)", cx, cy - this.maxRadius - 40);

    let ang2 = (TWO_PI / 3) * 1 - HALF_PI;
    text(
      "AUDITORY\n(Sequencing)",
      cx + cos(ang2) * (this.maxRadius + 60),
      cy + sin(ang2) * (this.maxRadius + 60)
    );

    let ang3 = (TWO_PI / 3) * 2 - HALF_PI;
    text(
      "SPATIAL\n(Mapping)",
      cx + cos(ang3) * (this.maxRadius + 60),
      cy + sin(ang3) * (this.maxRadius + 60)
    );
  }

  drawPlayerShape(cx, cy) {
    let vScore = map(
      gameState.cognitiveProfile.visualScore || 10,
      0,
      100,
      0,
      this.maxRadius
    );
    let aScore = map(
      gameState.cognitiveProfile.auditoryScore || 10,
      0,
      100,
      0,
      this.maxRadius
    );
    let sScore = map(
      gameState.cognitiveProfile.spatialScore || 10,
      0,
      100,
      0,
      this.maxRadius
    );

    fill(PALETTE.blue + "80");
    stroke(PALETTE.blue);
    strokeWeight(3);

    let ang2 = (TWO_PI / 3) * 1 - HALF_PI;
    let ang3 = (TWO_PI / 3) * 2 - HALF_PI;

    beginShape();
    vertex(cx + cos(-HALF_PI) * vScore, cy + sin(-HALF_PI) * vScore);
    vertex(cx + cos(ang2) * aScore, cy + sin(ang2) * aScore);
    vertex(cx + cos(ang3) * sScore, cy + sin(ang3) * sScore);
    endShape(CLOSE);

    // Draw corner dots
    fill(PALETTE.purple);
    noStroke();
    circle(cx + cos(-HALF_PI) * vScore, cy + sin(-HALF_PI) * vScore, 10);
    circle(cx + cos(ang2) * aScore, cy + sin(ang2) * aScore, 10);
    circle(cx + cos(ang3) * sScore, cy + sin(ang3) * sScore, 10);
  }

  drawBackButton() {
    push();
    fill(255);
    stroke(200);
    strokeWeight(1);
    rect(10, 10, 60, 30, 5);
    fill(100);
    noStroke();
    textSize(12);
    textStyle(NORMAL);
    textAlign(LEFT, CENTER);
    text("MENU", 22, 25);
    pop();
  }

  handleClick() {
    if (mouseX > 10 && mouseX < 70 && mouseY > 10 && mouseY < 40) {
      gameState.setScreen(GAME_STATES.MENU);
      return true;
    }
    return false;
  }
}
