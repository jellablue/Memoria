class InstructionOverlay {
  constructor(gameKey) {
    this.gameKey = gameKey;
    this.info = GAME_INSTRUCTIONS[gameKey];

    this.animT = 0.0;
    this.btnScale = 1.0;

    this._lastW = -1;
    this._lastH = -1;
    this.layout = {};
  }

  _syncLayout() {
    if (this._lastW === width && this._lastH === height) return;

    let boxW = constrain(width * 0.7, 340, 600);
    let boxH = constrain(height * 0.7, 400, 520);

    this.layout = {
      boxW,
      boxH,
      btnW: constrain(boxW * 0.5, 200, 260),
      btnH: 54
    };

    this._lastW = width;
    this._lastH = height;
  }

  draw() {
    this._syncLayout();
    const { boxW, boxH } = this.layout;

    this.animT = lerp(this.animT, 1.0, 0.15);
    push();
    resetMatrix(); 
    noStroke();
    fill(0, 180 * this.animT);
    rectMode(CORNER);
    rect(0, 0, width, height);
    pop();

    push();
    translate(width / 2, height / 2);
    scale(this.animT);
    drawingContext.shadowBlur = 40;
    drawingContext.shadowColor = 'rgba(0,0,0,0.3)';
    fill(255);
    stroke(PALETTE?.purple || "#C3B1E1");
    strokeWeight(4);
    rectMode(CENTER);
    rect(0, 0, boxW, boxH, 30); 

    drawingContext.shadowBlur = 0;
    noStroke();
    fill(PALETTE?.purple || "#9B5DE5");
    textSize(constrain(boxW * 0.07, 26, 36));
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text(this.info.title, 0, -boxH / 2 + 45);
    stroke(230);
    strokeWeight(2);
    strokeCap(ROUND);
    line(-boxW * 0.3, -boxH / 2 + 80, boxW * 0.3, -boxH / 2 + 80);
    noStroke();
    fill(60);
    textSize(constrain(boxW * 0.038, 16, 20));
    textStyle(NORMAL);
    textAlign(CENTER, TOP);

    let stepStartY = -boxH / 2 + 105;
    let stepSpacing = constrain(boxH * 0.12, 45, 65);

    for (let i = 0; i < this.info.steps.length; i++) {
      fill(60);
      rectMode(CENTER);
      text(this.info.steps[i], 0, stepStartY + i * stepSpacing + 15, boxW * 0.8);
    }
    fill(120);
    textSize(constrain(boxW * 0.03, 13, 15));
    textStyle(ITALIC);
    textAlign(CENTER, BOTTOM);
    rectMode(CENTER);
    text(this.info.science, 0, boxH / 2 - 90, boxW * 0.85);

    this.drawButton();

    pop();
  }

  drawButton() {
    const { boxH, btnW, btnH } = this.layout;
    let btnY = boxH / 2 - 40;

    let isHovered = false;
    if (this.animT > 0.9) {
      let relativeMouseX = mouseX - width / 2;
      let relativeMouseY = mouseY - height / 2;

      isHovered = (
        relativeMouseX > -btnW / 2 && relativeMouseX < btnW / 2 &&
        relativeMouseY > btnY - btnH / 2 && relativeMouseY < btnY + btnH / 2
      );
    }
    let pulse = 1.0 + sin(frameCount * 0.05) * 0.02;
    this.btnScale = lerp(this.btnScale, isHovered ? 1.08 : pulse, 0.2);

    push();
    translate(0, btnY);
    scale(this.btnScale);
    drawingContext.shadowBlur = isHovered ? 25 : 12;
    drawingContext.shadowColor = isHovered ? "rgba(93,201,138,0.4)" : "rgba(0,0,0,0.15)";

    fill(isHovered ? (PALETTE?.green || "#A0EACD") : (PALETTE?.blue || "#B5CDF5"));
    if (isHovered) cursor(HAND);

    rectMode(CENTER);
    rect(0, 0, btnW, btnH, 30);

    drawingContext.shadowBlur = 0;
    fill(isHovered ? 255 : 250);
    textSize(constrain(btnH * 0.35, 16, 20));
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text("START PLAYING", 0, 0);

    pop();
  }

  isButtonClicked() {
    if (this.animT < 0.9) return false;

    const { boxH, btnW, btnH } = this.layout;
    let btnY = boxH / 2 - 40;

    let relativeMouseX = mouseX - width / 2;
    let relativeMouseY = mouseY - height / 2;

    return (
      relativeMouseX > -btnW / 2 && relativeMouseX < btnW / 2 &&
      relativeMouseY > btnY - btnH / 2 && relativeMouseY < btnY + btnH / 2
    );
  }
}
