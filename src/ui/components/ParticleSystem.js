// ============================================
// PARTICLE SYSTEM (Lanterns & Sparkles)
// ============================================

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

    // Initialize particles
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
    // Vertical gradient background
    noFill();
    for (let y = 0; y < height; y++) {
      let inter = map(y, 0, height, 0, 1);
      let c = lerpColor(this.colorTop, this.colorBottom, inter);
      stroke(c);
      line(0, y, width, y);
    }

    // Draw particles
    for (let l of this.lanterns) l.draw();
    for (let s of this.sparkles) s.draw();

    // Foreground flora
    this.drawForegroundFlora();
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
