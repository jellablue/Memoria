class ProfileScreen {
  constructor() {
    this.animT = 0;
    this.backBtnScale = 1.0;
    this.nodeScales = [1.0, 1.0, 1.0];

    this.scrollOffset = 0;
    this.targetScroll = 0;
    this.maxScroll = 0;

    this._lastW = -1;
    this._lastH = -1;
    this.layout = {};
  }

  resetAnim() {
    this.animT = 0;
    this.scrollOffset = 0;
    this.targetScroll = 0;
  }

  _syncLayout() {
    if (this._lastW === width && this._lastH === height) return;

    const isNarrow = width < 768;
    const cx = width / 2;
    const headerY = 80;
    const radarRadius = min(120, width * 0.22);
    const LD = radarRadius + 55;
    const visualOffset = 0.25 * LD; 

    const cardH = radarRadius * 3.2; 
    const radarCardY = headerY + 100 + cardH / 2; 
    const radarCY = radarCardY + visualOffset; 

    const summaryHeaderY = radarCardY + cardH / 2 + 50;
    const summaryCardsStartY = summaryHeaderY + 50;
    const cardW = min(width * 0.9, 700);

    const metricH = 170;
    const metricGap = 20;
    const totalVirtualHeight = summaryCardsStartY + (3 * metricH) + (2 * metricGap) + 120;

    this.layout = {
      cx, isNarrow, cardW,
      headerY, radarCardY, radarCY, radarRadius, cardH,
      summaryHeaderY, summaryCardsStartY,
      metricH, metricGap,
      totalVirtualHeight
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
    this._drawDynamicBackground();

    this.scrollOffset = lerp(this.scrollOffset, this.targetScroll, 0.1);
    this.animT = lerp(this.animT, 1.0, 0.08);

    push();
    translate(0, -this.scrollOffset);

    this._drawHeader();
    this._drawRadarCard();
    this._drawMetricCards();

    pop();

    this.drawBackButton();
    this.drawScrollbar();
  }
  _drawDynamicBackground() {
    push();
    fill(245, 248, 255); 
    noStroke();
    rectMode(CORNER);
    rect(0, 0, width, height);
    fill(200, 210, 240, 80);
    for(let i = 0; i < 5; i++) {
      let x = (width * 0.2 * i) + sin(frameCount * 0.005 + i) * 100;
      let y = (height * 0.3 * i) + cos(frameCount * 0.006 + i) * 100;
      circle(x % width, y % height, 150 + sin(frameCount*0.01)*50);
    }
    pop();
  }

  _drawHeader() {
    const { cx, headerY } = this.layout;

    push();
    
    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = "rgba(0,0,0,0.05)";
    fill(255, 200);
    stroke(255);
    strokeWeight(2);
    rectMode(CENTER);
    rect(cx, headerY + 10, min(width * 0.8, 500), 90, 25);
    drawingContext.shadowBlur = 0;
    noStroke();

    fill(PALETTE?.purple || "#9B5DE5");
    textAlign(CENTER, CENTER);
    textSize(constrain(width * 0.045, 24, 32));
    textStyle(BOLD);
    text("📖 Your Wonderland Passport", cx, headerY - 5);

    fill(120);
    textSize(constrain(width * 0.025, 13, 16));
    textStyle(NORMAL);
    text("A magical record of your brightest memories and journeys!", cx, headerY + 26);
    pop();
  }

  _drawRadarCard() {
    const { cx, radarCardY, radarCY, radarRadius, cardW, cardH } = this.layout;

    push();
    rectMode(CENTER);
    drawingContext.shadowBlur = 25;
    drawingContext.shadowColor = "rgba(0,0,0,0.08)";
    fill(255, 230); 
    stroke(255);
    strokeWeight(3);
    
    rect(cx, radarCardY, cardW, cardH, 25);
    drawingContext.shadowBlur = 0;
    pop();

    this._drawGrid(cx, radarCY, radarRadius);
    this._drawAxes(cx, radarCY, radarRadius);
    this._drawPlayerShape(cx, radarCY, radarRadius);
    this._drawLabels(cx, radarCY, radarRadius);
  }

  _drawMetricCards() {
    const { cx, summaryHeaderY, summaryCardsStartY, cardW, metricH, metricGap } = this.layout;
    const scores = (typeof starBank !== 'undefined')
      ? starBank.getCognitiveScores()
      : {
          visual: 0, auditory: 0, spatial: 0,
          sessionVisual: 0, sessionAuditory: 0, sessionSpatial: 0,
          details: {
            kaleido: { finalScore: 0, levelLabel: "Developing", peakPct: 0, avgPct: 0, consistencyLabel: "Low", tagline: "" },
            jelly: { finalScore: 0, levelLabel: "Developing", peakPct: 0, avgPct: 0, consistencyLabel: "Low", tagline: "" },
            tiptoe: { finalScore: 0, levelLabel: "Developing", peakPct: 0, avgPct: 0, consistencyLabel: "Low", tagline: "" },
          },
        };
    push();
    fill(130);
    textSize(14);
    textStyle(BOLD);
    textAlign(LEFT, CENTER);
    noStroke();
    let leftEdge = cx - cardW/2;
    text("WONDERLAND ADVENTURE STATS", leftEdge + 15, summaryHeaderY);

    stroke(220);
    strokeWeight(2);
    strokeCap(ROUND);
    line(leftEdge + 15, summaryHeaderY + 20, cx + cardW/2 - 15, summaryHeaderY + 20);
    pop();

    const metrics = [
      { icon: "\uD83C\uDF38", game: "Kaleido-Pop", gameKey: "kaleido", faculty: "Visual Binding", color: PALETTE?.pink || "#FFB7B2", score: scores.visual, sessionScore: scores.sessionVisual, detail: scores.details?.kaleido },
      { icon: "\uD83C\uDFB5", game: "Jelly Jams", gameKey: "jelly", faculty: "Audio Sequencing", color: PALETTE?.blue || "#B5CDF5", score: scores.auditory, sessionScore: scores.sessionAuditory, detail: scores.details?.jelly },
      { icon: "\uD83D\uDC63", game: "Tiptoe Trails", gameKey: "tiptoe", faculty: "Spatial Mapping", color: PALETTE?.green || "#A0EACD", score: scores.spatial, sessionScore: scores.sessionSpatial, detail: scores.details?.tiptoe },
    ];

    for (let i = 0; i < metrics.length; i++) {
      const m = metrics[i];
      const cardY = summaryCardsStartY + i * (metricH + metricGap);
      
      push();
      fill(255, 230);
      stroke(255);
      strokeWeight(2);
      drawingContext.shadowBlur = 20;
      drawingContext.shadowColor = "rgba(0,0,0,0.06)";
      rectMode(CORNER);
      rect(leftEdge, cardY, cardW, metricH, 20);
      drawingContext.shadowBlur = 0;
      noStroke();
      let iconColor = color(m.color);
      fill(red(iconColor), green(iconColor), blue(iconColor), 50);
      circle(leftEdge + 45, cardY + 45, 50);
      fill(50);
      textAlign(CENTER, CENTER);
      textSize(24);
      text(m.icon, leftEdge + 45, cardY + 47);
      fill(60);
      textSize(20);
      textStyle(BOLD);
      textAlign(LEFT, CENTER);
      text(m.faculty, leftEdge + 85, cardY + 35);

      fill(130);
      textSize(14);
      textStyle(NORMAL);
      text("Trained in: " + m.game, leftEdge + 85, cardY + 58);
      fill(m.color);
      textSize(32);
      textStyle(BOLD);
      textAlign(RIGHT, CENTER);
      text(round(m.score * this.animT) + "%", leftEdge + cardW - 30, cardY + 45);
      const detail = m.detail || { finalScore: m.score, levelLabel: "Developing", peakPct: m.score, avgPct: m.sessionScore, consistencyLabel: "Low", tagline: "" };
      
      fill(100);
      textSize(13);
      textStyle(NORMAL);
      textAlign(LEFT, CENTER);
      text(`Peak: ${round(detail.peakPct)}%   |   Avg: ${round(detail.avgPct)}%   |   ${detail.consistencyLabel} Consistency`, leftEdge + 35, cardY + 95);
      const barW = cardW - 70;
      const barX = leftEdge + 35;
      const barY = cardY + 125;
      fill(235);
      rect(barX, barY, barW, 14, 7);
      fill(red(iconColor), green(iconColor), blue(iconColor), 90);
      rect(barX, barY, barW * (m.sessionScore / 100) * this.animT, 14, 7);
      fill(m.color);
      rect(barX, barY, barW * (m.score / 100) * this.animT, 14, 7);
      const delta = (typeof starBank !== 'undefined' && starBank.getSessionDelta) ? starBank.getSessionDelta(m.gameKey) : null;
      if (delta) {
        let currentFillX = barX + (barW * (m.score / 100) * this.animT);
        let badgeX = constrain(currentFillX, barX + 40, barX + barW - 40); 
        
        fill(255, 240, 180);
        rectMode(CENTER);
        rect(badgeX, barY - 20, 70, 22, 11);
        fill(120, 90, 20);
        textSize(11);
        textStyle(BOLD);
        text("PB " + delta, badgeX, barY - 19);
      }
      pop();
    }
  }

  _drawLabels(cx, cy, R) {
    const scores = (typeof starBank !== 'undefined') ? starBank.getCognitiveScores() : { visual: 0, auditory: 0, spatial: 0 };
    const LD = R + 55;

    const data = [
      { label: "VISUAL",   sub: "Binding",    score: scores.visual,   angle: -HALF_PI,                  color: PALETTE?.pink || "#FFB7B2" },
      { label: "AUDITORY", sub: "Sequencing", score: scores.auditory, angle: (TWO_PI / 3) - HALF_PI,    color: PALETTE?.blue || "#B5CDF5" },
      { label: "SPATIAL",  sub: "Mapping",    score: scores.spatial,  angle: (TWO_PI / 3) * 2 - HALF_PI,color: PALETTE?.green || "#A0EACD" },
    ];

    for (const d of data) {
      const lx = cx + cos(d.angle) * LD;
      const ly = cy + sin(d.angle) * LD;
      
      push();
      noStroke();
      drawingContext.shadowBlur = 10;
      drawingContext.shadowColor = "rgba(0,0,0,0.1)";
      fill(255); 
      rectMode(CENTER); 
      rect(lx, ly, 110, 56, 15);
      drawingContext.shadowBlur = 0;
      fill(d.color);
      rect(lx, ly - 26, 60, 4, 2);
      textAlign(CENTER, CENTER);
      fill(60); 
      textSize(12); 
      textStyle(BOLD); 
      text(d.label, lx, ly - 10);
      
      fill(140); 
      textSize(10); 
      textStyle(NORMAL);
      text(d.sub, lx, ly + 2);
      
      fill(d.color); 
      textSize(16); 
      textStyle(BOLD);
      text(round(d.score * this.animT) + "%", lx, ly + 18);
      pop();
    }
  }

  handleClick() {
    let cx = max(40, width * 0.05);
    let cy = max(40, height * 0.06);

    if (dist(mouseX, mouseY, cx, cy) < 24) {
      
      if (typeof audioManager !== 'undefined') {
        audioManager.playBackgroundMusic("menu");
        audioManager.playSound("petal");
      }
  
      gameState.setScreen(GAME_STATES.MENU);

      this.scrollOffset = 0;
      this.targetScroll = 0;
      
      return true;
    }
    return false; 
  }

  _drawGrid(cx, cy, R) {
    const rings = [25, 50, 75, 100];
    const labelAngle = (TWO_PI / 3) * 2 - HALF_PI;
    push();
    for (let i = 0; i < rings.length; i++) {
      const r = (rings[i] / 100) * R;
      const isLast = i === rings.length - 1;
      noFill();
      stroke(isLast ? 200 : 230);
      strokeWeight(isLast ? 2 : 1);
      strokeJoin(ROUND);
      beginShape();
      for (let j = 0; j < 3; j++) {
        const a = (TWO_PI / 3) * j - HALF_PI;
        vertex(cx + cos(a) * r, cy + sin(a) * r);
      }
      endShape(CLOSE);
      if (i === 1 || i === 2) {
        fill(160); noStroke(); textSize(10); textStyle(BOLD); textAlign(LEFT, CENTER);
        text(rings[i] + "%", cx + cos(labelAngle) * r + 8, cy + sin(labelAngle) * r - 8);
      }
    }
    pop();
  }

  _drawAxes(cx, cy, R) {
    const colors = [PALETTE?.pink || "#FFB7B2", PALETTE?.blue || "#B5CDF5", PALETTE?.green || "#A0EACD"];
    push();
    for (let i = 0; i < 3; i++) {
      const a = (TWO_PI / 3) * i - HALF_PI;
      stroke(colors[i]);
      strokeWeight(2);
      drawingContext.setLineDash([5, 8]);
      line(cx, cy, cx + cos(a) * R, cy + sin(a) * R);
      drawingContext.setLineDash([]);
    }
    pop();
  }

  _drawPlayerShape(cx, cy, R) {
    const s = (typeof starBank !== 'undefined') ? starBank.getCognitiveScores() : { visual: 0, auditory: 0, spatial: 0 };
    const t = this.animT;
    const pts = [
      [cx + cos(-HALF_PI) * (s.visual / 100) * R * t, cy + sin(-HALF_PI) * (s.visual / 100) * R * t],
      [cx + cos((TWO_PI / 3) - HALF_PI) * (s.auditory / 100) * R * t, cy + sin((TWO_PI / 3) - HALF_PI) * (s.auditory / 100) * R * t],
      [cx + cos((TWO_PI / 3) * 2 - HALF_PI) * (s.spatial / 100) * R * t, cy + sin((TWO_PI / 3) * 2 - HALF_PI) * (s.spatial / 100) * R * t],
    ];

    push();
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = "rgba(155, 93, 229, 0.3)";
    fill(red(color(PALETTE?.purple || "#9B5DE5")), green(color(PALETTE?.purple || "#9B5DE5")), blue(color(PALETTE?.purple || "#9B5DE5")), 50);
    stroke(PALETTE?.purple || "#9B5DE5");
    strokeWeight(3);
    strokeJoin(ROUND);
    beginShape();
    for (let p of pts) vertex(p[0], p[1]);
    endShape(CLOSE);
    pop();

    const dotColors = [PALETTE?.pink || "#FFB7B2", PALETTE?.blue || "#B5CDF5", PALETTE?.green || "#A0EACD"];
    for (let i = 0; i < 3; i++) {
      let virtualMouseY = mouseY + this.scrollOffset;
      let isHovered = dist(mouseX, virtualMouseY, pts[i][0], pts[i][1]) < 15;

      this.nodeScales[i] = lerp(this.nodeScales[i], isHovered ? 1.6 : 1.0, 0.2);

      push();
      translate(pts[i][0], pts[i][1]);
      scale(this.nodeScales[i]);
      drawingContext.shadowBlur = isHovered ? 20 : 10;
      drawingContext.shadowColor = dotColors[i];
      fill(255); stroke(dotColors[i]); strokeWeight(4);
      circle(0, 0, 12);
      if (isHovered) cursor(HAND);
      pop();
    }
  }

  drawScrollbar() {
    if (this.maxScroll <= 0) return;

    let scrollRatio = this.scrollOffset / this.maxScroll;
    let barHeight = map(height, 0, this.layout.totalVirtualHeight, 0, height);
    let barY = map(scrollRatio, 0, 1, 0, height - barHeight);

    push();
    fill(200, 100);
    noStroke();
    rectMode(CORNER);
    rect(width - 12, barY + 5, 6, barHeight - 10, 10);
    pop();
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
    drawingContext.shadowColor = 'rgba(0,0,0,0.15)';
    noStroke();
    fill(255);
    circle(0, 0, r * 2);
    drawingContext.shadowBlur = 0;

    stroke(hover ? (PALETTE?.pink || '#FFB7B2') : 100);
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

}
