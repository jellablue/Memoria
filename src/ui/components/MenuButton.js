class MenuButton {
  constructor(x, y, w, h, label, col, action, description = "") {
    this.cx = x;
    this.cy = y + h / 2;

    this.w = w;
    this.h = h;
    this.label = label;
    this.description = description;
    this.baseColor = col;
    this.action = action;
    this.particles = [];

    this.scaleFactor = 1.0;
    this.parallaxX = 0;
    this.parallaxY = 0;
  }

  display() {
    let hover = this.isHovering();

    let targetScale = hover ? 1.04 : 1.0;
    this.scaleFactor = lerp(this.scaleFactor, targetScale, 0.2);

    let targetPx = 0;
    let targetPy = 0;
    if (hover) {
      targetPx = map(mouseX - this.cx, -this.w / 2, this.w / 2, -5, 5);
      targetPy = map(mouseY - this.cy, -this.h / 2, this.h / 2, -3, 3);
    }
    this.parallaxX = lerp(this.parallaxX, targetPx, 0.2);
    this.parallaxY = lerp(this.parallaxY, targetPy, 0.2);

    push();

    translate(this.cx, this.cy);
    scale(this.scaleFactor);

    let c = color(this.baseColor);
    drawingContext.shadowBlur = hover ? 25 : 8;
    drawingContext.shadowColor = `rgba(${red(c)}, ${green(c)}, ${blue(c)}, ${hover ? 0.6 : 0.15})`;

    fill(255, hover ? 245 : 200);
    stroke(this.baseColor);
    strokeWeight(hover ? 4 : 2);
    rectMode(CENTER);
    rect(0, 0, this.w, this.h, 25);

    drawingContext.shadowBlur = 0;

    push();
    translate(this.parallaxX, this.parallaxY);

    let darkTextCol = lerpColor(c, color(20, 20, 30), 0.5);

    noStroke();
    fill(darkTextCol);
    textSize(constrain(this.h * 0.32, 18, 28));
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text(this.label, 0, -this.h * 0.12);

    fill(100);
    textStyle(NORMAL);
    textSize(constrain(this.h * 0.18, 12, 16));
    text(this.description, 0, this.h * 0.22);

    pop();
    pop();

    if (hover) {
      cursor(HAND);
      if (frameCount % 8 === 0) {
        let px = this.cx + random(-this.w / 3, this.w / 3);
        let py = this.cy + this.h / 2;
        this.particles.push(new Particle(px, py, this.baseColor));
      }
    } else {
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      if(p.update) p.update();
      if(p.display) p.display();

      if (p.isDead && p.isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }

  isHovering() {
    return (
      mouseX > this.cx - this.w / 2 &&
      mouseX < this.cx + this.w / 2 &&
      mouseY > this.cy - this.h / 2 &&
      mouseY < this.cy + this.h / 2
    );
  }

  isClicked() {
    return this.isHovering();
  }
}
