// ============================================
// MENU BUTTON COMPONENT
// ============================================

class MenuButton {
  constructor(x, y, w, h, label, col, action) {
    this.x = x - w / 2;
    this.y = y;
    this.w = w;
    this.h = h;
    this.label = label;
    this.col = col;
    this.action = action;
  }

  display() {
    let hover = this.isHovering();

    if (hover) {
      fill(255, 210);
      cursor(HAND);
      drawingContext.shadowBlur = 25;
      drawingContext.shadowColor = this.col;
    } else {
      fill(255, 120);
      cursor(ARROW);
      drawingContext.shadowBlur = 5;
      drawingContext.shadowColor = "rgba(0,0,0,0.1)";
    }

    stroke(255);
    strokeWeight(2);
    rect(this.x, this.y, this.w, this.h, 30);

    noStroke();
    fill(
      this.col === "#E0E0E0"
        ? "#888"
        : this.col === PALETTE.pink
          ? "#D68A9C"
          : this.col === PALETTE.blue
            ? "#7FA2B3"
            : "#8FB38F"
    );
    textSize(24);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text(this.label, this.x + this.w / 2, this.y + this.h / 2);

    drawingContext.shadowBlur = 0;
  }

  isHovering() {
    return (
      mouseX > this.x &&
      mouseX < this.x + this.w &&
      mouseY > this.y &&
      mouseY < this.y + this.h
    );
  }

  isClicked() {
    return this.isHovering();
  }
}
