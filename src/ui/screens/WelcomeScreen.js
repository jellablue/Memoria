class WelcomeScreen {
  constructor() {
    this.startBtnHover  = false;
    this.bottomBtnHover = false;
    this._lastW = -1;
    this._lastH = -1;
    this.layout = {};

    this.scrollOffset    = 0;
    this.targetScroll    = 0;
    this.maxScroll       = 0;
    this.settingsBtnScale = 1.0;

    
    this._particles = Array.from({ length: 22 }, (_, i) => ({
      x:    (i * 137.508) % 1,   // golden-angle spread
      y:    (i * 97.31)   % 1,
      r:    4 + (i % 5) * 3,
      spd:  0.4 + (i % 4) * 0.18,
      phase: i * 0.41,
    }));

    this._syncLayout();
  }

  // ─── Layout ──────────────────────────────────────────────────────────────

  _syncLayout() {
    if (this._lastW === width && this._lastH === height) return;

    const base = min(width, height);
    const aboutContentHeight = 2000;

    this.layout = {
      titleSize:    constrain(base * 0.09, 38, 72),
      subtitleSize: constrain(base * 0.05, 22, 40),
      bodySize:     constrain(base * 0.024, 14, 19),
      btnW:  constrain(width * 0.28, 190, 310),
      btnH:  constrain(height * 0.09, 52, 66),
      btnY:  height * 0.75,
      infoMaxW: min(width * 0.82, 720),

      titleY:    height * 0.20,
      subtitleY: height * 0.285,
      infoY:     height * 0.365,
      bluY:      height * 0.545,

      bluSize:      constrain(base * 0.11, 54, 90),
      aboutStartY:  height,
      totalVirtualHeight: height + aboutContentHeight,
    };

    this.maxScroll = max(0, this.layout.totalVirtualHeight - height);
    this._lastW = width;
    this._lastH = height;
  }

  handleScroll(delta) {
    this.targetScroll = constrain(this.targetScroll + delta, 0, this.maxScroll);
  }

  // ─── Main draw ───────────────────────────────────────────────────────────

  draw() {
    this._syncLayout();
    this.scrollOffset = lerp(this.scrollOffset, this.targetScroll, 0.1);

    push();
    translate(0, -this.scrollOffset);
    this._drawFloatingParticles(0, this.layout.totalVirtualHeight);
    this.drawHeroSection();
    this.drawAboutSection();
    pop();

    this.drawScrollbar();
    this.drawSettingsButton();
  }

  // ─── Decorative helpers ───────────────────────────────────────────────────

  _drawFloatingParticles(fromY, toY) {
    push();
    noStroke();
    const t = frameCount * 0.006;
    const blobColors = [
      [255, 200, 220],  // rose
      [200, 230, 255],  // sky
      [220, 200, 255],  // lavender
      [200, 255, 230],  // mint
      [255, 240, 190],  // butter
    ];
    for (let i = 0; i < this._particles.length; i++) {
      const p = this._particles[i];
      const px = p.x * width  + sin(t * p.spd + p.phase) * 28;
      const py = fromY + p.y * (toY - fromY) + cos(t * p.spd * 0.7 + p.phase) * 20;
      const [r, g, b] = blobColors[i % blobColors.length];
      fill(r, g, b, 55);
      circle(px, py, p.r * 2);
    }
    pop();
  }


  _drawSparkles(startY, endY) {
    push();
    noStroke();
    const seeds = [0.12, 0.33, 0.54, 0.71, 0.88, 0.21, 0.63, 0.45, 0.79, 0.07];
    const t = frameCount * 0.04;
    for (let i = 0; i < seeds.length; i++) {
      const sx = seeds[i] * width;
      const sy = startY + ((seeds[(i + 3) % seeds.length]) * (endY - startY));
      const pulse = 0.6 + 0.4 * sin(t + i * 1.1);
      const s = (6 + (i % 4) * 3) * pulse;
      fill(255, 230, 80, 180 * pulse);
      this._drawStar(sx, sy, s * 0.4, s, 4);
    }
    pop();
  }

  _drawStar(x, y, r1, r2, pts) {
    beginShape();
    for (let i = 0; i < pts * 2; i++) {
      const ang = (i * PI) / pts - HALF_PI;
      const r   = (i % 2 === 0) ? r2 : r1;
      vertex(x + cos(ang) * r, y + sin(ang) * r);
    }
    endShape(CLOSE);
  }

  
  _drawCloudPuff(cx, cy, w, h, col) {
    push();
    noStroke();
    fill(col);
    ellipse(cx, cy, w, h);
    ellipse(cx - w * 0.28, cy + h * 0.05, w * 0.72, h * 0.85);
    ellipse(cx + w * 0.28, cy + h * 0.05, w * 0.72, h * 0.85);
    pop();
  }

  // ─── Hero ─────────────────────────────────────────────────────────────────

  drawHeroSection() {
    const L = this.layout;
    push();

    // Title
    drawingContext.shadowBlur  = 18;
    drawingContext.shadowColor = "rgba(150,100,255,0.25)";
    fill(255);
    textSize(L.titleSize);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text("Welcome to Memoria!", width / 2, L.titleY);
    drawingContext.shadowBlur = 0;

    fill(PALETTE?.text || 55);
    textSize(L.subtitleSize);
    textStyle(NORMAL);
    text("✨ Blu's Wonderland ✨", width / 2, L.subtitleY);

    fill(110);
    textSize(L.bodySize);
    textAlign(CENTER, TOP);
    rectMode(CORNER); 
    text(
      "A playful memory adventure where Blu guides you through three mini-games\nto train your visual, auditory, and spatial superpowers.",
      width / 2, L.infoY
    );
    pop();

    // Blu character
    const floatY  = sin(frameCount * 0.05) * 9;
    const bluSize = L.bluSize;
    push();
    translate(width / 2, L.bluY + floatY);

    // Glow halo
    for (let g = 3; g > 0; g--) {
      noStroke();
      fill(100, 160, 255, 18 * g);
      circle(0, 0, bluSize + g * 18);
    }

    // Body
    noStroke();
    fill(PALETTE?.blue || color(80, 160, 255));
    ellipse(0, 0, bluSize, bluSize);

    // Cheeks
    fill(255, 160, 180, 90);
    ellipse(-bluSize * 0.28, bluSize * 0.08, bluSize * 0.22, bluSize * 0.14);
    ellipse( bluSize * 0.28, bluSize * 0.08, bluSize * 0.22, bluSize * 0.14);

    // Eyes
    fill(255);
    ellipse(-bluSize * 0.18, -bluSize * 0.12, bluSize * 0.3, bluSize * 0.3);
    ellipse( bluSize * 0.18, -bluSize * 0.12, bluSize * 0.3, bluSize * 0.3);
    fill(30);
    ellipse(-bluSize * 0.18, -bluSize * 0.12, bluSize * 0.13, bluSize * 0.13);
    ellipse( bluSize * 0.18, -bluSize * 0.12, bluSize * 0.13, bluSize * 0.13);
    // Eye shine
    fill(255);
    ellipse(-bluSize * 0.15, -bluSize * 0.15, bluSize * 0.05, bluSize * 0.05);
    ellipse( bluSize * 0.21, -bluSize * 0.15, bluSize * 0.05, bluSize * 0.05);

    // Smile
    noFill();
    stroke(30);
    strokeWeight(max(2, bluSize * 0.032));
    arc(0, bluSize * 0.12, bluSize * 0.26, bluSize * 0.13, 0, PI);

    // Tiny star accessory
    noStroke();
    fill(255, 220, 60);
    this._drawStar(-bluSize * 0.46, -bluSize * 0.35, 4, 8, 5);
    pop();

    this.drawStartButton(L.btnY, "startBtnHover");
    this._drawScrollIndicator();
  }

  _drawScrollIndicator() {
    push();
    const bounceY = sin(frameCount * 0.1) * 4;
    const iy      = height * 0.92 + bounceY;
    fill(160);
    noStroke();
    textSize(this.layout.bodySize * 0.72);
    textAlign(CENTER, CENTER);
    text("scroll to learn more", width / 2, iy - 14);
    stroke(180);
    strokeWeight(2.5);
    noFill();
    beginShape();
    vertex(width / 2 - 9,  iy + 4);
    vertex(width / 2,      iy + 13);
    vertex(width / 2 + 9,  iy + 4);
    endShape();
    pop();
  }

  // ─── About section ────────────────────────────────────────────────────────

  drawAboutSection() {
    const L   = this.layout;
    const cx  = width / 2;
    const mW  = min(width * 0.88, 680);   
    const pad = 28;                        

    // Panel base
    push();
    noStroke();
    fill(252, 248, 255);
    rectMode(CORNER);
    rect(0, L.aboutStartY, width, L.totalVirtualHeight - height, 44, 44, 0, 0);
    pop();

    this._drawSparkles(L.aboutStartY, L.totalVirtualHeight);

    let y = L.aboutStartY + 70;

    // ── Section: Header ────────────────────────────────────────────
    y = this._drawSectionHeader(cx, y, "Inside Wonderland", "Your brain-training adventure starts here ✨");
    y += 18;

    // ── Section: How it Works ──────────────────────────────────────
    y = this._drawHowItWorks(cx, mW, y);
    y += 30;

    // ── Divider ───────────────────────────────────────────────────
    y = this._drawWaveDivider(cx, y);
    y += 30;

    // ── Section: Games ────────────────────────────────────────────
    y = this._drawSectionHeader(cx, y, "🎮 The Three Games", "Each game trains a different part of your memory");
    y += 14;
    y = this._drawGameCards(cx, mW, pad, y);
    y += 30;

    // ── Divider ───────────────────────────────────────────────────
    y = this._drawWaveDivider(cx, y);
    y += 30;

    // ── Section: Scoring ──────────────────────────────────────────
    y = this._drawSectionHeader(cx, y, "📈 Scoring & Progression", "How stars, streaks, and your brain profile work");
    y += 14;
    y = this._drawScoringRules(cx, mW, pad, y);
    y += 30;

    // ── Section: Controls ─────────────────────────────────────────
    y = this._drawControlsCard(cx, mW, pad, y);
    y += 50;

    // ── Bottom CTA ────────────────────────────────────────────────
    this.layout.bottomBtnY = y;
    this.drawStartButton(y, "bottomBtnHover");
  }

  // ─── Sub-section renderers ────────────────────────────────────────────────

  _drawSectionHeader(cx, y, title, sub) {
    const L = this.layout;
    push();
    textAlign(CENTER, CENTER);

    this._drawCloudPuff(cx, y + 18, 300, 52, color(240, 232, 255, 140));

    fill(PALETTE?.purple || color(120, 60, 200));
    textSize(constrain(L.titleSize * 0.52, 20, 30));
    textStyle(BOLD);
    text(title, cx, y + 18);

    fill(140);
    textStyle(NORMAL);
    textSize(L.bodySize);
    text(sub, cx, y + 60);
    pop();
    return y + 80;
  }

  _drawWaveDivider(cx, y) {
    push();
    noFill();
    stroke(210, 190, 240);
    strokeWeight(1.5);
    beginShape();
    const ww = min(width * 0.7, 500);
    for (let x = cx - ww / 2; x <= cx + ww / 2; x += 4) {
      const wy = y + sin((x - cx) * 0.04) * 5;
      vertex(x, wy);
    }
    endShape();
    pop();
    return y + 18;
  }

  _drawHowItWorks(cx, mW, startY) {
    const steps = [
      { icon: "🧩", label: "Pick a Game",         sub: "Choose from 3 mini-games" },
      { icon: "🎯", label: "Complete Challenges",   sub: "Follow Blu's instructions" },
      { icon: "🧠", label: "Train Your Brain",      sub: "Watch your profile grow" },
    ];

    const spacing = min(mW / 3, 210);
    const cardW   = spacing - 16;
    const cardH   = 140;
    const baseX   = cx - spacing;          
    const y       = startY + cardH / 2;

    for (let i = 0; i < 3; i++) {
      const icx = baseX + i * spacing;
      const icy = y;

      push();
      // Card
      noStroke();
      drawingContext.shadowBlur  = 18;
      drawingContext.shadowColor = "rgba(180,140,255,0.13)";
      fill(255);
      rectMode(CENTER);
      rect(icx, icy, cardW, cardH, 22);
      drawingContext.shadowBlur = 0;

      // Icon circle
      fill(245, 238, 255);
      circle(icx, icy - 20, 52);

      textAlign(CENTER, CENTER);
      textSize(24);
      text(steps[i].icon, icx, icy - 20);

      fill(55);
      textStyle(BOLD);
      textSize(14);
      text(steps[i].label, icx, icy + 16);

      fill(140);
      textStyle(NORMAL);
      textSize(12);
      text(steps[i].sub, icx, icy + 35);
      pop();
    }

    return startY + cardH + 20;
  }

  _drawGameCards(cx, mW, pad, startY) {
    const games = [
      {
        icon: "🌸", title: "Kaleido-Pop",
        desc: "Train your visual memory with colorful petal patterns.",
        tags: "Visual Binding  •  Mental Rotation",
        diff: "Paced  •  3–5 mins",
        bg:   color(255, 235, 245),
        accent: color(255, 160, 200),
      },
      {
        icon: "🎵", title: "Jelly Jams",
        desc: "Follow musical flash sequences to test sequential recall.",
        tags: "Auditory Memory  •  Sequencing",
        diff: "Rhythmic  •  3–5 mins",
        bg:   color(230, 248, 238),
        accent: color(100, 210, 160),
      },
      {
        icon: "👣", title: "Tiptoe Trails",
        desc: "Memorize the hidden path to master spatial awareness.",
        tags: "Spatial Mapping  •  Planning",
        diff: "Strategic  •  4–6 mins",
        bg:   color(225, 238, 255),
        accent: color(120, 170, 255),
      },
    ];

    const cardH   = 148;
    const cardGap = 20;
    let y = startY;

    for (const g of games) {
      // ── Card shell ──────────────────────────────────────────────
      push();
      noStroke();
      drawingContext.shadowBlur  = 22;
      drawingContext.shadowColor = "rgba(0,0,0,0.06)";
      fill(g.bg);
      rectMode(CENTER);
      rect(cx, y + cardH / 2, mW, cardH, 24);
      drawingContext.shadowBlur = 0;

      // Left accent bar
      fill(g.accent);
      rectMode(CORNER);
      rect(cx - mW / 2, y + 14, 5, cardH - 28, 3);

      const cardLeft = cx - mW / 2;
      const iconCX   = cardLeft + pad + 26; 
      const iconCY   = y + cardH / 2;
      
      const textX    = iconCX + 42;         
      const textW    = mW - (textX - cardLeft) - pad; 

      // ── Icon bubble ─────────────────────────────────────────────
      fill(255, 200);
      circle(iconCX, iconCY, 52);
      textAlign(CENTER, CENTER);
      textSize(26);
      text(g.icon, iconCX, iconCY);

      // ── Text block ──────────────────────────────────────────────
      fill(45);
      textStyle(BOLD);
      textSize(17);
      textAlign(LEFT, TOP);
      rectMode(CORNER); 
      text(g.title, textX, y + 20);

      // Description
      fill(100);
      textStyle(NORMAL);
      textSize(13);
      text(g.desc, textX, y + 44, textW);


      const pillY = y + cardH - 44;
      const pillW = min(textWidth(g.tags) + 24, textW);
      fill(red(g.accent), green(g.accent), blue(g.accent), 60);
      rect(textX, pillY, pillW, 24, 12);
      fill(red(g.accent) * 0.55, green(g.accent) * 0.55, blue(g.accent) * 0.55);
      textStyle(BOLD);
      textSize(11);
      textAlign(LEFT, CENTER);
      text(g.tags, textX + 12, pillY + 12);

      fill(150);
      textStyle(NORMAL);
      textSize(11);
      textAlign(RIGHT, CENTER);
      text(g.diff, cx + mW / 2 - pad, pillY + 12);

      pop();
      y += cardH + cardGap;
    }
    return y;
  }

  _drawScoringRules(cx, mW, pad, startY) {
    const rules = [
      { icon: "⭐", title: "Points → Stars",    desc: "Earn points in each game. They convert to Stars based on how deep you go and how many hearts you kept." },
      { icon: "⚡", title: "Bonus Stars",       desc: "Finish Kaleido-Pop quickly for a speed bonus, or complete 3 levels in a row perfectly for a Flawless Streak!" },
      { icon: "🏆", title: "Personal Records", desc: "Your best score per game is saved automatically. Every session gives you a chance to beat it." },
      { icon: "🧠", title: "Brain Profile",     desc: "Your records fuel your Cognitive Profile: Visual, Auditory, and Spatial. Hit 100% to master that skill!" },
      { icon: "👑", title: "Rank Up",           desc: "Collect total Stars to level up: Newbie → Explorer → Memory Master. Show off your rank badge!" },
    ];


    const rowH   = 96; 
    const cardH  = rules.length * rowH; 
    const cardCY = startY + cardH / 2;
    push();
    noStroke();
    drawingContext.shadowBlur  = 24;
    drawingContext.shadowColor = "rgba(160,120,255,0.10)";
    fill(255);
    rectMode(CENTER);
    rect(cx, cardCY, mW, cardH, 30);
    drawingContext.shadowBlur = 0;
    pop();

    const leftX  = cx - mW / 2 + pad;
    const rightW = mW - pad * 2;

    for (let i = 0; i < rules.length; i++) {
      const r   = rules[i];
      const ry  = startY + (i * rowH); 
      const rcy = ry + rowH / 2;

      push();
 
      if (i % 2 === 0) {
        noStroke();
        fill(248, 244, 255);
        rectMode(CENTER);
        if (i === 0) {
          rect(cx, rcy, mW, rowH, 30, 30, 0, 0);
        } else if (i === rules.length - 1) {
          rect(cx, rcy, mW, rowH, 0, 0, 30, 30);
        } else {
          rect(cx, rcy, mW, rowH, 0);
        }
      }


      const ibCX = leftX + 24;
      fill(240, 230, 255);
      noStroke();
      circle(ibCX, rcy, 46); 
      textAlign(CENTER, CENTER);
      textSize(20);
      text(r.icon, ibCX, rcy);

      const txX = leftX + 64; 
      const txW = rightW - 64;

      fill(50);
      textStyle(BOLD);
      textSize(15);
      textAlign(LEFT, TOP);
      rectMode(CORNER); 
      

      text(r.title, txX, ry + 22);

      fill(115);
      textStyle(NORMAL);
      textSize(13);
      text(r.desc, txX, ry + 46, txW);
      pop();
    }

    return startY + cardH;
  }

  _drawControlsCard(cx, mW, pad, startY) {
    const cardH = 90;
    const cardCY = startY + cardH / 2;

    push();
    noStroke();
    fill(235, 248, 255);
    drawingContext.shadowBlur  = 16;
    drawingContext.shadowColor = "rgba(100,160,255,0.10)";
    rectMode(CENTER);
    rect(cx, cardCY, mW, cardH, 22);
    drawingContext.shadowBlur = 0;

    textAlign(CENTER, CENTER);
    fill(70, 130, 200);
    textStyle(BOLD);
    textSize(15);
    text("🎮  Controls Guide", cx, cardCY - 16);

    fill(110);
    textStyle(NORMAL);
    textSize(13);
    text("🖱️ Click or Tap  •  👀 Follow on-screen prompts  •  🔊 Listen for audio cues", cx, cardCY + 14);
    pop();

    return startY + cardH;
  }

  // ─── Settings button ──────────────────────────────────────────────────────

  _settingsBtnBounds() {
    const size = 48;
    return {
      x: width - max(40, width * 0.05) - size / 2,
      y: max(40, height * 0.06) - size / 2,
      w: size, h: size,
    };
  }

  drawSettingsButton() {
    const b    = this._settingsBtnBounds();
    const bx   = b.x + b.w / 2;
    const by   = b.y + b.h / 2;
    const hover = mouseX > b.x && mouseX < b.x + b.w && mouseY > b.y && mouseY < b.y + b.h;

    this.settingsBtnScale = lerp(this.settingsBtnScale, hover ? 1.13 : 1.0, 0.2);

    push();
    translate(bx, by);
    scale(this.settingsBtnScale);
    noStroke();
    drawingContext.shadowBlur  = hover ? 18 : 6;
    drawingContext.shadowColor = "rgba(150,100,255,0.25)";
    fill(hover ? color(240, 232, 255) : 255);
    circle(0, 0, 48);
    drawingContext.shadowBlur = 0;
    fill(hover ? (PALETTE?.purple || color(120, 60, 200)) : 120);
    textAlign(CENTER, CENTER);
    textSize(20);
    textStyle(BOLD);
    text("⚙", 0, 1);
    pop();

    if (hover) cursor(HAND);
  }

  // ─── Start button ─────────────────────────────────────────────────────────

  drawStartButton(btnY, hoverStateName) {
    const L    = this.layout;
    const btnW = L.btnW;
    const btnH = L.btnH;
    const btnX = width / 2 - btnW / 2;
    const vmY  = mouseY + this.scrollOffset;
    const isHovering = mouseX > btnX && mouseX < btnX + btnW && vmY > btnY && vmY < btnY + btnH;

    push();
    rectMode(CORNER);

    // Glow
    drawingContext.shadowBlur  = isHovering ? 28 : 12;
    drawingContext.shadowColor = isHovering ? "rgba(100,220,160,0.5)" : "rgba(80,160,255,0.3)";

    if (isHovering) {
      this[hoverStateName] = true;
      cursor(HAND);
      // Bouncy outline
      noStroke();
      fill(100, 220, 160);
      rect(btnX - 3, btnY - 3, btnW + 6, btnH + 6, 32);
    } else {
      this[hoverStateName] = false;
      if (!this.startBtnHover && !this.bottomBtnHover) cursor(ARROW);
      noStroke();
      fill(PALETTE?.blue || color(80, 180, 255));
      rect(btnX, btnY, btnW, btnH, 30);
    }

    drawingContext.shadowBlur = 0;

    // Shine strip
    noStroke();
    fill(255, 50);
    rectMode(CORNER);
    rect(btnX + 6, btnY + 6, btnW - 12, btnH * 0.38, 20);

    fill(255);
    textSize(constrain(btnH * 0.36, 17, 22));
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    const label = hoverStateName === "bottomBtnHover" ? "🚀  START PLAYING" : "✨  START GAME";
    text(label, width / 2, btnY + btnH / 2);
    pop();
  }

  // ─── Scrollbar ────────────────────────────────────────────────────────────

  drawScrollbar() {
    if (this.maxScroll <= 0) return;
    push();
    const ratio   = this.scrollOffset / this.maxScroll;
    const barH    = map(height, 0, this.layout.totalVirtualHeight, 0, height);
    const barY    = map(ratio, 0, 1, 0, height - barH);
    noStroke();
    fill(200, 180, 240, 120);
    rectMode(CORNER);
    rect(width - 11, barY + 5, 5, barH - 10, 10);
    pop();
  }

  // ─── Click handling ───────────────────────────────────────────────────────

  handleClick() {
    this._syncLayout();
    const L    = this.layout;
    const btnW = L.btnW;
    const btnH = L.btnH;
    const btnX = width / 2 - btnW / 2;
    const vmY  = mouseY + this.scrollOffset;

    // Settings
    const s = this._settingsBtnBounds();
    if (mouseX > s.x && mouseX < s.x + s.w && mouseY > s.y && mouseY < s.y + s.h) {
      if (typeof audioManager !== "undefined") audioManager.playSound("petal");
      gameState.setScreen(GAME_STATES.SETTINGS);
      return true;
    }

    // Top CTA
    if (mouseX > btnX && mouseX < btnX + btnW && vmY > L.btnY && vmY < L.btnY + btnH) {
      this._triggerGameStart();
      return true;
    }

    // Bottom CTA
    if (L.bottomBtnY && mouseX > btnX && mouseX < btnX + btnW && vmY > L.bottomBtnY && vmY < L.bottomBtnY + btnH) {
      this._triggerGameStart();
      return true;
    }

    return false;
  }

  _triggerGameStart() {
    gameState.setScreen(GAME_STATES.AGE_SELECT);
    if (typeof audioManager !== "undefined") audioManager.playSound("petal");
    cursor(ARROW);
    this.scrollOffset = 0;
    this.targetScroll = 0;
  }
}