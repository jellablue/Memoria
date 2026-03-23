// ============================================
// INSTRUCTION OVERLAY COMPONENT
// ============================================

class InstructionOverlay {
  constructor(gameKey) {
    this.gameKey = gameKey;
    this.info = GAME_INSTRUCTIONS[gameKey];

    // --- Animation States ---
    this.animT = 0.0;     // Overall card pop-in scale (0 to 1)
    this.btnScale = 1.0;  // Button hover squish/scale

    this._lastW = -1;
    this._lastH = -1;
    this.layout = {};
  }

  _syncLayout() {
    if (this._lastW === width && this._lastH === height) return;

    // Responsive dimensions
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

    // 1. Smooth Spring Animation
    this.animT = lerp(this.animT, 1.0, 0.15);

    push(); // Main isolation wrapper
    
    // 2. Dimmed Background (Fades in)
    noStroke();
    fill(0, 150 * this.animT); 
    rectMode(CORNER);
    rect(0, 0, width, height);

    // 3. Center Origin for easy scaling
    translate(width / 2, height / 2);
    scale(this.animT); 

    // 4. Main Modal Card (Glassmorphism)
    drawingContext.shadowBlur = 40;
    drawingContext.shadowColor = 'rgba(0,0,0,0.25)';
    fill(255);
    stroke(PALETTE?.purple || "#C3B1E1");
    strokeWeight(3);
    rectMode(CENTER);
    rect(0, 0, boxW, boxH, 25);
    
    // CRITICAL FIX: Reset rectMode immediately so the text bounding boxes behave!
    rectMode(CORNER); 
    
    drawingContext.shadowBlur = 0; // Reset shadows for text
    noStroke();

    // 5. Typography: Title
    fill(PALETTE?.purple || "#9B5DE5");
    textSize(constrain(boxW * 0.07, 26, 36));
    textStyle(BOLD);
    textAlign(CENTER, TOP);
    text(this.info.title, 0, -boxH / 2 + 30);

    // Divider Line
    stroke(230);
    strokeWeight(2);
    strokeCap(ROUND);
    line(-boxW * 0.35, -boxH / 2 + 80, boxW * 0.35, -boxH / 2 + 80);
    noStroke();

    // 6. Typography: Steps (With wrapping bounding boxes)
    fill(70);
    textSize(constrain(boxW * 0.035, 15, 18));
    textStyle(NORMAL);
    textAlign(LEFT, TOP);

    let stepStartY = -boxH / 2 + 105;
    let stepSpacing = constrain(boxH * 0.1, 40, 55); // Dynamic spacing

    for (let i = 0; i < this.info.steps.length; i++) {
      // Add a cute, colored bullet point
      fill(PALETTE?.pink || "#FFB7B2");
      circle(-boxW / 2 + 40, stepStartY + i * stepSpacing + 10, 10);

      fill(70);
      // Because we reset to rectMode(CORNER), this bounding box will now perfectly wrap the text inside the card!
      text(this.info.steps[i], -boxW / 2 + 65, stepStartY + i * stepSpacing, boxW - 100);
    }

    // 7. Scientific Context (Anchored near bottom)
    fill(130);
    textSize(constrain(boxW * 0.03, 13, 15));
    textStyle(ITALIC);
    textAlign(CENTER, BOTTOM);
    
    // FIXED: Center the bounding box by shifting X left by half its width
    let sciW = boxW * 0.85;
    text(this.info.science, -sciW / 2, boxH / 2 - 95, sciW);

    // 8. Interactive Start Button
    this.drawButton();
    
    pop(); // End main wrapper
  }

  drawButton() {
    const { boxH, btnW, btnH } = this.layout;
    
    // Button is anchored relative to the bottom of the card
    let btnY = boxH / 2 - 45;

    // Hitbox detection
    let isHovered = false;
    if (this.animT > 0.9) { 
      let relativeMouseX = mouseX - width / 2;
      let relativeMouseY = mouseY - height / 2;
      
      isHovered = (
        relativeMouseX > -btnW / 2 && relativeMouseX < btnW / 2 &&
        relativeMouseY > btnY - btnH / 2 && relativeMouseY < btnY + btnH / 2
      );
    }

    // Smooth Hover Scaling
    this.btnScale = lerp(this.btnScale, isHovered ? 1.08 : 1.0, 0.2);

    push();
    translate(0, btnY);
    scale(this.btnScale);

    // Dynamic Shadows
    drawingContext.shadowBlur = isHovered ? 20 : 8;
    drawingContext.shadowColor = "rgba(0,0,0,0.15)";

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
    let btnY = boxH / 2 - 45;
    
    let relativeMouseX = mouseX - width / 2;
    let relativeMouseY = mouseY - height / 2;

    return (
      relativeMouseX > -btnW / 2 && relativeMouseX < btnW / 2 &&
      relativeMouseY > btnY - btnH / 2 && relativeMouseY < btnY + btnH / 2
    );
  }
}