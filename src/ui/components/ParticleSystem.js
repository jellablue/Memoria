
class HangingLantern {
  constructor(x, len) {
    this.x = x;
    this.len = len;
    this.swayOffset = random(100);
    this.color = color(255, 255, 200, 200);
  }

  draw() {
    let sway = sin(frameCount * 0.02 + this.swayOffset) * 10;

    stroke(255, 100);
    strokeWeight(1);
    line(this.x, 0, this.x + sway, this.len);

    noStroke();
    fill(this.color);

    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = "orange";
    ellipse(this.x + sway, this.len, 20, 25);
    drawingContext.shadowBlur = 0;
  }
}

class Sparkle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = random(width);
    this.y = random(height);
    this.size = random(2, 5);
    this.speedY = random(0.2, 0.5);
    this.alpha = 0;
    this.fade = random(2, 5);
    this.life = 0;
    this.maxLife = random(100, 300);
  }

  update() {
    this.y -= this.speedY;
    this.life++;

    if (this.life < 50) this.alpha += this.fade;
    else if (this.life > this.maxLife - 50) this.alpha -= this.fade;

    if (this.life > this.maxLife) this.reset();
  }

  draw() {
    fill(255, this.alpha);
    noStroke();
    ellipse(this.x, this.y, this.size);
  }
}

class ParticleSystem {
  constructor() {
    this.lanterns = [];
    this.sparkles = [];
    this.colorTop = color("#E0B0FF");
    this.colorBottom = color("#F0FFF0");

    for (let i = 0; i < 10; i++) {
      this.lanterns.push(new HangingLantern(random(width), random(50, 150)));
    }
    for (let i = 0; i < 40; i++) {
      this.sparkles.push(new Sparkle());
    }
  }

  update() {
    for (let s of this.sparkles) {
      s.update();
    }
  }

  draw() {
    if (typeof bgImage !== 'undefined' && bgImage) {
      image(bgImage, 0, 0, width, height);
    } else {
      noFill();
      for (let y = 0; y < height; y++) {
        let inter = map(y, 0, height, 0, 1);
        let c = lerpColor(this.colorTop, this.colorBottom, inter);
        stroke(c);
        line(0, y, width, y);
      }
    }

    for (let l of this.lanterns) l.draw();
    for (let s of this.sparkles) s.draw();

  }

  drawForegroundFlora() {
    noStroke();
    fill(150, 220, 200, 150);
    ellipse(0, height, 300, 200);
    ellipse(width, height, 350, 250);

    fill(180, 240, 220, 150);
    ellipse(50, height, 200, 150);
    ellipse(width - 50, height, 250, 180);
  }
}

class Particle {
  constructor(x, y, col) {
    this.x = x + random(-40, 40);
    this.y = y + random(-80, 40);
    this.size = random(3, 6);
    this.alpha = 255;
    this.col = col;
    this.vx = random(-0.5, 0.5);
    this.vy = random(-1.5, -0.5);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 4;
  }

  display() {
    noStroke();
    fill(red(this.col), green(this.col), blue(this.col), this.alpha);
    ellipse(this.x, this.y, this.size);
  }

  isDead() {
    return this.alpha <= 0;
  }
}
