class AgeCard {
  constructor(x, y, title, subtitle, color) {
    this.x = x;
    this.y = y;
    this.title = title;
    this.subtitle = subtitle;
    this.color = color;
    // EDIT HERE: Default card width and height.
    this.w = 280;
    this.h = 280;
    this.particles = [];
  }

  display() {
    let pulse = sin(frameCount * 0.05) * 10;
    push();

    // EDIT HERE: Hover hit area; keep this in sync with card width/height changes.
    let hover =
      mouseX > this.x - 100 &&
      mouseX < this.x + 100 &&
      mouseY > this.y - 125 &&
      mouseY < this.y + 125;

    if (hover) {
      if (frameCount % 5 === 0) {
        this.particles.push(new Particle(this.x, this.y, this.color));
      }
      // EDIT HERE: Hover card background transparency.
      fill(255, 230);
      cursor(HAND);
      // EDIT HERE: Hover glow intensity and color.
      drawingContext.shadowBlur = hover ? 60 + pulse : 15;
      drawingContext.shadowColor = color(
        red(this.color),
        green(this.color),
        blue(this.color),
        150, // transparency
      );
      fill(255, 240);
      push();
      translate(this.x, this.y);
      // EDIT HERE: Hover zoom scale.
      scale(1.05);
      translate(-this.x, -this.y);
    } else {
      // EDIT HERE: Non-hover card background transparency.
      fill(255, 100);
      cursor(ARROW);
      drawingContext.shadowBlur = 15;
      drawingContext.shadowColor = this.color;

      push();
    }

    if (hover) {
      drawingContext.shadowBlur = 25;
      drawingContext.shadowColor = this.color;
    } else {
      drawingContext.shadowBlur = 5;
    }

    stroke(255);
    strokeWeight(4);
    rectMode(CENTER);
    // EDIT HERE: Card corner roundness.
    rect(this.x, this.y, this.w, this.h, 25);

    noStroke();
    fill(this.color);
    // EDIT HERE: Accent circle size and vertical position.
    noStroke();

    // outer glow
    for (let i = 60; i > 0; i -= 5) {
      fill(red(this.color), green(this.color), blue(this.color), 5);
      ellipse(this.x, this.y - 60, i + 40);
    }

    // inner core
    fill(this.color);
    ellipse(this.x, this.y - 60, 50);

    // EDIT HERE: Title typography (color/size/weight/position).
    fill(80);
    textSize(30);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text(this.title, this.x, this.y + 20);

    // EDIT HERE: Subtitle typography (color/size/position).
    fill(120);
    textSize(22);
    textStyle(NORMAL);
    text(this.subtitle, this.x, this.y + 55);
    pop();
    rectMode(CORNER);
    drawingContext.shadowBlur = 0;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      p.update();
      p.display();

      if (p.isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }

  isClicked() {
    // EDIT HERE: Click hit area; keep this aligned with visual card size.
    return (
      mouseX > this.x - 100 &&
      mouseX < this.x + 100 &&
      mouseY > this.y - 125 &&
      mouseY < this.y + 125
    );
  }
}
