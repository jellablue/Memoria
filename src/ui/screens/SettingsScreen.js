class SettingsScreen {
  constructor() {
    this.backBtnScale = 1.0;
    this._dragging = null;
    this.layout = {};
    this._lastW = -1;
    this._lastH = -1;
  }

  _syncLayout() {
    if (this._lastW === width && this._lastH === height) return;

    const cardW = constrain(width * 0.86, 400, 720);
    const cardH = constrain(height * 0.72, 360, 540);
    const cx = width / 2;
    const cy = height / 2;

    this.layout = {
      cx, cy, cardW, cardH,
      titleY: cy - cardH * 0.35,
      row1Y: cy - cardH * 0.08,
      row2Y: cy + cardH * 0.15,
     
      col1X: cx - cardW * 0.40, 
      col2X: cx + cardW * 0.05, 
      sliderW: cardW * 0.30,    
      sliderH: 12,              
    };

    this._lastW = width;
    this._lastH = height;
  }

  _toggleBounds(type) {
    const rowY = type === "bgm" ? this.layout.row1Y : this.layout.row2Y;
    return {
      x: this.layout.col1X,
      y: rowY - 22,
      w: 76,
      h: 34,
    };
  }

  _sliderBounds(type) {
    const rowY = type === "bgm" ? this.layout.row1Y : this.layout.row2Y;
    return {
      x: this.layout.col2X,
      y: rowY - this.layout.sliderH / 2,
      w: this.layout.sliderW,
      h: this.layout.sliderH,
    };
  }

  _resetBtnBounds() {
    return {
      x: this.layout.cx - (this.layout.cardW * 0.28),
      y: this.layout.cy + this.layout.cardH * 0.32,
      w: this.layout.cardW * 0.56,
      h: 46,
    };
  }

  _isInside(x, y, b) {
    return x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
  }

  _drawToggle(type, label, enabled) {
    const b = this._toggleBounds(type);
    const hover = this._isInside(mouseX, mouseY, b);

    push();
    rectMode(CORNER);
    
    fill(enabled ? color(PALETTE?.green || "#A0EACD") : color(220));
    noStroke();
    rect(b.x, b.y, b.w, b.h, 17);

   
    const knobX = enabled ? b.x + b.w - 18 : b.x + 18;
    
  
    drawingContext.shadowBlur = 8;
    drawingContext.shadowColor = "rgba(0,0,0,0.2)";
    fill(255);
    circle(knobX, b.y + b.h / 2, 26);
    drawingContext.shadowBlur = 0; 

    fill(enabled ? 60 : 120);
    textAlign(LEFT, CENTER);
    textStyle(BOLD);
    textSize(18);
    text(label, b.x + b.w + 20, b.y + b.h / 2);

    if (hover) cursor(HAND);
    pop();
  }

  _drawSlider(type, value) {
    const b = this._sliderBounds(type);
    const hover = this._isInside(mouseX, mouseY, {
      x: b.x,
      y: b.y - 15,
      w: b.w,
      h: b.h + 30, 
    });

    push();
    rectMode(CORNER);
    
    fill(220);
    noStroke();
    rect(b.x, b.y, b.w, b.h, 6);

    fill(PALETTE?.blue || "#5BACE0");
    rect(b.x, b.y, b.w * value, b.h, 6);

    const knobX = b.x + (b.w * value);
    drawingContext.shadowBlur = 8;
    drawingContext.shadowColor = "rgba(0,0,0,0.2)";
    fill(255);
    stroke(PALETTE?.blue || "#5BACE0");
    strokeWeight(3);
    circle(knobX, b.y + b.h / 2, 24);
    drawingContext.shadowBlur = 0; 

    noStroke();
    fill(90);
    textAlign(LEFT, CENTER);
    textStyle(BOLD);
    textSize(16);
    text(round(value * 100) + "%", b.x + b.w + 15, b.y + b.h / 2);

    if (hover || this._dragging === type) cursor(HAND);
    pop();
  }

  _updateSliderFromMouse(type) {
    const b = this._sliderBounds(type);
    const t = constrain((mouseX - b.x) / b.w, 0, 1);

    if (type === "bgm") {
      audioManager.setBgmVolume(t);
      if (t > 0 && !audioManager.bgmEnabled) audioManager.setBgmEnabled(true);
    } else {
      audioManager.setSfxVolume(t);
      if (t > 0 && !audioManager.sfxEnabled) audioManager.setSfxEnabled(true);
    }
  }

  draw() {
    this._syncLayout();
    cursor(ARROW);

    if (typeof bgImage !== "undefined") {
      image(bgImage, 0, 0, width, height);
  
      fill(0, 80);
      noStroke();
      rectMode(CORNER);
      rect(0, 0, width, height);
    } else {
      background(242, 246, 252); 
    }

    push();
   
    drawingContext.shadowBlur = 30;
    drawingContext.shadowColor = "rgba(0,0,0,0.15)";
    noStroke();
    fill(255, 245); 
    rectMode(CENTER);
    rect(this.layout.cx, this.layout.cy, this.layout.cardW, this.layout.cardH, 25);
    drawingContext.shadowBlur = 0; 

    fill(PALETTE?.purple || "#9B5DE5");
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(constrain(width * 0.045, 28, 40));
    text("Audio Settings", this.layout.cx, this.layout.titleY);

   
    fill(120);
    textStyle(NORMAL);
    textSize(16);
    text("Tune the music and effects to what feels best.", this.layout.cx, this.layout.titleY + 35);

  
    const settings = audioManager.getSettings();

    this._drawToggle("bgm", "🎵 Background Music", settings.bgmEnabled);
    this._drawSlider("bgm", settings.bgmVolume);

    this._drawToggle("sfx", "🔊 Sound Effects", settings.sfxEnabled);
    this._drawSlider("sfx", settings.sfxVolume);

    const resetBtn = this._resetBtnBounds();
    const resetHover = this._isInside(mouseX, mouseY, resetBtn);

    fill(resetHover ? "#F4B6B0" : "#F8D8D4");
    rectMode(CORNER);
    rect(resetBtn.x, resetBtn.y, resetBtn.w, resetBtn.h, 14);

    fill(110);
    textAlign(CENTER, CENTER);
    textStyle(BOLD);
    textSize(16);
    text("Reset Wonderland Stats", resetBtn.x + resetBtn.w / 2, resetBtn.y + resetBtn.h / 2 + 1);

    fill(140);
    textStyle(NORMAL);
    textSize(12);
    text("Clears profile peaks, averages, and consistency data", this.layout.cx, resetBtn.y + resetBtn.h + 18);

    if (resetHover) cursor(HAND);

    pop();

    this.drawBackButton();

    if (this._dragging) {
      this._updateSliderFromMouse(this._dragging);
    }
  }

  drawBackButton() {
    let cx = max(40, width * 0.05);
    let cy = max(40, height * 0.06);
    let r = 24;
    let hover = dist(mouseX, mouseY, cx, cy) < r;

    this.backBtnScale = lerp(this.backBtnScale, hover ? 1.15 : 1.0, 0.2);

    push();
    translate(cx, cy);
    scale(this.backBtnScale);

    drawingContext.shadowBlur = hover ? 15 : 5;
    drawingContext.shadowColor = "rgba(0,0,0,0.15)";
    noStroke();
    fill(255);
    circle(0, 0, r * 2);
    drawingContext.shadowBlur = 0;

    stroke(hover ? (PALETTE?.pink || "#FFB7B2") : 100);
    strokeWeight(4);
    strokeCap(ROUND);
    strokeJoin(ROUND);
    noFill();

    beginShape();
    vertex(4, -8);
    vertex(-4, 0);
    vertex(4, 8);
    endShape();
    pop();

    if (hover) cursor(HAND);
  }

  handleClick() {
    const cx = max(40, width * 0.05);
    const cy = max(40, height * 0.06);

    if (dist(mouseX, mouseY, cx, cy) < 24) {
      gameState.setScreen(GAME_STATES.WELCOME); 
      if (typeof audioManager !== "undefined") audioManager.playSound("petal");
      this._dragging = null;
      return true;
    }

    const bgmToggle = this._toggleBounds("bgm");
    const sfxToggle = this._toggleBounds("sfx");

    if (this._isInside(mouseX, mouseY, bgmToggle)) {
      audioManager.setBgmEnabled(!audioManager.bgmEnabled);
      if (typeof audioManager !== "undefined") audioManager.playSound("petal");
      return true;
    }

    if (this._isInside(mouseX, mouseY, sfxToggle)) {
      audioManager.setSfxEnabled(!audioManager.sfxEnabled);
      if (typeof audioManager !== "undefined") audioManager.playSound("petal");
      return true;
    }

    const bgmSlider = this._sliderBounds("bgm");
    const sfxSlider = this._sliderBounds("sfx");
    const resetBtn = this._resetBtnBounds();

    if (this._isInside(mouseX, mouseY, resetBtn)) {
      if (typeof starBank !== "undefined" && starBank.resetBrainStats) {
        starBank.resetBrainStats();
      }
      if (typeof audioManager !== "undefined") audioManager.playSound("petal");
      return true;
    }

    if (this._isInside(mouseX, mouseY, { x: bgmSlider.x, y: bgmSlider.y - 15, w: bgmSlider.w, h: bgmSlider.h + 30 })) {
      this._dragging = "bgm";
      this._updateSliderFromMouse("bgm");
      return true;
    }

    if (this._isInside(mouseX, mouseY, { x: sfxSlider.x, y: sfxSlider.y - 15, w: sfxSlider.w, h: sfxSlider.h + 30 })) {
      this._dragging = "sfx";
      this._updateSliderFromMouse("sfx");
      return true;
    }

    return false;
  }

  handleMouseRelease() {
    this._dragging = null;
  }

  windowResized() {
    this._lastW = -1;
    this._lastH = -1;
    this._syncLayout();
  }
}