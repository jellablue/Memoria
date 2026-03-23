class MenuButton {
  constructor(x, y, w, h, label, col, action, description = "") {
    // MenuScreen passes 'x' as center, and 'y' as the top edge.
    // We calculate the true geometric center (cx, cy) for easier 3D math and scaling.
    this.cx = x;
    this.cy = y + h / 2; 
    
    this.w = w;
    this.h = h;
    this.label = label;
    this.description = description;
    this.baseColor = col;
    this.action = action;
    this.particles = [];

    // --- Animation States ---
    this.scaleFactor = 1.0;
    this.parallaxX = 0;
    this.parallaxY = 0;
  }

  display() {
    let hover = this.isHovering();
    
    // --- 1. Smooth Interpolation (Scaling) ---
    let targetScale = hover ? 1.04 : 1.0;
    this.scaleFactor = lerp(this.scaleFactor, targetScale, 0.2);

    // --- 2. Parallax Effect ---
    let targetPx = 0;
    let targetPy = 0;
    if (hover) {
      targetPx = map(mouseX - this.cx, -this.w / 2, this.w / 2, -5, 5);
      targetPy = map(mouseY - this.cy, -this.h / 2, this.h / 2, -3, 3);
    }
    this.parallaxX = lerp(this.parallaxX, targetPx, 0.2);
    this.parallaxY = lerp(this.parallaxY, targetPy, 0.2);

    push(); // MAIN ISOLATION WRAPPER

    // Translate to center for scaling and drawing
    translate(this.cx, this.cy);
    scale(this.scaleFactor);

    // --- 3. Dynamic Shadows ---
    let c = color(this.baseColor);
    drawingContext.shadowBlur = hover ? 25 : 8;
    // Glow uses the button's specific color
    drawingContext.shadowColor = `rgba(${red(c)}, ${green(c)}, ${blue(c)}, ${hover ? 0.6 : 0.15})`;

    // --- 4. Draw Button Base ---
    fill(255, hover ? 245 : 200); // Slight glassmorphism transparency
    stroke(this.baseColor);
    strokeWeight(hover ? 4 : 2);
    rectMode(CENTER);
    rect(0, 0, this.w, this.h, 25); // 25px rounded corners

    drawingContext.shadowBlur = 0; // Turn off shadow for internal text

    // --- 5. Inner Parallax Wrapper ---
    push(); 
    translate(this.parallaxX, this.parallaxY);

    // Procedurally calculate a dark, readable version of the base color for the title
    let darkTextCol = lerpColor(c, color(20, 20, 30), 0.5); 

    noStroke();
    fill(darkTextCol);
    textSize(constrain(this.h * 0.32, 18, 28));
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    // Draw text slightly above center
    text(this.label, 0, -this.h * 0.12);

    fill(100);
    textStyle(NORMAL);
    textSize(constrain(this.h * 0.18, 12, 16));
    // Draw description slightly below center
    text(this.description, 0, this.h * 0.22);

    pop(); // End Parallax Wrapper
    pop(); // End Main Matrix Wrapper (Fixes the Matrix Leak!)

    // --- 6. Particle System ---
    if (hover) {
      cursor(HAND);
      if (frameCount % 8 === 0) {
        // Spawn particles randomly around the button's bottom edge
        let px = this.cx + random(-this.w / 3, this.w / 3);
        let py = this.cy + this.h / 2;
        // Assuming your Particle class accepts (x, y, color)
        this.particles.push(new Particle(px, py, this.baseColor));
      }
    } else {
      // We only want to set cursor to ARROW if another button isn't already setting it to HAND
      // Handled globally in MenuScreen, but safe to default here.
    }

    // Update and draw existing particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      if(p.update) p.update();
      if(p.display) p.display();

      if (p.isDead && p.isDead()) {
        this.particles.splice(i, 1);
      }
    }
  }

  // Updated to use the true center coordinates
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