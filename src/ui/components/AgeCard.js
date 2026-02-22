// ============================================
// AGE CARD COMPONENT
// ============================================

class AgeCard {
  constructor(x, y, title, subtitle, color) {
    this.x = x;
    this.y = y;
    this.title = title;
    this.subtitle = subtitle;
    this.color = color;
    this.w = 200;
    this.h = 250;
  }

  display() {
    let hover =
      mouseX > this.x - 100 &&
      mouseX < this.x + 100 &&
      mouseY > this.y - 125 &&
      mouseY < this.y + 125;

    if (hover) {
      fill(255, 230);
      cursor(HAND);
      drawingContext.shadowBlur = 30;
      drawingContext.shadowColor = this.color;
      push();
      translate(this.x, this.y);
      scale(1.05);
      translate(-this.x, -this.y);
    } else {
      fill(255, 100);
      cursor(ARROW);
      drawingContext.shadowBlur = 10;
      drawingContext.shadowColor = "rgba(0,0,0,0.05)";
      push();
    }

    stroke(255);
    strokeWeight(4);
    rectMode(CENTER);
    rect(this.x, this.y, this.w, this.h, 25);

    noStroke();
    fill(this.color);
    ellipse(this.x, this.y - 60, 80, 80);

    fill(80);
    textSize(26);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text(this.title, this.x, this.y + 10);

    fill(120);
    textSize(18);
    textStyle(NORMAL);
    text(this.subtitle, this.x, this.y + 40);

    pop();
    rectMode(CORNER);
    drawingContext.shadowBlur = 0;
  }

  isClicked() {
    return (
      mouseX > this.x - 100 &&
      mouseX < this.x + 100 &&
      mouseY > this.y - 125 &&
      mouseY < this.y + 125
    );
  }
}
