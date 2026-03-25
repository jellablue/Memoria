class AgeCard {
  constructor(x, y, title, subtitle, color, w = 280, h = 280, description = "") {
    this.x = x;
    this.y = y;
    this.title = title;
    this.subtitle = subtitle;
    this.description = description;
    this.baseColor = color;
    this.w = w;
    this.h = h;
    this.particles = [];

    this.scaleFactor = 1.0;
    this.parallaxX = 0;
    this.parallaxY = 0;
  }

  display() {
    const halfW = this.w / 2;
    const halfH = this.h / 2;
    let hover =
      mouseX > this.x - halfW &&
      mouseX < this.x + halfW &&
      mouseY > this.y - halfH &&
      mouseY < this.y + halfH;

    let targetScale = hover ? 1.06 : 1.0;
    this.scaleFactor = lerp(this.scaleFactor, targetScale, 0.15);

    let targetPx = 0;
    let targetPy = 0;
    if (hover) {
      let relX = mouseX - this.x;
      let relY = mouseY - this.y;

      targetPx = map(relX, -halfW, halfW, -8, 8);
      targetPy = map(relY, -halfH, halfH, -8, 8);
    }
    this.parallaxX = lerp(this.parallaxX, targetPx, 0.15);
    this.parallaxY = lerp(this.parallaxY, targetPy, 0.15);

    push();
    translate(this.x, this.y);
    scale(this.scaleFactor);

    let c = color(this.baseColor);
    drawingContext.shadowBlur = hover ? 30 : 10;
    drawingContext.shadowColor = `rgba(${red(c)}, ${green(c)}, ${blue(c)}, ${hover ? 0.6 : 0.2})`;

    fill(255);
    stroke(this.baseColor);
    strokeWeight(hover ? 5 : 2);
    rectMode(CENTER);
    rect(0, 0, this.w, this.h, 30);

    drawingContext.shadowBlur = 0;

    push();
    translate(this.parallaxX, this.parallaxY);

    this.drawIcon(0, -this.h * 0.15, this.h * 0.22);

    fill(60);
    noStroke();
    textSize(this.h * 0.11);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text(this.title, 0, this.h * 0.12);

    fill(130);
    textSize(this.h * 0.07);
    textStyle(NORMAL);
    text(this.subtitle, 0, this.description ? this.h * 0.22 : this.h * 0.25);

    if (this.description) {
      fill(110);
      textSize(this.h * 0.055);
      text(this.description, 0, this.h * 0.33);
    }

    pop();
    pop();

    if (hover && frameCount % 8 === 0) {
      this.particles.push(new Particle(this.x + random(-20, 20), this.y + this.h * 0.3, this.baseColor));
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

  drawIcon(x, y, size) {
    push();
    translate(x, y);
    let c = color(this.baseColor);

    noStroke();
    fill(red(c), green(c), blue(c), 30);
    circle(0, 0, size * 1.8);
    fill(red(c), green(c), blue(c), 60);
    circle(0, 0, size * 1.3);

    fill(this.baseColor);
    if (this.title === "Explorer") {
      this.drawStar(0, 0, size * 0.25, size * 0.5, 5);

    } else if (this.title === "Adventurer") {
      beginShape();
      vertex(0, -size * 0.55);
      vertex(size * 0.35, 0);
      vertex(0, size * 0.55);
      vertex(-size * 0.35, 0);
      endShape(CLOSE);

    } else if (this.title === "Master") {
      let w = size * 0.45;
      let h = size * 0.35;
      beginShape();
      vertex(-w, h);
      vertex(w, h);
      vertex(w, -h * 0.6);
      vertex(w * 0.3, 0);
      vertex(0, -h * 1.1);
      vertex(-w * 0.3, 0);
      vertex(-w, -h * 0.6);
      endShape(CLOSE);
    }
    pop();
  }

  drawStar(x, y, radius1, radius2, npoints) {
    let angle = TWO_PI / npoints;
    let halfAngle = angle / 2.0;
    beginShape();
    for (let a = -PI / 2; a < TWO_PI - PI / 2; a += angle) {
      let sx = x + cos(a) * radius2;
      let sy = y + sin(a) * radius2;
      vertex(sx, sy);
      sx = x + cos(a + halfAngle) * radius1;
      sy = y + sin(a + halfAngle) * radius1;
      vertex(sx, sy);
    }
    endShape(CLOSE);
  }

  isClicked() {
    const halfW = this.w / 2;
    const halfH = this.h / 2;
    return (
      mouseX > this.x - halfW &&
      mouseX < this.x + halfW &&
      mouseY > this.y - halfH &&
      mouseY < this.y + halfH
    );
  }
}
