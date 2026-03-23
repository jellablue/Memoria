let cloudImgs = [];

function preload() {
  audioManager.preload();
  bgImage = loadImage('assets/BackgroundImage.jpg');
  for (let i = 1; i <= 4; i++) {
    cloudImgs.push(loadImage(`assets/cloud${i}.png`));
  }
}

function setup() {
  console.log("Memoria Setup Started");
  createCanvas(windowWidth, windowHeight);
  textFont("Fredoka");
  textAlign(CENTER, CENTER);
  uiManager = new UIManager();

  gameState.recordActivity();
  console.log("Setup Complete");
}

function draw() {
  gameState.checkIdle();
  if (gameState.isIdle) {
    drawIdleScreen();
    return;
  }

  uiManager.updateCurrentScreen();
  uiManager.draw();
}

function mouseClicked() {
  gameState.recordActivity();
  uiManager.handleClick();
  return false;
}

function keyPressed() {
  gameState.recordActivity();

  if (keyCode === ENTER) {
    uiManager.handleKeyPress(keyCode);
  }

  return false;
}

function mouseMoved() {
  gameState.recordActivity();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  uiManager.handleWindowResize();
}

function mouseWheel(event) {
  if (uiManager && uiManager.handleScroll) {
    uiManager.handleScroll(event.delta);
    return false;
  }
}

function drawIdleScreen() {
  background(0, 100);
  fill(255);
  textSize(48);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text("Are you there?", width / 2, height / 2 - 60);

  textSize(24);
  textStyle(NORMAL);
  text("Click anywhere to continue", width / 2, height / 2 + 60);
}
