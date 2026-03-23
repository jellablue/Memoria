// ============================================
// PROFILE SCREEN — Brain radar chart
// ============================================
// Data source: starBank.getCognitiveScores()
//   kaleidoRecord → Visual   (Binding)
//   jellyRecord   → Auditory (Sequencing)
//   tiptoeRecord  → Spatial  (Mapping)
// ============================================

class ProfileScreen {
  constructor() {
    this.animT = 0;   // 0 → 1 shape draw-on animation
  }

  // Called by UIManager when navigating TO this screen
  resetAnim() {
    this.animT = 0;
  }

  // ── Main draw ───────────────────────────────────
  draw() {
    background(245, 248, 255);

    const cx = width  / 2;
    const cy = height * 0.46;
    const R  = min(145, min(width, height) * 0.19);

    this.animT = min(1, this.animT + 0.025);

    this._drawTitle(cx);
    this._drawGrid(cx, cy, R);
    this._drawAxes(cx, cy, R);
    this._drawPlayerShape(cx, cy, R);
    this._drawLabels(cx, cy, R);
    this._drawScoreSummary(cx, cy, R);
    this.drawBackButton();
  }

  // ── Header bar ──────────────────────────────────
  _drawTitle(cx) {
    push();
    noStroke();
    fill(179, 158, 181, 40);
    rect(0, 0, width, 72);

    fill(PALETTE.purple);
    textAlign(CENTER, CENTER);
    textSize(28);
    textStyle(BOLD);
    text("\uD83E\uDDE0  Your Brain Profile", cx, 26);

    fill(140);
    textSize(13);
    textStyle(NORMAL);
    text("Cognitive capacity mapped from your best game performances", cx, 53);
    pop();
  }

  // ── Concentric triangle grid ────────────────────
  _drawGrid(cx, cy, R) {
    const rings = [25, 50, 75, 100];
    const labelAngle = (TWO_PI / 3) - HALF_PI;   // right-axis direction

    push();
    for (let i = 0; i < rings.length; i++) {
      const r      = (rings[i] / 100) * R;
      const isLast = i === rings.length - 1;

      noFill();
      stroke(isLast ? 175 : 215);
      strokeWeight(isLast ? 1.5 : 0.8);

      beginShape();
      for (let j = 0; j < 3; j++) {
        const a = (TWO_PI / 3) * j - HALF_PI;
        vertex(cx + cos(a) * r, cy + sin(a) * r);
      }
      endShape(CLOSE);

      // % label on the right axis, skip 25 % to avoid clutter
      if (i === 1 || i === 2) {
        fill(185);
        noStroke();
        textSize(9);
        textStyle(NORMAL);
        textAlign(LEFT, CENTER);
        text(rings[i] + "%",
          cx + cos(labelAngle) * r + 5,
          cy + sin(labelAngle) * r - 5);
      }
    }
    pop();
  }

  // ── Dashed coloured axis lines ──────────────────
  _drawAxes(cx, cy, R) {
    const colors = ["#F97098", "#5BACE0", "#5DC98A"];
    push();
    for (let i = 0; i < 3; i++) {
      const a = (TWO_PI / 3) * i - HALF_PI;
      stroke(colors[i]);
      strokeWeight(1.2);
      drawingContext.setLineDash([4, 5]);
      line(cx, cy, cx + cos(a) * R, cy + sin(a) * R);
      drawingContext.setLineDash([]);
    }
    pop();
  }

  // ── Animated filled shape + glowing vertex dots ─
  _drawPlayerShape(cx, cy, R) {
    const s    = starBank.getCognitiveScores();
    const t    = this.animT;
    const ang2 = (TWO_PI / 3)     - HALF_PI;
    const ang3 = (TWO_PI / 3) * 2 - HALF_PI;

    const vR = (s.visual   / 100) * R * t;
    const aR = (s.auditory / 100) * R * t;
    const sR = (s.spatial  / 100) * R * t;

    const pts = [
      [cx + cos(-HALF_PI) * vR, cy + sin(-HALF_PI) * vR],
      [cx + cos(ang2)     * aR, cy + sin(ang2)     * aR],
      [cx + cos(ang3)     * sR, cy + sin(ang3)     * sR],
    ];

    // Semi-transparent purple fill
    push();
    fill("#B39EB5" + "60");
    stroke(PALETTE.purple);
    strokeWeight(2.5);
    beginShape();
    for (let p of pts) vertex(p[0], p[1]);
    endShape(CLOSE);
    pop();

    // Glowing vertex dots
    const dotColors = ["#F97098", "#5BACE0", "#5DC98A"];
    for (let i = 0; i < 3; i++) {
      push();
      drawingContext.shadowBlur  = 10;
      drawingContext.shadowColor = dotColors[i] + "99";
      fill(dotColors[i]);
      stroke(255);
      strokeWeight(2.5);
      circle(pts[i][0], pts[i][1], 16);
      drawingContext.shadowBlur = 0;
      pop();
    }
  }

