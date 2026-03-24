
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
    const radarCardY = headerY + 350;
    const radarRadius = min(150, width * 0.2);
    const summaryHeaderY = radarCardY + radarRadius + 180;
    const summaryCardsStartY = summaryHeaderY + 40;
    const cardW = min(width * 0.9, 700);
    const totalVirtualHeight = summaryCardsStartY + (3 * 95) + 120;

    this.layout = {
      cx, isNarrow, cardW,
      headerY, radarCardY, radarRadius,
      summaryHeaderY, summaryCardsStartY,
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


    background(245, 248, 255);


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

  _drawHeader() {
    const { cx, headerY } = this.layout;

    push();
    fill(PALETTE?.purple || "#9B5DE5");
    textAlign(CENTER, CENTER);
    textSize(constrain(width * 0.045, 28, 40));
    textStyle(BOLD);
    text("\uD83E\uDDE0 Your Brain Profile", cx, headerY);

    fill(120);
    textSize(constrain(width * 0.025, 14, 18));
    textStyle(NORMAL);
    text("Cognitive capacity mapped from your best performances", cx, headerY + 40);
    pop();
  }

  _drawRadarCard() {
    const { cx, radarCardY, radarRadius, cardW } = this.layout;
    const cardH = radarRadius * 3.6;

    push();
    rectMode(CENTER);
    drawingContext.shadowBlur = 25;
    drawingContext.shadowColor = "rgba(0,0,0,0.06)";
    fill(255);
    noStroke();
    rect(cx, radarCardY, cardW, cardH, 25);
    drawingContext.shadowBlur = 0;
    pop();

    this._drawGrid(cx, radarCardY, radarRadius);
    this._drawAxes(cx, radarCardY, radarRadius);
    this._drawPlayerShape(cx, radarCardY, radarRadius);
    this._drawLabels(cx, radarCardY, radarRadius);
  }

  _drawMetricCards() {
    const { cx, summaryHeaderY, summaryCardsStartY, cardW } = this.layout;
    const scores = (typeof starBank !== 'undefined')
      ? starBank.getCognitiveScores()
      : {
          visual: 0,
          auditory: 0,
          spatial: 0,
          sessionVisual: 0,
          sessionAuditory: 0,
          sessionSpatial: 0,
        };

    push();
    fill(150);
    textSize(13);
    textStyle(BOLD);
    textAlign(LEFT, CENTER);
    noStroke();
    text("DETAILED COGNITIVE BREAKDOWN", cx - cardW/2 + 10, summaryHeaderY);

    stroke(220);
    strokeWeight(2);
    strokeCap(ROUND);
    line(cx - cardW/2 + 10, summaryHeaderY + 15, cx + cardW/2 - 10, summaryHeaderY + 15);
    pop();

    const metrics = [
      {
        icon: "\uD83C\uDF38",
        game: "Kaleido-Pop",
        gameKey: "kaleido",
        faculty: "Visual Binding",
        color: PALETTE?.pink || "#FFB7B2",
        score: scores.visual,
        sessionScore: scores.sessionVisual,
      },
      {
        icon: "\uD83C\uDFB5",
        game: "Jelly Jams",
        gameKey: "jelly",
        faculty: "Audio Sequencing",
        color: PALETTE?.blue || "#B5CDF5",
        score: scores.auditory,
        sessionScore: scores.sessionAuditory,
      },
      {
        icon: "\uD83D\uDC63",
        game: "Tiptoe Trails",
        gameKey: "tiptoe",
        faculty: "Spatial Mapping",
        color: PALETTE?.green || "#A0EACD",
        score: scores.spatial,
        sessionScore: scores.sessionSpatial,
      },
    ];

    const metricH = 80;
    const metricGap = 15;

    for (let i = 0; i < metrics.length; i++) {
      const m = metrics[i];
      const cardY = summaryCardsStartY + i * (metricH + metricGap);
      const leftX = cx - cardW/2;

      push();
      fill(255);
      drawingContext.shadowBlur = 15;
      drawingContext.shadowColor = "rgba(0,0,0,0.04)";
      noStroke();
      rectMode(CORNER);
      rect(leftX, cardY, cardW, metricH, 16);
      drawingContext.shadowBlur = 0;

      fill(color(m.color).levels[0], color(m.color).levels[1], color(m.color).levels[2], 50);
      circle(leftX + 40, cardY + metricH/2, 44);
      fill(50);
      textAlign(CENTER, CENTER);
      textSize(20);
      text(m.icon, leftX + 40, cardY + metricH/2 + 2);

      fill(60);
      textSize(18);
      textStyle(BOLD);
      textAlign(LEFT, BOTTOM);
      text(m.faculty, leftX + 80, cardY + metricH/2 - 2);

      fill(130);
      textSize(13);
      textStyle(NORMAL);
      textAlign(LEFT, TOP);
      text("Trained in: " + m.game, leftX + 80, cardY + metricH/2 + 4);

      const barW = cardW * 0.3;
      const barX = leftX + cardW - barW - 80;
      const barY = cardY + metricH/2 - 6;

      fill(240);
      rect(barX, barY, barW, 12, 6);

      const overlayColor = color(m.color);
      fill(red(overlayColor), green(overlayColor), blue(overlayColor), 90);
      rect(barX, barY, barW * (m.sessionScore / 100) * this.animT, 12, 6);

      fill(m.color);
      rect(barX, barY, barW * (m.score / 100) * this.animT, 12, 6);

      const delta = (typeof starBank !== 'undefined' && starBank.getSessionDelta)
        ? starBank.getSessionDelta(m.gameKey)
        : null;
      if (delta) {
        fill(255, 240, 180);
        rect(barX, barY - 24, 86, 18, 9);
        fill(120, 90, 20);
        textSize(11);
        textStyle(BOLD);
        textAlign(CENTER, CENTER);
        text("PB " + delta, barX + 43, barY - 15);
      }

      fill(m.color);
      textSize(22);
      textStyle(BOLD);
      textAlign(RIGHT, CENTER);
      text(round(m.score * this.animT) + "%", leftX + cardW - 20, cardY + metricH/2);

      pop();
    }
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

  _drawLabels(cx, cy, R) {
    const scores = (typeof starBank !== 'undefined') ? starBank.getCognitiveScores() : { visual: 0, auditory: 0, spatial: 0 };
    const LD = R + 40;

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
      fill(d.color); rectMode(CENTER); rect(lx, ly - 18, 100, 24, 12);
      fill(60); textSize(11); textStyle(BOLD); textAlign(CENTER, CENTER);
      text(d.label, lx, ly - 18);
      fill(140); textSize(11); textStyle(NORMAL);
      text("(" + d.sub + ")", lx, ly);
      fill(d.color); textSize(24); textStyle(BOLD);
      text(round(d.score * this.animT) + "%", lx, ly + 26);
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

  handleClick() {
    let cx = max(40, width * 0.05);
    let cy = max(40, height * 0.06);

    if (dist(mouseX, mouseY, cx, cy) < 24) {
      gameState.setScreen(GAME_STATES.MENU);
      if (typeof audioManager !== 'undefined') audioManager.playSound("petal");

      this.scrollOffset = 0;
      this.targetScroll = 0;
      return true;
    }
    return false;
  }
}
