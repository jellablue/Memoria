class WelcomeScreen {
  constructor() {
    this.startBtnHover = false;
    this._lastW = -1;
    this._lastH = -1;
    this.layout = {};
    
    // --- Scroll State Variables ---
    this.scrollOffset = 0;   
    this.targetScroll = 0;   
    this.maxScroll = 0;      
    
    this._syncLayout();
  }

  _syncLayout() {
    if (this._lastW === width && this._lastH === height) return;

    const base = min(width, height);
    
    // Typography
    const titleSize = constrain(base * 0.09, 38, 74);
    const subtitleSize = constrain(base * 0.05, 24, 42);
    const bodySize = constrain(base * 0.024, 14, 20);
    
    // Interactive Elements
    const btnW = constrain(width * 0.28, 190, 320);
    const btnH = constrain(height * 0.09, 52, 68);

    this.layout = {
      titleY: height * 0.20,
      subtitleY: height * 0.28,
      infoY: height * 0.38,
      bluY: height * 0.55,
      bluSize: constrain(base * 0.11, 56, 92),
      titleSize,
      subtitleSize,
      bodySize,
      btnW,
      btnH,
      btnY: height * 0.75,
      infoMaxW: min(width * 0.82, 780),
      aboutStartY: height, 
      totalVirtualHeight: height * 2.1 
    };

    this.maxScroll = max(0, this.layout.totalVirtualHeight - height);
    this._lastW = width;
    this._lastH = height;
  }

  handleScroll(delta) {
    this.targetScroll += delta;
    this.targetScroll = constrain(this.targetScroll, 0, this.maxScroll);
  }

  draw() {
    this._syncLayout();
    this.scrollOffset = lerp(this.scrollOffset, this.targetScroll, 0.1);

    push(); 
    translate(0, -this.scrollOffset);

    this.drawHeroSection();
    this.drawAboutSection();

    pop(); 
    
    this.drawScrollbar(); 
  }

  drawHeroSection() {
    // 1. Title & Subtitle
    push(); // Isolate Hero Typography
    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = "rgba(255,255,255,0.6)";
    fill(255);
    textSize(this.layout.titleSize);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text("Welcome to Memoria!", width / 2, this.layout.titleY);
    drawingContext.shadowBlur = 0; 

    fill(PALETTE?.text || 50);
    textSize(this.layout.subtitleSize);
    textStyle(NORMAL);
    text("Blu's Wonderland", width / 2, this.layout.subtitleY);

    // 2. Main Info Text (FIXED BOUNDING BOX)
    fill(100);
    textSize(this.layout.bodySize);
    textAlign(CENTER, TOP); 
    rectMode(CENTER); // Explicitly tell p5 to anchor the box to the center point
    text(
      "A playful memory adventure where Blu guides you through three mini-games to train visual, auditory, and spatial skills.",
      width / 2, // We can now perfectly center it to the screen width!
      this.layout.infoY,
      this.layout.infoMaxW
    );
    pop(); // End Hero Typography Isolation

    // 3. Floating Blu 
    let floatY = sin(frameCount * 0.05) * 10;
    const bluSize = this.layout.bluSize;
    
    push(); // Isolate Blu
    translate(width / 2, this.layout.bluY + floatY);
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = "rgba(50, 100, 255, 0.4)";
    noStroke();
    fill(PALETTE?.blue || color(50, 150, 255));
    ellipse(0, 0, bluSize, bluSize);
    
    drawingContext.shadowBlur = 0; 
    fill(255);
    ellipse(-bluSize * 0.18, -bluSize * 0.12, bluSize * 0.31, bluSize * 0.31); 
    ellipse(bluSize * 0.18, -bluSize * 0.12, bluSize * 0.31, bluSize * 0.31);  
    fill(0);
    ellipse(-bluSize * 0.18, -bluSize * 0.12, bluSize * 0.12, bluSize * 0.12); 
    ellipse(bluSize * 0.18, -bluSize * 0.12, bluSize * 0.12, bluSize * 0.12);  
    noFill();
    stroke(0);
    strokeWeight(max(2, bluSize * 0.03));
    arc(0, bluSize * 0.13, bluSize * 0.24, bluSize * 0.12, 0, PI); 
    pop();

    this.drawStartButton();
    this.drawScrollIndicator();
  }

  drawScrollIndicator() {
    push(); // Isolate Scroll Indicator
    let bounceY = sin(frameCount * 0.1) * 5;
    let indicatorY = height * 0.92 + bounceY;
    
    fill(150);
    noStroke();
    textSize(this.layout.bodySize * 0.7);
    textAlign(CENTER, CENTER);
    text("Scroll Down", width / 2, indicatorY - 15);
    
    stroke(150);
    strokeWeight(3);
    noFill();
    beginShape();
    vertex(width / 2 - 10, indicatorY + 5);
    vertex(width / 2, indicatorY + 15);
    vertex(width / 2 + 10, indicatorY + 5);
    endShape();
    pop();
  }

  drawAboutSection() {
    let startY = this.layout.aboutStartY;
    
    push(); // Isolate About Section Background
    fill(248, 250, 255); 
    noStroke();
    rectMode(CORNER);
    rect(0, startY, width, height * 1.1, 40, 40, 0, 0); 

    fill(PALETTE?.blue || 50);
    textSize(this.layout.titleSize * 0.7);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text("Inside Wonderland", width / 2, startY + 130);
    pop();

    let cardW = min(width * 0.8, 600);
    let cardH = height * 0.18;
    let cardSpacing = cardH + 20;
    let firstCardY = startY + 270;

    const games = [
      { title: "Kaleido-Pop", desc: "Train your visual memory with popping, colorful patterns.", color: PALETTE?.pink || '#FFB7B2' },
      { title: "Jelly Jams", desc: "Follow the musical sequences to test your sequential recall.", color: PALETTE?.green || '#E2F0CB' },
      { title: "Tiptoe Trails", desc: "Memorize the hidden path to improve your spatial awareness.", color: PALETTE?.blue || '#B5EAD7' }
    ];

    // Draw Feature Cards
    for (let i = 0; i < games.length; i++) {
      let currentY = firstCardY + (i * cardSpacing);
      
      push(); // Isolate Card Background
      fill(255);
      stroke(games[i].color);
      strokeWeight(4);
      drawingContext.shadowBlur = 10;
      drawingContext.shadowColor = "rgba(0,0,0,0.05)";
      rectMode(CENTER); 
      rect(width / 2, currentY, cardW, cardH, 20); 
      pop();

      push(); 
      noStroke();
      fill(50);
      textSize(this.layout.bodySize * 1.2);
      textStyle(BOLD);
      textAlign(LEFT, BOTTOM);
      text(games[i].title, width / 2 - cardW / 2 + 30, currentY - 5);

      fill(100);
      textSize(this.layout.bodySize * 0.9);
      textStyle(NORMAL);
      textAlign(LEFT, TOP);
      rectMode(CORNER); 
      text(games[i].desc, width / 2 - cardW / 2 + 30, currentY + 5, cardW - 60);
      pop();
    }
  }

  drawStartButton() {
    push(); // Isolate Button
    let btnW = this.layout.btnW;
    let btnH = this.layout.btnH;
    let btnX = width / 2 - btnW / 2;
    let btnY = this.layout.btnY;
    let virtualMouseY = mouseY + this.scrollOffset;

    let isHovering = (mouseX > btnX && mouseX < btnX + btnW && virtualMouseY > btnY && virtualMouseY < btnY + btnH);

    drawingContext.shadowBlur = isHovering ? 20 : 10;
    drawingContext.shadowColor = "rgba(0,0,0,0.15)";
    
    rectMode(CORNER); // Enforce predictable drawing
    if (isHovering) {
      this.startBtnHover = true;
      cursor(HAND);
      fill(PALETTE?.green || color(100, 220, 150));
      rect(btnX - 2, btnY - 2, btnW + 4, btnH + 4, 30); 
    } else {
      this.startBtnHover = false;
      // Let global cursor logic reset to ARROW if needed, but safe here
      cursor(ARROW);
      fill(PALETTE?.blue || color(80, 180, 255));
      rect(btnX, btnY, btnW, btnH, 30);
    }

    drawingContext.shadowBlur = 0; 
    noStroke();
    fill(255);
    textSize(constrain(btnH * 0.38, 18, 24));
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text("START GAME", width / 2, btnY + btnH / 2);
    pop();
  }

  drawScrollbar() {
    if (this.maxScroll <= 0) return;
    
    push(); // Isolate Scrollbar
    let scrollRatio = this.scrollOffset / this.maxScroll;
    let barHeight = map(height, 0, this.layout.totalVirtualHeight, 0, height);
    let barY = map(scrollRatio, 0, 1, 0, height - barHeight);
    
    fill(200, 100); 
    noStroke();
    rectMode(CORNER);
    rect(width - 12, barY + 5, 6, barHeight - 10, 10);
    pop();
  }

  handleClick() {
    this._syncLayout();
    let btnW = this.layout.btnW;
    let btnH = this.layout.btnH;
    let btnX = width / 2 - btnW / 2;
    let btnY = this.layout.btnY;
    let virtualMouseY = mouseY + this.scrollOffset;

    if (
      mouseX > btnX &&
      mouseX < btnX + btnW &&
      virtualMouseY > btnY &&
      virtualMouseY < btnY + btnH
    ) {
      gameState.setScreen(GAME_STATES.AGE_SELECT);
      if (typeof audioManager !== 'undefined') audioManager.playSound("petal");
      
      cursor(ARROW);
      this.scrollOffset = 0;
      this.targetScroll = 0;
      return true;
    }
    return false;
  }
}