  // ── Vertex labels: pill badge + sub-label + score % ─
  _drawLabels(cx, cy, R) {
    const scores = starBank.getCognitiveScores();
    const LD     = R + 58;

    const data = [
      { label: "VISUAL",   sub: "Binding",    score: scores.visual,
        angle: -HALF_PI,                color: "#F97098" },
      { label: "AUDITORY", sub: "Sequencing", score: scores.auditory,
        angle: (TWO_PI / 3) - HALF_PI,  color: "#5BACE0" },
      { label: "SPATIAL",  sub: "Mapping",    score: scores.spatial,
        angle: (TWO_PI / 3) * 2 - HALF_PI, color: "#5DC98A" },
    ];

    for (const d of data) {
      const lx = cx + cos(d.angle) * LD;
      const ly = cy + sin(d.angle) * LD;

      push();
      noStroke();

      // Coloured pill badge
      fill(d.color);
      rectMode(CENTER);
      rect(lx, ly - 18, 110, 22, 11);
      fill(255);
      textSize(11);
      textStyle(BOLD);
      textAlign(CENTER, CENTER);
      text(d.label, lx, ly - 18);

      // Sub-label
      fill(115);
      textSize(11);
      textStyle(NORMAL);
      text("(" + d.sub + ")", lx, ly);

      // Score percentage — large and coloured
      fill(d.color);
      textSize(23);
      textStyle(BOLD);
      text(round(d.score) + "%", lx, ly + 22);
      pop();
    }
  }

  // ── Bottom summary strip: game → faculty bars ───
  _drawScoreSummary(cx, cy, R) {
    const scores = starBank.getCognitiveScores();
    const LD     = R + 58;

    // Start below the lowest label text (bottom vertices are at sin(π/6) = 0.5)
    const summaryTop = cy + LD * 0.5 + 52;

    const rows = [
      { icon: "\uD83C\uDF38", game: "Kaleido-Pop",   faculty: "Visual",
        color: "#F97098", score: scores.visual,   record: starBank.kaleidoRecord },
      { icon: "\uD83C\uDFB5", game: "Jelly Jams",    faculty: "Auditory",
        color: "#5BACE0", score: scores.auditory, record: starBank.jellyRecord   },
      { icon: "\uD83D\uDC63", game: "Tiptoe Trails", faculty: "Spatial",
        color: "#5DC98A", score: scores.spatial,  record: starBank.tiptoeRecord  },
    ];

    const barW   = min(190, width * 0.17);
    const totalW = min(540, width * 0.52);
    const x0     = cx - totalW / 2;
    const rowH   = 24;
    const rowGap = 8;

    // Section heading + divider
    push();
    fill(175);
    textSize(10);
    textStyle(BOLD);
    textAlign(LEFT, CENTER);
    noStroke();
    text("GAME  \u2192  COGNITIVE FACULTY", x0, summaryTop - 13);
    stroke(210);
    strokeWeight(0.8);
    line(x0, summaryTop - 4, x0 + totalW, summaryTop - 4);
    pop();

    for (let i = 0; i < rows.length; i++) {
      const d    = rows[i];
      const ry   = summaryTop + i * (rowH + rowGap);
      const midY = ry + rowH / 2;

      push();
      noStroke();

      // Accent dot
      fill(d.color);
      circle(x0 + 8, midY, 10);

      // Game name
      fill(72);
      textSize(13);
      textStyle(BOLD);
      textAlign(LEFT, CENTER);
      text(d.icon + " " + d.game, x0 + 18, midY);

      // Arrow + faculty
      fill(d.color);
      textSize(12);
      textStyle(NORMAL);
      textAlign(LEFT, CENTER);
      text("\u2192 " + d.faculty, x0 + 150, midY);

      // Progress bar background
      const barX = x0 + totalW - barW - 54;
      const barY = midY - 5;
      fill(225);
      rect(barX, barY, barW, 10, 5);

      // Progress bar fill
      fill(d.color);
      rect(barX, barY, barW * (d.score / 100), 10, 5);

      // Score % label
      fill(65);
      textSize(12);
      textStyle(BOLD);
      textAlign(RIGHT, CENTER);
      text(round(d.score) + "%", x0 + totalW, midY);
      pop();
    }
  }

  // ── Back button (top-left circle) ───────────────
  drawBackButton() {
    const bx = 35, by = 35, r = 22;
    const hover = dist(mouseX, mouseY, bx, by) < r;
    push();
    drawingContext.shadowBlur  = hover ? 14 : 4;
    drawingContext.shadowColor = "rgba(0,0,0,0.25)";
    noStroke();
    fill(255, hover ? 230 : 180);
    circle(bx, by, r * 2);
    drawingContext.shadowBlur = 0;
    stroke(80);
    strokeWeight(2.5);
    strokeCap(ROUND);
    noFill();
    beginShape();
    vertex(bx + 6, by - 9);
    vertex(bx - 6, by);
    vertex(bx + 6, by + 9);
    endShape();
    if (hover) cursor(HAND); else cursor(ARROW);
    pop();
  }

  handleClick() {
    if (dist(mouseX, mouseY, 35, 35) < 22) {
      gameState.setScreen(GAME_STATES.MENU);
      return true;
    }
    return false;
  }
}
