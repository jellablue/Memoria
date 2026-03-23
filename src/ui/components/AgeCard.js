class AgeCard {
  constructor(x, y, title, subtitle, color, w = 280, h = 280) {
    this.x = x;
    this.y = y;
    this.title = title;
    this.subtitle = subtitle;
    this.baseColor = color; // Store the original color
    this.w = w;
    this.h = h;
    this.particles = [];

    // --- Animation States ---
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

    // --- 1. Smooth Scaling (Lerp) ---
    let targetScale = hover ? 1.06 : 1.0;
    this.scaleFactor = lerp(this.scaleFactor, targetScale, 0.15);

    // --- 2. Parallax Effect ---
    let targetPx = 0;
    let targetPy = 0;
    if (hover) {
      // Calculate how far the mouse is from the card's center
      let relX = mouseX - this.x;
      let relY = mouseY - this.y;
      
      // Map that distance to a small pixel shift for the inner contents
      targetPx = map(relX, -halfW, halfW, -8, 8);
      targetPy = map(relY, -halfH, halfH, -8, 8);
    }
    // Smoothly transition the parallax shift
    this.parallaxX = lerp(this.parallaxX, targetPx, 0.15);
    this.parallaxY = lerp(this.parallaxY, targetPy, 0.15);

    // --- 3. Render Card Base ---
    push(); // Main isolation wrapper
    translate(this.x, this.y);
    scale(this.scaleFactor); // Apply smooth hover scale

    // Dynamic Shadows
    let c = color(this.baseColor);
    drawingContext.shadowBlur = hover ? 30 : 10;
    drawingContext.shadowColor = `rgba(${red(c)}, ${green(c)}, ${blue(c)}, ${hover ? 0.6 : 0.2})`;

    // Draw the Card Background
    fill(255);
    stroke(this.baseColor);
    strokeWeight(hover ? 5 : 2);
    rectMode(CENTER);
    rect(0, 0, this.w, this.h, 30); // Soft 30px rounded corners
    
    drawingContext.shadowBlur = 0; // Turn off shadows for internal elements

    // --- 4. Render Inner Contents (With Parallax) ---
    push(); // Inner isolation wrapper for parallax
    translate(this.parallaxX, this.parallaxY); 

    // Draw the Generative Icon
    this.drawIcon(0, -this.h * 0.15, this.h * 0.22);

    // Typography
    fill(60);
    noStroke();
    textSize(this.h * 0.11);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text(this.title, 0, this.h * 0.12);

    fill(130);
    textSize(this.h * 0.07);
    textStyle(NORMAL);
    text(this.subtitle, 0, this.h * 0.25);

    pop(); // End Parallax wrapper
    pop(); // End Main wrapper

    // --- 5. Particle System ---
    if (hover && frameCount % 8 === 0) {
      // Assuming you have a standard Particle class in your project
      // Spawn particles slightly below the card center
      this.particles.push(new Particle(this.x + random(-20, 20), this.y + this.h * 0.3, this.baseColor));
    }

    // Update and draw existing particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      if(p.update) p.update();
      if(p.display) p.display();
      
      // Clean up dead particles
      if (p.isDead && p.isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }

  // A helper method to draw unique generative shapes based on the card title
  drawIcon(x, y, size) {
    push();
    translate(x, y);
    let c = color(this.baseColor);

    // Draw soft glowing aura behind the icon
    noStroke();
    fill(red(c), green(c), blue(c), 30);
    circle(0, 0, size * 1.8);
    fill(red(c), green(c), blue(c), 60);
    circle(0, 0, size * 1.3);

    // Draw the specific icon
    fill(this.baseColor);
    if (this.title === "Explorer") {
      // A cute 5-pointed star
      this.drawStar(0, 0, size * 0.25, size * 0.5, 5);
      
    } else if (this.title === "Adventurer") {
      // A diamond / compass shape
      beginShape();
      vertex(0, -size * 0.55);
      vertex(size * 0.35, 0);
      vertex(0, size * 0.55);
      vertex(-size * 0.35, 0);
      endShape(CLOSE);
      
    } else if (this.title === "Master") {
      // A stylized 3-point crown
      let w = size * 0.45;
      let h = size * 0.35;
      beginShape();
      vertex(-w, h);          // Bottom left
      vertex(w, h);           // Bottom right
      vertex(w, -h * 0.6);    // Top right tip
      vertex(w * 0.3, 0);     // Inner right dip
      vertex(0, -h * 1.1);    // Top middle tip
      vertex(-w * 0.3, 0);    // Inner left dip
      vertex(-w, -h * 0.6);   // Top left tip
      endShape(CLOSE);
    }
    pop();
  }

  // Generative Math for a Star Polygon
  drawStar(x, y, radius1, radius2, npoints) {
    let angle = TWO_PI / npoints;
    let halfAngle = angle / 2.0;
    beginShape();
    // Start pointing up (-PI/2)
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